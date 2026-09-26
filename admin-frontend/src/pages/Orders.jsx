import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Package, Search, ChevronDown, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => (o._id === orderId || o.id === orderId) ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'NEW': return { bg: '#e0e7ff', text: '#3730a3', icon: <Package size={14} /> };
      case 'PROCESSING': return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={14} /> };
      case 'SHIPPED': return { bg: '#dbeafe', text: '#1e40af', icon: <Truck size={14} /> };
      case 'DELIVERED': return { bg: '#dcfce7', text: '#166534', icon: <CheckCircle size={14} /> };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={14} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <Package size={14} /> };
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id?.toLowerCase().includes(search.toLowerCase()) || 
                          o.address?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Dashboard>
      <div style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Orders</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage customer orders and fulfillment</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Toolbar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} 
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ appearance: 'none', padding: '10px 36px 10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white', cursor: 'pointer', fontWeight: 500 }}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#0f172a', borderRadius: '50%' }}></div>
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
              <Package size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 500, color: '#475569' }}>No orders found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.orderStatus);
                    return (
                      <tr key={order._id || order.id} style={{ borderBottom: '1px solid #e2e8f0', transition: '0.2s' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                          #{ (order._id || order.id).slice(-8).toUpperCase() }
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>{order.address?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.address?.city || 'No City'}, {order.address?.state || 'No State'}</div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>₹{order.total}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {statusStyle.icon} {order.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <select 
                            value={order.orderStatus} 
                            onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                            disabled={updating === (order._id || order.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer' }}
                          >
                            <option value="NEW">New</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
