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

  const [isLocating, setIsLocating] = useState(false);

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setNewAddr({ ...newAddr, pincode: val });
    
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setNewAddr(prev => ({
            ...prev,
            pincode: val,
            city: postOffice.District || prev.city,
            state: postOffice.State || prev.state
          }));
          toast.success("Location auto-filled!");
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    const loadingToast = toast.loading("Locating you...");
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        
        if (data && data.address) {
          setNewAddr(prev => ({
            ...prev,
            pincode: data.address.postcode || prev.pincode,
            city: data.address.city || data.address.state_district || data.address.county || prev.city,
            state: data.address.state || prev.state,
            street: data.address.road || data.address.suburb || data.address.neighbourhood || prev.street
          }));
          toast.dismiss(loadingToast);
          toast.success("Address auto-filled from location!");
        } else {
          toast.dismiss(loadingToast);
          toast.error("Could not determine address.");
        }
      } catch (err) {
        console.error("Geolocation fetch error:", err);
        toast.dismiss(loadingToast);
        toast.error("Failed to fetch address details.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Permission denied or location unavailable.");
      setIsLocating(false);
    });
  };

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

  // Lock body scroll when Address Modal is open
  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showAddressModal]);

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
    if ((!newAddr.fullName && !newAddr.name) || (!newAddr.mobile && !newAddr.phone) || !newAddr.house || !newAddr.pincode) {
      toast.error('Please fill all required address fields.');
      return;
    }

    const payload = {
      ...newAddr,
      name: newAddr.fullName || newAddr.name,
      phone: newAddr.mobile || newAddr.phone,
      street: newAddr.street || 'N/A',
      city: newAddr.city || 'N/A',
      state: newAddr.state || 'N/A'
    };

    try {
      if (editAddressId) {
        await updateAddress(editAddressId, payload);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(payload);
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
    <div style={{ boxSizing: 'border-box', maxWidth: '100%', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      {/* Account Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)', 
        border: '1px solid rgba(212, 175, 55, 0.2)', 
        borderRadius: '16px', 
        padding: '2rem 1.5rem', 
        marginBottom: '2.5rem', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '1.5rem',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0 }}>
          <div style={{ 
            width: '70px', height: '70px', flexShrink: 0, borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, #b89020 100%)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)',
            boxShadow: '0 8px 20px -5px rgba(212, 175, 55, 0.4)'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Valued Customer'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.02em', wordBreak: 'break-all' }}>
              {user?.email || 'customer@evrevia.com'}
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => { logout(); navigate('/login'); }} style={{ 
          padding: '10px 20px', fontSize: '0.85rem', borderRadius: '30px', 
          border: '1px solid var(--border-color)', background: 'transparent',
          color: 'var(--text-main)', transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Tabs Navigation Header */}
      <div className="hide-scrollbar" style={{ 
        display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-subtle)', 
        marginBottom: '2.5rem', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch',
        paddingBottom: '2px'
      }}>
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
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                position: 'relative',
                background: isActive ? '#faf8f5' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-light)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                transform: isActive ? 'translateY(1px)' : 'none'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-gold)' : 'currentColor'} style={{ transition: 'color 0.3s' }} />
              <span>{tab.label}</span>
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: '-3px', left: 0, right: 0, height: '2px',
                  background: 'var(--accent-gold)', borderRadius: '2px'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Profile */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--text-main)' }}>Login & Security</h3>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} style={{ 
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', 
                borderRadius: '30px', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600,
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <Edit2 size={14} color="var(--accent-gold)" /> Edit Details
              </button>
            )}
          </div>

          <div style={{ 
            boxSizing: 'border-box', maxWidth: '100%', overflow: 'hidden', 
            border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', 
            background: 'var(--bg-surface)', boxShadow: '0 10px 40px -15px rgba(0,0,0,0.05)'
          }}>
            {!isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500 }}>{user?.name || 'Not provided'}</div>
                </div>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500, wordBreak: 'break-all' }}>{user?.email || 'Not provided'}</div>
                </div>
                <div style={{ padding: '1.5rem 2rem' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Mobile Number</label>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500 }}>{user?.phone || 'Not provided'}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '10px', 
                      border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email} 
                    disabled
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '10px', 
                      border: '1px solid var(--border-subtle)', fontSize: '1rem', 
                      background: '#f8fafc', color: 'var(--text-muted)' 
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '6px', display: 'block' }}>Email cannot be changed online.</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mobile Phone Number</label>
                  <input 
                    type="tel" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '10px', 
                      border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '12px 24px', flex: 1, borderRadius: '30px', fontWeight: 600 }} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={handleEditCancel} className="btn-secondary" style={{ padding: '12px 24px', flex: 1, borderRadius: '30px', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <Link to={`/product/${item.productId}`} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--text-main)' }}>Saved Delivery Locations</h3>
            <button onClick={() => { setEditAddressId(null); setNewAddr({ fullName: user?.name || '', mobile: user?.phone || '', alternatePhone: '', pincode: '', house: '', street: '', landmark: '', city: '', state: '', addressType: 'Home', isDefault: true }); setShowAddressModal(true); }} className="btn-primary" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem', borderRadius: '30px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -15px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '80px', height: '80px', background: '#faf8f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-gold)' }}>
                <MapPin size={36} />
              </div>
              <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No addresses saved yet</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Add your delivery address to checkout faster and seamlessly.</p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="address-card" style={{ background: 'var(--bg-surface)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px -10px rgba(0,0,0,0.05)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px -10px rgba(0,0,0,0.08)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px -10px rgba(0,0,0,0.05)'; }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>{addr.fullName}</strong>
                    {addr.addressType && <span className="badge" style={{ background: '#faf8f5', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.2)' }}>{addr.addressType}</span>}
                  </div>
                  {addr.isDefault && <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '30px' }}>Default</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {addr.house}<br />
                  {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}<br />
                  {addr.city}, {addr.state} {addr.pincode}<br />
                  <span style={{ display: 'block', marginTop: '6px', color: 'var(--text-main)' }}>Phone: {addr.mobile} {addr.alternatePhone ? `, ${addr.alternatePhone}` : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <button onClick={() => handleEditAddress(addr)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 0.7} onMouseOut={(e) => e.currentTarget.style.opacity = 1}>
                    Edit Address
                  </button>
                  <span style={{ color: 'var(--border-subtle)' }}>|</span>
                  <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 0.7} onMouseOut={(e) => e.currentTarget.style.opacity = 1}>
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
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -15px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '80px', height: '80px', background: '#faf8f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-gold)' }}>
                <Heart size={36} />
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>Your wishlist is empty</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '420px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>Explore our luxury collection and tap the heart icon to save your favorite garments for later.</p>
              <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: '30px', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>Explore Collection</Link>
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

            <button 
              type="button" 
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#e0f2fe', 
                color: '#0284c7', 
                border: '1px dashed #7dd3fc', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                cursor: isLocating ? 'not-allowed' : 'pointer',
                transition: '0.2s'
              }}
            >
              <MapPin size={16} />
              {isLocating ? "Locating..." : "Use my current location"}
            </button>

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
                <input type="text" maxLength="6" required value={newAddr.pincode} onChange={handlePincodeChange} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>City</label>
                <input type="text" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>State</label>
                <select value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', appearance: 'none', background: 'white' }}>
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
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
