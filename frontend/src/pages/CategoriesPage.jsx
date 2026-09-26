import React, { useState, useMemo } from 'react';
import { Sparkles, Search, X, Tag } from 'lucide-react';
import CategoryExplorer from '../components/CategoryExplorer';
import { EVREVIA_CATEGORIES } from '../data/categoriesData';

export default function CategoriesPage() {
  const [catSearch, setCatSearch] = useState('');

  // Total subcategories count
  const totalSubcategories = useMemo(() => {
    return EVREVIA_CATEGORIES.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);
  }, []);

  return (
    <div className="categories-page" style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      
      {/* Category Hub Header Banner */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2.5rem',
        padding: '2.5rem 1.5rem',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-surface) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--accent-gold-light)', border: '1px solid rgba(212, 182, 142, 0.3)', marginBottom: '12px' }}>
          <Sparkles size={15} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            HAUTE COUTURE CATEGORY HUB
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', letterSpacing: '-0.01em' }}>
          Explore 10 Categories & {totalSubcategories} Subcategories
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '680px', margin: '6px auto 0', lineHeight: 1.5 }}>
          Discover our curated collection of luxury apparel, handloom Chanderi sarees, artisan leather bags, fine jewelry, timepieces & footwear.
        </p>

        {/* Quick Search Bar across Categories & Subcategories */}
        <div style={{ maxWidth: '420px', margin: '1.75rem auto 0', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search category or subcategory (e.g. Dresses, Silk, Leather)..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 42px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          />
          {catSearch && (
            <button
              onClick={() => setCatSearch('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Full Category Explorer Showcase */}
      <CategoryExplorer hideHeader={true} variant="full" />
    </div>
  );
}
