// Point d'entrée UNIQUE des données du dashboard.
//
// Toutes les valeurs sont RÉELLES : elles viennent de Firestore via GET /api/admin/data
// (produits, catégories, clients inscrits, commandes, compteurs d'audience).
// Les statistiques sont calculées ici à partir de ces données brutes.
// Quand la boutique grossira, ces calculs pourront être déplacés côté backend
// sans changer les composants : ils ne dépendent que de ces fonctions et des types.
import axios from "axios";
import { auth } from "../../firebase";
import { API_URL } from "../../config/api";
import type {
  AdminNotification,
  AdminSnapshot,
  AnalyticsData,
  CategorySales,
  Customer,
  CustomerDetail,
  CustomerStats,
  CustomerStatus,
  DashboardStats,
  KpiValue,
  Order,
  OrdersQuery,
  OrdersToProcess,
  OrderStatus,
  Paginated,
  Period,
  ProductPerformance,
  SalesPoint,
  StockItem,
  StockStatus,
  TopProduct,
} from "../types";

const ADMIN_ENDPOINT = `${API_URL}/api/admin`;
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const CACHE_MS = 30 * 1000;

// ---------------------------------------------------------------------------
// Chargement des données réelles (une requête partagée par tous les blocs)
// ---------------------------------------------------------------------------
let db: AdminSnapshot = { generatedAt: "", categories: [], products: [], customers: [], orders: [], analytics: [] };
let loadedAt = 0;
let pending: Promise<void> | null = null;

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function ensureLoaded(force = false) {
  if (!force && Date.now() - loadedAt < CACHE_MS) return;
  if (!pending) {
    pending = (async () => {
      try {
        const res = await axios.get<AdminSnapshot>(`${ADMIN_ENDPOINT}/data`, { headers: await authHeaders() });
        db = res.data;
        loadedAt = Date.now();
      } catch (error) {
        throw new Error(
          axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : "Le serveur ne répond pas. Vérifiez votre connexion.",
          { cause: error }
        );
      } finally {
        pending = null;
      }
    })();
  }
  await pending;
}

// Force le rechargement au prochain appel (ex : bouton « Actualiser »)
export function invalidateDashboardCache() {
  loadedAt = 0;
}

function respond<T>(data: T): T {
  return structuredClone(data);
}

// ---------------------------------------------------------------------------
// Périodes
// ---------------------------------------------------------------------------
interface Range {
  start: number;
  end: number;
}

interface Bucket extends Range {
  label: string;
}

const PERIOD_DAYS: Record<Period, number> = { today: 1, "7d": 7, "30d": 30, "3m": 90, year: 365 };

// Période courante + période précédente de même durée (pour les comparaisons)
function periodRange(period: Period, now = Date.now()): { current: Range; previous: Range } {
  const days = PERIOD_DAYS[period];
  const start = new Date(now).setHours(0, 0, 0, 0) - (days - 1) * DAY;
  const elapsed = now - start;
  const previousStart = start - days * DAY;
  return {
    current: { start, end: now },
    previous: { start: previousStart, end: previousStart + elapsed },
  };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).replace(".", "");

function buckets(period: Period, range: Range): Bucket[] {
  const result: Bucket[] = [];
  if (period === "today") {
    for (let h = 8; h < 20; h += 2) {
      result.push({
        label: `${h}h`,
        start: h === 8 ? range.start : range.start + h * HOUR,
        end: h === 18 ? range.start + DAY : range.start + (h + 2) * HOUR,
      });
    }
  } else if (period === "7d" || period === "30d") {
    for (let day = range.start; day < range.end; day += DAY) {
      const date = new Date(day);
      result.push({
        label:
          period === "7d"
            ? capitalize(date.toLocaleDateString("fr-FR", { weekday: "short" }))
            : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", ""),
        start: day,
        end: day + DAY,
      });
    }
  } else if (period === "3m") {
    for (let week = range.start; week < range.end; week += 7 * DAY) {
      result.push({
        label: new Date(week).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", ""),
        start: week,
        end: Math.min(week + 7 * DAY, range.end + 1),
      });
    }
  } else {
    const cursor = new Date(range.end);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    cursor.setMonth(cursor.getMonth() - 11);
    for (let i = 0; i < 12; i++) {
      const monthStart = cursor.getTime();
      cursor.setMonth(cursor.getMonth() + 1);
      result.push({
        label: capitalize(new Date(monthStart).toLocaleDateString("fr-FR", { month: "short" })),
        start: Math.max(monthStart, range.start),
        end: cursor.getTime(),
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Briques de calcul
// ---------------------------------------------------------------------------
const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

function ordersIn(range: Range, { includeCancelled = false } = {}) {
  return db.orders.filter((o) => {
    const t = time(o.createdAt);
    return t >= range.start && t <= range.end && (includeCancelled || o.status !== "cancelled");
  });
}

function salesSummary(range: Range) {
  const orders = ordersIn(range);
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  return {
    revenue: round2(revenue),
    orders: orders.length,
    customers: new Set(orders.map((o) => o.customer.id || o.customer.email)).size,
    averageBasket: orders.length ? round2(revenue / orders.length) : 0,
  };
}

function kpi(value: number, previous: number, trend: number[]): KpiValue {
  return { value, previous, trend };
}

function stockStatus(product: { stock: number | null; lowStockThreshold: number }): StockStatus {
  if (product.stock === null) return "untracked";
  if (product.stock <= 0) return "out";
  return product.stock <= product.lowStockThreshold ? "low" : "in_stock";
}

function productSales(range: Range) {
  const totals = new Map<string, { sales: number; revenue: number }>();
  for (const order of ordersIn(range)) {
    for (const item of order.items) {
      const entry = totals.get(item.productId) ?? { sales: 0, revenue: 0 };
      entry.sales += item.quantity;
      entry.revenue += item.quantity * item.unitPrice;
      totals.set(item.productId, entry);
    }
  }
  return db.products.map((p) => ({
    ...p,
    sales: totals.get(p.id)?.sales ?? 0,
    revenue: round2(totals.get(p.id)?.revenue ?? 0),
  }));
}

const customerKey = (o: Order) => o.customer.id || o.customer.email;

// Dates des commandes non annulées de chaque client
function customerOrderTimes() {
  const map = new Map<string, number[]>();
  for (const order of db.orders) {
    if (order.status === "cancelled") continue;
    const list = map.get(customerKey(order)) ?? [];
    list.push(time(order.createdAt));
    map.set(customerKey(order), list);
  }
  return map;
}

function analyticsIn(range: Range) {
  // Dates locales AAAA-MM-JJ (les compteurs sont enregistrés à l'heure de Paris)
  const startDay = new Date(range.start).toLocaleDateString("en-CA");
  const endDay = new Date(range.end).toLocaleDateString("en-CA");
  return db.analytics.filter((a) => a.date >= startDay && a.date <= endDay);
}

function customerStatsSync(period: Period): CustomerStats {
  const { current, previous } = periodRange(period);
  const orderTimes = customerOrderTimes();

  function measure(range: Range) {
    const newCustomers = db.customers.filter((c) => {
      const t = time(c.createdAt);
      return t >= range.start && t <= range.end;
    }).length;
    const active = new Set(ordersIn(range).map(customerKey));
    let loyal = 0;
    let returning = 0;
    for (const id of active) {
      const times = orderTimes.get(id) ?? [];
      if (times.filter((t) => t <= range.end).length >= 3) loyal++;
      if (times.some((t) => t < range.start)) returning++;
    }
    return {
      newCustomers,
      active: active.size,
      loyal,
      returnRate: active.size ? round2((returning / active.size) * 100) : 0,
    };
  }

  const cur = measure(current);
  const prev = measure(previous);
  const series = buckets(period, current).map((b) => ({ bucket: b, ...measure(b) }));

  return {
    newCustomers: kpi(cur.newCustomers, prev.newCustomers, series.map((s) => s.newCustomers)),
    activeCustomers: kpi(cur.active, prev.active, series.map((s) => s.active)),
    loyalCustomers: kpi(cur.loyal, prev.loyal, series.map((s) => s.loyal)),
    returnRate: kpi(cur.returnRate, prev.returnRate, series.map((s) => s.returnRate)),
    evolution: series.map((s) => ({
      label: s.bucket.label,
      total: db.customers.filter((c) => time(c.createdAt) <= s.bucket.end).length,
      new: s.newCustomers,
    })),
  };
}

function customerStatus(createdAt: string, times: number[]): CustomerStatus {
  const now = Date.now();
  const last = times.length ? Math.max(...times) : 0;
  if (now - time(createdAt) < 30 * DAY) return "new";
  if (!last || now - last > 120 * DAY) return "inactive";
  if (times.length >= 3) return "loyal";
  return "active";
}

function customersWithStats(): Customer[] {
  const totals = new Map<string, { count: number; spent: number; last: number }>();
  for (const order of db.orders) {
    if (order.status === "cancelled") continue;
    const entry = totals.get(customerKey(order)) ?? { count: 0, spent: 0, last: 0 };
    entry.count++;
    entry.spent += order.total;
    entry.last = Math.max(entry.last, time(order.createdAt));
    totals.set(customerKey(order), entry);
  }
  const orderTimes = customerOrderTimes();
  return db.customers.map((c) => {
    const t = totals.get(c.id) ?? totals.get(c.email);
    return {
      ...c,
      ordersCount: t?.count ?? 0,
      totalSpent: round2(t?.spent ?? 0),
      lastOrderAt: t ? new Date(t.last).toISOString() : undefined,
      status: customerStatus(c.createdAt, orderTimes.get(c.id) ?? orderTimes.get(c.email) ?? []),
    };
  });
}

// ---------------------------------------------------------------------------
// API publique du service
// ---------------------------------------------------------------------------
export async function getDashboardStats(period: Period): Promise<DashboardStats> {
  await ensureLoaded();
  const { current, previous } = periodRange(period);
  const cur = salesSummary(current);
  const prev = salesSummary(previous);
  const series = buckets(period, current).map(salesSummary);
  return respond({
    revenue: kpi(cur.revenue, prev.revenue, series.map((s) => s.revenue)),
    orders: kpi(cur.orders, prev.orders, series.map((s) => s.orders)),
    customers: kpi(cur.customers, prev.customers, series.map((s) => s.customers)),
    averageBasket: kpi(cur.averageBasket, prev.averageBasket, series.map((s) => s.averageBasket)),
  });
}

export async function getSalesData(period: Period): Promise<SalesPoint[]> {
  await ensureLoaded();
  const { current } = periodRange(period);
  return respond(
    buckets(period, current).map((b) => {
      const s = salesSummary(b);
      return { label: b.label, revenue: Math.round(s.revenue), orders: s.orders };
    })
  );
}

export async function getCategorySales(period: Period): Promise<CategorySales[]> {
  await ensureLoaded();
  const { current } = periodRange(period);
  // Toutes les catégories apparaissent, même sans vente sur la période
  const byCategory = new Map<string, { sales: number; revenue: number }>(
    [...db.categories].sort((a, b) => a.order - b.order).map((c) => [c.name, { sales: 0, revenue: 0 }])
  );
  for (const p of productSales(current)) {
    const entry = byCategory.get(p.category) ?? { sales: 0, revenue: 0 };
    entry.sales += p.sales;
    entry.revenue += p.revenue;
    byCategory.set(p.category, entry);
  }
  const totalRevenue = [...byCategory.values()].reduce((s, c) => s + c.revenue, 0);
  return respond(
    [...byCategory.entries()]
      .map(([category, { sales, revenue }]) => ({
        category,
        sales,
        revenue: round2(revenue),
        percent: totalRevenue ? round2((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  );
}

export async function getTopProducts(period: Period, limit = 5): Promise<TopProduct[]> {
  await ensureLoaded();
  const { current } = periodRange(period);
  return respond(
    productSales(current)
      .filter((p) => p.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit)
      .map((p) => ({ ...p, stockStatus: stockStatus(p) }))
  );
}

export async function getRecentOrders(limit = 6): Promise<Order[]> {
  await ensureLoaded();
  return respond([...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit));
}

export async function getOrdersToProcess(): Promise<OrdersToProcess> {
  await ensureLoaded();
  const count = (statuses: OrderStatus[]) => db.orders.filter((o) => statuses.includes(o.status)).length;
  return respond({
    pending: count(["pending"]),
    preparing: count(["confirmed", "preparing"]),
    ready: count(["ready"]),
  });
}

export async function getStockOverview(): Promise<{ items: StockItem[]; counts: Record<StockStatus, number> }> {
  await ensureLoaded();
  const severity: Record<StockStatus, number> = { out: 0, low: 1, in_stock: 2, untracked: 3 };
  const items = db.products
    .map((p) => ({ ...p, stockStatus: stockStatus(p) }))
    .sort((a, b) => severity[a.stockStatus] - severity[b.stockStatus] || (a.stock ?? 0) - (b.stock ?? 0));
  const counts: Record<StockStatus, number> = { in_stock: 0, low: 0, out: 0, untracked: 0 };
  items.forEach((i) => counts[i.stockStatus]++);
  return respond({ items, counts });
}

export async function getCustomerStats(period: Period): Promise<CustomerStats> {
  await ensureLoaded();
  return respond(customerStatsSync(period));
}

export async function getOrders(query: OrdersQuery = {}): Promise<Paginated<Order>> {
  await ensureLoaded();
  const {
    search = "",
    status = "all",
    from,
    to,
    minAmount,
    maxAmount,
    sortBy = "createdAt",
    sortDir = "desc",
    page = 1,
    pageSize = 10,
  } = query;
  const term = search.trim().toLowerCase();
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;

  const filtered = db.orders.filter((o) => {
    const t = time(o.createdAt);
    return (
      (status === "all" || o.status === status || (status === "to_prepare" && (o.status === "confirmed" || o.status === "preparing"))) &&
      t >= fromTime &&
      t <= toTime &&
      (minAmount === undefined || o.total >= minAmount) &&
      (maxAmount === undefined || o.total <= maxAmount) &&
      (!term ||
        o.number.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.customer.email.toLowerCase().includes(term))
    );
  });

  const value = (o: Order) =>
    sortBy === "total" ? o.total : sortBy === "customer" ? o.customer.name : sortBy === "status" ? o.status : sortBy === "number" ? o.number : o.createdAt;
  filtered.sort((a, b) => {
    const [va, vb] = [value(a), value(b)];
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "fr");
    return sortDir === "asc" ? cmp : -cmp;
  });

  return respond({
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  await ensureLoaded();
  return respond(db.orders.find((o) => o.id === id) ?? null);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  try {
    const res = await axios.put<Order>(`${ADMIN_ENDPOINT}/orders/${id}/status`, { status }, { headers: await authHeaders() });
    db.orders = db.orders.map((o) => (o.id === id ? res.data : o));
    return respond(res.data);
  } catch (error) {
    throw new Error(axios.isAxiosError(error) && error.response?.data?.error ? error.response.data.error : "Mise à jour impossible", {
      cause: error,
    });
  }
}

export async function getCustomers(
  query: { search?: string; status?: CustomerStatus | "all"; sortBy?: "name" | "ordersCount" | "totalSpent" | "lastOrderAt" | "createdAt"; sortDir?: "asc" | "desc"; page?: number; pageSize?: number } = {}
): Promise<Paginated<Customer>> {
  await ensureLoaded();
  const { search = "", status = "all", sortBy = "lastOrderAt", sortDir = "desc", page = 1, pageSize = 10 } = query;
  const term = search.trim().toLowerCase();
  const filtered = customersWithStats().filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (!term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.phone.includes(term))
  );
  filtered.sort((a, b) => {
    const [va, vb] = [a[sortBy] ?? "", b[sortBy] ?? ""];
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "fr");
    return sortDir === "asc" ? cmp : -cmp;
  });
  return respond({ items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize });
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  await ensureLoaded();
  const customer = customersWithStats().find((c) => c.id === id);
  if (!customer) return null;
  const orders = db.orders
    .filter((o) => o.customer.id === id || (!o.customer.id && o.customer.email === customer.email))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return respond({ ...customer, orders });
}

// --- Notifications (événements réels ; l'état « lu » est mémorisé dans ce navigateur) ---
const READ_KEY = "cookingib.admin.readNotifications";

function readIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export async function getNotifications(): Promise<AdminNotification[]> {
  await ensureLoaded();
  const now = Date.now();
  const read = readIds();
  const recent = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const list: AdminNotification[] = [];

  recent
    .filter((o) => o.status === "pending")
    .slice(0, 5)
    .forEach((o) =>
      list.push({ id: `order-${o.id}`, type: "order", title: "Nouvelle commande reçue", message: `${o.number} · ${o.customer.name}`, createdAt: o.createdAt, read: false, link: `/admin/orders?commande=${o.id}` })
    );
  recent
    .filter((o) => o.status === "ready")
    .slice(0, 3)
    .forEach((o) =>
      list.push({ id: `ready-${o.id}`, type: "ready", title: "Commande prête", message: `${o.number} · ${o.delivery.mode === "pickup" ? "retrait en boutique" : "à livrer"}`, createdAt: o.createdAt, read: false, link: `/admin/orders?commande=${o.id}` })
    );
  db.customers
    .filter((c) => now - time(c.createdAt) < 14 * DAY)
    .forEach((c) =>
      list.push({ id: `customer-${c.id}`, type: "customer", title: "Nouveau client", message: c.name, createdAt: c.createdAt, read: false, link: `/admin/customers?client=${c.id}` })
    );
  // Alertes de stock : sans date, elles restent tant que le stock n'est pas réapprovisionné
  db.products
    .filter((p) => stockStatus(p) === "low" || stockStatus(p) === "out")
    .forEach((p) =>
      list.push({ id: `stock-${p.id}-${p.stock}`, type: "stock", title: p.stock === 0 ? "Rupture de stock" : "Stock faible", message: p.stock === 0 ? p.name : `${p.name} · ${p.stock} restant${(p.stock ?? 0) > 1 ? "s" : ""}`, read: false, link: "/admin/products" })
    );

  return respond(
    list
      .sort((a, b) => (b.createdAt ?? "9999").localeCompare(a.createdAt ?? "9999"))
      .slice(0, 15)
      .map((n) => ({ ...n, read: read.has(n.id) }))
  );
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  const read = readIds();
  ids.forEach((id) => read.add(id));
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...read].slice(-300)));
  } catch {
    // stockage indisponible : l'état « lu » ne sera pas conservé
  }
}

// --- Analytics ---
export async function getAnalytics(period: Period): Promise<AnalyticsData> {
  await ensureLoaded();
  const { current, previous } = periodRange(period);
  const [stats, sales] = await Promise.all([getDashboardStats(period), getSalesData(period)]);
  const orders = salesSummary(current).orders;
  const previousOrders = salesSummary(previous).orders;

  const sum = (rows: AdminSnapshot["analytics"], key: "visitors" | "productViews" | "addToCart") =>
    rows.reduce((s, r) => s + r[key], 0);
  const traffic = analyticsIn(current);
  const previousTraffic = analyticsIn(previous);
  const visitors = sum(traffic, "visitors");
  const previousVisitors = sum(previousTraffic, "visitors");

  const funnel = [
    { label: "Visiteurs", value: visitors },
    { label: "Consultations produits", value: sum(traffic, "productViews") },
    { label: "Ajouts au panier", value: sum(traffic, "addToCart") },
    { label: "Commandes", value: orders },
  ];

  const views = new Map<string, number>();
  for (const day of traffic) {
    for (const [id, n] of Object.entries(day.productViewsById)) views.set(id, (views.get(id) ?? 0) + n);
  }

  const perf = productSales(current);
  const toPerformance = (p: (typeof perf)[number], value: number): ProductPerformance => ({ id: p.id, name: p.name, image: p.image, category: p.category, value });
  const sold = perf.filter((p) => p.sales > 0).sort((a, b) => b.sales - a.sales);

  const orderTimes = customerOrderTimes();
  const newVsReturning = buckets(period, current).map((b) => {
    let newCount = 0;
    let returning = 0;
    for (const o of ordersIn(b)) {
      const first = Math.min(...(orderTimes.get(customerKey(o)) ?? [time(o.createdAt)]));
      if (first >= time(o.createdAt)) newCount++;
      else returning++;
    }
    return { label: b.label, new: newCount, returning };
  });

  const trackingSince = db.analytics.length ? db.analytics.map((a) => a.date).sort()[0] : null;

  return respond({
    sales,
    stats,
    funnel,
    conversionRate: visitors
      ? kpi(round2((orders / visitors) * 100), previousVisitors ? round2((previousOrders / previousVisitors) * 100) : 0, [])
      : null,
    trackingSince,
    bestSellers: sold.slice(0, 5).map((p) => toPerformance(p, p.sales)),
    // Les moins vendus parmi tout le catalogue (y compris jamais vendus)
    worstSellers: [...perf].sort((a, b) => a.sales - b.sales).slice(0, 5).map((p) => toPerformance(p, p.sales)),
    mostViewed: perf
      .map((p) => toPerformance(p, views.get(p.id) ?? 0))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    customers: customerStatsSync(period),
    newVsReturning,
  });
}

// --- Export CSV (séparateur « ; » pour Excel en français) ---
export async function exportOrdersCsv(period: Period): Promise<string> {
  await ensureLoaded();
  const { current } = periodRange(period);
  const categoryOf = new Map(db.products.map((p) => [p.id, p.category]));
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["Commande", "Date", "Client", "Email", "Articles", "Catégories", "Total (€)", "Paiement", "Statut"];
  const rows = ordersIn(current, { includeCancelled: true }).map((o) => [
    o.number,
    new Date(o.createdAt).toLocaleString("fr-FR"),
    o.customer.name,
    o.customer.email,
    o.items.map((i) => `${i.quantity}× ${i.name}`).join(", "),
    [...new Set(o.items.map((i) => categoryOf.get(i.productId) ?? ""))].join(", "),
    o.total.toFixed(2).replace(".", ","),
    o.paymentMethod,
    o.status,
  ]);
  return "﻿" + [header, ...rows].map((r) => r.map(escape).join(";")).join("\n");
}
