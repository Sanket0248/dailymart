import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDiscount, clsx } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';
import QuantityStepper from '@/components/features/QuantityStepper';

/* ─── Discount Badge ─────────────────────────────────────────────────────── */
function DiscountBadge({ mrp, price }) {
  if (!mrp || mrp <= price) return null;
  const pct = formatDiscount(mrp, price);
  if (pct <= 0) return null;
  return (
    <Badge variant="accent" size="sm" className="shrink-0">
      {pct}% OFF
    </Badge>
  );
}

/* ─── Out-of-Stock Overlay ───────────────────────────────────────────────── */
function OutOfStockOverlay() {
  return (
    <div className="absolute inset-0 rounded-card bg-white/75 flex items-center justify-center z-10">
      <span className="text-xs font-semibold text-slate-500 bg-white rounded-full px-3 py-1 shadow-sm border border-slate-200">
        Out of Stock
      </span>
    </div>
  );
}

/* ─── Grid Layout ────────────────────────────────────────────────────────── */
function GridCard({ product, cartItem, onAdd, onIncrease, onDecrease, onRemove }) {
  const navigate = useNavigate();
  const { id, name, brand, image, price, mrp, weight, inStock = true } = product;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/product/${id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={clsx(
        'group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-soft',
        'flex flex-col overflow-hidden',
        'cursor-pointer select-none',
        'transition-all duration-300',
      )}
      aria-label={`${name}, ${formatPrice(price)}`}
    >
      {/* Product image area */}
      <div className="relative w-full aspect-square bg-slate-50/50 p-4 overflow-hidden flex items-center justify-center group-hover:bg-slate-50 transition-colors">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Discount Badge over Image */}
        <div className="absolute top-2 left-2">
          <DiscountBadge mrp={mrp} price={price} />
        </div>

        {!inStock && <OutOfStockOverlay />}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 pt-2 gap-1.5 relative">
        <div className="flex flex-col gap-0.5">
          {brand && (
            <span className="text-[10px] text-slate-400 font-600 uppercase tracking-wider truncate">
              {brand}
            </span>
          )}
          <h3 className="text-[13px] font-600 text-slate-800 line-clamp-2 leading-snug min-h-[36px]">
            {name}
          </h3>
          {weight && (
            <span className="text-[11px] text-slate-500 font-500">{weight}</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Bottom row: Price & Action */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-[15px] font-800 text-slate-900 leading-none">{formatPrice(price)}</span>
            {mrp && mrp > price && (
              <span className="text-[11px] text-slate-400 line-through mt-0.5">{formatPrice(mrp)}</span>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {!inStock ? null : cartItem && cartItem.qty > 0 ? (
              <QuantityStepper
                qty={cartItem.qty}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
                size="sm"
              />
            ) : (
              <button
                type="button"
                onClick={onAdd}
                aria-label={`Add ${name} to cart`}
                className={clsx(
                  'w-9 h-9 rounded-full',
                  'bg-brand-50 text-brand-600 border border-brand-200',
                  'flex items-center justify-center',
                  'hover:bg-brand-500 hover:text-white hover:border-brand-500',
                  'transition-all duration-200 active-scale shadow-sm',
                )}
              >
                <ShoppingCart size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Horizontal Layout ──────────────────────────────────────────────────── */
function HorizontalCard({ product, cartItem, onAdd, onIncrease, onDecrease, onRemove }) {
  const navigate = useNavigate();
  const { id, name, brand, image, price, mrp, weight, inStock = true } = product;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/product/${id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={clsx(
        'group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-soft',
        'flex flex-row items-center gap-3 p-2.5 pr-4',
        'cursor-pointer select-none overflow-hidden',
        'transition-all duration-300',
      )}
      aria-label={`${name}, ${formatPrice(price)}`}
    >
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50/50 p-2 group-hover:bg-slate-50 transition-colors">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded shadow-sm">OOS</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        {brand && (
          <span className="text-[10px] text-slate-400 font-600 uppercase tracking-wider truncate mb-0.5">
            {brand}
          </span>
        )}
        <h3 className="text-[14px] font-600 text-slate-800 line-clamp-2 leading-snug">
          {name}
        </h3>
        {weight && (
          <span className="text-[11px] text-slate-500 mt-0.5">{weight}</span>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[15px] font-800 text-slate-900">{formatPrice(price)}</span>
          {mrp && mrp > price && (
            <span className="text-[11px] text-slate-400 line-through">{formatPrice(mrp)}</span>
          )}
        </div>
      </div>

      {/* Add / Stepper — right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
        <DiscountBadge mrp={mrp} price={price} />
        {!inStock ? (
          <span className="text-[11px] text-slate-400 font-medium">Unavailable</span>
        ) : cartItem && cartItem.qty > 0 ? (
          <QuantityStepper
            qty={cartItem.qty}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
            size="sm"
          />
        ) : (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${name} to cart`}
            className={clsx(
              'w-8 h-8 rounded-full',
              'bg-brand-50 text-brand-600 border border-brand-200',
              'flex items-center justify-center',
              'hover:bg-brand-500 hover:text-white hover:border-brand-500',
              'transition-all duration-200 active-scale shadow-sm',
            )}
          >
            <ShoppingCart size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </article>
  );
}

/* ─── ProductCard (Exports) ──────────────────────────────────────────────── */
export default function ProductCard({ product, layout = 'grid' }) {
  const { addItem, removeItem, updateQty, items } = useCartStore();

  const cartItem = items.find((i) => i.id === product.id);

  const handleAdd = useCallback(() => {
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      duration: 1500,
      style: { fontSize: '13px' },
    });
  }, [product, addItem]);

  const handleIncrease = useCallback(() => {
    if (!cartItem) return;
    updateQty(product.id, cartItem.qty + 1);
  }, [cartItem, product.id, updateQty]);

  const handleDecrease = useCallback(() => {
    if (!cartItem) return;
    if (cartItem.qty - 1 <= 0) {
      removeItem(product.id);
    } else {
      updateQty(product.id, cartItem.qty - 1);
    }
  }, [cartItem, product.id, removeItem, updateQty]);

  const handleRemove = useCallback(() => {
    removeItem(product.id);
    toast(`${product.name} removed`, {
      icon: '🗑️',
      duration: 1500,
      style: { fontSize: '13px' },
    });
  }, [product.id, product.name, removeItem]);

  const sharedProps = {
    product,
    cartItem,
    onAdd: handleAdd,
    onIncrease: handleIncrease,
    onDecrease: handleDecrease,
    onRemove: handleRemove,
  };

  if (layout === 'horizontal') {
    return <HorizontalCard {...sharedProps} />;
  }

  return <GridCard {...sharedProps} />;
}
