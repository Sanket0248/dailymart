import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrder } from '@/hooks/useOrders';
import Skeleton from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatTime } from '@/utils/helpers';

// Status steps matching Supabase status values
const TRACKING_STEPS = [
  { id: 'placed',            label: 'Order Placed',    icon: Package },
  { id: 'confirmed',         label: 'Confirmed',       icon: CheckCircle2 },
  { id: 'preparing',         label: 'Being Prepared',  icon: Package },
  { id: 'out_for_delivery',  label: 'Out for Delivery',icon: Truck },
  { id: 'delivered',         label: 'Delivered',       icon: CheckCircle2 },
];

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function getStepState(stepId, orderStatus) {
  const statusIdx = STATUS_ORDER.indexOf(orderStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepId);
  if (stepIdx < statusIdx) return 'done';
  if (stepIdx === statusIdx) return 'active';
  return 'pending';
}

function getEstimatedDelivery(status) {
  switch (status) {
    case 'placed':           return '⏳ Order received — being processed';
    case 'confirmed':        return '✅ Order confirmed — preparing soon';
    case 'preparing':        return '📦 Packing your items';
    case 'out_for_delivery': return '⚡ Arriving in 25–40 mins';
    case 'delivered':        return '🎉 Delivered successfully';
    default:                 return '⏳ Processing your order';
  }
}

const PAYMENT_LABELS = {
  cod:  'Cash on Delivery',
  upi:  'UPI Payment',
  card: 'Card / Net Banking',
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function OrderTrackingSkeleton() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <div className="sticky top-0 z-10 bg-white shadow-top flex items-center gap-3 px-4 h-14">
        <Skeleton variant="circle" className="w-9 h-9" />
        <div className="space-y-1">
          <Skeleton variant="text" className="h-4 w-28" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        <Skeleton className="h-16 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-36 rounded-card" />
        <Skeleton className="h-24 rounded-card" />
      </div>
    </div>
  );
}

// ─── Not Found State ──────────────────────────────────────────────────────────
function OrderNotFound({ onRetry }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center px-6 text-center gap-4">
      <span className="text-5xl">📦</span>
      <h2 className="text-lg font-700 text-text-heading">Order not found</h2>
      <p className="text-sm text-text-sub">This order doesn't exist or may have been removed.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 border border-brand-500 text-brand-600 text-sm font-600 px-5 py-2.5 rounded-btn"
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="bg-brand-500 text-white text-sm font-600 px-6 py-3 rounded-btn"
      >
        View All Orders
      </button>
    </div>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelled, setCancelled] = useState(false);

  const { order, loading, error, refetch } = useOrder(id);

  if (loading) return <OrderTrackingSkeleton />;
  if (error || !order) return <OrderNotFound onRetry={refetch} />;

  const status = cancelled ? 'cancelled' : order.status;
  const canCancel = !cancelled && (order.status === 'placed' || order.status === 'confirmed');

  const handleCancel = () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelled(true);
    toast('Order cancelled', { icon: '❌' });
  };

  // Map Supabase order_items to display
  const orderItems = order.order_items || [];

  // Address is a JSONB object
  const address = order.address || {};

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-top flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => navigate(-1)}
          className="tap-target -ml-2 text-text-heading"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-sm font-700 text-text-heading leading-tight">Order Tracking</h1>
          <p className="text-xs text-text-sub">#{order.id}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 pb-8">
        {/* Status header */}
        <div className={`rounded-card p-4 flex items-center gap-3 ${
          cancelled ? 'bg-red-50 border border-red-200' : 'bg-brand-50 border border-brand-200'
        }`}>
          {cancelled ? (
            <XCircle size={24} className="text-red-500 flex-shrink-0" />
          ) : (
            <Truck size={24} className="text-brand-500 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-700 ${cancelled ? 'text-red-700' : 'text-brand-700'}`}>
              {cancelled ? 'Order Cancelled' : getEstimatedDelivery(order.status)}
            </p>
            <p className="text-xs text-text-sub">
              Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        {!cancelled && (
          <div className="bg-white rounded-card shadow-card p-5 animate-fade-in">
            <h2 className="text-sm font-700 text-text-heading mb-5">Order Progress</h2>
            <div className="relative">
              {TRACKING_STEPS.map((step, idx) => {
                const state = getStepState(step.id, status);
                const Icon = step.icon;
                const isLast = idx === TRACKING_STEPS.length - 1;

                return (
                  <div key={step.id} className="flex gap-4">
                    {/* Left: icon + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          state === 'done'
                            ? 'bg-brand-500'
                            : state === 'active'
                            ? 'bg-brand-500 ring-4 ring-brand-100 animate-pulse-brand'
                            : 'bg-slate-200'
                        }`}
                      >
                        {state === 'done' ? (
                          <CheckCircle2 size={16} className="text-white" strokeWidth={2.5} />
                        ) : (
                          <Icon
                            size={15}
                            className={state === 'active' ? 'text-white' : 'text-slate-400'}
                          />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-10 mt-1 transition-colors duration-500 ${
                            state === 'done' ? 'bg-brand-400' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Right: text */}
                    <div className="pb-6 flex-1 min-w-0">
                      <p
                        className={`text-sm font-700 leading-none ${
                          state === 'pending' ? 'text-slate-400' : 'text-text-heading'
                        }`}
                      >
                        {step.label}
                      </p>
                      {state === 'active' && (
                        <p className="text-[11px] text-brand-600 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          In progress
                        </p>
                      )}
                      {state === 'done' && (
                        <p className="text-[11px] text-text-sub mt-1">Completed</p>
                      )}
                      {state === 'pending' && (
                        <p className="text-[11px] text-slate-400 mt-1">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-card shadow-card p-4 animate-fade-slide-up">
          <h2 className="text-sm font-700 text-text-heading mb-3">Order Details</h2>

          <div className="space-y-3">
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <Package size={16} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-text-heading line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-text-sub">×{item.qty}</p>
                </div>
                <p className="text-sm font-700 text-brand-600 flex-shrink-0">
                  {formatPrice(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-100 my-3" />

          {/* Price breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-sub">
              <span>Subtotal</span><span className="font-600">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-sub">
              <span>Delivery</span>
              <span className={`font-600 ${order.delivery_fee === 0 ? 'text-brand-500' : ''}`}>
                {order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}
              </span>
            </div>
            {order.coupon_discount > 0 && (
              <div className="flex justify-between text-xs text-brand-600">
                <span>Coupon ({order.coupon_code})</span>
                <span className="font-700">-{formatPrice(order.coupon_discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-700 text-sm text-text-heading pt-1 border-t border-slate-100">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={15} className="text-brand-500" />
            <span className="text-sm font-700 text-text-heading">Delivery Address</span>
          </div>
          {address.name && (
            <p className="text-sm font-600 text-text-heading">{address.name}</p>
          )}
          {address.phone && (
            <p className="text-xs text-text-sub mt-0.5">{address.phone}</p>
          )}
          <p className="text-xs text-text-sub mt-1 leading-relaxed">
            {[address.flat, address.area, address.city, address.pincode].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-text-sub" />
            <span className="text-sm font-700 text-text-heading">Payment</span>
          </div>
          <span className="mt-2 inline-block text-xs font-600 text-slate-600 bg-slate-100 px-3 py-1 rounded-pill">
            {PAYMENT_LABELS[order.payment_method] || order.payment_method}
          </span>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={handleCancel}
            className="w-full h-12 border-2 border-red-400 text-red-500 font-700 text-sm rounded-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
