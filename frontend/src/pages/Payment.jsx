import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Payment() {
  const { orderId } = useParams();

  return (
    <div style={{ maxWidth: '650px', width: '100%', boxSizing: 'border-box', margin: '3rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Animated Green Success Badge */}
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={44} />
        </div>

        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Payment Confirmed</span>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Thank You For Your Order!
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your order <strong>#{orderId || 'EV-1042'}</strong> has been placed successfully and is now being prepared by our master tailors.
        </p>

        {/* Delivery Estimate Box */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Truck size={22} color="var(--accent-gold)" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Estimated Delivery</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Express Courier Shipping</p>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Expected Arrival: 2-3 Business Days
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to={`/order-tracking/${orderId || 'EV-1042'}`} className="btn-primary" style={{ width: 'auto', padding: '0.85rem 1.75rem' }}>
            <Package size={18} />
            <span>Track Order Timeline</span>
          </Link>
          <Link to="/shop" className="btn-secondary" style={{ width: 'auto', padding: '0.85rem 1.5rem' }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
