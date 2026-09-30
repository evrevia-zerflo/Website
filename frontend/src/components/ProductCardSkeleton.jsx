import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="product-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Product Image Box Skeleton */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
        <div className="skeleton skeleton-box"></div>
      </div>

      {/* Card Info Content Skeleton */}
      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            {/* Category text skeleton */}
            <div className="skeleton skeleton-text short" style={{ height: '10px', width: '30%', marginBottom: 0 }}></div>
            {/* Rating skeleton */}
            <div className="skeleton skeleton-text" style={{ height: '10px', width: '20px', marginBottom: 0 }}></div>
          </div>

          {/* Product Title Skeletons */}
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
          {/* Price Skeleton */}
          <div className="skeleton skeleton-text" style={{ height: '18px', width: '60px', marginBottom: 0 }}></div>

          {/* Add Button Skeleton */}
          <div className="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  );
}
