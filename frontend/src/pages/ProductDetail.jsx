import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, MapPin, Sparkles, ArrowLeft, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import useCartStore from '../store/cartStore';
import ProgressiveImage from '../components/ProgressiveImage';
import useWishlistStore from '../store/wishlistStore';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import ProductCard from '../components/ProductCard';
import api from '../api/client';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // Garment Info Tab
  const [activeSpecTab, setActiveSpecTab] = useState('fabric');

  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useCartStore(state => state.openCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    const found = MOCK_PRODUCTS.find(p => p.id === id || p._id === id);
    if (found) {
      setProduct(found);
      if (found.sizes?.[0]) setSelectedSize(found.sizes[0]);
      if (found.colors?.[0]) setSelectedColor(found.colors[0]);
    } else {
      api.get(`/products/${id}`).then(res => {
        setProduct(res.data);
        if (res.data.sizes?.[0]) setSelectedSize(res.data.sizes[0]);
        if (res.data.colors?.[0]) setSelectedColor(res.data.colors[0]);
      }).catch(() => {});
    }
  }, [id]);

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  const productId = product.id || product._id;
  const isSaved = isInWishlist(productId);
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(price * 1.3);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const images = product.images?.length > 0 ? product.images : [{ url: product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' }];

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setDeliveryStatus(`Express Shipping available to ${pincode}! Delivered in 2-3 days.`);
    } else {
      setDeliveryStatus('Please enter a valid 6-digit PIN code.');
    }
  };

  const handleBuyNow = () => {
    addToCart(product, 1, selectedSize, selectedColor);
    openCart();
    navigate('/checkout');
  };

  const relatedProducts = MOCK_PRODUCTS.filter(p => (p.id || p._id) !== productId).slice(0, 4);

  return (
    <div style={{ maxWidth: '1150px', width: '100%', boxSizing: 'border-box', margin: '0 auto', padding: '1.25rem 1rem 4rem' }}>
      
      <button 
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', cursor: 'pointer', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={15} /> Back to Collection
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
        
        {/* LEFT: Gallery */}
        <div>
          <div style={{ position: 'relative', height: 'clamp(300px, 50vh, 460px)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)', marginBottom: '0.85rem', border: '1px solid var(--border-subtle)' }}>
            <ProgressiveImage 
              src={(typeof images[selectedImageIndex] === 'string' ? images[selectedImageIndex] : images[selectedImageIndex]?.url) || (typeof images[0] === 'string' ? images[0] : images[0]?.url)} 
              alt={product.name}
            />
            
            <button 
              onClick={() => toggleWishlist(product)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: isSaved ? 'var(--text-main)' : 'rgba(255, 255, 255, 0.9)',
                color: isSaved ? '#FFF' : 'var(--text-main)',
                border: 'none', borderRadius: '50%', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Heart size={18} fill={isSaved ? '#FFF' : 'none'} />
            </button>

            {images.length > 1 && (
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#FFF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '65px', height: '80px',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    border: selectedImageIndex === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <ProgressiveImage src={typeof img === 'string' ? img : img?.url} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Garment Details & Controls */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.subcategory || product.category || 'Collection'}
          </span>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, margin: '4px 0 0.5rem', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--accent-gold-light)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              <Star size={13} fill="currentColor" /> {product.rating || 4.9}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({product.reviewsCount || 42} ratings)</span>
            <span style={{ fontSize: '0.78rem', color: '#2E7D32', fontWeight: 600 }}>• In Stock ({product.stockCount || 8} left)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{price.toLocaleString('en-IN')}
            </span>
            {originalPrice > price && (
              <span style={{ fontSize: '1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercent > 0 && <span className="badge badge-rose">{discountPercent}% OFF</span>}
          </div>

          <div 
            style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Select Size</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}>Size Guide</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '7px 14px',
                      border: selectedSize === sz ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                      background: selectedSize === sz ? 'var(--text-main)' : 'var(--bg-surface)',
                      color: selectedSize === sz ? 'var(--bg-primary)' : 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
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

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Color: <strong style={{ color: 'var(--text-main)' }}>{selectedColor}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {product.colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      padding: '6px 12px',
                      border: selectedColor === col ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      background: selectedColor === col ? 'var(--accent-gold-light)' : 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <button 
              className="btn-primary"
              onClick={() => { addToCart(product, 1, selectedSize, selectedColor); openCart(); }}
              style={{ flex: 1, padding: '0.9rem' }}
            >
              <ShoppingBag size={17} />
              <span>Add to Bag</span>
            </button>
            <button 
              className="btn-accent"
              onClick={handleBuyNow}
              style={{ flex: 1, padding: '0.9rem' }}
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Doorstep Delivery Estimator */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <MapPin size={15} color="var(--accent-gold)" /> Check Doorstep Delivery
            </label>
            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '0.4rem' }}>
              <input 
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>Check</button>
            </form>
            {deliveryStatus && (
              <p style={{ fontSize: '0.78rem', color: deliveryStatus.includes('valid') ? '#D32F2F' : '#2E7D32', marginTop: '6px', fontWeight: 500 }}>
                {deliveryStatus}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* DETAILED CLOTHING & PRODUCT SPECIFICATIONS SECTION */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem', marginBottom: '4rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.25rem' }}>Garment & Product Details</h3>

        {/* Spec Tabs Header */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {[
            { id: 'fabric', label: 'Fabric & Composition' },
            { id: 'fit', label: 'Fit & Sizing' },
            { id: 'care', label: 'Care Instructions' },
            { id: 'styling', label: 'Styling Notes' },
            { id: 'included', label: "What's Included" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSpecTab(tab.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: activeSpecTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                background: 'none',
                color: activeSpecTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeSpecTab === tab.id ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Spec Tab Content */}
        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.7, minHeight: '80px' }}>
          {(() => {
            const renderList = (text, fallback) => {
              const content = text || fallback;
              if (!content.includes('|')) return <p>{content}</p>;
              
              const items = content.split('|').filter(i => i.trim());
              return (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-gold)' }}>•</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              );
            };

            return (
              <>
                {activeSpecTab === 'fabric' && (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>Fabric & Material Details:</p>
                    {renderList(product.fabric, '100% Pure Mulberry Silk Satin (19 Momme) | Fine Handloom Woven Fabric')}
                  </div>
                )}

                {activeSpecTab === 'fit' && (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>Silhouette & Fit Guide:</p>
                    {renderList(product.fit, 'Fluid relaxed silhouette. | Fits true to size with tailored waist contouring.')}
                  </div>
                )}

                {activeSpecTab === 'care' && (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>Garment Care Instructions:</p>
                    {renderList(product.care, 'Dry clean recommended. | Store in a breathable muslin garment bag away from direct sunlight.')}
                  </div>
                )}

                {activeSpecTab === 'styling' && (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>Haute Couture Styling Notes:</p>
                    {renderList(product.styling, 'Pair with gold drop earrings | Sleek crescent handbag | Stiletto sandals for evening receptions.')}
                  </div>
                )}

                {activeSpecTab === 'included' && (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>Package Contents:</p>
                    {renderList(product.whatsIncluded, '1x Primary Garment | 1x Evrévia Signature Storage Bag | Authenticity Card')}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* You May Also Like */}
      <section>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.25rem' }}>You May Also Like</h3>
        <div className="product-grid-catalog">
          {relatedProducts.map(p => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
