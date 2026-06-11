import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useBanners, useDeals, useTopPicks, useCategories } from '@/hooks/useProducts';
import ProductCard from '@/components/features/ProductCard';
import Skeleton, { ProductCardSkeleton } from '@/components/ui/Skeleton';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ─── Hero Carousel ──────────────────────────────────────────────────────────
function HeroCarousel({ banners, loading }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  if (loading) {
    return (
      <div className="px-4 pt-3">
        <Skeleton className="w-full" style={{ aspectRatio: '16/7', height: 'auto', minHeight: 160 }} />
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="px-4 pt-3">
      <div className="relative overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-none w-full relative"
              style={{ minWidth: '100%' }}
            >
              {/* Image */}
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Text content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-pill border border-white/30 mb-2">
                    {banner.badge}
                  </span>
                  <h2 className="text-white text-xl font-700 leading-tight mb-0.5">
                    {banner.title}
                  </h2>
                  <p className="text-white/80 text-sm font-400">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 right-4 flex gap-1.5 items-center">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Chips ─────────────────────────────────────────────────────────
function CategoryChips({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <div className="mt-6 mb-2">
      <SectionHeader
        title="Shop by Category"
        linkLabel="All Categories"
        onLink={() => navigate('/categories')}
      />
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-y-4 gap-x-2 px-4 mt-2">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton variant="circle" className="w-16 h-16 rounded-[20px]" />
                <Skeleton variant="text" className="h-3 w-12" />
              </div>
            ))
          : (categories || []).slice(0, 8).map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group flex flex-col items-center gap-1.5 active-scale"
              >
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center rounded-[20px] shadow-sm group-hover:shadow-soft transition-all duration-300"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </span>
                </div>
                <span className="text-[11px] font-600 text-slate-700 leading-tight text-center px-1">
                  {cat.name}
                </span>
              </button>
            ))}
      </div>
    </div>
  );
}

// ─── Section Header Component ────────────────────────────────────────────────
function SectionHeader({ title, linkLabel, onLink }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {onLink && (
        <button
          type="button"
          onClick={onLink}
          className="section-link flex items-center gap-0.5"
        >
          {linkLabel} <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ─── Deals of the Day ────────────────────────────────────────────────────────
function DealsSection({ deals, loading }) {
  const navigate = useNavigate();

  return (
    <section className="mt-8 bg-gradient-to-b from-amber-50 to-white py-6">
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-800 text-slate-800 flex items-center gap-2">
          <span className="text-xl">🔥</span> Super Deals
        </h2>
        <button
          type="button"
          onClick={() => navigate('/category/all')}
          className="text-[13px] font-700 text-brand-600 flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm active-scale"
        >
          See all <ChevronRight size={14} strokeWidth={3} className="ml-0.5" />
        </button>
      </div>
      
      <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : (deals || []).map((product) => (
              <div key={product.id} className="flex-shrink-0 w-40 snap-start">
                <ProductCard product={product} layout="snap" />
              </div>
            ))}
      </div>
    </section>
  );
}

// ─── Top Picks ────────────────────────────────────────────────────────────────
function TopPicksSection({ topPicks, loading }) {
  const navigate = useNavigate();

  return (
    <section className="mt-2 mb-6">
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-800 text-slate-800 flex items-center gap-2">
          <span className="text-xl">⭐</span> Top Picks
        </h2>
        <button
          type="button"
          onClick={() => navigate('/category/all')}
          className="text-[13px] font-700 text-brand-600 flex items-center bg-brand-50 px-3 py-1.5 rounded-full active-scale"
        >
          See all <ChevronRight size={14} strokeWidth={3} className="ml-0.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : (topPicks || []).map((product) => (
              <ProductCard key={product.id} product={product} layout="grid" />
            ))}
      </div>
    </section>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const { banners, loading: bannersLoading } = useBanners();
  const { deals, loading: dealsLoading } = useDeals();
  const { topPicks, loading: topPicksLoading } = useTopPicks();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <div className="page-wrapper bg-surface-page">
      <TopBar />

      {/* Scrollable content area */}
      <main className="pb-6">
        <HeroCarousel banners={banners} loading={bannersLoading} />
        <CategoryChips categories={categories} loading={categoriesLoading} />
        <DealsSection deals={deals} loading={dealsLoading} />
        <TopPicksSection topPicks={topPicks} loading={topPicksLoading} />

        {/* Bottom spacer */}
        <div className="h-4" />
      </main>

      <BottomNav />
    </div>
  );
}
