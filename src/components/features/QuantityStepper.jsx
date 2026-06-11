import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { clsx } from '@/utils/helpers';

const SIZE_MAP = {
  sm: {
    btn: 'w-6 h-6 min-w-[24px]',
    qty: 'min-w-[20px] text-xs',
    icon: 14,
  },
  md: {
    btn: 'w-8 h-8 min-w-[32px]',
    qty: 'min-w-[28px] text-sm',
    icon: 16,
  },
  lg: {
    btn: 'w-10 h-10 min-w-[40px]',
    qty: 'min-w-[32px] text-base',
    icon: 18,
  },
};

export default function QuantityStepper({
  qty = 0,
  onIncrease,
  onDecrease,
  onRemove,
  min = 0,
  max = 20,
  size = 'md',
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const isActive = qty > 0;
  const atMin = qty <= min;
  const atMax = qty >= max;

  const handleDecrease = () => {
    if (atMin) return;
    if (qty - 1 <= min && min === 0 && onRemove) {
      onRemove();
    } else {
      onDecrease?.();
    }
  };

  const showTrash = qty === 1 && min === 0;

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-between',
        'rounded-full border-2 transition-all duration-200',
        isActive
          ? 'border-accent-500 bg-accent-50'
          : 'border-slate-200 bg-white',
      )}
      role="group"
      aria-label="Quantity stepper"
    >
      {/* Decrease / Remove button */}
      <button
        type="button"
        aria-label={showTrash ? 'Remove item' : 'Decrease quantity'}
        onClick={handleDecrease}
        disabled={atMin}
        className={clsx(
          s.btn,
          'flex items-center justify-center rounded-full',
          'transition-colors duration-150 flex-shrink-0',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
          isActive
            ? 'text-accent-500 hover:bg-accent-100 active:bg-accent-200'
            : 'text-slate-400',
          atMin && !isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        {showTrash ? (
          <Trash2 size={s.icon} strokeWidth={2} />
        ) : (
          <Minus size={s.icon} strokeWidth={2.5} />
        )}
      </button>

      {/* Quantity display */}
      <span
        className={clsx(
          s.qty,
          'text-center font-bold select-none tabular-nums',
          'transition-colors duration-150',
          isActive ? 'text-accent-600' : 'text-slate-500',
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>

      {/* Increase button */}
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => !atMax && onIncrease?.()}
        disabled={atMax}
        className={clsx(
          s.btn,
          'flex items-center justify-center rounded-full',
          'transition-colors duration-150 flex-shrink-0',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
          isActive
            ? 'text-accent-500 hover:bg-accent-100 active:bg-accent-200'
            : 'text-slate-400 hover:bg-slate-100',
          atMax ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <Plus size={s.icon} strokeWidth={2.5} />
      </button>
    </div>
  );
}
