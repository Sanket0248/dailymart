import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Leaf } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { clsx } from '@/utils/helpers';

export default function TopBar() {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.getItemCount());

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50',
        'glass shadow-sm',
        'flex items-center justify-between',
        'px-4 h-[60px]',
        'safe-top',
      )}
      style={{ height: 'var(--top-bar-height, 60px)' }}
    >
      {/* ── Left: Logo ─────────────────────────────────────────────── */}
      <Link
        to="/"
        className="flex items-center gap-2 select-none active-scale"
        aria-label="Balaji Traders home"
      >
        <img src="/logo.png" alt="Balaji Traders" className="h-8" />
        <span className="font-800 text-xl tracking-tight text-brand-500">Balaji Traders</span>
      </Link>

      {/* ── Desktop Nav links (md+) ─────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
        {[
          { label: 'Home', to: '/' },
          { label: 'Categories', to: '/categories' },
          { label: 'Orders', to: '/orders' },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className="text-[15px] font-600 text-sub hover:text-brand-500 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Right: Action Icons ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Search products"
          onClick={() => navigate('/search')}
          className="relative flex items-center justify-center w-10 h-10 rounded-full text-heading hover:bg-slate-100 active-scale"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          aria-label={`Cart, ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
          onClick={() => navigate('/cart')}
          className="relative flex items-center justify-center w-10 h-10 rounded-full text-heading hover:bg-slate-100 active-scale"
        >
          <ShoppingCart size={20} strokeWidth={2.5} />

          {totalItems > 0 && (
            <span
              aria-hidden="true"
              className={clsx(
                'absolute -top-1 -right-1',
                'min-w-[18px] h-[18px] px-1',
                'flex items-center justify-center',
                'rounded-full text-white bg-accent-500',
                'text-[10px] font-bold leading-none',
                'border-2 border-white shadow-sm',
              )}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
