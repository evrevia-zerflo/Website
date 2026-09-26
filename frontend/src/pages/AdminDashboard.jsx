import React, { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, Plus, Link, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Dresses', description: '', price: '', stock: '25', supplierUrl: '', imageFile: null, imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products');
      if (res.data) setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProduct({...newProduct, imageFile: file, imageUrl: URL.createObjectURL(file)});
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    try {
      let finalImageUrl = '';
      
      // Upload image first if one is selected
      if (newProduct.imageFile) {
        const formData = new FormData();
        formData.append('file', newProduct.imageFile);
        
        const uploadRes = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalImageUrl = uploadRes.data.url;
      }

      // Create product
      const productPayload = {
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        supplierUrl: newProduct.supplierUrl,
        images: finalImageUrl ? [finalImageUrl] : []
      };

      const res = await api.post('/admin/products', productPayload);
      setProducts([res.data, ...products]);
      
      // Reset form
      setNewProduct({ name: '', category: 'Dresses', description: '', price: '', stock: '25', supplierUrl: '', imageFile: null, imageUrl: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert("Product added successfully!");
      
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id && p._id !== id));
    } catch(err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>EVRÉVIA Admin</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Store Management & Operations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* ADD PRODUCT FORM */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Add New Product
          </h2>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Image Upload Area */}
            <div 
              style={{ border: '2px dashed var(--border-subtle)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: newProduct.imageUrl ? `url(${newProduct.imageUrl}) center/cover` : 'transparent', position: 'relative' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!newProduct.imageUrl && (
                <>
                  <Upload size={32} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tap to upload product image</p>
                </>
              )}
              {newProduct.imageUrl && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>Change Image</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Product Name</label>
              <input type="text" placeholder="E.g. Elegant Evening Gown" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent' }} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Price (₹)</label>
                <input type="number" placeholder="2999" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent' }}>
                  <option value="Dresses">Dresses</option>
                  <option value="Tops">Tops</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <Link size={14} /> Secret Source Link (Hidden)
              </label>
              <input type="url" placeholder="Paste Meesho link here..." value={newProduct.supplierUrl} onChange={e => setNewProduct({...newProduct, supplierUrl: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '0.85rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Description</label>
              <textarea rows={3} placeholder="Premium quality fabric..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
              Publish Product
            </button>
          </form>
        </div>

        {/* PRODUCTS LIST */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} /> Live Catalog ({products.length})
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, maxHeight: '600px', paddingRight: '4px' }}>
            {isLoading ? <p>Loading...</p> : products.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No products yet. Start adding them!</p> : products.map((prod, i) => (
              <div key={prod.id || i} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', alignItems: 'center' }}>
                
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                  <img src={prod.images?.[0] || prod.image || ''} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>₹{prod.price}</span>
                    <span>•</span>
                    <span>{prod.category}</span>
                  </div>
                  {prod.supplierUrl && (
                    <a href={prod.supplierUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '4px', textDecoration: 'none' }}>
                      <Link size={10} /> View Source
                    </a>
                  )}
                </div>

                <button onClick={() => handleDelete(prod.id || prod._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
