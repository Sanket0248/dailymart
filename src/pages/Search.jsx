import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '@/components/features/ProductCard';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dailymart-recent-searches';
const MAX_RECENT = 6;
const POPULAR_SEARCHES = ['Maggi', 'Amul', 'Parle', 'Colgate', 'Surf Excel'];

// ─── Recent searches helpers ──────────────────────────────────────────────────
function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(term) {
  if (!term.trim()) return;
  const prev = getRecent().filter((t) => t.toLowerCase() !== term.toLowerCase());
  const next = [term, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function removeRecent(term) {
  const next = getRecent().filter((t) => t !== term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

// ─── Search Input Bar ─────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onClear, inputRef }) {
  return (
    <div className="relative flex-1">
      <SearchIcon
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        placeholder="Search products, brands…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-9 pr-9 py-2.5 rounded-xl
          bg-surface-page border border-slate-200
          text-sm text-text-heading placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
          transition-all duration-150
        "
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-text-sub hover:text-text-heading hover:bg-slate-200 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ─── Recent Searches ──────────────────────────────────────────────────────────
function RecentSearches({ terms, onSelect, onRemove }) {
  if (terms.length === 0) return null;
  return (
    <div className="mb-5">
      <h2 className="text-sm font-600 text-text-heading mb-2.5">Recent Searches</h2>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <div
            key={term}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-pill px-3 py-1.5"
          >
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="text-xs font-500 text-text-heading"
            >
              {term}
            </button>
            <button
              type="button"
              aria-label={`Remove ${term} from recent`}
              onClick={() => onRemove(term)}
              className="flex items-center justify-center text-text-muted hover:text-text-heading transition-colors"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Popular Searches ─────────────────────────────────────────────────────────
function PopularSearches({ onSelect }) {
  return (
    <div>
      <h2 className="text-sm font-600 text-text-heading mb-2.5">Popular Searches</h2>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onSelect(term)}
            className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-500 rounded-pill px-3 py-1.5 hover:bg-brand-100 transition-colors"
          >
            <SearchIcon size={11} strokeWidth={2} />
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query, onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <span className="text-6xl mb-4" aria-hidden="true">🔍</span>
      <h3 className="text-base font-600 text-text-heading mb-1">No results found</h3>
      <p className="text-sm text-text-sub mb-6">
        No results found for{' '}
        <span className="font-600 text-text-heading">"{query}"</span>
      </p>
      <button
        type="button"
        onClick={onBrowse}
        className="bg-brand-500 text-white text-sm font-600 px-6 py-3 rounded-btn hover:bg-brand-600 active:bg-brand-700 transition-colors min-h-[44px]"
      >
        Browse Categories
      </button>
    </div>
  );
}

// ─── Search Results List ──────────────────────────────────────────────────────
function SearchResults({ results }) {
  if (results.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5 animate-fade-in">
      <p className="text-xs text-text-sub font-500 mb-1">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </p>
      {results.map((product) => (
        <ProductCard key={product.id} product={product} layout="horizontal" />
      ))}
    </div>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────
export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(getRecent);

  const debouncedQuery = useDebounce(query, 300);
  const { results, loading } = useSearch(debouncedQuery);

  const hasQuery = debouncedQuery.trim().length > 0;

  // Auto-focus on mount
  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Save search when user pauses typing and there are results
  useEffect(() => {
    if (debouncedQuery.trim() && results && results.length > 0) {
      saveRecent(debouncedQuery.trim());
      setRecent(getRecent());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, results]);

  const handleSelect = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (term) => {
    removeRecent(term);
    setRecent(getRecent());
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const safeResults = results || [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-100 bg-white sticky top-0 z-30">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} strokeWidth={2} className="text-text-heading" />
        </button>

        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          inputRef={inputRef}
        />
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* State 1: No query — show recent + popular */}
        {!hasQuery && (
          <div className="animate-fade-in">
            <RecentSearches
              terms={recent}
              onSelect={handleSelect}
              onRemove={handleRemoveRecent}
            />
            <PopularSearches onSelect={handleSelect} />
          </div>
        )}

        {/* State 2: Loading */}
        {hasQuery && loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-text-sub">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Searching…</span>
          </div>
        )}

        {/* State 3: Has query + results */}
        {hasQuery && !loading && safeResults.length > 0 && (
          <SearchResults results={safeResults} />
        )}

        {/* State 4: Has query + no results */}
        {hasQuery && !loading && safeResults.length === 0 && (
          <EmptyState
            query={debouncedQuery}
            onBrowse={() => navigate('/categories')}
          />
        )}
      </div>
    </div>
  );
}
