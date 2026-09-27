import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, X, Search, RotateCcw, Filter, ChevronRight, LayoutGrid, ChevronDown, ChevronUp,
  Shirt, ShoppingBag, Footprints, Gem, Watch, Sparkles, Scissors, Glasses, Smartphone, Home as HomeIcon, Tag,
  ArrowLeft
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategoryExplorer from '../components/CategoryExplorer';
import api from '../api/client';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { EVREVIA_CATEGORIES } from '../data/categoriesData';
import { preloadImages } from '../utils/imagePreloader';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(8000);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get('/products');
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
          // Eagerly preload product images
          preloadImages(res.data.map(p => p.images?.[0]?.url || p.images?.[0]).filter(Boolean));
        }
      } catch (err) {
        console.log("Using local mock products fallback");
        // Preload mock images too
        preloadImages(MOCK_PRODUCTS.map(p => p.image).filter(Boolean));
      }
    }
    loadProducts();
  }, []);

  // Sync state from URL parameters and scroll to top when category changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const sub = searchParams.get('subcategory') || 'All';
    const q = searchParams.get('search') || '';
    const s = searchParams.get('sort') || 'featured';

    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
    if (searchParams.has('search')) setSearchQuery(q);
    if (searchParams.has('sort')) setSortBy(s);

    if (searchParams.get('view') === 'categories') {
      setTimeout(() => {
        const el = document.getElementById('category-explorer-hub');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [searchParams]);

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'Free Size'];
  const colors = ['All', 'Champagne', 'Emerald', 'Ivory Gold', 'Sand', 'Midnight Blue', 'Gold', 'Espresso'];

  // Primary Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      // Category filter
      if (selectedCategory !== 'All' && item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      
      // Subcategory filter (flexible matching)
      if (selectedSubcategory !== 'All') {
        const itemSub = item.subcategory?.toLowerCase() || '';
        const targetSub = selectedSubcategory.toLowerCase();
        if (itemSub !== targetSub && !itemSub.includes(targetSub) && !targetSub.includes(itemSub)) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        const matchesSubcat = item.subcategory?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesSubcat) return false;
      }

      // Price filter
      if (Number(item.price) > maxPrice) return false;

      // Size filter
      if (selectedSize !== 'All' && item.sizes && !item.sizes.includes(selectedSize)) return false;

      // Color filter
      if (selectedColor !== 'All' && item.colors && !item.colors.includes(selectedColor)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'popular') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      return 0; // Featured
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, maxPrice, selectedSize, selectedColor, sortBy]);

  // Fallback products when a subcategory has no exact mock match
  const displayProducts = useMemo(() => {
    if (filteredProducts.length > 0) return filteredProducts;
    if (selectedCategory !== 'All') {
      return products.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    return products;
  }, [filteredProducts, products, selectedCategory]);

  const isSubcategoryFallback = filteredProducts.length === 0 && selectedSubcategory !== 'All';
  const activeFiltersCount = (maxPrice < 8000 ? 1 : 0) + (selectedSize !== 'All' ? 1 : 0) + (selectedColor !== 'All' ? 1 : 0);

  const resetCategorySelection = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSearchQuery('');
    setMaxPrice(8000);
    setSelectedSize('All');
    setSelectedColor('All');
    setSortBy('featured');
    setSearchParams({});
  };

  // Is a specific collection (category/subcategory) selected?
  const isCollectionView = selectedCategory !== 'All' || selectedSubcategory !== 'All';

  return (
    <div className="shop-page" style={{ maxWidth: '1350px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      
      {/* ---------------------------------------------------- */}
      {/* MODE 1: DEDICATED COLLECTION SHOWCASE VIEW           */}
      {/* ---------------------------------------------------- */}
      {isCollectionView ? (
        <div>
          {/* COMPACT COLLECTION HERO STRIP */}
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-surface) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  CURATED COLLECTION
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {displayProducts.length} Items
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1.2, color: 'var(--text-main)' }}>
                {selectedSubcategory !== 'All' ? `${selectedSubcategory}` : `${selectedCategory} Collection`}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={resetCategorySelection}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ArrowLeft size={13} />
                <span>All Catalog</span>
              </button>
            </div>
          </div>

          {/* COMPACT CONTROL & FILTER TOOLBAR */}
          <div className="shop-control-panel" style={{ padding: '0.4rem 0.8rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              
              {/* Left: Refine Drawer & Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
                <button className="btn-secondary" onClick={() => setIsFilterDrawerOpen(true)} style={{ padding: '3px 8px', fontSize: '0.7rem', flexShrink: 0, height: '28px', borderRadius: 'var(--radius-full)' }}>
                  <SlidersHorizontal size={12} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span style={{ background: 'var(--accent-gold)', color: '#FFF', width: '14px', height: '14px', borderRadius: '50%', fontSize: '0.6rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div style={{ position: 'relative', flex: 1, maxWidth: '220px' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder={`Search ${selectedSubcategory !== 'All' ? selectedSubcategory : selectedCategory}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', height: '28px', padding: '3px 24px 3px 26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', background: 'var(--bg-primary)', fontSize: '0.7rem', outline: 'none' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Sort Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ height: '28px', padding: '2px 6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', fontSize: '0.7rem', outline: 'none' }}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(searchQuery || activeFiltersCount > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filters:</span>
                {searchQuery && (
                  <span className="shop-active-filter-tag">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                  </span>
                )}
                {maxPrice < 8000 && (
                  <span className="shop-active-filter-tag">
                    Price ≤ ₹{maxPrice.toLocaleString('en-IN')}
                    <button onClick={() => setMaxPrice(8000)}><X size={12} /></button>
                  </span>
                )}
                {selectedSize !== 'All' && (
                  <span className="shop-active-filter-tag">
                    Size: {selectedSize}
                    <button onClick={() => setSelectedSize('All')}><X size={12} /></button>
                  </span>
                )}
                {selectedColor !== 'All' && (
                  <span className="shop-active-filter-tag">
                    Color: {selectedColor}
                    <button onClick={() => setSelectedColor('All')}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* DEDICATED COLLECTION PRODUCT GRID */}
          {displayProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>No products match your criteria</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Try clearing active filters or searching for another term.</p>
              <button className="btn-secondary" onClick={resetFilters}>Reset All Filters</button>
            </div>
          ) : (
            <div className="product-grid-catalog">
              {displayProducts.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}

        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* MODE 2: MAIN CATALOG PAGE                            */
        /* ---------------------------------------------------- */
        <div>
          {/* COMPACT MAIN CATALOG HEADER */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            padding: '1.25rem 1rem',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-surface) 100%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--accent-gold-light)', border: '1px solid rgba(212, 182, 142, 0.3)', marginBottom: '4px' }}>
              <Sparkles size={13} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                EVRÉVIA MASTER CATALOGUE ({products.length} PRODUCTS)
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
              Complete Master Catalog
            </h1>
          </div>

          {/* Compact Category Filter Pills */}
          <div className="horizontal-scroll-row" style={{ marginBottom: '1.25rem', gap: '0.4rem', paddingBottom: '4px' }}>
            {[
              { id: 'All', label: 'All Products' },
              { id: 'Clothing', label: 'Clothing & Dresses' },
              { id: 'Bags', label: 'Artisan Bags' },
              { id: 'Footwear', label: 'Luxe Footwear' },
              { id: 'Jewelry', label: 'Fine Jewelry' },
              { id: 'Watches', label: 'Timepieces' },
              { id: 'Hair & Accessories', label: 'Hair & Accessories' },
            ].map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('All');
                  }}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: isActive ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    background: isActive ? 'var(--accent-gold-light)' : 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 3px 10px rgba(212, 182, 142, 0.25)' : 'none'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* COMPACT CONTROL & FILTER TOOLBAR */}
          <div className="shop-control-panel" style={{ padding: '0.4rem 0.8rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
                <button className="btn-secondary" onClick={() => setIsFilterDrawerOpen(true)} style={{ padding: '3px 8px', fontSize: '0.7rem', flexShrink: 0, height: '28px', borderRadius: 'var(--radius-full)' }}>
                  <SlidersHorizontal size={12} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span style={{ background: 'var(--accent-gold)', color: '#FFF', width: '14px', height: '14px', borderRadius: '50%', fontSize: '0.6rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div style={{ position: 'relative', flex: 1, maxWidth: '220px' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', height: '28px', padding: '3px 24px 3px 26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', background: 'var(--bg-primary)', fontSize: '0.7rem', outline: 'none' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ height: '28px', padding: '2px 6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', fontSize: '0.7rem', outline: 'none' }}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* ALL PRODUCTS HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Complete Catalog Products
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
              {displayProducts.length} Items Found
            </span>
          </div>

          {/* ALL PRODUCTS GRID */}
          <div className="product-grid-catalog">
            {displayProducts.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom-sheet Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="modal-backdrop" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} />
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>Smart Filters</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsFilterDrawerOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Max Price Range</span>
                <span style={{ color: 'var(--accent-gold)' }}>Up to ₹{maxPrice.toLocaleString('en-IN')}</span>
              </label>
              <input 
                type="range"
                min="500"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Size</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {sizes.map(sz => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '5px 10px',
                      border: selectedSize === sz ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                      background: selectedSize === sz ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {colors.map(col => (
                  <button 
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      padding: '5px 10px',
                      border: selectedColor === col ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      background: selectedColor === col ? 'var(--accent-gold-light)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={resetFilters} style={{ flex: 1, padding: '8px' }}>
                <RotateCcw size={13} /> Reset
              </button>
              <button className="btn-primary" onClick={() => setIsFilterDrawerOpen(false)} style={{ flex: 1, padding: '8px' }}>
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
