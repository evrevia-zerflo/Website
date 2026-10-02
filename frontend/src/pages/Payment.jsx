import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ShieldCheck, QrCode, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-hot-toast';

export default function Payment() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // In Phase 2, we can set up polling here. For now, manual refresh.
  }, [orderId]);

  const copyUpiId = () => {
    // Extract UPI ID from URI or hardcode if standard
    navigator.clipboard.writeText("merchant@upi");
    toast.success("UPI ID copied to clipboard!");
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <RefreshCw className="spin" size={32} color="var(--accent-gold)" />
        <p style={{ marginTop: '1rem' }}>Loading payment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Order Not Found</h2>
        <Link to="/shop" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', width: 'auto' }}>Return to Shop</Link>
      </div>
    );
  }

  // PENDING_PAYMENT UI - Phase 1 Dynamic UPI QR
  if (order.paymentStatus === 'PENDING_PAYMENT') {
    return (
      <div style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box', margin: '3rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem', color: '#2E7D32', fontWeight: 600 }}>
            <ShieldCheck size={20} />
            <span>Secure UPI Payment</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Complete Your Order</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Scan the QR code with any UPI app to pay the exact amount securely.</p>

          <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem', display: 'inline-block' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Pay ₹{order.total.toLocaleString()}
            </p>
            
            {order.qrBase64 ? (
              <img src={`data:image/png;base64,${order.qrBase64}`} alt="UPI QR Code" style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block', borderRadius: '8px' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', flexDirection: 'column' }}>
                <QrCode size={48} color="#cbd5e1" />
                <span style={{ fontSize: '10px', color: 'red', marginTop: '8px' }}>QR failed to load</span>
              </div>
            )}
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              Ref: {order.paymentReference}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
            {order.upiUri && (
              <a href={order.upiUri} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                Open UPI App <ExternalLink size={16} />
              </a>
            )}
            
            <button className="btn-secondary" onClick={copyUpiId} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              Copy UPI ID <Copy size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2.5rem' }}>
            Please wait on this page after completing the payment. We will verify your transaction shortly.
          </p>
        </div>
      </div>
    );
  }

  // PAID UI - Success Screen
  return (
    <div style={{ maxWidth: '650px', width: '100%', boxSizing: 'border-box', margin: '3rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
        
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
