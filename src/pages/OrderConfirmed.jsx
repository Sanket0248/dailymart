import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/helpers';

const CONFIRMED_ADDRESS = {
  name: 'Rajan Sharma',
  flat: '12, Shanti Nagar',
  area: 'Main Market',
  city: 'Joura',
  pincode: '476221',
};

export default function OrderConfirmed() {
  const { id } = useParams();
  const { items, clearCart } = useCartStore();

  // Snapshot items before clearing
  const snapshot = [...items];

  useEffect(() => {
    const t = setTimeout(() => clearCart(), 200);
    return () => clearTimeout(t);
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-start px-4 py-10">
      {/* Animated Checkmark */}
      <div className="relative mb-6 animate-scale-in">
        <div className="w-32 h-32 rounded-full bg-brand-500 flex items-center justify-center shadow-lg animate-pulse-brand">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="drop-shadow"
          >
            <path
              d="M12 28L23 39L44 17"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: 0,
                animation: 'checkmark 0.6s 0.3s cubic-bezier(0.65,0,0.45,1) both',
              }}
            />
          </svg>
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full bg-brand-300 opacity-20 animate-ping" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-800 text-brand-700 text-center mb-2 animate-fade-slide-up">
        Order Confirmed!
      </h1>
      <p className="text-sm text-text-sub text-center mb-5 animate-fade-in">
        Your order has been placed successfully
      </p>

      {/* Order ID Badge */}
      <div className="bg-slate-100 text-slate-600 text-sm font-700 px-5 py-2 rounded-pill mb-4 animate-fade-in">
        {id}
      </div>

      {/* ETA */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
          <Clock size={16} className="text-brand-500" />
        </div>
        <p className="text-sm font-700 text-brand-600">⚡ Arriving in 25–40 mins</p>
      </div>

      {/* Items Summary */}
      {snapshot.length > 0 ? (
        <div className="w-full max-w-md bg-white rounded-card shadow-card p-4 mb-4 animate-fade-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-text-sub" />
            <span className="text-sm font-700 text-text-heading">
              {snapshot.reduce((s, i) => s + i.qty, 0)} items ordered
            </span>
          </div>
          <div className="space-y-2">
            {snapshot.slice(0, 4).map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 text-text-heading line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-text-sub">×{qty}</p>
                </div>
                <p className="text-xs font-700 text-brand-600">
                  {formatPrice(product.price * qty)}
                </p>
              </div>
            ))}
            {snapshot.length > 4 && (
              <p className="text-xs text-text-muted text-center pt-1">
                +{snapshot.length - 4} more items
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-card shadow-card p-4 mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-text-sub" />
            <span className="text-sm font-700 text-text-heading">3 items ordered</span>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="w-full max-w-md bg-white rounded-card shadow-card p-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={16} className="text-brand-500" />
          <span className="text-sm font-700 text-text-heading">Delivery to</span>
        </div>
        <p className="text-sm font-600 text-text-heading">{CONFIRMED_ADDRESS.name}</p>
        <p className="text-xs text-text-sub mt-0.5 leading-relaxed">
          {CONFIRMED_ADDRESS.flat}, {CONFIRMED_ADDRESS.area},{' '}
          {CONFIRMED_ADDRESS.city} – {CONFIRMED_ADDRESS.pincode}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link
          to={`/orders/${id}`}
          className="w-full h-12 flex items-center justify-center gap-2 border-2 border-brand-500 text-brand-600 font-700 text-[15px] rounded-btn active:scale-[0.98] transition-all"
        >
          <CheckCircle2 size={18} />
          Track Order
        </Link>
        <Link
          to="/"
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-500 text-white font-700 text-[15px] rounded-btn active:scale-[0.98] transition-all shadow-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
