import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Plus, Trash2, Edit, Link as LinkIcon } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  return (
    <Dashboard>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Products</h2>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage your EVRÉVIA catalog</p>
          </div>
          <Link to="/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', textDecoration: 'none' }}>
            <Plus size={18} /> Add Product
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading catalog...</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No products found. Start adding some!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Product</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Stock</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id || prod.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f3f4f6', overflow: 'hidden' }}>
                        <img src={prod.images?.[0] || ''} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{prod.name}</h4>
                        {prod.supplierUrl && (
                          <a href={prod.supplierUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '4px' }}>
                            <LinkIcon size={12} /> Supplier Source
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: '#4b5563' }}>{prod.category}</td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: '#111827', fontWeight: 500 }}>₹{prod.price}</td>
                    <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                      <span style={{ background: prod.stock > 0 ? '#dcfce7' : '#fee2e2', color: prod.stock > 0 ? '#166534' : '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px 8px' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(prod._id || prod.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
