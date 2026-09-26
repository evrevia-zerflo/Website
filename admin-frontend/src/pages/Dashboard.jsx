import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

export default function Dashboard({ children }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-role');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>EVRÉVIA</h1>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Portal</span>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#111827', textDecoration: 'none', background: window.location.pathname === '/' ? '#f3f4f6' : 'transparent', fontWeight: window.location.pathname === '/' ? 600 : 400 }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#111827', textDecoration: 'none', background: window.location.pathname.includes('/products') ? '#f3f4f6' : 'transparent', fontWeight: window.location.pathname.includes('/products') ? 600 : 400 }}>
            <Package size={20} /> Products
          </Link>
          <Link to="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#6b7280', textDecoration: 'none' }}>
            <ShoppingCart size={20} /> Orders <span style={{ marginLeft: 'auto', background: '#e5e7eb', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>Soon</span>
          </Link>
          <Link to="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#6b7280', textDecoration: 'none' }}>
            <Users size={20} /> Customers
          </Link>
        </nav>
        
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', width: '100%', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children ? children : (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Total Revenue</span>
                <h3 style={{ fontSize: '2rem', margin: '8px 0 0' }}>₹0</h3>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Active Orders</span>
                <h3 style={{ fontSize: '2rem', margin: '8px 0 0' }}>0</h3>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Products</span>
                <h3 style={{ fontSize: '2rem', margin: '8px 0 0' }}>Go to Products</h3>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <Package size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3>Ready to build your catalog</h3>
              <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>Start by adding your first product to EVRÉVIA. It will instantly appear on the customer-facing website.</p>
              <Link to="/products/new" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', textDecoration: 'none' }}>
                Add First Product
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
