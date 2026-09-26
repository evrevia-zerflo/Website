import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>EVRÉVIA</h1>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Admin Portal</span>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink to="/products" icon={<Package size={20} />} label="Products" />
          <NavLink to="/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <NavLink to="#" icon={<Users size={20} />} label="Customers" badge="Soon" />
        </nav>
        
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', width: '100%', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', transition: '0.2s', ':hover': { background: '#fef2f2' } }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children ? children : (
          <div style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Overview</h2>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track your store's performance and inventory</p>
            </div>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>
                Loading analytics...
              </div>
            ) : analytics ? (
              <>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <StatCard 
                    title="Total Revenue" 
                    value={`₹${analytics.totalRevenue.toLocaleString()}`} 
                    icon={<IndianRupee size={24} style={{ color: '#059669' }} />} 
                    trend="+12%"
                  />
                  <StatCard 
                    title="Active Orders" 
                    value={analytics.activeOrders} 
                    icon={<ShoppingCart size={24} style={{ color: '#3b82f6' }} />} 
                  />
                  <StatCard 
                    title="Products Live" 
                    value={analytics.totalProducts} 
                    icon={<Package size={24} style={{ color: '#8b5cf6' }} />} 
                  />
                  <StatCard 
                    title="Low Stock Items" 
                    value={analytics.lowStock} 
                    icon={<AlertTriangle size={24} style={{ color: '#f59e0b' }} />} 
                    warning={analytics.lowStock > 0}
                  />
                </div>
                
                {/* Charts Area */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Sales Trend (7 Days)</h3>
                    <TrendingUp size={20} style={{ color: '#94a3b8' }} />
                  </div>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                          formatter={(value) => [`₹${value}`, 'Sales']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
const NavLink = ({ to, icon, label, badge }) => {
  const location = useLocation();
  // Exact match for home, partial for others
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '12px', 
        borderRadius: '10px', 
        color: isActive ? '#0f172a' : '#64748b', 
        textDecoration: 'none', 
        background: isActive ? '#f1f5f9' : 'transparent', 
        fontWeight: isActive ? 600 : 500,
        transition: '0.2s',
      }}
    >
      {icon} 
      {label}
      {badge && (
        <span style={{ marginLeft: 'auto', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
          {badge}
        </span>
      )}
    </Link>
  );
};

const StatCard = ({ title, value, icon, trend, warning }) => (
  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: warning ? '1px solid #fef08a' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{title}</span>
      <div style={{ background: warning ? '#fefce8' : '#f8fafc', padding: '8px', borderRadius: '10px' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
      <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>{value}</h3>
      {trend && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>{trend}</span>}
    </div>
  </div>
);
