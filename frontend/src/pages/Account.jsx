import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Plus, Trash2, Edit2, Check, X, ShieldCheck, Box, RotateCcw, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAddressStore from '../store/addressStore';
import useWishlistStore from '../store/wishlistStore';
import useOrderStore from '../store/orderStore';
import ProductCard from '../components/ProductCard';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();
  const { addresses, deleteAddress, fetchAddresses, addAddress, updateAddress } = useAddressStore();
  const { items: wishlistItems } = useWishlistStore();

  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    alternatePhone: '',
    pincode: '',
    house: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    addressType: 'Home',
    isDefault: true
  });

  const { orders, fetchMyOrders, isLoading: ordersLoading, requestReturn } = useOrderStore();
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const handleSubmitReturn = async () => {
    if (!returnReason.trim()) {
      toast.error("Please enter a reason for the return.");
      return;
    }
    setIsSubmittingReturn(true);
    try {
      await requestReturn(returnModalOrder._id, returnReason);
      toast.success("Return requested successfully!");
      setReturnModalOrder(null);
      setReturnReason("");
    } catch (err) {
      toast.error(err.message || "Failed to submit return request.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchMyOrders();
    }
  }, [user, fetchAddresses, fetchMyOrders]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', { name: editName, phone: editPhone });
      login(response.data.user, useAuthStore.getState().token);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setIsEditingProfile(false);
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.mobile || !newAddr.house || !newAddr.pincode) {
      toast.error('Please fill all required address fields.');
      return;
    }
    try {
      if (editAddressId) {
        await updateAddress(editAddressId, newAddr);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(newAddr);
        toast.success('Address added successfully!');
      }
      setShowAddressModal(false);
      setEditAddressId(null);
      setNewAddr({ fullName: user?.name || '', mobile: user?.phone || '', alternatePhone: '', pincode: '', house: '', street: '', landmark: '', city: '', state: '', addressType: 'Home', isDefault: true });
    } catch (err) {
      toast.error(editAddressId ? 'Failed to update address' : 'Failed to add address');
    }
  };

  const handleEditAddress = (addr) => {
    setEditAddressId(addr.id);
    setNewAddr({ ...addr });
    setShowAddressModal(true);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Account Header */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
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
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
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
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '600px', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Login & Security</h3>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Edit2 size={14} /> Edit Profile
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Name</label>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{user?.name || 'Not provided'}</div>
              </div>
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{user?.email || 'Not provided'}</div>
              </div>
              <div style={{ paddingBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mobile Phone Number</label>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{user?.phone || 'Not provided'}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={user?.email} 
                  disabled
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '1rem', background: '#f8fafc', color: 'var(--text-muted)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>Email cannot be changed online.</span>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Mobile Phone Number</label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '10px 20px', flex: 1, borderRadius: '8px' }} disabled={isSaving}>
                  {isSaving ? "Saving..." : <><Check size={16} /> Save Changes</>}
                </button>
                <button onClick={handleEditCancel} className="btn-secondary" style={{ padding: '10px 20px', flex: 1, borderRadius: '8px' }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Order History */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 -1rem 0' }}>Your Orders</h3>
          
          {ordersLoading && <div style={{textAlign:'center', padding: '2rem'}}>Loading orders...</div>}
          {!ordersLoading && orders.length === 0 && <div style={{textAlign:'center', padding: '2rem'}}>No orders found.</div>}
          {!ordersLoading && orders.map(order => (
            <div key={order._id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              
              {/* Order Header (Amazon-style) */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Order Placed</div>
                  <div style={{ color: 'var(--text-main)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Total</div>
                  <div style={{ color: 'var(--text-main)' }}>₹{order.total.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Ship To</div>
                  <div style={{ color: 'var(--text-main)' }}>{order.address?.name || 'Customer'}</div>
                </div>
                <div style={{ textAlign: 'right', gridColumn: '1 / -1', '@media (min-width: 640px)': { gridColumn: 'auto' } }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Order # {order._id}</div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>View Invoice</button>
                </div>
              </div>

              {/* Order Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', margin: 0, color: order.orderStatus === 'DELIVERED' ? '#166534' : 'var(--text-main)' }}>
                  Status: {order.orderStatus}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                  {/* Items List */}
                  <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {order.items.map(item => (
                      <div key={item.productId} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '90px', height: '120px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                              <Box size={32} />
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Link to={`/product/${item.productId}`} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', marginBottom: '4px' }}>
                            {item.name}
                          </Link>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '12px' }}>₹{item.price.toLocaleString('en-IN')}</div>
                          
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'fit-content', borderRadius: '6px' }}>
                            <Package size={14} /> Buy it again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Column */}
                  <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link to={`/order-tracking/${order._id}`} className="btn-primary" style={{ padding: '10px', fontSize: '0.9rem', borderRadius: '8px', justifyContent: 'center', boxShadow: 'none' }}>
                      Track package
                    </Link>
                    {order.orderStatus === 'DELIVERED' && (!order.returnStatus || order.returnStatus === 'NONE') && (
                      <button 
                        onClick={() => setReturnModalOrder(order)}
                        className="btn-secondary" 
                        style={{ padding: '10px', fontSize: '0.9rem', borderRadius: '8px', justifyContent: 'center', background: '#fff' }}
                      >
                        <RotateCcw size={16} /> Return or replace items
                      </button>
                    )}
                    {order.returnStatus && order.returnStatus !== 'NONE' && (
                      <div style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', background: '#fff8f1', color: '#c2410c', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <RotateCcw size={14} /> Return Status: {order.returnStatus}
                      </div>
                    )}
                    <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.9rem', borderRadius: '8px', justifyContent: 'center', background: '#fff' }}>
                      <ShieldCheck size={16} /> Get order help
                    </button>
                    <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.9rem', borderRadius: '8px', justifyContent: 'center', background: '#fff' }}>
                      <Star size={16} /> Write a product review
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Addresses */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Saved Delivery Locations</h3>
            <button onClick={() => { setEditAddressId(null); setNewAddr({ fullName: user?.name || '', mobile: user?.phone || '', alternatePhone: '', pincode: '', house: '', street: '', landmark: '', city: '', state: '', addressType: 'Home', isDefault: true }); setShowAddressModal(true); }} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}>
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <MapPin size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No addresses saved yet</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Add your delivery address to checkout faster.</p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="address-card" style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1.05rem' }}>{addr.fullName}</strong>
                    {addr.addressType && <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{addr.addressType}</span>}
                  </div>
                  {addr.isDefault && <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Default</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {addr.house}<br />
                  {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}<br />
                  {addr.city}, {addr.state} {addr.pincode}<br />
                  Phone: {addr.mobile} {addr.alternatePhone ? `, ${addr.alternatePhone}` : ''}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <button onClick={() => handleEditAddress(addr)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}>
                    Edit
                  </button>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#D32F2F', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <Heart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Your wishlist is empty</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Explore our luxury collection and tap the heart icon to save your favorite garments for later.</p>
              <Link to="/shop" className="btn-primary" style={{ width: 'auto', display: 'inline-flex', padding: '10px 24px', borderRadius: '8px' }}>Explore Collection</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
              {wishlistItems.map(item => (
                <ProductCard key={item.id || item._id} product={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', width: '90%', maxWidth: '500px' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>{editAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}</h3>
              <button className="icon-btn" onClick={() => setShowAddressModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddAddressSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name *</label>
                <input type="text" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Mobile Number *</label>
                <input type="tel" required value={newAddr.mobile} onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Alternate Number</label>
                <input type="tel" value={newAddr.alternatePhone} onChange={(e) => setNewAddr({ ...newAddr, alternatePhone: e.target.value })} placeholder="Optional" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>House / Flat / Building *</label>
                <input type="text" required value={newAddr.house} onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Area / Street / Sector</label>
                <input type="text" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Landmark</label>
                <input type="text" value={newAddr.landmark} onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })} placeholder="Optional" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>PIN Code *</label>
                <input type="text" required value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>City</label>
                <input type="text" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>State</label>
                <input type="text" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Address Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="addressType" checked={newAddr.addressType === 'Home'} onChange={() => setNewAddr({ ...newAddr, addressType: 'Home' })} style={{ accentColor: 'var(--accent-gold)' }} /> Home
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="addressType" checked={newAddr.addressType === 'Work'} onChange={() => setNewAddr({ ...newAddr, addressType: 'Work' })} style={{ accentColor: 'var(--accent-gold)' }} /> Work
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>{editAddressId ? 'Update Address' : 'Save Address'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Return Modal */}
      {returnModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', animation: 'fadeSlideUp 0.3s ease-out' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Return Request</h3>
              <button onClick={() => setReturnModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                You are requesting a return for Order #{returnModalOrder.id || returnModalOrder._id.slice(-6).toUpperCase()}. Please tell us the reason for your return.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Reason for Return</label>
                  <select 
                    value={returnReason} 
                    onChange={(e) => setReturnReason(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', background: 'var(--bg-surface)' }}
                  >
                    <option value="">Select a reason</option>
                    <option value="Item defective or doesn't work">Item defective or doesn't work</option>
                    <option value="Wrong size or fit">Wrong size or fit</option>
                    <option value="Product looks different from image">Product looks different from image</option>
                    <option value="Arrived damaged">Arrived damaged</option>
                    <option value="No longer needed">No longer needed</option>
                  </select>
                </div>

                <button 
                  onClick={handleSubmitReturn}
                  disabled={isSubmittingReturn || !returnReason}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', opacity: (!returnReason || isSubmittingReturn) ? 0.7 : 1 }}
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
