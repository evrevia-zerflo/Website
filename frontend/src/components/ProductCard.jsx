import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressiveImage from './ProgressiveImage';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import useWishlistStore from '../store/wishlistStore';
import QuickVariantModal from './QuickVariantModal';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  if (!product) return null;

  const productId = product.id || product._id;
  const isSaved = isInWishlist(productId);

  const imageSrc = (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80';
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(price * 1.3);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <>
      <div className="product-card" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}>
        {/* Product Image Box */}
        <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '125%', background: 'var(--bg-secondary)' }}>
          <Link to={`/product/${productId}`} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <ProgressiveImage 
              src={imageSrc} 
              alt={product.name} 
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </Link>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--text-main)', color: 'var(--bg-primary)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
              {discountPercent}% OFF
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: isSaved ? 'var(--text-main)' : 'rgba(255, 255, 255, 0.9)',
              color: isSaved ? '#FFF' : 'var(--text-main)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={isSaved ? '#FFF' : 'none'} />
          </button>
        </div>

        {/* Card Info Content */}
        <div className="product-card-info">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {product.subcategory || product.category || 'Luxury'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', fontWeight: 600 }}>
                <Star size={11} fill="var(--accent-gold)" color="var(--accent-gold)" />
                <span>{product.rating || 4.9}</span>
              </div>
            </div>

            <Link to={`/product/${productId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.name}
              </h4>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: '4px' }}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button 
              onClick={() => setShowQuickAdd(true)}
              className="btn-primary"
              style={{ padding: '5px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            >
              <ShoppingBag size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <QuickVariantModal product={product} isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </>
  );
}
