import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, SlidersHorizontal, PackageOpen, RefreshCw } from 'lucide-react';
import { useCategories, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/features/ProductCard';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import Skeleton from '@/components/ui/Skeleton';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ─── All Categories Grid ────────────────────────────────────────────────────
function AllCategoriesPage() {
  const { categories, loading, error, refetch } = useCategories();

  return (
    <div className="page-wrapper bg-surface-page">
      <TopBar />
      <main className="px-4 py-4">
        <h1 className="text-xl font-700 text-text-heading mb-4">All Categories</h1>

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-card shadow-card p-4">
                <Skeleton variant="rect" className="w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-text-sub mb-4">Failed to load categories</p>
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-2 bg-brand-500 text-white text-sm font-600 px-5 py-2.5 rounded-btn"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-y-6 gap-x-2">
            {(categories || []).map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 active-scale"
                aria-label={`${cat.name} — ${cat.count} products`}
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-[20px] shadow-sm group-hover:shadow-soft transition-all duration-300"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </span>
                </div>
                <div className="text-center px-1">
                  <p className="text-[12px] font-600 text-slate-800 leading-tight mb-0.5">{cat.name}</p>
                  <p className="text-[10px] font-500 text-slate-400">{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

// ─── Sort Options ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Discount %' },
  { value: 'newest', label: 'Newest' },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label || 'Sort';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-pill border text-xs font-600
          min-h-[36px] whitespace-nowrap transition-colors duration-150
          ${open
            ? 'border-brand-500 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-white text-text-heading hover:border-brand-300'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <SlidersHorizontal size={13} strokeWidth={2.5} />
        {label}
        <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-card shadow-card-hover py-1 min-w-[180px]">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`
                  w-full text-left px-4 py-2.5 text-xs font-500 transition-colors
                  ${value === opt.value
                    ? 'text-brand-600 bg-brand-50 font-600'
                    : 'text-text-heading hover:bg-slate-50'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ categoryName }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <PackageOpen size={56} className="text-slate-300 mb-4" strokeWidth={1.5} />
      <h3 className="text-base font-600 text-text-heading mb-1">No products found</h3>
      <p className="text-sm text-text-sub mb-6">
        {categoryName
          ? `We don't have products in "${categoryName}" matching your filters.`
          : 'Try adjusting your filters.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/categories')}
        className="bg-brand-500 text-white text-sm font-600 px-6 py-3 rounded-btn hover:bg-brand-600 active:bg-brand-700 transition-colors min-h-[44px]"
      >
        Browse Categories
      </button>
    </div>
  );
}

// ─── Category Products Page ──────────────────────────────────────────────────
function CategoryProductsPage({ slug }) {
  const navigate = useNavigate();
  const [sort, setSort] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);

  const { products: rawProducts, loading, error, refetch } = useProducts(slug);
  const { categories } = useCategories();
  const category = useMemo(
    () => (categories || []).find((c) => c.slug === slug),
    [categories, slug]
  );

  const products = useMemo(() => {
    let list = [...(rawProducts || [])];
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        list.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
        list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
      default:
        break;
    }
    return list;
  }, [rawProducts, sort, inStockOnly]);

  return (
    <div className="page-wrapper bg-surface-page">
      <TopBar />
      <main>
        {/* Category header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-text-heading" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {category && slug !== 'all' && (
              <span
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg flex-shrink-0"
                style={{ backgroundColor: category.color }}
              >
                {category.emoji}
              </span>
            )}
            <h1 className="text-base font-700 text-text-heading truncate">
              {slug === 'all' ? 'All Products' : (category?.name || slug)}
            </h1>
            {!loading && (
              <span className="text-xs text-text-sub flex-shrink-0">({(rawProducts || []).length})</span>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 overflow-x-auto scrollbar-hide bg-surface-page border-b border-slate-100">
          <SortDropdown value={sort} onChange={setSort} />
          <button
            type="button"
            onClick={() => setInStockOnly((v) => !v)}
            aria-pressed={inStockOnly}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-pill border text-xs font-600
              min-h-[36px] whitespace-nowrap transition-all duration-150 flex-shrink-0
              ${inStockOnly
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-slate-200 bg-white text-text-heading hover:border-brand-300'
              }
            `}
          >
            {inStockOnly ? '✓ In Stock' : 'In Stock Only'}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-4">
            <ProductListSkeleton count={6} />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm text-text-sub mb-4">Failed to load products</p>
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-2 bg-brand-500 text-white text-sm font-600 px-5 py-2.5 rounded-btn"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          products.length === 0 ? (
            <EmptyState categoryName={category?.name} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-4 py-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} layout="grid" />
              ))}
            </div>
          )
        )}
      </main>
      <BottomNav />
    </div>
  );
}

// ─── CategoryListing — Router Entry Point ────────────────────────────────────
export default function CategoryListing() {
  const { slug } = useParams();

  // /categories shows the full grid of all categories
  if (!slug) {
    return <AllCategoriesPage />;
  }

  return <CategoryProductsPage slug={slug} />;
}
