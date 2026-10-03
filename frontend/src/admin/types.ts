// Types partagés du dashboard d'administration.
// Ils décrivent la forme des données attendues de l'API : quand le backend
// exposera ces routes, il suffira de renvoyer des objets de cette forme.

export type Period = "today" | "7d" | "30d" | "3m" | "year";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

export type PaymentMethod = "card" | "paypal" | "cash" | "transfer";

// "untracked" : le stock de ce produit n'est pas renseigné
export type StockStatus = "in_stock" | "low" | "out" | "untracked";

export type CustomerStatus = "new" | "active" | "loyal" | "inactive";

export interface KpiValue {
  value: number;
  previous: number;
  // Petite série pour le mini-graphique de la carte
  trend: number[];
}

export interface DashboardStats {
  revenue: KpiValue;
  orders: KpiValue;
  customers: KpiValue;
  averageBasket: KpiValue;
}

export interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  sales: number;
  revenue: number;
  percent: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  // null quand le stock n'est pas suivi pour ce produit
  stock: number | null;
  lowStockThreshold: number;
  isAvailable: boolean;
  createdAt: string | null;
}

export interface TopProduct extends CatalogProduct {
  sales: number;
  revenue: number;
  stockStatus: StockStatus;
}

export interface StockItem extends CatalogProduct {
  stockStatus: StockStatus;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  number: string;
  customer: OrderCustomer;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  delivery: { mode: "pickup" | "delivery"; address?: string; date: string };
  note?: string;
}

export interface OrdersToProcess {
  pending: number;
  preparing: number;
  ready: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  status: CustomerStatus;
}

export interface CustomerDetail extends Customer {
  orders: Order[];
}

export interface CustomerStats {
  newCustomers: KpiValue;
  activeCustomers: KpiValue;
  loyalCustomers: KpiValue;
  returnRate: KpiValue;
  evolution: { label: string; total: number; new: number }[];
}

export type NotificationType = "order" | "stock" | "customer" | "payment" | "ready";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  // Absent pour une alerte « en cours » (ex : stock faible) plutôt qu'un événement daté
  createdAt?: string;
  read: boolean;
  link?: string;
}

// Données brutes renvoyées par GET /api/admin/data
export interface AdminSnapshot {
  generatedAt: string;
  categories: { id: string; name: string; order: number }[];
  products: CatalogProduct[];
  customers: Pick<Customer, "id" | "name" | "email" | "phone" | "createdAt">[];
  orders: Order[];
  analytics: {
    date: string;
    visitors: number;
    productViews: number;
    addToCart: number;
    productViewsById: Record<string, number>;
  }[];
}

export interface FunnelStep {
  label: string;
  value: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  image: string;
  category: string;
  value: number;
}

export interface AnalyticsData {
  sales: SalesPoint[];
  stats: DashboardStats;
  funnel: FunnelStep[];
  // null tant qu'aucune visite n'a été mesurée
  conversionRate: KpiValue | null;
  trackingSince: string | null;
  bestSellers: ProductPerformance[];
  worstSellers: ProductPerformance[];
  mostViewed: ProductPerformance[];
  customers: CustomerStats;
  newVsReturning: { label: string; new: number; returning: number }[];
}

export interface OrdersQuery {
  search?: string;
  // "to_prepare" regroupe les commandes confirmées et en préparation
  status?: OrderStatus | "all" | "to_prepare";
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "number" | "createdAt" | "total" | "customer" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
