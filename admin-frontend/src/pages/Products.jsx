import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Plus, Trash2, Edit, Link as LinkIcon, Search, PackageOpen, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id && p._id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dashboard>
      <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Catalog</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage {products.length} products in your store</p>
          </div>
          <Link to="/products/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0f172a', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Plus size={18} /> New Product
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Toolbar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by product name or category..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} 
              />
            </div>
            
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#0f172a', borderRadius: '50%' }}></div>
              Loading catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
              <PackageOpen size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 500, color: '#475569' }}>No products found</p>
              <p style={{ fontSize: '0.875rem' }}>{search ? "Try a different search term" : "Start building your catalog by adding a product"}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id || prod.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }} className="hover-bg-slate-50">
                      <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '64px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <img src={prod.images?.[0] || ''} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{prod.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: { (prod._id || prod.id).slice(-8).toUpperCase() }</span>
                            {prod.supplierUrl && (
                              <a href={prod.supplierUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500 }}>
                                <LinkIcon size={12} /> Supplier
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>{prod.category}</span>
                          {prod.subcategory && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.subcategory}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          background: prod.status === 'publish' ? '#dcfce7' : '#f1f5f9', 
                          color: prod.status === 'publish' ? '#166534' : '#475569', 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' 
                        }}>
                          {prod.status === 'publish' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prod.stock > 10 ? '#22c55e' : prod.stock > 0 ? '#f59e0b' : '#ef4444' }}></div>
                          <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{prod.stock} units</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>₹{prod.price?.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => navigate(`/products/edit/${prod._id || prod.id}`)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', ':hover': { background: '#e2e8f0' } }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(prod._id || prod.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
