import React from 'react';
import { clsx } from '@/utils/helpers';

const variantClasses = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 border-transparent',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 border-transparent',
  outline: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-50 active:bg-brand-100 bg-transparent',
  ghost: 'text-brand-500 hover:bg-brand-50 active:bg-brand-100 border-transparent bg-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border-transparent',
};

const sizeClasses = {
  sm: 'text-sm py-1.5 px-3 min-h-[44px]',
  md: 'text-sm py-2.5 px-4 min-h-[44px]',
  lg: 'text-base py-3.5 px-6 min-h-[44px]',
};

function Spinner({ size }) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <svg
      className={clsx(dim, 'animate-spin')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'rounded-btn font-semibold',
        'transition-all duration-150 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-400',
        'select-none',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      )}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      {loading && <Spinner size={size} />}
      {children}
    </button>
  );
}
