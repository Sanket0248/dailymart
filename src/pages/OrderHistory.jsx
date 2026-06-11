import { Link, useNavigate } from 'react-router-dom';
import { Package, RotateCcw, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useOrders';
import { OrderCardSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatTime } from '@/utils/helpers';

const STATUS_CONFIG = {
  delivered:        { label: 'Delivered',       classes: 'bg-brand-50 text-brand-700 border-brand-200' },
  confirmed:        { label: 'Confirmed',        classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  preparing:        { label: 'Being Prepared',   classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  packing:          { label: 'Being Packed',     classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  out_for_delivery: { label: 'Out for Delivery', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  placed:           { label: 'Placed',           classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled:        { label: 'Cancelled',        classes: 'bg-red-50 text-red-700 border-red-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span className={`text-[11px] font-700 px-2.5 py-0.5 rounded-pill border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

// Group orders by date (using created_at from Supabase)
function groupByDate(orders) {
  const groups = {};
  orders.forEach((order) => {
    const key = formatDate(order.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });
  return groups;
}

function OrderCard({ order }) {
  const navigate = useNavigate();

  // order_items is an array of { product_id, product_name, product_image, price, mrp, qty, subtotal }
  const orderItems = order.order_items || [];
  const itemCount = orderItems.reduce((s, i) => s + i.qty, 0);
  const itemNames = orderItems
    .slice(0, 3)
    .map((i) => (i.product_name || '').split(' ').slice(0, 2).join(' '))
    .join(', ');

  const handleReorder = () => {
    // Reorder shows a toast for now (no product objects to add to cart without a full product lookup)
    toast.success('Reorder coming soon! 🛒');
  };

  return (
    <div className="bg-white rounded-card shadow-card p-4 animate-fade-slide-up">
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-700 text-text-heading">{order.id}</p>
          <p className="text-[11px] text-text-sub">{formatTime(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items summary */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2">
          {orderItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-md overflow-hidden border-2 border-white bg-slate-100 flex-shrink-0"
            >
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Package size={12} className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-sub line-clamp-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {itemNames}
            {orderItems.length > 3 && ` +${orderItems.length - 3} more`}
          </p>
        </div>
        <p className="text-sm font-700 text-text-heading flex-shrink-0">
          {formatPrice(order.total)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Link
          to={`/orders/${order.id}`}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 border border-slate-200 rounded-lg text-xs font-600 text-text-sub active:scale-95 transition-transform"
        >
          <Package size={13} />
          View Details
        </Link>
        <button
          onClick={handleReorder}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-brand-50 border border-brand-200 rounded-lg text-xs font-700 text-brand-600 active:scale-95 transition-transform"
        >
          <RotateCcw size={13} />
          Reorder
        </button>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-screen bg-surface-page flex flex-col">
        <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center">
          <h1 className="text-base font-700 text-text-heading">My Orders</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-700 text-text-heading mb-2">Sign in to view orders</h2>
          <p className="text-sm text-text-sub mb-6 max-w-[220px]">
            Track your orders and view order history
          </p>
          <Link
            to="/account"
            className="bg-brand-500 text-white font-600 text-sm px-8 py-3 rounded-btn shadow-sm active:scale-95 transition-transform"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <OrderHistoryContent userUid={user.uid} />;
}

function OrderHistoryContent({ userUid }) {
  const { orders, loading, error, refetch } = useOrders(userUid);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-page pb-20">
        <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center">
          <h1 className="text-base font-700 text-text-heading">My Orders</h1>
        </div>
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface-page flex flex-col">
        <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center">
          <h1 className="text-base font-700 text-text-heading">My Orders</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-sm text-text-sub mb-4">Failed to load orders</p>
          <button
            type="button"
            onClick={refetch}
            className="bg-brand-500 text-white font-600 text-sm px-6 py-2.5 rounded-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-surface-page flex flex-col">
        <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center">
          <h1 className="text-base font-700 text-text-heading">My Orders</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <Package size={36} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-700 text-text-heading mb-2">No orders yet</h2>
          <p className="text-sm text-text-sub mb-6">Your orders will appear here</p>
          <Link
            to="/"
            className="bg-brand-500 text-white font-600 text-sm px-8 py-3 rounded-btn shadow-sm active:scale-95 transition-transform"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(orders);

  return (
    <div className="min-h-screen bg-surface-page pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-top px-4 h-14 flex items-center justify-between">
        <h1 className="text-base font-700 text-text-heading">My Orders</h1>
        <span className="text-xs text-text-sub font-600">
          {orders.length} orders
        </span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {Object.entries(grouped).map(([date, dateOrders]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2.5">
              <p className="text-xs font-700 text-text-sub uppercase tracking-wider">{date}</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-3">
              {dateOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
