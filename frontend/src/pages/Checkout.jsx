import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  MapPin, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  QrCode, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  X,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import CheckoutHeader from '../components/CheckoutHeader';
import ProgressiveImage from '../components/ProgressiveImage';
import useCartStore from '../store/cartStore';
import useAddressStore from '../store/addressStore';
import useAuthStore from '../store/authStore';
import api from '../api/client';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    coupon, 
    applyCoupon, 
    removeCoupon,
    getCartSubtotal, 
    getDiscountAmount, 
    getShippingCost, 
    getCartTotal,
    clearCart
  } = useCartStore();

  const { addresses, selectedAddressId, setSelectedAddressId, addAddress, getSelectedAddress } = useAddressStore();

  const [activeStep, setActiveStep] = useState(1); // Step 1: Address, Step 2: Review, Step 3: Payment
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    alternatePhone: '',
    pincode: '800001',
    house: '',
    street: '',
    landmark: '',
    city: 'Patna',
    state: 'Bihar',
    addressType: 'Home',
    isDefault: true
  });

  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCost();
  const total = getCartTotal();
  const selectedAddress = getSelectedAddress();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout.');
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  const handleContinueToReview = () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address first.');
      return;
    }
    setActiveStep(2);
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>Your shopping bag is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add some luxury pieces before proceeding to checkout.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')} style={{ width: 'auto' }}>
          Explore Collection
        </button>
      </div>
    );
  }

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.mobile || !newAddr.house || !newAddr.pincode) {
      alert('Please fill all required address fields.');
      return;
    }
    addAddress(newAddr);
    setShowAddressModal(false);
  };

  const handleApplyCouponSubmit = (e) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg('Coupon applied successfully!');
      setShowCouponModal(false);
    } else {
      setCouponMsg(res.error);
    }
  };

  const handlePlaceOrderAndPay = async () => {
    setPaymentProcessing(true);
    setShowQrModal(true);

    // Simulate backend payment verification callback after 3.5 seconds
    setTimeout(async () => {
      try {
        const orderData = {
          userId: user?.id || 'guest-' + Date.now(),
          items: items.map(i => ({ 
            productId: i.productId, 
            name: i.name,
            price: i.price, 
            quantity: i.quantity, 
            size: i.size, 
            color: i.color,
            image: i.image
          })),
          address: selectedAddress,
          subtotal: subtotal,
          shipping: shipping
        };
        const res = await api.post('/orders', orderData).catch(() => ({ data: { id: 'EV-' + Math.floor(1000 + Math.random() * 9000) } }));
        const orderId = res.data.id || res.data._id || 'EV-1042';

        clearCart();
        setPaymentProcessing(false);
        setShowQrModal(false);
        navigate(`/payment/${orderId}`);
      } catch (err) {
        console.error("Order error", err);
        setPaymentProcessing(false);
      }
    }, 3500);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* GoDaddy / Amazon Minimal Top Header */}
      <CheckoutHeader currentStep={activeStep} />

      <main className="checkout-container">
        <div className="checkout-grid">
          
          {/* LEFT COLUMN: 3 Expandable Cards */}
          <div className="checkout-left">
            
            {/* STEP 1: Delivery Address */}
            <div className={`checkout-card ${activeStep === 1 ? 'active' : ''}`}>
              <div className="checkout-card-header" onClick={() => setActiveStep(1)}>
                <div className="checkout-card-title">
                  <div className={`step-number ${activeStep > 1 ? 'completed' : ''}`}>
                    {activeStep > 1 ? <Check size={14} /> : '1'}
                  </div>
                  <span>1. Delivery Address</span>
                </div>
                {activeStep > 1 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit2 size={12} /> Edit
                  </span>
                )}
              </div>

              {activeStep === 1 && (
                <div className="checkout-card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a saved address or add a new delivery location.</p>
                    <button className="btn-secondary" onClick={() => setShowAddressModal(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Address
                    </button>
                  </div>

                  {/* Saved Address List */}
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{addr.fullName}</strong>
                          {addr.addressType && <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem' }}>{addr.addressType}</span>}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>📱 {addr.mobile} {addr.alternatePhone ? `| ${addr.alternatePhone}` : ''}</span>
                        </div>
                        {selectedAddressId === addr.id && <span className="badge badge-gold">Deliver Here</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {addr.house}, {addr.street} {addr.landmark ? `(Near ${addr.landmark})` : ''}, {addr.city}, {addr.state} – <strong>{addr.pincode}</strong>
                      </p>
                    </div>
                  ))}

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-primary" onClick={handleContinueToReview} style={{ width: 'auto' }}>
                      <span>Continue to Order Review</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Order Review */}
            <div className={`checkout-card ${activeStep === 2 ? 'active' : ''}`}>
              <div className="checkout-card-header" onClick={() => setActiveStep(2)}>
                <div className="checkout-card-title">
                  <div className={`step-number ${activeStep > 2 ? 'completed' : ''}`}>
                    {activeStep > 2 ? <Check size={14} /> : '2'}
                  </div>
                  <span>2. Order Review ({items.length} items)</span>
                </div>
                {activeStep > 2 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit2 size={12} /> Edit
                  </span>
                )}
              </div>

              {activeStep === 2 && (
                <div className="checkout-card-content">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: '65px', height: '80px' }}>
                          <ProgressiveImage src={item.image} alt={item.name} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Size: <strong>{item.size}</strong> | Color: <strong>{item.color}</strong>
                            </p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                              <span>Qty: <strong>{item.quantity}</strong></span>
                            </div>
                            <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={() => setActiveStep(1)} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      Back
                    </button>
                    <button className="btn-primary" onClick={() => setActiveStep(3)} style={{ width: 'auto' }}>
                      <span>Continue to Payment</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Payment */}
            <div className={`checkout-card ${activeStep === 3 ? 'active' : ''}`}>
              <div className="checkout-card-header" onClick={() => setActiveStep(3)}>
                <div className="checkout-card-title">
                  <div className="step-number">3</div>
                  <span>3. Payment Method</span>
                </div>
              </div>

              {activeStep === 3 && (
                <div className="checkout-card-content">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Select your preferred secure payment mode:
                  </p>

                  <div style={{ border: '2px solid var(--accent-gold)', background: 'var(--accent-gold-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <QrCode size={24} color="var(--accent-gold)" />
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>Instant UPI & QR Code</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay securely using Google Pay, PhonePe, Paytm, or BHIM</p>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Tag size={16} color="var(--accent-gold)" />
                      <span>{coupon ? `Coupon '${coupon.code}' Applied` : 'Have a Promo Coupon?'}</span>
                    </div>
                    <button onClick={() => setShowCouponModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                      {coupon ? 'Change' : 'Apply'}
                    </button>
                  </div>

                  <button className="btn-primary" onClick={handlePlaceOrderAndPay} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    <ShieldCheck size={20} />
                    <span>Pay ₹{total.toLocaleString('en-IN')} Securely</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Amazon-Style Sticky Price & Order Summary */}
          <div className="checkout-right" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                Order Summary
              </h3>

              {/* Miniature Item List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1.25rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <div style={{ width: '36px', height: '48px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                        <ProgressiveImage src={item.image} alt={item.name} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Qty: {item.quantity} | {item.size}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, paddingLeft: '8px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div className="flex-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Item Total ({items.length})</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex-between" style={{ color: '#2E7D32', fontWeight: 600 }}>
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Delivery Charges</span>
                  <span>{shipping === 0 ? <strong style={{ color: '#2E7D32' }}>FREE</strong> : `₹${shipping}`}</span>
                </div>

                <div className="flex-between" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {discount > 0 && (
                <div style={{ marginTop: '1rem', background: '#E8F5E9', color: '#2E7D32', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
                  🎉 You are saving ₹{discount.toLocaleString('en-IN')} on this order!
                </div>
              )}

              {selectedAddress && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Shipping To:</p>
                  <p style={{ lineHeight: 1.4 }}>{selectedAddress.fullName}, {selectedAddress.house}, {selectedAddress.city} – {selectedAddress.pincode}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Sticky Mobile Action Bar */}
      <div className="mobile-checkout-bar">
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Amount</span>
          <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>₹{total.toLocaleString('en-IN')}</strong>
        </div>

        {activeStep < 3 ? (
          <button className="btn-primary" onClick={() => activeStep === 1 ? handleContinueToReview() : setActiveStep(3)} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handlePlaceOrderAndPay} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            <span>Pay ₹{total.toLocaleString('en-IN')}</span>
          </button>
        )}
      </div>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>Add Delivery Address</h3>
              <button className="icon-btn" onClick={() => setShowAddressModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddAddressSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Full Name *</label>
                <input type="text" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Mobile Number *</label>
                <input type="tel" required value={newAddr.mobile} onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Alternate Number</label>
                <input type="tel" value={newAddr.alternatePhone} onChange={(e) => setNewAddr({ ...newAddr, alternatePhone: e.target.value })} placeholder="Optional" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>House / Flat / Building *</label>
                <input type="text" required value={newAddr.house} onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Area / Street / Sector</label>
                <input type="text" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Landmark</label>
                <input type="text" value={newAddr.landmark} onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })} placeholder="Optional" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>PIN Code *</label>
                <input type="text" required value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>City</label>
                <input type="text" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>State</label>
                <input type="text" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Address Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="radio" name="checkoutAddressType" checked={newAddr.addressType === 'Home'} onChange={() => setNewAddr({ ...newAddr, addressType: 'Home' })} style={{ accentColor: 'var(--accent-gold)' }} /> Home
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="radio" name="checkoutAddressType" checked={newAddr.addressType === 'Work'} onChange={() => setNewAddr({ ...newAddr, addressType: 'Work' })} style={{ accentColor: 'var(--accent-gold)' }} /> Work
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save & Deliver Here</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="modal-backdrop" onClick={() => setShowCouponModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>Apply Promo Coupon</h3>
              <button className="icon-btn" onClick={() => setShowCouponModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleApplyCouponSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text"
                placeholder="Enter code (e.g. WELCOME300)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>Apply</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div onClick={() => { applyCoupon('WELCOME300'); setShowCouponModal(false); }} style={{ border: '1px dashed var(--accent-gold)', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--accent-gold-light)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>WELCOME300</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get flat ₹300 OFF on your first purchase</p>
              </div>
              <div onClick={() => { applyCoupon('EVREVIA10'); setShowCouponModal(false); }} style={{ border: '1px dashed var(--accent-gold)', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--accent-gold-light)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>EVREVIA10</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get 10% OFF on all luxury orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic UPI Scan to Pay QR Code Modal */}
      {showQrModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              <Clock size={14} style={{ marginRight: '6px' }} /> Verification in progress
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Scan to Pay ₹{total.toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Order #EV-1042 • EVRÉVIA Store</p>

            <div style={{ background: '#FFF', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              {/* Dynamic QR SVG */}
              <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="#1A1817"/>
                <path d="M20 20H30V30H20V20Z" fill="#B8975A"/>
                <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z" fill="#1A1817"/>
                <path d="M70 20H80V30H70V20Z" fill="#B8975A"/>
                <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z" fill="#1A1817"/>
                <path d="M20 70H30V80H20V70Z" fill="#B8975A"/>
                <path d="M50 50H60V60H50V50Z" fill="#1A1817"/>
                <path d="M70 50H90V60H70V50Z" fill="#1A1817"/>
                <path d="M50 70H70V90H50V70Z" fill="#1A1817"/>
                <path d="M80 70H90V90H80V70Z" fill="#B8975A"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Waiting for payment confirmation...
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Open GPay, PhonePe or Paytm to authorize transaction.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
