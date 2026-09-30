import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, TrendingUp, AlertTriangle, IndianRupee, Search, Bell, Menu, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Only fetch analytics if we are on the main dashboard root path
    if (location.pathname === '/') {
      fetchAnalytics();
    }
  }, [location.pathname]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-role');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Modern UI constants
  const textMain = '#0f172a';
  const textMuted = '#64748b';
  const primaryBrand = '#0f172a';
  const bgMain = '#f8fafc';
  const borderSubtle = '#e2e8f0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bgMain, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: sidebarOpen ? '260px' : '80px', 
        background: '#ffffff', 
        borderRight: `1px solid ${borderSubtle}`, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: `1px solid ${borderSubtle}`, height: '76px', boxSizing: 'border-box' }}>
          {sidebarOpen ? (
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: textMain }}>EVRÉVIA</h1>
              <span style={{ fontSize: '0.65rem', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Admin Portal</span>
            </div>
          ) : (
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', margin: 0, fontWeight: 700, color: textMain }}>E</h1>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}>
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Overview" expanded={sidebarOpen} />
          <NavLink to="/orders" icon={<ShoppingCart size={20} />} label="Orders" expanded={sidebarOpen} />
          <NavLink to="/products" icon={<Package size={20} />} label="Products" expanded={sidebarOpen} />
          <NavLink to="/customers" icon={<Users size={20} />} label="Customers" expanded={sidebarOpen} />
        </nav>
        
        <div style={{ padding: '1rem', borderTop: `1px solid ${borderSubtle}` }}>
          <button onClick={handleLogout} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '12px', 
            padding: '12px', width: '100%', background: 'transparent', border: 'none', 
            color: '#ef4444', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', 
            transition: '0.2s', ':hover': { background: '#fef2f2' } 
          }}>
            <LogOut size={20} /> 
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{ 
          height: '76px', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '4px' }}>
              <Menu size={22} />
            </button>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search orders, products..." 
                style={{ 
                  width: '100%', padding: '10px 10px 10px 36px', 
                  borderRadius: '20px', border: 'none', background: '#f1f5f9', 
                  fontSize: '0.85rem', outline: 'none', transition: 'box-shadow 0.2s',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: textMuted, position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '1.5rem', borderLeft: `1px solid ${borderSubtle}` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: primaryBrand, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: textMain }}>Admin User</span>
                <span style={{ fontSize: '0.7rem', color: textMuted }}>Store Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children ? children : (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, color: textMain }}>Dashboard Overview</h2>
                <p style={{ color: textMuted, marginTop: '0.25rem', fontSize: '0.9rem' }}>Welcome back! Here's what's happening with your store today.</p>
              </div>
              
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: textMuted }}>
                  <div style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', width: '24px', height: '24px', border: `2px solid ${borderSubtle}`, borderTopColor: primaryBrand, borderRadius: '50%' }}></div>
                </div>
              ) : analytics ? (
                <>
                  {/* Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <StatCard 
                      title="Total Revenue" 
                      value={`₹${analytics.totalRevenue.toLocaleString()}`} 
                      icon={<IndianRupee size={22} style={{ color: '#059669' }} />} 
                      trend="+14.2%"
                      trendUp={true}
                    />
                    <StatCard 
                      title="Active Orders" 
                      value={analytics.activeOrders} 
                      icon={<ShoppingCart size={22} style={{ color: '#3b82f6' }} />} 
                      trend="+5.4%"
                      trendUp={true}
                    />
                    <StatCard 
                      title="Products Live" 
                      value={analytics.totalProducts} 
                      icon={<Package size={22} style={{ color: '#8b5cf6' }} />} 
                      trend="Stable"
                    />
                    <StatCard 
                      title="Low Stock Alerts" 
                      value={analytics.lowStock} 
                      icon={<AlertTriangle size={22} style={{ color: '#f59e0b' }} />} 
                      warning={analytics.lowStock > 0}
                    />
                  </div>
                  
                  {/* Main Grid: Charts & Recent Orders */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    
                    {/* Charts Area */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderSubtle}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: textMain }}>Revenue Analytics</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: textMuted }}>Last 7 days performance</p>
                        </div>
                        <select style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderSubtle}`, fontSize: '0.8rem', outline: 'none', background: bgMain }}>
                          <option>Last 7 days</option>
                          <option>This Month</option>
                        </select>
                      </div>
                      <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 11 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 11 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderSubtle} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 500, fontSize: '0.85rem' }}
                              itemStyle={{ color: '#3b82f6', fontWeight: 700 }}
                              formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Orders List */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderSubtle}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: textMain }}>Recent Orders</h3>
                        <Link to="/orders" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                          analytics.recentOrders.map(order => (
                            <div key={order._id || order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: `1px solid ${bgMain}` }}>
                              <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: textMain }}>{order.address?.name || 'Customer'}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: textMuted }}>#{ (order._id || order.id).slice(-6).toUpperCase() } • {order.items?.length || 1} items</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: textMain }}>₹{order.total}</p>
                                <span style={{ 
                                  display: 'inline-block', marginTop: '4px', fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '10px',
                                  background: order.orderStatus === 'DELIVERED' ? '#dcfce7' : '#e0e7ff',
                                  color: order.orderStatus === 'DELIVERED' ? '#166534' : '#3730a3'
                                }}>
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: textMuted, textAlign: 'center', padding: '2rem 0' }}>No recent orders.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper Components
const NavLink = ({ to, icon, label, expanded }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: expanded ? 'flex-start' : 'center',
        gap: '12px', 
        padding: expanded ? '12px 16px' : '12px', 
        borderRadius: '12px', 
        color: isActive ? '#3b82f6' : '#64748b', 
        textDecoration: 'none', 
        background: isActive ? '#eff6ff' : 'transparent', 
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ color: isActive ? '#3b82f6' : '#94a3b8' }}>{icon}</div>
      {expanded && <span style={{ fontSize: '0.9rem' }}>{label}</span>}
      {expanded && isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </Link>
  );
};

const StatCard = ({ title, value, icon, trend, trendUp, warning }) => (
  <div style={{ 
    background: warning ? 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    border: warning ? '1px solid #fde047' : '1px solid #e2e8f0', 
    boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.05)', 
    display: 'flex', 
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    cursor: 'default',
  }}
  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'; }}
  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0, 0, 0, 0.05)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{title}</span>
      <div style={{ background: warning ? '#fefce8' : '#ffffff', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
      <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</h3>
    </div>
    {trend && (
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
        <span style={{ color: trendUp ? '#059669' : '#64748b', background: trendUp ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
          {trend}
        </span>
        vs last week
      </div>
    )}
  </div>
);
