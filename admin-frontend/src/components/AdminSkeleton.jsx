import React from 'react';

export function StatCardSkeleton() {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="skeleton skeleton-text short" style={{ height: '14px', width: '40%', marginBottom: 0 }}></div>
        <div className="skeleton skeleton-avatar" style={{ width: '24px', height: '24px' }}></div>
      </div>
      <div className="skeleton skeleton-text" style={{ height: '32px', width: '60%', marginBottom: '0.5rem' }}></div>
      <div className="skeleton skeleton-text" style={{ height: '12px', width: '30%', marginBottom: 0 }}></div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div className="skeleton skeleton-text" style={{ height: '14px', width: i === 0 ? '70%' : '100%', marginBottom: 0 }}></div>
        </td>
      ))}
    </tr>
  );
}

export function FormFieldSkeleton() {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="skeleton skeleton-text" style={{ height: '14px', width: '20%', marginBottom: '8px' }}></div>
      <div className="skeleton skeleton-text" style={{ height: '42px', width: '100%', borderRadius: '8px', marginBottom: 0 }}></div>
    </div>
  );
}
