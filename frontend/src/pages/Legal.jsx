import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, FileText } from 'lucide-react';

export default function Legal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'shipping';

  return (
    <div style={{ maxWidth: '900px', width: '100%', boxSizing: 'border-box', margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600, textAlign: 'center', marginBottom: '2rem' }}>
        Customer Policies & Information
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
          { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
          { id: 'terms', label: 'Terms of Service', icon: FileText },
          { id: 'contact', label: 'Contact Us', icon: Headphones },
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

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.95rem' }}>
        {activeTab === 'shipping' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>Shipping & Delivery Policy</h2>
            <p>At EVRÉVIA, every garment is inspected for quality before dispatch. We ship across India using premium express courier partners.</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem' }}>
              <li><strong>Free Delivery:</strong> Orders above ₹1,499 qualify for FREE Express Shipping. Standard delivery fee is ₹99.</li>
              <li><strong>Delivery Timeline:</strong> Metro cities (2–3 business days), rest of India (3–5 business days).</li>
              <li><strong>Order Tracking:</strong> A live tracking link will be sent via SMS and Email as soon as your order leaves our warehouse.</li>
            </ul>
          </div>
        )}

        {activeTab === 'returns' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>Returns & Refund Policy</h2>
            <p>We want you to adore your EVRÉVIA garment. If the fit or style is not perfect, we offer a hassle-free 7-day return policy.</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem' }}>
              <li><strong>Doorstep Pickup:</strong> We arrange free return pickup directly from your address.</li>
              <li><strong>Condition:</strong> Items must be unworn, unwashed, and with all original brand tags attached.</li>
              <li><strong>Refund Method:</strong> Refunds are processed back to your original payment method or UPI account within 48 hours of return inspection.</li>
            </ul>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>Privacy Policy</h2>
            <p>Your privacy is strictly protected at EVRÉVIA. We collect only necessary details (name, phone, address) to process your order securely.</p>
            <p style={{ marginTop: '1rem' }}>We never sell or share your personal data with third-party advertisers. All payment transactions are encrypted using 256-bit SSL technology.</p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>Terms of Service</h2>
            <p>By accessing or placing an order on EVRÉVIA Store, you agree to our terms of service. All designs, text, and imagery are protected trademarks of EVRÉVIA PARSI.</p>
          </div>
        )}

        {activeTab === 'contact' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>Concierge Support</h2>
            <p style={{ marginBottom: '1.5rem' }}>Have questions about sizing, fabric care, or order customization? Our styling team is here to assist.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <p><strong>WhatsApp Concierge:</strong> +91 98765 43210</p>
              <p><strong>Email Support:</strong> concierge@evrevia.com</p>
              <p><strong>Flagship Studio:</strong> EVRÉVIA Atelier, Boring Road, Patna, Bihar – 800001</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
