import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Truck } from 'lucide-react';
import useCartStore from '../store/cartStore';
import ProgressiveImage from './ProgressiveImage';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    applyCoupon, 
    removeCoupon,
    coupon, 
    couponError,
    getCartSubtotal, 
    getDiscountAmount, 
    getShippingCost, 
    getCartTotal 
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');

  // Lock background scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
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
  }, [isCartOpen]);

  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCost();
  const total = getCartTotal();

  const freeShippingThreshold = 1499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {isCartOpen && <div className="cart-drawer-overlay open" onClick={closeCart} />}

      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-drawer-header" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Your Shopping Bag</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({items.length} items)</span>
          </div>
          <button className="icon-btn" onClick={closeCart}>
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Bar */}
        {subtotal > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <Truck size={14} color="var(--accent-gold)" />
                {subtotal >= freeShippingThreshold ? 'You unlocked FREE Shipping!' : `Add ₹${freeShippingThreshold - subtotal} more for FREE shipping`}
              </span>
              <span style={{ fontWeight: 600 }}>{progressPercent}%</span>
            </div>
            <div className="shipping-progress-track" style={{ height: '4px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div className="shipping-progress-fill" style={{ height: '100%', background: 'var(--accent-gold)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Drawer Items */}
        <div className="cart-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your bag is empty</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Explore our luxury collection and select your favorite garments.</p>
              <button className="btn-primary" onClick={() => { closeCart(); navigate('/shop'); }} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${index}`} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '70px', height: '90px' }}>
                  <ProgressiveImage src={item.image} alt={item.name} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.productId, item.size, item.color)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Size: <strong style={{ color: 'var(--text-main)' }}>{item.size}</strong> | Color: <strong style={{ color: 'var(--text-main)' }}>{item.color}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                        style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                        style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="cart-drawer-footer" style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Coupon Code Input */}
            <div>
              {coupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--accent-gold-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--accent-gold)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    <Tag size={14} />
                    <span>Coupon '{coupon.code}' applied</span>
                  </div>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME300)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p style={{ fontSize: '0.75rem', color: '#D32F2F', marginTop: '4px' }}>{couponError}</p>}
            </div>

            {/* Subtotal Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: '#2E7D32' }}>FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Fast Checkout CTA */}
            <button className="btn-primary" onClick={handleCheckout} style={{ marginTop: '0.5rem' }}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
