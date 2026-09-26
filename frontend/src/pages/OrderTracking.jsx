import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Package, Clock, MapPin, ArrowLeft } from 'lucide-react';

export default function OrderTracking() {
  const { orderId } = useParams();

  const steps = [
    { title: 'Order Placed', time: '22 Sep, 02:30 PM', completed: true },
    { title: 'Order Confirmed', time: '22 Sep, 02:45 PM', completed: true },
    { title: 'Quality Check & Packed', time: '22 Sep, 05:15 PM', completed: true },
    { title: 'Shipped via Express Courier', time: '22 Sep, 08:00 PM', completed: true, active: true },
    { title: 'Out for Delivery', time: 'Expected 24 Sep', completed: false },
    { title: 'Delivered', time: 'Expected 24 Sep', completed: false }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
      <Link to="/account?tab=orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Order Timeline</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tracking ID: <strong>#{orderId || 'EV-1042'}</strong></p>
          </div>
          <span className="badge badge-gold" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <Truck size={14} style={{ marginRight: '4px' }} /> In Transit
          </span>
        </div>

        {/* Visual Timeline Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '2rem', marginBottom: '2.5rem' }}>
          {/* Vertical Track Line */}
          <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)' }} />

          {steps.map((step, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* Step Node Dot */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: step.completed ? (step.active ? 'var(--accent-gold)' : '#2E7D32') : 'var(--bg-secondary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                border: '2px solid var(--bg-surface)'
              }}>
                {step.completed ? <CheckCircle2 size={16} /> : (idx + 1)}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: step.active ? 700 : 600, color: step.completed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {step.title}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.time}</span>
            </div>
          ))}
        </div>

        {/* Package Card */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Package Contents</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1x Aurelia Silk Satin Gown (Champagne, Size M)</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1x Minimalist Linen Wrap Dress (Sand, Size M)</p>
        </div>

      </div>
    </div>
  );
}
