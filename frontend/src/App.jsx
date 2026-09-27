import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load Pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Payment = React.lazy(() => import('./pages/Payment'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const Account = React.lazy(() => import('./pages/Account'));
const Login = React.lazy(() => import('./pages/Login'));
const Legal = React.lazy(() => import('./pages/Legal'));

function FallbackLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check if current route is checkout
  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className={`app-container ${!isCheckoutPage ? 'has-bottom-nav' : ''}`}>
      {/* Standard Header (hidden on Checkout page) */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Page Router */}
      <ErrorBoundary>
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {/* Footer (hidden on Checkout page) */}
      <Footer />

      {/* Global Overlays & Mobile Bars */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
