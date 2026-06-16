import { useState } from 'react';
import { BarChart2, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAdminProducts, useAdminOrders } from '@/hooks/useAdmin';

const REVENUE_DATA = [
  { day: 'Mon', revenue: 4200, orders: 18 },
  { day: 'Tue', revenue: 5800, orders: 22 },
  { day: 'Wed', revenue: 3100, orders: 15 },
  { day: 'Thu', revenue: 7200, orders: 28 },
  { day: 'Fri', revenue: 8900, orders: 31 },
  { day: 'Sat', revenue: 11200, orders: 38 },
  { day: 'Sun', revenue: 6840, orders: 24 },
];


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-700 text-text-heading mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-600">
          {entry.name === 'revenue' ? `₹${entry.value.toLocaleString('en-IN')}` : `${entry.value} orders`}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { data: products = [], loading: productsLoading } = useAdminProducts();
  const { data: orders = [], loading: ordersLoading } = useAdminOrders();

  const [from, setFrom] = useState('2024-10-21');
  const [to, setTo] = useState('2024-10-27');

  const totalRevenue = orders.reduce((s, d) => s + d.total, 0) || REVENUE_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = orders.length || REVENUE_DATA.reduce((s, d) => s + d.orders, 0);

  const BEST_SELLERS = products.slice(0, 5).map((p, i) => ({
    ...p,
    unitsSold: [320, 280, 245, 190, 155][i] || 10,
    revenue: p.price * ([320, 280, 245, 190, 155][i] || 10),
  }));

  if (productsLoading || ordersLoading) return <div className="p-4 md:p-6 text-center text-slate-500">Loading reports...</div>;

  const handleExport = () => {
    const rows = [
      ['Day', 'Revenue (₹)', 'Orders'],
      ...REVENUE_DATA.map(d => [d.day, d.revenue, d.orders]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'balajitraders-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-700 text-text-heading flex items-center gap-2">
          <BarChart2 className="text-brand-500" size={24} /> Reports
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-brand-500 text-brand-500 font-600 px-4 py-2.5 rounded-btn hover:bg-brand-50 transition-colors text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-4 flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-xs font-700 text-text-sub uppercase tracking-wide mb-1.5">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-slate-200 rounded-btn px-3 py-2 text-sm focus:border-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-700 text-text-sub uppercase tracking-wide mb-1.5">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-slate-200 rounded-btn px-3 py-2 text-sm focus:border-brand-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 bg-brand-500 text-white font-600 px-4 py-2 rounded-btn hover:bg-brand-600 text-sm">
          <Calendar size={15} /> Apply
        </button>
        {/* Summary pills */}
        <div className="ml-auto flex gap-3">
          <div className="text-right">
            <p className="text-xs text-text-muted">Total Revenue</p>
            <p className="font-700 text-brand-600 text-lg">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-xs text-text-muted">Total Orders</p>
            <p className="font-700 text-text-heading text-lg">{totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue Line Chart */}
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <h2 className="font-700 text-text-heading mb-4">Revenue (₹) — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1a9e5c"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1a9e5c', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <h2 className="font-700 text-text-heading mb-4">Orders Count — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#1a9e5c" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-700 text-text-heading">🏆 Best Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Rank', 'Product', 'Category', 'Units Sold', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-700 text-text-sub uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {BEST_SELLERS.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                      <div>
                        <p className="font-600 text-text-heading text-sm">{p.name}</p>
                        <p className="text-xs text-text-muted">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-text-sub">{p.category}</td>
                  <td className="px-4 py-3 font-700 text-text-heading">{p.unitsSold}</td>
                  <td className="px-4 py-3 font-700 text-brand-600">₹{p.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
