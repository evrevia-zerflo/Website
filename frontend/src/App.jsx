import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderTracking from './pages/OrderTracking';
import Account from './pages/Account';
import Login from './pages/Login';
import Legal from './pages/Legal';
import AdminDashboard from './pages/AdminDashboard';

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
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

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
