import React, { useId } from 'react';
import { clsx } from '@/utils/helpers';

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  className = '',
  ...rest
}) {
  const id = useId();
  const inputId = rest.id || id;

  const hasError = Boolean(error);

  const baseInputClass =
    'w-full min-h-[44px] rounded-btn border bg-white text-heading text-sm transition-all duration-150 ' +
    'focus:outline-none placeholder:text-slate-400 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50';

  const stateClass = hasError
    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

  const paddingClass = clsx(
    prefix ? 'pl-10' : 'pl-3',
    suffix ? 'pr-10' : 'pr-3',
    'py-2.5',
  );

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-heading leading-none"
        >
          {label}
          {rest.required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Prefix icon */}
        {prefix && (
          <span className="absolute left-3 text-slate-400 flex items-center pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          aria-invalid={hasError}
          className={clsx(baseInputClass, stateClass, paddingClass)}
          {...rest}
        />

        {/* Suffix icon */}
        {suffix && (
          <span className="absolute right-3 text-slate-400 flex items-center pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-red-500 leading-tight"
        >
          {error}
        </p>
      )}

      {/* Hint text (shown only if no error) */}
      {!hasError && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-sub leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}
