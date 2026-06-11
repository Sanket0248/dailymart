import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Customer pages — each manages its own TopBar + BottomNav ─────────────────
import Home from '@/pages/Home';
import CategoryListing from '@/pages/CategoryListing';
import ProductDetail from '@/pages/ProductDetail';
import Search from '@/pages/Search';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmed from '@/pages/OrderConfirmed';
import OrderTracking from '@/pages/OrderTracking';
import OrderHistory from '@/pages/OrderHistory';
import Account from '@/pages/Account';

// ── Admin pages (lazy loaded — separate code-split chunk) ────────────────────
const AdminLayout   = lazy(() => import('@/pages/admin/AdminLayout'));
const Dashboard     = lazy(() => import('@/pages/admin/Dashboard'));
const AdminOrders   = lazy(() => import('@/pages/admin/Orders'));
const Products      = lazy(() => import('@/pages/admin/Products'));
const Categories    = lazy(() => import('@/pages/admin/Categories'));
const Coupons       = lazy(() => import('@/pages/admin/Coupons'));
const Banners       = lazy(() => import('@/pages/admin/Banners'));
const Reports       = lazy(() => import('@/pages/admin/Reports'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Customer Routes ──────────────────────────────────────────── */}
      <Route path="/"                    element={<Home />} />
      <Route path="/categories"          element={<CategoryListing />} />
      <Route path="/category/:slug"      element={<CategoryListing />} />
      <Route path="/product/:id"         element={<ProductDetail />} />
      <Route path="/cart"                element={<Cart />} />
      <Route path="/orders"              element={<OrderHistory />} />
      <Route path="/orders/:id"          element={<OrderTracking />} />
      <Route path="/account"             element={<Account />} />
      <Route path="/search"              element={<Search />} />
      <Route path="/checkout"            element={<Checkout />} />
      <Route path="/order-confirmed/:id" element={<OrderConfirmed />} />

      {/* ── Admin Routes (code-split, protected inside AdminLayout) ──── */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
        <Route path="orders"     element={<Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense>} />
        <Route path="products"   element={<Suspense fallback={<AdminFallback />}><Products /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<AdminFallback />}><Categories /></Suspense>} />
        <Route path="coupons"    element={<Suspense fallback={<AdminFallback />}><Coupons /></Suspense>} />
        <Route path="banners"    element={<Suspense fallback={<AdminFallback />}><Banners /></Suspense>} />
        <Route path="reports"    element={<Suspense fallback={<AdminFallback />}><Reports /></Suspense>} />
        <Route path="settings"   element={<Suspense fallback={<AdminFallback />}><AdminSettings /></Suspense>} />
      </Route>

      {/* ── 404 fallback ─────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
