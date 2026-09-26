import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check } from 'lucide-react';

export default function CheckoutHeader({ currentStep = 1 }) {
  return (
    <header className="checkout-header">
      <div className="checkout-brand">
        <Link to="/" className="brand-logo" style={{ fontSize: '1.3rem' }}>EVRÉVIA</Link>
        <div className="secure-tag">
          <ShieldCheck size={14} color="#2E7D32" />
          <span>Secure Checkout</span>
        </div>
      </div>

      <div className="checkout-stepper">
        <div className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > 1 ? <Check size={14} /> : '1'}</div>
          <span style={{ display: currentStep === 1 ? 'inline' : 'none' }}>Address</span>
          <span className="desktop-only-inline">Address</span>
        </div>

        <div style={{ width: '20px', height: '1px', background: 'var(--border-color)' }}></div>

        <div className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > 2 ? <Check size={14} /> : '2'}</div>
          <span style={{ display: currentStep === 2 ? 'inline' : 'none' }}>Review</span>
          <span className="desktop-only-inline">Review</span>
        </div>

        <div style={{ width: '20px', height: '1px', background: 'var(--border-color)' }}></div>

        <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span style={{ display: currentStep === 3 ? 'inline' : 'none' }}>Payment</span>
          <span className="desktop-only-inline">Payment</span>
        </div>
      </div>
    </header>
  );
}
