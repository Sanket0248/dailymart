import React from 'react';
import { clsx } from '@/utils/helpers';

const variantClasses = {
  success: 'bg-brand-100 text-brand-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  gray:    'bg-slate-100 text-slate-600',
  brand:   'bg-brand-500 text-white',
  accent:  'bg-accent-500 text-white',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function Badge({
  variant = 'gray',
  size = 'sm',
  children,
  className = '',
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        'rounded-full font-semibold leading-none whitespace-nowrap',
        variantClasses[variant] || variantClasses.gray,
        sizeClasses[size] || sizeClasses.sm,
        className,
      )}
    >
      {children}
    </span>
  );
}
