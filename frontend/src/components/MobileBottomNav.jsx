import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Heart, User, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';

export default function MobileBottomNav({ onOpenSearch }) {
  const location = useLocation();
  const cartItems = useCartStore(state => state.items);
  const toggleCartDrawer = useCartStore(state => state.toggleCartDrawer);
  const wishlistItems = useWishlistStore(state => state.items);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Don't show bottom nav on checkout page
  if (location.pathname === '/checkout') return null;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link to="/shop" className={`bottom-nav-item ${location.pathname === '/shop' ? 'active' : ''}`}>
        <Compass size={20} />
        <span>Explore</span>
      </Link>

      <button className="bottom-nav-item" onClick={onOpenSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Search size={20} />
        <span>Search</span>
      </button>

      <Link to="/account?tab=wishlist" className={`bottom-nav-item ${location.search.includes('wishlist') ? 'active' : ''}`}>
        <Heart size={20} />
        {wishlistCount > 0 && <span className="badge-count" style={{ top: '2px', right: '14px', width: '15px', height: '15px', fontSize: '0.65rem' }}>{wishlistCount}</span>}
        <span>Saved</span>
      </Link>

      <button className="bottom-nav-item" onClick={() => toggleCartDrawer(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ShoppingBag size={20} />
        {cartCount > 0 && <span className="badge-count" style={{ top: '2px', right: '14px', width: '15px', height: '15px', fontSize: '0.65rem' }}>{cartCount}</span>}
        <span>Bag</span>
      </button>

      <Link to="/account" className={`bottom-nav-item ${location.pathname === '/account' && !location.search.includes('wishlist') ? 'active' : ''}`}>
        <User size={20} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
