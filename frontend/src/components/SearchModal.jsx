import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';

const POPULAR_SEARCHES = ['Floral Dress', 'Silk Saree', 'Velvet Kurta', 'Embroidered Gown', 'Linen Top'];

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleChipClick = (term) => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Search EVRÉVIA Catalog</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search dresses, tops, ethnic wear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              outline: 'none',
              background: 'var(--bg-primary)'
            }}
          />
        </form>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Trending Searches
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {POPULAR_SEARCHES.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => handleChipClick(item)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSearchSubmit} style={{ width: 'auto' }}>
            <span>Search Catalog</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
