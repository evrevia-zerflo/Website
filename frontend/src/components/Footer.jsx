import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Don't render footer on Checkout page
  if (location.pathname === '/checkout') return null;

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '4rem', padding: '3.5rem 1.5rem 2rem' }}>
      {/* Reassurance Bar */}
      <div style={{ maxWidth: '1150px', margin: '0 auto 3.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Truck size={22} color="var(--accent-gold)" />
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 600 }}>Pan-India Delivery</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Express shipping on all orders</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <RotateCcw size={22} color="var(--accent-gold)" />
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 600 }}>7-Day Easy Returns</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Doorstep return pickup</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <ShieldCheck size={22} color="var(--accent-gold)" />
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 600 }}>Secure Payments</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>256-bit SSL encrypted UPI & cards</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Headphones size={22} color="var(--accent-gold)" />
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 600 }}>Customer Support</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mon–Sat, 10am–7pm</p>
          </div>
        </div>
      </div>

      {/* Main Link Columns */}
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.85rem' }}>
            EVRÉVIA
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Curated fashion, accessories, and everyday luxury for modern women. Made to be seen.
          </p>
        </div>

        <div>
          <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Shop</h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li><Link to="/categories" style={{ color: 'inherit' }}>Categories</Link></li>
            <li><Link to="/shop" style={{ color: 'inherit' }}>Catalog</Link></li>
            <li><Link to="/shop?category=Clothing" style={{ color: 'inherit' }}>Clothing</Link></li>
            <li><Link to="/shop?category=Bags" style={{ color: 'inherit' }}>Bags</Link></li>
            <li><Link to="/shop?category=Jewelry" style={{ color: 'inherit' }}>Jewelry</Link></li>
          </ul>
        </div>

        <div>
          <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Care</h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li><Link to="/account?tab=orders" style={{ color: 'inherit' }}>My Orders</Link></li>
            <li><Link to="/legal?tab=shipping" style={{ color: 'inherit' }}>Shipping & Delivery</Link></li>
            <li><Link to="/legal?tab=returns" style={{ color: 'inherit' }}>Returns & Refunds</Link></li>
            <li><Link to="/legal?tab=contact" style={{ color: 'inherit' }}>Contact & Help</Link></li>
          </ul>
        </div>

        <div>
          <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Legal</h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li><Link to="/legal?tab=privacy" style={{ color: 'inherit' }}>Privacy Policy</Link></li>
            <li><Link to="/legal?tab=terms" style={{ color: 'inherit' }}>Terms of Service</Link></li>
            <li><Link to="/legal?tab=returns" style={{ color: 'inherit' }}>Refund Policy</Link></li>
            <li><Link to="/admin" style={{ color: 'inherit' }}>Merchant Portal</Link></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1150px', margin: '1.5rem auto 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>© {currentYear} EVRÉVIA Store. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <span>UPI / GPay / PhonePe</span>
          <span>•</span>
          <span>Cards</span>
          <span>•</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
}
