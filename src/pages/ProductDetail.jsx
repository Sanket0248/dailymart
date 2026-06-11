import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/helpers';
import ProductCard from '@/components/features/ProductCard';
import Skeleton, { ProductCardSkeleton } from '@/components/ui/Skeleton';
import QuantityStepper from '@/components/features/QuantityStepper';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ─── Stock Badge ─────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-600 text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-pill">
        <XCircle size={13} strokeWidth={2.5} />
        Out of Stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-600 text-accent-700 bg-accent-50 border border-accent-200 px-2.5 py-1 rounded-pill">
        <AlertCircle size={13} strokeWidth={2.5} />
        Only {stock} left!
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-600 text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-pill">
      <CheckCircle size={13} strokeWidth={2.5} />
      In Stock
    </span>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
function Tabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="mt-5 bg-white rounded-card shadow-card overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-slate-100">
        {['description', 'details'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-3 text-sm font-600 capitalize transition-colors duration-150
              ${activeTab === tab
                ? 'text-brand-600 border-b-2 border-brand-500'
                : 'text-text-sub hover:text-text-heading'
              }
            `}
          >
            {tab === 'description' ? 'Description' : 'Details'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'description' ? (
          <p className="text-sm text-text-sub leading-relaxed">{product.description}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Brand', product.brand],
                ['Weight / Volume', product.weight],
                ['Storage', product.storage],
                ['Ingredients', product.ingredients],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-3 text-text-sub font-500 w-1/3 align-top">{label}</td>
                  <td className="py-2.5 text-text-heading font-400 leading-relaxed">{value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── You May Also Like ────────────────────────────────────────────────────────
function YouMayAlsoLike({ currentProduct }) {
  const { products, loading } = useProducts(currentProduct.category);
  const related = useMemo(
    () => (products || []).filter((p) => p.id !== currentProduct.id).slice(0, 6),
    [products, currentProduct.id]
  );

  if (loading) {
    return (
      <section className="mt-5">
        <div className="section-header">
          <h2 className="section-title">You May Also Like</h2>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="section-header">
        <h2 className="section-title">You May Also Like</h2>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
        {related.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-36">
            <ProductCard product={p} layout="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Product Detail Skeleton ──────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="page-wrapper bg-surface-page">
      <TopBar />
      <main className="pb-28">
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
          <Skeleton variant="circle" className="w-9 h-9" />
          <Skeleton variant="text" className="h-4 w-40" />
        </div>
        <div className="bg-white">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-2 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="px-4 pt-4 pb-3 bg-white mt-2 rounded-t-2xl space-y-3">
          <Skeleton variant="text" className="h-3 w-1/4" />
          <Skeleton variant="text" className="h-6 w-3/4" />
          <Skeleton variant="text" className="h-4 w-1/5" />
          <div className="flex gap-3">
            <Skeleton variant="text" className="h-7 w-24" />
            <Skeleton variant="text" className="h-5 w-16" />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// ─── Product Not Found ────────────────────────────────────────────────────────
function ProductNotFound({ onRetry }) {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper bg-surface-page flex flex-col items-center justify-center gap-4 px-6 text-center">
      <TopBar />
      <span className="text-6xl">📦</span>
      <h2 className="text-lg font-700 text-text-heading">Product Not Found</h2>
      <p className="text-sm text-text-sub">This product doesn't exist or has been removed.</p>
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
        onClick={() => navigate('/')}
        className="bg-brand-500 text-white text-sm font-600 px-6 py-3 rounded-btn hover:bg-brand-600 transition-colors min-h-[44px]"
      >
        Back to Home
      </button>
      <BottomNav />
    </div>
  );
}

// ─── ProductDetail Page ───────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProduct(id);

  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const getQty = useCartStore((s) => s.getQty);
  const qty = getQty(id);

  // Thumbnail state (show same image 3 times for demo)
  const [selectedThumb, setSelectedThumb] = useState(0);
  const thumbnails = product ? [product.image, product.image, product.image] : [];

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) return <ProductNotFound onRetry={refetch} />;

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 10;
  const outOfStock = !inStock;
  const inCart = qty > 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart! 🛒`, {
      duration: 2000,
      position: 'bottom-center',
    });
  };

  const handleInc = () => {
    if (qty >= Math.min(product.stock, 20)) return;
    setQty(product.id, qty + 1);
  };

  const handleDec = () => {
    setQty(product.id, qty - 1);
  };

  const discountPct = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="page-wrapper bg-surface-page">
      <TopBar />

      {/* Page scroll area */}
      <main className="pb-28">
        {/* ── Back Button Header ───────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-text-heading" />
          </button>
          <span className="text-sm font-600 text-text-heading truncate">{product.name}</span>
        </div>

        {/* ── Image Section ─────────────────────────────── */}
        <div className="bg-white">
          <div className="max-w-md mx-auto">
            {/* Main image */}
            <div className="aspect-square w-full overflow-hidden bg-slate-50/50 flex items-center justify-center p-8">
              <img
                src={thumbnails[selectedThumb]}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-200"
              />
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide justify-center">
              {thumbnails.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedThumb(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150
                    ${selectedThumb === i
                      ? 'border-brand-500 shadow-sm'
                      : 'border-slate-200 hover:border-brand-300'
                    }
                  `}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-contain mix-blend-multiply p-1"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product Info ──────────────────────────────── */}
        <div className="px-4 pt-4 pb-3 bg-white mt-2 rounded-t-2xl">
          {/* Brand */}
          <p className="text-xs text-text-sub font-500 uppercase tracking-wide mb-1">{product.brand}</p>

          {/* Name */}
          <h1 className="text-lg font-700 text-text-heading leading-snug mb-2">{product.name}</h1>

          {/* Weight */}
          <span className="inline-block bg-slate-100 text-text-sub text-xs font-500 px-2.5 py-1 rounded-pill mb-3">
            {product.weight}
          </span>

          {/* Price row */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <span className="text-2xl font-700 text-brand-600">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-base text-text-muted line-through">{formatPrice(product.mrp)}</span>
            )}
            {discountPct > 0 && (
              <span className="bg-accent-500 text-white text-xs font-700 px-2 py-0.5 rounded-pill">
                {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Stock badge */}
          <StockBadge stock={product.stock} />
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="px-4 mt-2">
          <Tabs product={product} />
        </div>

        {/* ── You May Also Like ─────────────────────────── */}
        <YouMayAlsoLike currentProduct={product} />
      </main>

      {/* ── Sticky Bottom CTA ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 py-3 pb-safe shadow-top">
        {outOfStock ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[50px] rounded-btn bg-slate-200 text-slate-400 font-600 text-base cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : inCart ? (
          <div className="flex items-center gap-3">
            <QuantityStepper
              qty={qty}
              onIncrease={handleInc}
              onDecrease={handleDec}
              onRemove={() => setQty(product.id, 0)}
              max={Math.min(product.stock, 20)}
              size="lg"
            />
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="flex-1 min-h-[50px] rounded-btn bg-brand-500 text-white font-600 text-sm flex items-center justify-center gap-2 hover:bg-brand-600 active:bg-brand-700 transition-colors"
            >
              <ShoppingCart size={18} strokeWidth={2} />
              Go to Cart
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full min-h-[50px] rounded-btn bg-accent-500 text-white font-700 text-base flex items-center justify-center gap-2 hover:bg-accent-600 active:bg-accent-700 transition-colors shadow-sm"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            Add to Cart
          </button>
        )}
      </div>

    </div>
  );
}
