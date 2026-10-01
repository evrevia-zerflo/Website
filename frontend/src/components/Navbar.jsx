import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Moon, Sun, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';

export default function Navbar({ onOpenSearch }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const toggleCartDrawer = useCartStore(state => state.toggleCartDrawer);
  const wishlistItems = useWishlistStore(state => state.items);
  
  const [isDark, setIsDark] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme ? 'dark' : 'light');
  };

  // Don't render top navbar on Checkout page
  if (location.pathname === '/checkout') return null;

  return (
    <header className="navbar">
        {/* Left: Brand Logo */}
        <div className="nav-brand">
          <Link to="/" className="brand-logo">EVRÉVIA</Link>
        </div>

        {/* Center: Desktop Navigation with Line Separators */}
        <nav className="nav-links-center">
          <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>

          <span className="nav-divider" />

          <Link to="/categories" className={`nav-link-item ${location.pathname === '/categories' ? 'active' : ''}`}>
            Category
          </Link>

          <span className="nav-divider" />

          <Link to="/shop" className={`nav-link-item ${location.pathname === '/shop' ? 'active' : ''}`}>
            Catalog
          </Link>

          <span className="nav-divider" />

          <Link to="/legal" className={`nav-link-item ${location.pathname === '/legal' ? 'active' : ''}`}>
            About & Support
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          <button className="icon-btn" onClick={onOpenSearch} title="Search Catalog" aria-label="Search">
            <Search size={19} />
          </button>

          <Link to="/account?tab=wishlist" className="icon-btn hide-on-mobile" title="Wishlist" aria-label="Wishlist">
            <Heart size={19} />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </Link>

          <button className="icon-btn" onClick={() => toggleCartDrawer(true)} title="Shopping Bag" aria-label="Shopping Bag">
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>

          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <Link to="/account" className="icon-btn hide-on-mobile" title="Account" style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600 }}>
              <User size={15} />
              <span>{user?.name?.split(' ')[0] || 'Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="btn-secondary hide-on-mobile" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}>
              Sign In
            </Link>
          )}
        </div>
      </header>
  );
}
