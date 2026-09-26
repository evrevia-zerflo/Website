import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Upload, ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '', category: 'Clothing', subcategory: '', description: '', 
    price: '', originalPrice: '', stock: '25', supplierUrl: '', 
    sizes: 'XS,S,M,L,XL', colors: '', material: '', careInstructions: '', 
    tags: '', status: 'publish', isNew: true, isBestSeller: false,
    fabric: '', fit: '', care: '', styling: '', whatsIncluded: ''
  });
  
  const [images, setImages] = useState([]);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('addProductDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(parsed);
        toast.success("Draft restored automatically");
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setDraftLoaded(true);
  }, []);

  // Save draft to localStorage on form change
  useEffect(() => {
    if (draftLoaded) {
      localStorage.setItem('addProductDraft', JSON.stringify(form));
    }
  }, [form, draftLoaded]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls = [];
      
      // Upload all images sequentially
      for (const img of images) {
        const formData = new FormData();
        formData.append('file', img.file);
        const uploadRes = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrls.push(uploadRes.data.url);
      }

      // Format payload
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: uploadedImageUrls
      };

      await api.post('/admin/products', payload);
      toast.success('Product added successfully!');
      localStorage.removeItem('addProductDraft'); // Clear draft on success
      navigate('/products');
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', background: '#f8fafc' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#475569' };
  const sectionStyle = { background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
  const sectionTitleStyle = { fontSize: '1.125rem', marginTop: 0, marginBottom: '1.5rem', fontWeight: 600, color: '#0f172a' };

  return (
    <Dashboard>
      <div style={{ padding: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', color: '#64748b', background: 'white', transition: '0.2s' }} className="hover-bg-slate-50"><ArrowLeft size={20} /></Link>
            <div>
              <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Add Product</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>Create a new item in your catalog</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Basic Details</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Product Title</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} placeholder="E.g. Classic White T-Shirt" required />
              </div>
              
              <div>
                <label style={labelStyle}>Description</label>
                <div style={{ background: '#fff' }}>
                  <ReactQuill theme="snow" value={form.description} onChange={val => setForm({...form, description: val})} style={{ height: '200px', marginBottom: '50px' }} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Pricing & Inventory</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Selling Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>MRP (₹) <span style={{fontWeight: 400, color: '#94a3b8'}}>(Optional)</span></label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={inputStyle} required />
                </div>
              </div>
            </div>
            
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Variants & Specifications</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Sizes (comma separated)</label>
                  <input type="text" value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} placeholder="XS, S, M, L, XL" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Colors (comma separated)</label>
                  <input type="text" value={form.colors} onChange={e => setForm({...form, colors: e.target.value})} placeholder="Red, Blue, Black" style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Material</label>
                  <input type="text" value={form.material} onChange={e => setForm({...form, material: e.target.value})} placeholder="100% Cotton" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Care Instructions</label>
                  <input type="text" value={form.careInstructions} onChange={e => setForm({...form, careInstructions: e.target.value})} placeholder="Machine wash cold" style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Garment Details (Store Tabs)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Fabric & Composition</label>
                  <textarea rows={3} value={form.fabric} onChange={e => setForm({...form, fabric: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="E.g. 100% Pure Mulberry Silk Satin"></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Fit & Sizing</label>
                  <textarea rows={3} value={form.fit} onChange={e => setForm({...form, fit: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="E.g. Fluid relaxed silhouette. Fits true to size."></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Care Instructions</label>
                  <textarea rows={3} value={form.care} onChange={e => setForm({...form, care: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="E.g. Dry clean recommended."></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Styling Notes</label>
                  <textarea rows={3} value={form.styling} onChange={e => setForm({...form, styling: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="E.g. Pair with gold drop earrings..."></textarea>
                </div>
                <div>
                  <label style={labelStyle}>What's Included</label>
                  <textarea rows={3} value={form.whatsIncluded} onChange={e => setForm({...form, whatsIncluded: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="E.g. 1x Garment, 1x Storage Bag"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Media</h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', transition: '0.2s' }}
              >
                <div style={{ background: '#e2e8f0', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#64748b' }}>
                  <ImageIcon size={24} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Click to upload multiple images</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>PNG, JPG up to 5MB. You can select as many as you want!</span>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple style={{ display: 'none' }} />
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '1.5rem' }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={img.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Organization & Visibility</h3>
              
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ ...labelStyle, color: '#0f172a' }}>Product Visibility</label>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px 0' }}>Control if this product is visible on the main store.</p>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ ...inputStyle, background: 'white' }}>
                  <option value="publish">Published (Visible)</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                  <option value="Clothing">Clothing</option>
                  <option value="Bags">Bags</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Subcategory</label>
                <input type="text" value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} placeholder="E.g. Dresses" style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="summer, casual, luxury" style={inputStyle} />
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Sourcing <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>Hidden</span></h3>
              <label style={labelStyle}>Supplier URL</label>
              <input type="url" value={form.supplierUrl} onChange={e => setForm({...form, supplierUrl: e.target.value})} placeholder="https://meesho.com/..." style={inputStyle} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', margin: '8px 0 0 0' }}>Keep track of where you source this product. Customers will never see this.</p>
            </div>

          </div>
        </form>
      </div>
    </Dashboard>
  );
}
