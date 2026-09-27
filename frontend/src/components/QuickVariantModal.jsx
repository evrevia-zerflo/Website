import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import useCartStore from '../store/cartStore';

export default function QuickVariantModal({ product, isOpen, onClose }) {
  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useCartStore(state => state.openCart);

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Default');

  if (!isOpen || !product) return null;

  const price = Number(product.price);
  const imageSrc = (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80';

  const handleConfirmAdd = () => {
    addToCart(product, 1, selectedSize, selectedColor);
    onClose();
    openCart();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Select Options</span>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Product Brief */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <img src={imageSrc} alt={product.name} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{product.name}</h4>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Select Size
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {product.sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '6px 14px',
                    border: selectedSize === sz ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                    background: selectedSize === sz ? 'var(--text-main)' : 'var(--bg-surface)',
                    color: selectedSize === sz ? 'var(--bg-primary)' : 'var(--text-main)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Color: <strong style={{ color: 'var(--text-main)' }}>{selectedColor}</strong>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {product.colors.map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    padding: '6px 12px',
                    border: selectedColor === col ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    background: selectedColor === col ? 'var(--accent-gold-light)' : 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary" onClick={handleConfirmAdd} style={{ width: '100%', padding: '0.9rem' }}>
          <ShoppingBag size={16} />
          <span>Confirm & Add to Bag</span>
        </button>
      </div>
    </div>
  );
}
