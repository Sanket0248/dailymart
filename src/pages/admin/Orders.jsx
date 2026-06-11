import { useState, useMemo } from 'react';
import { useAdminOrders } from '@/hooks/useAdmin';
import { updateOrderStatus } from '@/services/orderService';
import toast from 'react-hot-toast';
import {
  Search,
  X,
  ChevronRight,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  ChevronDown,
} from 'lucide-react';

const TABS = [
  { key: 'all',              label: 'All' },
  { key: 'placed',           label: 'Placed' },
  { key: 'confirmed',        label: 'Confirmed' },
  { key: 'packed',           label: 'Packed' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
  { key: 'cancelled',        label: 'Cancelled' },
];

const STATUS_CONFIG = {
  delivered:        { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered' },
  confirmed:        { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmed' },
  placed:           { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Placed' },
  packed:           { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Packed' },
  out_for_delivery: { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Out for Delivery' },
  cancelled:        { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
};

const STATUS_FLOW = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
const STATUS_NEXT_LABEL = {
  placed:           'Mark as Confirmed',
  confirmed:        'Mark as Being Packed',
  packed:           'Mark as Out for Delivery',
  out_for_delivery: 'Mark as Delivered',
};

const PAYMENT_LABEL = { cod: 'Cash on Delivery', upi: 'UPI', card: 'Card' };

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function OrderSlideOver({ order, onClose, onStatusChange, onCancel }) {
  if (!order) return null;

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIdx !== -1 && currentIdx < STATUS_FLOW.length - 1;
  const canCancel  = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <p className="text-xs text-text-sub font-medium">Order</p>
            <h3 className="text-base font-bold text-text-heading font-mono">{order.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Status */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-text-heading">Status</p>
              <StatusBadge status={order.status} />
            </div>
            {/* Status progression */}
            {canAdvance && (
              <button
                onClick={() => onStatusChange(order.id, STATUS_FLOW[currentIdx + 1])}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <ChevronRight size={16} />
                {STATUS_NEXT_LABEL[order.status]}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="w-full mt-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors min-h-[44px]"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Items */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-text-heading mb-3">
              Items ({(order.order_items || []).length})
            </p>
            <div className="space-y-3">
              {(order.order_items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-heading truncate">{item.product_name}</p>
                    <p className="text-xs text-text-sub">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-heading flex-shrink-0">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-text-sub">
                <span>Subtotal</span><span>₹{order.subtotal}</span>
              </div>
              {order.coupon_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>−₹{order.coupon_discount}</span>
                </div>
              )}
              <div className="flex justify-between text-text-sub">
                <span>Delivery</span><span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-text-heading text-base pt-1 border-t border-slate-100">
                <span>Total</span><span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-2">
            <p className="text-sm font-semibold text-text-heading mb-2">Customer</p>
            <div className="flex items-center gap-2 text-sm text-text-sub">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  {order.address.name.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-text-heading">{order.address.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-sub">
              <Phone size={14} className="flex-shrink-0" />
              <a href={`tel:${order.address.phone}`} className="hover:text-brand-500">
                {order.address.phone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-text-sub">
              <MapPin size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                {order.address.flat}, {order.address.area}, {order.address.city} – {order.address.pincode}
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-text-heading mb-2">Payment</p>
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-text-sub" />
              <span className="text-sm font-medium text-text-heading">
                {PAYMENT_LABEL[order.payment_method] ?? (order.payment_method || '').toUpperCase()}
              </span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-pill ${
                order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                {order.payment_method === 'cod' ? 'Collect on Delivery' : 'Paid'}
              </span>
            </div>
          </div>
        </div>

        {/* Print footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={() => toast.success('Invoice sent to printer!')}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 text-text-sub hover:bg-slate-50 text-sm font-medium py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            <Printer size={16} />
            Print Invoice
          </button>
        </div>
      </div>
    </>
  );
}

export default function Orders() {
  const { data: orders = [], setData: setOrders, loading } = useAdminOrders();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeTab !== 'all') list = list.filter(o => o.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.address.name.toLowerCase().includes(q) ||
        o.address.phone.includes(q)
      );
    }
    return list;
  }, [orders, activeTab, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
      const label = STATUS_CONFIG[newStatus]?.label ?? newStatus;
      toast.success(`Order ${orderId} → ${label}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    await handleStatusChange(orderId, 'cancelled');
  };

  if (loading) {
    return <div className="p-4 md:p-6 text-center text-slate-500">Loading orders...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-heading">Orders</h2>
        <span className="text-sm text-text-sub">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[40px] flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-brand-50 text-brand-600 border border-brand-200'
                : 'text-text-sub hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {orders.filter(o => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Order ID, customer name or phone…"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Order ID','Customer','Phone','Items','Total','Payment','Time','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-text-sub text-sm">
                    No orders found.
                  </td>
                </tr>
              )}
              {filteredOrders.map((order, idx) => (
                <tr key={`${order.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-text-heading whitespace-nowrap">{order.id}</td>
                  <td className="px-4 py-3.5 font-medium text-text-heading whitespace-nowrap">{order.address.name}</td>
                  <td className="px-4 py-3.5 text-text-sub whitespace-nowrap">{order.address.phone}</td>
                  <td className="px-4 py-3.5 text-text-sub whitespace-nowrap">{(order.order_items || []).length}</td>
                  <td className="px-4 py-3.5 font-semibold text-text-heading whitespace-nowrap">₹{order.total}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-pill ${
                      order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {(order.payment_method || '').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-sub text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 rounded px-2.5 py-1.5 hover:bg-brand-50 transition-colors min-h-[32px]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over panel */}
      {selectedOrder && (
        <OrderSlideOver
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
