import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Users, Search, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/AdminSkeleton';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users');
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || 
           (c.email || '').toLowerCase().includes(term) ||
           (c.phone || '').toLowerCase().includes(term);
  });

  return (
    <Dashboard>
      <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Customers</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage your registered users and customer base</p>
          </div>
          <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} /> {customers.length} Total Users
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Toolbar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          {isLoading ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={4} />)}
                </tbody>
              </table>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 500, color: '#475569' }}>No customers found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((user) => (
                    <tr key={user._id || user.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem', overflow: 'hidden' }}>
                            {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user.name || 'Unknown User'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: { (user._id || user.id).slice(-8) }</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {user.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                              <Mail size={14} color="#94a3b8" /> {user.email}
                            </span>
                          )}
                          {user.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                              <Phone size={14} color="#94a3b8" /> {user.phone}
                            </span>
                          )}
                          {!user.email && !user.phone && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No contact info</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: user.role === 'admin' ? '#fef08a' : '#f1f5f9', color: user.role === 'admin' ? '#854d0e' : '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {user.role === 'admin' && <UserCheck size={12} />}
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#94a3b8" />
                          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
