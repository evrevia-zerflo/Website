import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  ShoppingBag, 
  Footprints, 
  Gem, 
  Watch, 
  Sparkles, 
  Palette, 
  Glasses, 
  Smartphone, 
  Gift, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';
import { EVREVIA_CATEGORIES } from '../data/categoriesData';

const ICON_MAP = {
  Shirt,
  ShoppingBag,
  Footprints,
  Gem,
  Watch,
  Sparkles,
  Palette,
  Glasses,
  Smartphone,
  Gift
};

export default function CategoryExplorer({ hideHeader = false, variant = 'full' }) {
  const navigate = useNavigate();
  const [selectedCatId, setSelectedCatId] = useState(EVREVIA_CATEGORIES[0].id);

  const activeCategory = EVREVIA_CATEGORIES.find(c => c.id === selectedCatId) || EVREVIA_CATEGORIES[0];
  const ActiveIconComponent = ICON_MAP[activeCategory.iconName] || Sparkles;

  const handleSubCategoryClick = (catName, subName) => {
    navigate(`/shop?category=${encodeURIComponent(catName)}&subcategory=${encodeURIComponent(subName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (catName) => {
    navigate(`/shop?category=${encodeURIComponent(catName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // HOME VARIANT: Render ONLY the 10-category avatars + 3-photo subcategory visual lookbook
  if (variant === 'home') {
    return (
      <div style={{ maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          
          {!hideHeader && (
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                HAUTE COUTURE CATALOG
              </span>
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                Explore Categories & Subcategories
              </h2>
            </div>
          )}

          {/* 10 Categories Horizontal Avatar Selection Row */}
          <div className="horizontal-scroll-row" style={{ marginBottom: '1.75rem', paddingBottom: '10px', gap: '0.85rem' }}>
            {EVREVIA_CATEGORIES.map(cat => {
              const isSelected = selectedCatId === cat.id;
              const IconComp = ICON_MAP[cat.iconName] || Sparkles;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`cat-avatar-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--text-main)', padding: '2px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={10} color="var(--accent-gold)" />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category 3-Photo Subcategory Visual Lookbook */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ActiveIconComponent size={20} color="var(--accent-gold)" />
                <span>{activeCategory.name} Subcategories</span>
              </h4>
              
              <button 
                onClick={() => handleCategoryClick(activeCategory.name)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold-hover)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Explore All {activeCategory.name} <ArrowRight size={14} />
              </button>
            </div>

            <div className="subcat-grid-responsive">
              {activeCategory.subcategories.map((subItem, idx) => {
                const subName = typeof subItem === 'string' ? subItem : subItem.name;
                const price = typeof subItem === 'object' && subItem.startingPrice ? subItem.startingPrice : null;
                const badge = typeof subItem === 'object' && subItem.badge ? subItem.badge : null;
                const subImages = typeof subItem === 'string' 
                  ? [activeCategory.image, activeCategory.image, activeCategory.image] 
                  : (subItem.images || [activeCategory.image, activeCategory.image, activeCategory.image]);

                return (
                  <div
                    key={idx}
                    className="subcat-collage-card"
                    onClick={() => handleSubCategoryClick(activeCategory.name, subName)}
                  >
                    <div className="subcat-collage-box">
                      {badge && <span className="subcat-collage-tag">{badge}</span>}
                      
                      <div style={{ flex: '1.2', height: '100%', overflow: 'hidden' }}>
                        <img src={subImages[0]} alt={`${subName} 1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <img src={subImages[1] || subImages[0]} alt={`${subName} 2`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <img src={subImages[2] || subImages[0]} alt={`${subName} 3`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>

                    <div className="subcat-collage-footer">
                      <div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', lineHeight: 1.25 }}>
                          {subName}
                        </span>
                        {price ? (
                          <span style={{ fontSize: '0.71rem', color: 'var(--accent-gold-hover)', fontWeight: 600 }}>
                            From ₹{price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                            Explore Collection
                          </span>
                        )}
                      </div>
                      <ChevronRight size={14} color="var(--accent-gold)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // FULL VARIANT: Renders BOTH Element 1 (4-Tile Category Grid) and Element 2 (Subcategory Lookbook) in full-width 1350px layout
  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Container 1: Featured Category Collections (4-Tile Cards Grid) */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        
        {!hideHeader && (
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              HAUTE COUTURE CATALOG
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
              Featured Category Collections
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Explore luxury category collections & curated 4-tile subcategories.
            </p>
          </div>
        )}

        {/* ELEMENT 1: 4-TILE CATEGORY GRID HUB */}
        <div className="amazon-quad-grid">
          {EVREVIA_CATEGORIES.map(cat => {
            const IconComp = ICON_MAP[cat.iconName] || Sparkles;
            const quadSubcats = cat.subcategories.slice(0, 4);

            return (
              <div key={cat.id} className="amazon-quad-card">
                <div>
                  <div className="amazon-quad-header">
                    <div className="amazon-quad-title">
                      <IconComp size={18} color="var(--accent-gold)" />
                      <span>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {cat.subcategories.length} Subcategories
                    </span>
                  </div>

                  <div className="amazon-quad-tiles">
                    {quadSubcats.map((sub, sIdx) => {
                      const subName = typeof sub === 'string' ? sub : sub.name;
                      const subImage = typeof sub === 'string' 
                        ? cat.image 
                        : (sub.images && sub.images[0] ? sub.images[0] : cat.image);
                      const price = typeof sub === 'object' && sub.startingPrice ? sub.startingPrice : null;
                      const badge = typeof sub === 'object' && sub.badge ? sub.badge : null;

                      return (
                        <div 
                          key={sIdx}
                          className="amazon-quad-tile"
                          onClick={() => handleSubCategoryClick(cat.name, subName)}
                        >
                          <div className="quad-img-container">
                            <img src={subImage} alt={subName} className="quad-tile-img" />
                            {badge && <span className="quad-tile-badge">{badge}</span>}
                          </div>
                          
                          <span className="quad-tile-label">{subName}</span>
                          {price && (
                            <span className="quad-tile-price">
                              From ₹{price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div 
                  className="amazon-quad-footer"
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <span>Explore all in {cat.name}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Container 2: Subcategory Visual Lookbook (10-Category Avatar Bar + 3-Photo Collages) */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            VISUAL LOOKBOOK
          </span>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
            Explore Subcategory Lookbooks
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Select a category to view 3-photo collage cards & detailed subcategories.
          </p>
        </div>

        {/* 10 Categories Horizontal Avatar Row */}
        <div className="horizontal-scroll-row" style={{ marginBottom: '1.75rem', paddingBottom: '10px', gap: '0.85rem' }}>
          {EVREVIA_CATEGORIES.map(cat => {
            const isSelected = selectedCatId === cat.id;
            const IconComp = ICON_MAP[cat.iconName] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`cat-avatar-btn ${isSelected ? 'selected' : ''}`}
              >
                <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--text-main)', padding: '2px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={10} color="var(--accent-gold)" />
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category 3-Photo Collage Grid */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ActiveIconComponent size={20} color="var(--accent-gold)" />
              <span>{activeCategory.name} Subcategories</span>
            </h4>
            
            <button 
              onClick={() => handleCategoryClick(activeCategory.name)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-gold-hover)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Explore All {activeCategory.name} <ArrowRight size={14} />
            </button>
          </div>

          <div className="subcat-grid-responsive">
            {activeCategory.subcategories.map((subItem, idx) => {
              const subName = typeof subItem === 'string' ? subItem : subItem.name;
              const price = typeof subItem === 'object' && subItem.startingPrice ? subItem.startingPrice : null;
              const badge = typeof subItem === 'object' && subItem.badge ? subItem.badge : null;
              const subImages = typeof subItem === 'string' 
                ? [activeCategory.image, activeCategory.image, activeCategory.image] 
                : (subItem.images || [activeCategory.image, activeCategory.image, activeCategory.image]);

              return (
                <div
                  key={idx}
                  className="subcat-collage-card"
                  onClick={() => handleSubCategoryClick(activeCategory.name, subName)}
                >
                  <div className="subcat-collage-box">
                    {badge && <span className="subcat-collage-tag">{badge}</span>}

                    <div style={{ flex: '1.2', height: '100%', overflow: 'hidden' }}>
                      <img src={subImages[0]} alt={`${subName} 1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <img src={subImages[1] || subImages[0]} alt={`${subName} 2`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <img src={subImages[2] || subImages[0]} alt={`${subName} 3`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  </div>

                  <div className="subcat-collage-footer">
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', lineHeight: 1.25 }}>
                        {subName}
                      </span>
                      {price ? (
                        <span style={{ fontSize: '0.71rem', color: 'var(--accent-gold-hover)', fontWeight: 600 }}>
                          From ₹{price.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                          Explore Collection
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} color="var(--accent-gold)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
