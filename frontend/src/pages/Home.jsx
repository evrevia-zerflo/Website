import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, RotateCcw, Truck, ChevronLeft, ChevronRight, 
  Flame, Gem, Sparkles, Award, Grid, Search, Filter, SlidersHorizontal, Tag, X 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategoryExplorer from '../components/CategoryExplorer';
import api from '../api/client';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const MOCK_LOOK_COMBOS = [
  {
    id: 'combo-1',
    title: 'Aurelia Silk Evening Edit',
    description: 'Cowl Neck Mulberry Silk Dress + Crescent Leather Bag + Pearl Drop Hoops',
    totalPrice: 6797,
    items: [
      { name: 'Cowl Silk Dress', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80', price: 4999 },
      { name: 'Crescent Bag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=80', price: 1299 },
      { name: 'Pearl Hoops', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80', price: 499 }
    ]
  },
  {
    id: 'combo-2',
    title: 'Royal Chanderi Festive Ensemble',
    description: 'Handloom Anarkali Kurti + Gold Embellished Clutch + Kundan Jhumkas',
    totalPrice: 8497,
    items: [
      { name: 'Chanderi Anarkali', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80', price: 5999 },
      { name: 'Gold Clutch', img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=300&q=80', price: 1699 },
      { name: 'Kundan Jhumkas', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', price: 799 }
    ]
  },
  {
    id: 'combo-3',
    title: 'Minimalist Resort Weekend',
    description: 'French Linen Wrap Dress + Woven Raffia Tote + Leather Mule Sandals',
    totalPrice: 4697,
    items: [
      { name: 'Linen Tunic', img: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=300&q=80', price: 3499 },
      { name: 'Straw Tote', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300&q=80', price: 1499 },
      { name: 'Mule Sandals', img: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=300&q=80', price: 1299 }
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [combos, setCombos] = useState(MOCK_LOOK_COMBOS);
  const [activeComboIndex, setActiveComboIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/products');
        if (res.data && res.data.length > 0) setProducts(res.data);
      } catch (err) {
        console.log("Using local mock products fallback");
      }

      try {
        const comboRes = await api.get('/combos');
        if (comboRes.data && comboRes.data.length > 0) setCombos(comboRes.data);
      } catch (err) {
        console.log("Using local mock combos fallback");
      }
    }
    loadData();
  }, []);

  const trendingApparel = products.filter(p => p.category === 'Clothing' || p.category === 'Dresses' || p.category === 'Ethnic' || p.category === 'Sarees').slice(0, 4);
  const trendingAcc = products.filter(p => p.category === 'Bags' || p.category === 'Jewelry' || p.category === 'Footwear').slice(0, 4);
  const under999Items = products.filter(p => p.price <= 999 || p.under999).slice(0, 4);

  const activeCombo = combos[activeComboIndex] || combos[0];

  return (
    <div className="home-page" style={{ paddingBottom: '3.5rem' }}>
      
      <div className="home-sections-flow">
        {/* 1. Cinematic Full-Bleed Fashion Hero Section */}
        <section className="home-sec-hero hero-v1-improved">
          <div className="hero-v1-inner">
            <div className="hero-v1-badge">
              <span>PARSI HAUTE COUTURE • 2026 EDIT</span>
            </div>

            <h1 className="hero-v1-title">
              Elegance Defined in Every Stitch
            </h1>

            <p className="hero-v1-subtitle">
              Discover minimalist hand-crafted gowns, royal Chanderi Anarkalis, and pure Mulberry silk apparel designed for effortless luxury.
            </p>

            <div className="hero-v1-cta-group">
              <button className="hero-v1-btn-gold" onClick={() => navigate('/shop')}>
                <span>Shop Collection</span>
                <ArrowRight size={18} />
              </button>
              <button className="hero-v1-btn-glass" onClick={() => navigate('/shop?category=Clothing')}>
                Explore Dresses
              </button>
            </div>

            <div className="hero-v1-trust-bar">
              <div className="hero-v1-trust-item">
                <Truck size={15} color="#D4B68E" />
                <span>Express Pan-India Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 10 Categories Showcase with 3-Image Collages */}
        <section className="home-sec-categories" style={{ maxWidth: '1250px', margin: '0 auto 4rem', padding: '0 1.25rem' }}>
          <CategoryExplorer hideHeader={true} variant="home" />
        </section>



        {/* 4. Trending Now */}
        <section className="home-sec-trending" style={{ maxWidth: '1250px', margin: '0 auto 4rem', padding: '0 1.25rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={14} color="var(--accent-gold)" /> MOST WANTED STYLES
            </span>
            <h2 style={{ fontSize: '2.1rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>Trending Now</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Curated trend statements across apparel, bags, and luxury accessories.</p>
          </div>

          {/* Trending Section 1: Apparel & Ethnic Wear */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <span>Trending Haute Apparel & Ethnic Wear</span>
            </h3>
            <div className="product-grid-catalog">
              {trendingApparel.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Trending Section 2: Bags & Luxury Accessories */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <Gem size={18} color="var(--accent-gold)" />
              <span>Trending Bags & Accessories</span>
            </h3>
            <div className="product-grid-catalog">
              {trendingAcc.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Dedicated Button to Open Full Trending Catalog */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/shop?sort=popular')} 
              style={{ padding: '0.95rem 2.5rem', fontSize: '0.92rem' }}
            >
              <span>Explore All Trending Products</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </section>

        {/* 5. Shop Under ₹999 (Impulse Edit) */}
        {under999Items.length > 0 && (
          <section className="home-sec-under999" style={{ background: 'var(--accent-gold-light)', padding: '3.5rem 1.25rem', marginBottom: '4rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '4px 12px', marginBottom: '6px' }}>Impulse Edit</span>
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Under ₹999 Essentials</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chic pearl earrings, sunglasses, and layered gold necklaces at friendly prices.</p>
              </div>

              <div className="product-grid-catalog">
                {under999Items.map(product => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. Complete the Look (5 Dynamic Styled Outfit Combos Switcher) */}
        <section className="home-sec-combos" style={{ maxWidth: '1050px', margin: '0 auto 4rem', padding: '0 1.25rem' }}>
          <div className="combo-box-card">
            
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>CURATED OUTFIT COMBOS</span>
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Complete The Look</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>{activeCombo.description}</p>
            </div>

            {/* 5 Combo Switcher Selector Chips */}
            <div className="horizontal-scroll-row" style={{ justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem', paddingBottom: '6px' }}>
              {combos.map((combo, idx) => (
                <button
                  key={combo.id || idx}
                  onClick={() => setActiveComboIndex(idx)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: activeComboIndex === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    background: activeComboIndex === idx ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    fontWeight: activeComboIndex === idx ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: activeComboIndex === idx ? '0 4px 12px rgba(212, 182, 142, 0.25)' : 'none'
                  }}
                >
                  Combo {idx + 1}: {combo.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Combo Display - Responsive for Mobile Screens */}
            <div className="combo-items-display">
              {activeCombo.items.map((item, itemIdx) => (
                <React.Fragment key={itemIdx}>
                  {itemIdx > 0 && <span className="combo-plus-tag">+</span>}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <img src={item.img} alt={item.name} className="combo-item-img" />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '6px', maxWidth: '100px', margin: '6px auto 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold-hover)', fontWeight: 700 }}>₹{item.price.toLocaleString()}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={() => navigate('/shop')} style={{ padding: '0.85rem 2rem', fontSize: '0.88rem' }}>
                <span>Shop Complete Outfit (₹{activeCombo.totalPrice.toLocaleString()})</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </section>

        {/* 7. Why EVRÉVIA - Luxury Horizontal Benefit Row */}
        <section className="home-sec-why" style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>THE EVRÉVIA PROMISE</span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>Why Women Shop at EVRÉVIA</h2>
          </div>

          <div className="why-evrevia-scroll-track why-evrevia-grid">
            
            {/* Card 1: Easy Doorstep Returns */}
            <div className="why-evrevia-card">
              <div className="why-evrevia-icon-wrap">
                <RotateCcw size={24} color="var(--accent-gold)" />
              </div>
              <div className="why-evrevia-text">
                <h4 className="why-evrevia-title">Easy 7-Day Returns</h4>
                <p className="why-evrevia-desc">Hassle-free doorstep pickup if the fit isn't right.</p>
              </div>
            </div>

            {/* Card 2: 100% Encrypted & COD */}
            <div className="why-evrevia-card">
              <div className="why-evrevia-icon-wrap">
                <ShieldCheck size={24} color="var(--accent-gold)" />
              </div>
              <div className="why-evrevia-text">
                <h4 className="why-evrevia-title">100% Secure Payments</h4>
                <p className="why-evrevia-desc">Encrypted UPI, Cards & Cash on Delivery support.</p>
              </div>
            </div>

            {/* Card 3: Pan-India Express Delivery */}
            <div className="why-evrevia-card">
              <div className="why-evrevia-icon-wrap">
                <Truck size={24} color="var(--accent-gold)" />
              </div>
              <div className="why-evrevia-text">
                <h4 className="why-evrevia-title">Pan-India Express Delivery</h4>
                <p className="why-evrevia-desc">Delivered directly to your doorstep in 2–4 days.</p>
              </div>
            </div>

            {/* Card 4: Artisanal Luxury Assurance */}
            <div className="why-evrevia-card">
              <div className="why-evrevia-icon-wrap">
                <Award size={24} color="var(--accent-gold)" />
              </div>
              <div className="why-evrevia-text">
                <h4 className="why-evrevia-title">Haute Quality Assurance</h4>
                <p className="why-evrevia-desc">100% inspected pure fabrics & luxury finish.</p>
              </div>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
