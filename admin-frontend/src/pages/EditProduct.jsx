import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Upload, ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';
import DynamicListInput from '../components/DynamicListInput';
export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    name: '', category: 'Clothing', subcategory: '', description: '', 
    price: '', originalPrice: '', stock: '', supplierUrl: '', 
    sizes: '', colors: '', material: '', careInstructions: '', 
    tags: '', status: 'publish',
    fabric: '', fit: '', care: '', styling: '', whatsIncluded: ''
  });
  
  // Existing string URLs
  const [existingImages, setExistingImages] = useState([]);
  // New File objects
  const [newImages, setNewImages] = useState([]);
  
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Save draft to localStorage whenever form changes (after initial load)
  useEffect(() => {
    if (draftLoaded) {
      localStorage.setItem(`editProductDraft_${id}`, JSON.stringify(form));
    }
  }, [form, draftLoaded, id]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data;
      setForm({
        name: data.name || '',
        category: data.category || 'Clothing',
        subcategory: data.subcategory || '',
        description: data.description || '',
        price: data.price || '',
        originalPrice: data.originalPrice || '',
        stock: data.stock || '',
        supplierUrl: data.supplierUrl || '',
        sizes: (data.sizes || []).join(', '),
        colors: (data.colors || []).join(', '),
        material: data.material || '',
        careInstructions: data.careInstructions || '',
        tags: (data.tags || []).join(', '),
        status: data.status || 'publish',
        fabric: data.fabric || '',
        fit: data.fit || '',
        care: data.care || '',
        styling: data.styling || '',
        whatsIncluded: data.whatsIncluded || ''
      });
      setExistingImages(data.images || []);
      
      // Check for local draft after fetching server data
      const draft = localStorage.getItem(`editProductDraft_${id}`);
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
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const addedImages = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setNewImages([...newImages, ...addedImages]);
    }
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls = [];
      
      // Upload new images sequentially
      for (const img of newImages) {
        const formData = new FormData();
        formData.append('file', img.file);
        const uploadRes = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrls.push(uploadRes.data.url);
      }

      // Combine existing images and newly uploaded images
      const finalImages = [...existingImages, ...uploadedImageUrls];

      // Format payload
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: finalImages
      };

      await api.put(`/admin/products/${id}`, payload);
      toast.success('Product updated successfully!');
      localStorage.removeItem(`editProductDraft_${id}`); // Clear draft on success
      navigate('/products');
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Dashboard><div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>Loading product details...</div></Dashboard>;
  }

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
              <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Edit Product</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>Make changes to your catalog item</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Save size={18} /> {loading ? 'Saving...' : 'Update Product'}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Basic Details</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Product Title</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} required />
              </div>
              
              <div>
                <RichTextEditor 
                  value={form.description || ''} 
                  onChange={val => setForm({...form, description: val})} 
                />
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
              
                <DynamicListInput 
                  label="Fabric & Composition"
                  items={form.fabric ? form.fabric.split('|').filter(Boolean) : []}
                  onChange={arr => setForm({...form, fabric: arr.join('|')})}
                  placeholder="E.g. 100% Pure Mulberry Silk Satin"
                />
                
                <DynamicListInput 
                  label="Fit & Sizing"
                  items={form.fit ? form.fit.split('|').filter(Boolean) : []}
                  onChange={arr => setForm({...form, fit: arr.join('|')})}
                  placeholder="E.g. Fluid relaxed silhouette. Fits true to size."
                />
                
                <DynamicListInput 
                  label="Care Instructions"
                  items={form.care ? form.care.split('|').filter(Boolean) : []}
                  onChange={arr => setForm({...form, care: arr.join('|')})}
                  placeholder="E.g. Dry clean recommended."
                />
                
                <DynamicListInput 
                  label="Styling Notes"
                  items={form.styling ? form.styling.split('|').filter(Boolean) : []}
                  onChange={arr => setForm({...form, styling: arr.join('|')})}
                  placeholder="E.g. Pair with gold drop earrings..."
                />
                
                <DynamicListInput 
                  label="What's Included"
                  items={form.whatsIncluded ? form.whatsIncluded.split('|').filter(Boolean) : []}
                  onChange={arr => setForm({...form, whatsIncluded: arr.join('|')})}
                  placeholder="E.g. 1x Garment"
                />
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

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '1.5rem' }}>
                  {/* Render existing images from DB */}
                  {existingImages.map((url, index) => (
                    <div key={`exist-${index}`} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeExistingImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Render new images to be uploaded */}
                  {newImages.map((img, index) => (
                    <div key={`new-${index}`} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #3b82f6' }}>
                      <img src={img.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeNewImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
            </div>

          </div>
        </form>
      </div>
    </Dashboard>
  );
}
