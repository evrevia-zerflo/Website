import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, Tag, TrendingUp, Plus, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState([
    { id: 'EV-1042', customerName: 'Sharif Rahman', total: 1498, paymentStatus: 'PAID', orderStatus: 'SHIPPED' },
    { id: 'EV-0988', customerName: 'Ananya K.', total: 4299, paymentStatus: 'PAID', orderStatus: 'DELIVERED' }
  ]);
  
  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Dresses', description: '', price: '', stock: '25', image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodRes = await api.get('/products');
      if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data);
      
      const ordRes = await api.get('/admin/orders');
      if (ordRes.data && ordRes.data.length > 0) setOrders(ordRes.data);
    } catch (err) {
      console.log("Using mock admin catalog fallback");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const created = {
      id: 'prod-' + Date.now(),
      _id: 'prod-' + Date.now(),
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      originalPrice: Math.round(Number(newProduct.price) * 1.25),
      description: newProduct.description,
      stock: Number(newProduct.stock),
      image: newProduct.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
      rating: 5.0,
      reviewsCount: 1
    };

    setProducts([created, ...products]);
    setNewProduct({ name: '', category: 'Dresses', description: '', price: '', stock: '25', image: '' });
    alert("New luxury product published!");
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Merchant Operations Portal</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>EVRÉVIA Store Management & Analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn-${activeTab === 'products' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('products')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Products ({products.length})
          </button>
          <button className={`btn-${activeTab === 'orders' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('orders')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Sales</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>₹1,48,500</h3>
          <span style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 600 }}>+18.4% this week</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Orders</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{orders.length}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>1 Ready for dispatch</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog Stock</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{products.length} Products</h3>
          <span style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 600 }}>In stock</span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '2rem' }}>
          
          {/* Add Product Form */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Publish New Garment</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product Title</label>
                <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <option value="Dresses">Dresses</option>
                    <option value="Ethnic">Ethnic</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Suits">Suits</option>
                    <option value="Tops">Tops</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Price (₹)</label>
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Image URL</label>
                <input type="text" placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Publish to Store
              </button>
            </form>
          </div>

          {/* Product Catalog List */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Published Catalog ({products.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
              {products.map(p => (
                <div key={p.id || p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={p.images?.[0]?.url || p.image} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category} • ₹{p.price}</span>
                    </div>
                  </div>
                  <span className="badge badge-green">In Stock</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Manage Orders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map(ord => (
              <div key={ord.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong>Order #{ord.id}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer: {ord.customerName} • Total: ₹{ord.total}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge badge-gold">{ord.paymentStatus}</span>
                  <select defaultValue={ord.orderStatus} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
