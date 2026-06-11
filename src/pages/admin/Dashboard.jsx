import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboardStats, useAdminOrders, useAdminProducts } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  IndianRupee,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS = {
  delivered:        { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered' },
  confirmed:        { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmed' },
  pending:          { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending' },
  packed:           { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Packed' },
  out_for_delivery: { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Out for Delivery' },
  cancelled:        { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, iconBg, iconColor, badge, badgeColor }) {
  return (
    <div className="bg-white rounded-[12px] shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-sub">{title}</p>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-text-heading">{value}</p>
      {badge && (
        <span className={`text-xs font-semibold ${badgeColor}`}>{badge}</span>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-card-hover text-sm">
        <p className="font-semibold text-text-heading">{label}</p>
        <p className="text-brand-500">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

const CHART_DATA = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 19 },
  { day: 'Wed', orders: 15 },
  { day: 'Thu', orders: 22 },
  { day: 'Fri', orders: 28 },
  { day: 'Sat', orders: 35 },
  { day: 'Sun', orders: 42 }
];

export default function Dashboard() {
  const { data: stats, loading: statsLoading, refetch } = useAdminDashboardStats();
  const { data: orders = [], loading: ordersLoading } = useAdminOrders();
  const { data: products = [] } = useAdminProducts();
  const [stockValues, setStockValues] = useState({});

  const handleUpdateStock = (product) => {
    const current = stockValues[product.id] ?? product.stock;
    const val = window.prompt(`Update stock for "${product.name}"\nCurrent: ${current}`, current);
    if (val === null) return;
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    setStockValues(prev => ({ ...prev, [product.id]: qty }));
    toast.success(`Stock updated to ${qty} for ${product.name}`);
  };

  const displayOrders = orders.slice(0, 8);
  const lowStockProductsList = products.filter(p => p.stock <= (p.threshold || 5)).slice(0, 6);

  if (statsLoading || ordersLoading) {
    return <div className="p-4 md:p-6 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-heading">Dashboard</h2>
          <p className="text-text-sub text-sm mt-0.5">Welcome back, Store Owner 👋</p>
        </div>
        <button
          onClick={() => { refetch(); toast.success('Dashboard refreshed!'); }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-sub hover:text-text-heading border border-slate-200 rounded-lg hover:bg-slate-50 transition-all min-h-[44px]"
        >
          <RefreshCw size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          badge=""
          badgeColor="text-green-600"
        />
        <KpiCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          iconBg="bg-brand-100"
          iconColor="text-brand-600"
          badge=""
          badgeColor="text-brand-600"
        />
        <KpiCard
          title="Active Orders"
          value={stats?.activeOrders || 0}
          icon={Clock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          badge="Needs attention"
          badgeColor="text-amber-600"
        />
        <KpiCard
          title="Low Stock Items"
          value={stats?.lowStock || 0}
          icon={AlertTriangle}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          badge="Reorder required"
          badgeColor="text-red-500"
        />
      </div>

      {/* Chart + Low Stock row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[12px] shadow-card p-5">
          <h3 className="text-base font-semibold text-text-heading mb-4">Orders — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CHART_DATA} barSize={32} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf6' }} />
              <Bar
                dataKey="orders"
                fill="#1a9e5c"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-[12px] shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={17} className="text-red-500 flex-shrink-0" />
            <h3 className="text-base font-semibold text-text-heading">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {lowStockProductsList.length === 0 && (
              <p className="text-sm text-text-sub text-center py-4">All products are well-stocked!</p>
            )}
            {lowStockProductsList.map(product => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <div className="flex-shrink-0">
                  <AlertTriangle size={14} className={product.stock === 0 ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-heading truncate">{product.name}</p>
                  <p className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                    {product.stock === 0 ? 'Out of stock' : `${stockValues[product.id] ?? product.stock} left`}
                  </p>
                </div>
                <button
                  onClick={() => handleUpdateStock(product)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 rounded px-2 py-1 hover:bg-brand-50 transition-colors flex-shrink-0 min-h-[32px]"
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-[12px] shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-text-heading">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">Time</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayOrders.map((order, idx) => (
                <tr key={`${order.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-text-heading font-semibold whitespace-nowrap">{order.id}</td>
                  <td className="px-4 py-3.5 text-text-heading whitespace-nowrap">{order.address?.name || 'Guest'}</td>
                  <td className="px-4 py-3.5 text-text-sub whitespace-nowrap">{(order.order_items || []).length} item{((order.order_items || []).length !== 1) ? 's' : ''}</td>
                  <td className="px-4 py-3.5 font-semibold text-text-heading whitespace-nowrap">₹{order.total}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3.5 text-text-sub text-xs whitespace-nowrap">
                    {new Date(order.created_at || order.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      to="/admin/orders"
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
