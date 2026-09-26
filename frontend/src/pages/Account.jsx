import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, ShieldCheck, ChevronRight, Plus, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAddressStore from '../store/addressStore';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addresses, deleteAddress, setSelectedAddressId } = useAddressStore();
  const { items: wishlistItems } = useWishlistStore();

  const activeTab = searchParams.get('tab') || 'profile';

  const sampleOrders = [
    {
      id: 'EV-1042',
      date: '22 Sep 2026',
      total: 1498,
      status: 'In Transit',
      itemsCount: 2,
      firstItemName: 'Aurelia Silk Satin Gown & Linen Top'
    },
    {
      id: 'EV-0988',
      date: '10 Aug 2026',
      total: 4299,
      status: 'Delivered',
      itemsCount: 1,
      firstItemName: 'Chanderi Handloom Anarkali'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Account Header */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)' }}>{user?.name || 'Valued Customer'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email || 'customer@evrevia.com'}</p>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Tabs Navigation Header */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'profile', label: 'Profile Info', icon: User },
          { id: 'orders', label: 'Order History', icon: Package },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                background: 'none',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Profile */}
      {activeTab === 'profile' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name || 'Sharif Rahman'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.email || 'sharif@evrevia.com'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Member Tier</label>
              <span className="badge badge-gold" style={{ display: 'inline-block', marginTop: '4px' }}>PARSI VIP Member</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Order History */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sampleOrders.map(order => (
            <div key={order.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1rem' }}>Order #{order.id}</strong>
                  <span className={`badge ${order.status === 'Delivered' ? 'badge-green' : 'badge-gold'}`}>{order.status}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.firstItemName}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Placed on {order.date} • Total ₹{order.total.toLocaleString('en-IN')}</p>
              </div>

              <Link to={`/order-tracking/${order.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Track Order <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Addresses */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Saved Delivery Locations</h3>
            <Link to="/checkout" className="btn-primary" style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}>
              <Plus size={14} /> Add New Address
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="address-card" style={{ background: 'var(--bg-surface)' }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <strong>{addr.fullName}</strong>
                  {addr.isDefault && <span className="badge badge-gold">Default</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {addr.house}, {addr.street}, {addr.city} – {addr.pincode}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#D32F2F', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <Heart size={44} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your wishlist is empty</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore our luxury collection and tap the heart icon to save your favorite garments.</p>
              <Link to="/shop" className="btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>Explore Collection</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
              {wishlistItems.map(item => (
                <ProductCard key={item.id || item._id} product={item} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
