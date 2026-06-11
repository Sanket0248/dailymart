import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, Package, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { clsx } from '@/utils/helpers';

const NAV_ITEMS = [
  { label: 'Home',       to: '/',           icon: Home },
  { label: 'Categories', to: '/categories', icon: Grid3X3 },
  { label: 'Cart',       to: '/cart',       icon: ShoppingCart, showBadge: true },
  { label: 'Orders',     to: '/orders',     icon: Package },
  { label: 'Account',    to: '/account',    icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const totalItems = useCartStore((s) => s.getItemCount());

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname.startsWith(to);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none safe-bottom">
      <nav
        aria-label="Primary navigation"
        className={clsx(
          'mx-auto max-w-[400px]',
          'glass shadow-soft rounded-2xl',
          'flex items-center justify-between px-2 py-2',
          'pointer-events-auto',
        )}
      >
        {NAV_ITEMS.map(({ label, to, icon: Icon, showBadge }) => {
          const active = isActive(to);
          const cartCount = showBadge ? totalItems : 0;

          return (
            <Link
              key={to}
              to={to}
              aria-label={showBadge && cartCount > 0 ? `${label}, ${cartCount} items` : label}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'relative flex-1 flex flex-col items-center justify-center gap-1',
                'min-h-[50px]',
                'transition-all duration-300 active-scale',
                active ? 'text-brand-500' : 'text-sub hover:text-heading',
              )}
            >
              {/* Active Indicator Blob */}
              {active && (
                <div className="absolute inset-0 bg-brand-50 rounded-xl -z-10 animate-fade-in" />
              )}

              <span className="relative flex items-center justify-center">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className={clsx('transition-transform duration-300', active && '-translate-y-0.5')}
                  aria-hidden="true"
                />
                {showBadge && cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'absolute -top-1.5 -right-2',
                      'min-w-[16px] h-4 px-1',
                      'flex items-center justify-center',
                      'rounded-full text-white bg-accent-500',
                      'text-[9px] font-bold leading-none shadow-sm',
                      'border-2 border-white',
                    )}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>

              <span
                className={clsx(
                  'text-[10px] font-600 leading-none transition-all duration-300',
                  active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 absolute bottom-0 pointer-events-none'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
