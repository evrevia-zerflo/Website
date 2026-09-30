import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Package, Clock, MapPin, ArrowLeft } from 'lucide-react';
import useOrderStore from '../store/orderStore';

export default function OrderTracking() {
  const { orderId } = useParams();
  const { fetchOrderById } = useOrderStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const data = await fetchOrderById(orderId);
      setOrder(data);
      setLoading(false);
    };
    loadOrder();
  }, [orderId, fetchOrderById]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading tracking information...</div>;
  }

  if (!order) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Order not found.</div>;
  }

  // NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  const statusLevels = {
    'NEW': 1,
    'PROCESSING': 2,
    'SHIPPED': 3,
    'DELIVERED': 4,
    'CANCELLED': -1
  };
  
  const currentLevel = statusLevels[order.orderStatus] || 1;

  const steps = [
    { title: 'Order Placed', time: new Date(order.createdAt).toLocaleDateString(), completed: currentLevel >= 1, active: currentLevel === 1 },
    { title: 'Order Confirmed', time: '', completed: currentLevel >= 2, active: false },
    { title: 'Quality Check & Packed', time: '', completed: currentLevel >= 2, active: currentLevel === 2 },
    { title: order.courierName ? `Shipped via ${order.courierName}` : 'Shipped', time: '', completed: currentLevel >= 3, active: currentLevel === 3 },
    { title: 'Delivered', time: '', completed: currentLevel >= 4, active: currentLevel >= 4 }
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tracking ID: <strong>{order.trackingId || 'Pending Allocation'}</strong>
            </p>
          </div>
          <span className="badge badge-gold" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <Truck size={14} style={{ marginRight: '4px' }} /> {order.orderStatus}
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
              {step.time && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.time}</span>}
            </div>
          ))}
        </div>

        {/* Package Card */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Package Contents</h4>
          {order.items.map((item, idx) => (
            <p key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {item.quantity}x {item.name} {item.size ? `(${item.size})` : ''} - ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}
