import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function DynamicListInput({ label, items, onChange, placeholder = "Add an item..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onChange([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (indexToRemove, e) => {
    e.preventDefault();
    onChange(items.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd(e);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      
      {/* List Display */}
      {items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'var(--bg-secondary)', 
              padding: '0.65rem 1rem', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-gold)', marginTop: '2px' }}>•</span>
                <span>{item}</span>
              </div>
              <button 
                onClick={(e) => handleRemove(idx, e)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove item"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Input Field */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="form-input"
          style={{ flex: 1, margin: 0 }}
        />
        <button 
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          style={{
            background: inputValue.trim() ? 'var(--text-main)' : 'var(--bg-secondary)',
            color: inputValue.trim() ? '#FFF' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0 1rem',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
