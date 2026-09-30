import React from 'react';
import { ArrowLeft, Heart, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export default function ProductDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1400px', width: '100%', boxSizing: 'border-box', margin: '0 auto', padding: '1.25rem 2rem 4rem' }}>
      
      {/* Back Button Skeleton */}
      <div style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={15} /> Back to Collection
      </div>

      <div className="product-detail-layout">
        
        {/* LEFT: Gallery Skeleton */}
        <div>
          {/* Main Image Skeleton */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '75vh', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)', marginBottom: '0.85rem', border: '1px solid var(--border-subtle)' }}>
            <div className="skeleton skeleton-box" style={{ borderRadius: 0 }}></div>
            
            {/* Wishlist Button Skeleton */}
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10
            }}>
              <Heart size={18} fill="none" color="var(--text-muted)" />
            </div>
          </div>

          {/* Thumbnails Skeleton */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {[1, 2, 3].map((_, idx) => (
              <div 
                key={idx}
                style={{ width: '80px', height: '100px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}
              >
                <div className="skeleton skeleton-box" style={{ borderRadius: 0 }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem' }}>
          
          {/* Header & Price Skeleton */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="skeleton skeleton-text short" style={{ height: '14px', width: '25%', marginBottom: 0 }}></div>
              <div className="skeleton skeleton-text" style={{ height: '14px', width: '15%', marginBottom: 0 }}></div>
            </div>
            
            <div className="skeleton skeleton-text" style={{ height: '36px', width: '85%', marginBottom: '12px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <div className="skeleton skeleton-text" style={{ height: '28px', width: '30%', marginBottom: 0 }}></div>
            </div>
            
            {/* Description lines skeleton */}
            <div className="skeleton skeleton-text" style={{ height: '14px', width: '100%' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '14px', width: '90%' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '14px', width: '60%' }}></div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0' }} />

          {/* Size & Color Skeleton */}
          <div>
            <div className="skeleton skeleton-text" style={{ height: '16px', width: '20%', marginBottom: '12px' }}></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ width: '50px', height: '38px', borderRadius: 'var(--radius-full)' }}></div>
              ))}
            </div>
            
            <div className="skeleton skeleton-text" style={{ height: '16px', width: '20%', marginBottom: '12px', marginTop: '1.5rem' }}></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }}></div>
              ))}
            </div>
          </div>

          {/* Add to Bag Button Skeleton */}
          <div style={{ marginTop: '0.5rem' }}>
            <div className="skeleton" style={{ width: '100%', height: '54px', borderRadius: 'var(--radius-full)' }}></div>
          </div>

          {/* Trust Badges Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            {[Truck, ShieldCheck, RotateCcw].map((Icon, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <Icon size={20} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                <div className="skeleton skeleton-text short" style={{ height: '10px', width: '60%', margin: '0 auto' }}></div>
              </div>
            ))}
          </div>

          {/* Accordions Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="skeleton skeleton-text" style={{ height: '18px', width: '40%', marginBottom: 0 }}></div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
