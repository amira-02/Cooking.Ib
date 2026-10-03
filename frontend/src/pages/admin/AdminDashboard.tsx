import { useState } from "react";
import { Download, Euro, ShoppingBag, ShoppingBasket, Users } from "lucide-react";
import StatCard from "../../admin/components/dashboard/StatCard";
import SalesChart from "../../admin/components/dashboard/SalesChart";
import CategoryChart from "../../admin/components/dashboard/CategoryChart";
import TopProducts from "../../admin/components/dashboard/TopProducts";
import RecentOrders from "../../admin/components/dashboard/RecentOrders";
import OrdersToProcess from "../../admin/components/dashboard/OrdersToProcess";
import StockAlert from "../../admin/components/dashboard/StockAlert";
import CustomerStats from "../../admin/components/dashboard/CustomerStats";
import PeriodSelect from "../../admin/components/ui/PeriodSelect";
import { useToast } from "../../components/ui/Toast";
import { useAsync } from "../../admin/hooks/useAsync";
import {
  exportOrdersCsv,
  getCategorySales,
  getCustomerStats,
  getDashboardStats,
  getOrdersToProcess,
  getRecentOrders,
  getSalesData,
  getStockOverview,
  getTopProducts,
} from "../../admin/services/dashboardService";
import { PERIOD_OPTIONS } from "../../admin/constants";
import { formatNumber, formatPriceRounded } from "../../admin/utils/format";
import { downloadTextFile } from "../../admin/utils/download";
import { formatPrice } from "../../utils/formatPrice";
import { useAuth } from "../../context/AuthContext";
import type { Period } from "../../admin/types";

function greeting() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
}

function AdminDashboard() {
  const { profile } = useAuth();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>("7d");
  const [exporting, setExporting] = useState(false);
  const periodMeta = PERIOD_OPTIONS.find((p) => p.value === period)!;

  // Chaque bloc charge ses données indépendamment : une erreur n'empêche pas le reste de s'afficher
  const stats = useAsync(() => getDashboardStats(period), [period]);
  const sales = useAsync(() => getSalesData(period), [period]);
  const categories = useAsync(() => getCategorySales(period), [period]);
  const topProducts = useAsync(() => getTopProducts(period), [period]);
  const customers = useAsync(() => getCustomerStats(period), [period]);
  const recentOrders = useAsync(() => getRecentOrders(6), []);
  const toProcess = useAsync(() => getOrdersToProcess(), []);
  const stock = useAsync(() => getStockOverview(), []);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportOrdersCsv(period);
      downloadTextFile(csv, `commandes-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast("Export des commandes téléchargé");
    } catch {
      toast("L'export a échoué, réessayez", "error");
    } finally {
      setExporting(false);
    }
  }

  const s = stats.data;
  const kpiLoading = stats.loading || !s;

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-[1.75rem] leading-tight text-ink sm:text-3xl">
            {greeting()}, {profile?.firstName || "Amira"} 👋
          </h2>
          <p className="mt-1 text-sm text-ink-light">Voici un aperçu de votre activité.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelect value={period} onChange={setPeriod} />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#EADBCB] bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
          >
            <Download size={15} className="text-ink-light" />
            {exporting ? "Export…" : "Exporter"}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          value={s ? formatPriceRounded(s.revenue.value) : ""}
          kpi={s?.revenue}
          icon={<Euro size={18} strokeWidth={1.8} />}
          comparison={periodMeta.comparison}
          loading={kpiLoading}
        />
        <StatCard
          label="Commandes"
          value={s ? formatNumber(s.orders.value) : ""}
          kpi={s?.orders}
          icon={<ShoppingBag size={18} strokeWidth={1.8} />}
          comparison={periodMeta.comparison}
          loading={kpiLoading}
        />
        <StatCard
          label="Clients"
          value={s ? formatNumber(s.customers.value) : ""}
          kpi={s?.customers}
          icon={<Users size={18} strokeWidth={1.8} />}
          comparison={periodMeta.comparison}
          loading={kpiLoading}
        />
        <StatCard
          label="Panier moyen"
          value={s ? formatPrice(s.averageBasket.value) : ""}
          kpi={s?.averageBasket}
          icon={<ShoppingBasket size={18} strokeWidth={1.8} />}
          comparison={periodMeta.comparison}
          loading={kpiLoading}
        />
      </div>
      {stats.error && (
        <p className="text-sm text-red-700">
          Les indicateurs n'ont pas pu être chargés.{" "}
          <button type="button" onClick={stats.retry} className="font-medium underline">
            Réessayer
          </button>
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={sales.data} loading={sales.loading} error={sales.error} onRetry={sales.retry} periodLabel={periodMeta.label} />
        </div>
        <OrdersToProcess data={toProcess.data} loading={toProcess.loading} error={toProcess.error} onRetry={toProcess.retry} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <CategoryChart data={categories.data} loading={categories.loading} error={categories.error} onRetry={categories.retry} />
        <div className="xl:col-span-2">
          <TopProducts data={topProducts.data} loading={topProducts.loading} error={topProducts.error} onRetry={topProducts.retry} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrders data={recentOrders.data} loading={recentOrders.loading} error={recentOrders.error} onRetry={recentOrders.retry} />
        </div>
        <StockAlert data={stock.data} loading={stock.loading} error={stock.error} onRetry={stock.retry} />
      </div>

      <CustomerStats data={customers.data} loading={customers.loading} error={customers.error} onRetry={customers.retry} />

    </div>
  );
}

export default AdminDashboard;
