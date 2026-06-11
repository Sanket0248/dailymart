import React from 'react';
import { clsx } from '@/utils/helpers';

/* ─── Base Skeleton ─────────────────────────────────────────────────────── */

export default function Skeleton({ className = '', variant = 'rect' }) {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded'
      : 'rounded-card';

  return (
    <div
      className={clsx('skeleton', shapeClass, className)}
      aria-hidden="true"
    />
  );
}

/* ─── ProductCardSkeleton ───────────────────────────────────────────────── */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card p-3 flex flex-col gap-3" aria-hidden="true">
      {/* Square image placeholder */}
      <div className="skeleton rounded-card w-full aspect-square" />

      {/* Text lines */}
      <div className="flex flex-col gap-2">
        <div className="skeleton rounded h-3 w-2/5" />
        <div className="skeleton rounded h-4 w-4/5" />
        <div className="skeleton rounded h-3 w-3/5" />
      </div>

      {/* Price row */}
      <div className="flex items-center gap-2">
        <div className="skeleton rounded h-5 w-1/3" />
        <div className="skeleton rounded h-3 w-1/4" />
      </div>

      {/* Add button */}
      <div className="skeleton rounded-btn h-10 w-full" />
    </div>
  );
}

/* ─── ProductListSkeleton ───────────────────────────────────────────────── */

export function ProductListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── OrderCardSkeleton ─────────────────────────────────────────────────── */

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3" aria-hidden="true">
      {/* Header row: order id + status badge */}
      <div className="flex items-center justify-between">
        <div className="skeleton rounded h-4 w-1/3" />
        <div className="skeleton rounded-full h-6 w-20" />
      </div>

      {/* Date */}
      <div className="skeleton rounded h-3 w-2/5" />

      {/* Item thumbnails row */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded w-14 h-14 flex-shrink-0" />
        ))}
      </div>

      {/* Divider-like line */}
      <div className="skeleton rounded h-px w-full" />

      {/* Total + button */}
      <div className="flex items-center justify-between">
        <div className="skeleton rounded h-5 w-1/4" />
        <div className="skeleton rounded-btn h-9 w-28" />
      </div>
    </div>
  );
}
