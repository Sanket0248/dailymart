import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Tag,
  X,
  ChevronRight,
  Ticket,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import QuantityStepper from '@/components/features/QuantityStepper';
import { validateCoupon } from '@/services/couponService';
import { formatPrice } from '@/utils/helpers';

const FREE_DELIVERY_THRESHOLD = 299;

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    setQty,
    getSubtotal,
    getDeliveryFee,
    getCouponDiscount,
    getTotal,
    applyCoupon,
    removeCoupon,
    coupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getCouponDiscount();
  const total = getTotal();
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const found = await validateCoupon(code);
      if (!found) {
        toast.error('Invalid or expired coupon');
        setCouponLoading(false);
        return;
      }
      if (subtotal < found.minOrder) {
        toast.error(`Add ${formatPrice(found.minOrder - subtotal)} more to use this coupon`);
        setCouponLoading(false);
        return;
      }
      applyCoupon(found);
      setCouponInput('');
      toast.success(`Coupon "${found.code}" applied!`);
    } catch {
      toast.error('Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast('Coupon removed', { icon: '🗑️' });
  };

  if (items.length === 0) {
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
          <h1 className="text-base font-700 text-text-heading">My Cart</h1>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
          <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <ShoppingCart size={56} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-700 text-text-heading mb-2">Your cart is empty</h2>
          <p className="text-sm text-text-sub mb-8 max-w-[240px]">
            Looks like you haven't added anything yet
          </p>
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
        <h1 className="text-base font-700 text-text-heading flex-1">My Cart</h1>
        <span className="text-xs font-600 text-brand-500 bg-brand-50 px-2.5 py-1 rounded-pill">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-36 space-y-3">
        {/* Cart Items */}
        <div className="space-y-2 animate-fade-slide-up">
          {items.map(({ product, qty }) => (
            <div
              key={product.id}
              className="bg-white rounded-card shadow-card p-3 flex gap-3 items-start"
            >
              {/* Product image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-600 text-text-muted uppercase tracking-wide leading-none mb-0.5">
                  {product.brand}
                </p>
                <p className="text-sm font-600 text-text-heading line-clamp-1 leading-snug">
                  {product.name}
                </p>
                <p className="text-xs text-text-sub mb-2">{product.weight}</p>
                <QuantityStepper
                  qty={qty}
                  size="sm"
                  onIncrease={() => setQty(product.id, qty + 1)}
                  onDecrease={() => setQty(product.id, qty - 1)}
                  onRemove={() => removeItem(product.id)}
                />
              </div>

              {/* Price + Remove */}
              <div className="flex flex-col items-end justify-between h-full gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    removeItem(product.id);
                    toast('Item removed', { icon: '🗑️' });
                  }}
                  className="tap-target text-slate-400 active:text-red-500 transition-colors"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 size={15} />
                </button>
                <p className="text-sm font-700 text-brand-600">
                  {formatPrice(product.price * qty)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={16} className="text-accent-500" />
            <span className="text-sm font-700 text-text-heading">Apply Coupon</span>
          </div>

          {coupon ? (
            <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-brand-500" />
                <div>
                  <p className="text-xs font-700 text-brand-700">{coupon.code}</p>
                  <p className="text-[11px] text-brand-600">
                    You save {formatPrice(discount)} 🎉
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="tap-target text-brand-400 hover:text-brand-600"
                aria-label="Remove coupon"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Enter coupon code"
                className="flex-1 h-11 px-3 border border-slate-200 rounded-lg text-sm font-600 text-text-heading placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors"
                aria-label="Coupon code"
                disabled={couponLoading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || couponLoading}
                className="h-11 px-4 bg-brand-500 text-white text-sm font-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center gap-1.5 min-w-[70px] justify-center"
              >
                {couponLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="text-sm font-700 text-text-heading mb-3">Order Summary</h2>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-sub">Subtotal ({itemCount} items)</span>
              <span className="font-600 text-text-heading">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-sub">Delivery</span>
              {deliveryFee === 0 ? (
                <span className="font-600 text-brand-500">FREE</span>
              ) : (
                <span className="font-600 text-text-heading">{formatPrice(deliveryFee)}</span>
              )}
            </div>

            {/* Free delivery hint */}
            {toFreeDelivery > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-[11px] text-amber-700 font-600">
                  🛵 Add{' '}
                  <span className="font-700">{formatPrice(toFreeDelivery)}</span>{' '}
                  more for free delivery!
                </p>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-600 font-600">
                  <Tag size={12} className="inline mr-1" />
                  Coupon Discount
                </span>
                <span className="font-700 text-brand-600">-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="h-px bg-slate-100 my-1" />

            <div className="flex justify-between items-center">
              <span className="text-base font-700 text-text-heading">Total</span>
              <span className="text-lg font-700 text-brand-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-100 px-4 py-3 safe-bottom shadow-nav">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full h-13 flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white font-700 text-[15px] rounded-btn px-5 active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="text-left">
            <div className="text-xs font-400 opacity-80">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>
            <div>{formatPrice(total)}</div>
          </div>
          <div className="flex items-center gap-1">
            Proceed to Checkout
            <ChevronRight size={18} />
          </div>
        </button>
      </div>
    </div>
  );
}
