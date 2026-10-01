import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Grid, User } from 'lucide-react';
import useWishlistStore from '../store/wishlistStore';

export default function MobileBottomNav({ onOpenSearch }) {
  const location = useLocation();
  const wishlistItems = useWishlistStore(state => state.items);

  const wishlistCount = wishlistItems.length;

  // Don't show bottom nav on checkout or product detail pages (to avoid sticky collision)
  if (location.pathname === '/checkout' || location.pathname.startsWith('/product')) return null;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link to="/categories" className={`bottom-nav-item ${location.pathname === '/categories' ? 'active' : ''}`}>
        <Compass size={20} />
        <span>Explore</span>
      </Link>

      <button className="bottom-nav-item" onClick={onOpenSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Search size={20} />
        <span>Search</span>
      </button>

      <Link to="/shop" className={`bottom-nav-item ${location.pathname === '/shop' ? 'active' : ''}`}>
        <Grid size={20} />
        <span>Catalog</span>
      </Link>



      <Link to="/account" className={`bottom-nav-item ${location.pathname === '/account' && !location.search.includes('wishlist') ? 'active' : ''}`}>
        <User size={20} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
