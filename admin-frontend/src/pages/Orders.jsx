import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Dashboard from './Dashboard';
import { Package, Search, ChevronDown, CheckCircle, Clock, XCircle, Truck, X, User, MapPin, CreditCard, ChevronRight, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/AdminSkeleton';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState(null);
  
  // Slide-out state
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Edit state for slide-out form
  const [editStatus, setEditStatus] = useState("");
  const [editTrackingId, setEditTrackingId] = useState("");
  const [editCourierName, setEditCourierName] = useState("");

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

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    try {
      setUpdating(orderId);
      const payload = { status: editStatus };
      if (editStatus === 'SHIPPED') {
        payload.trackingId = editTrackingId;
        payload.courierName = editCourierName;
      }
      
      const res = await api.put(`/admin/orders/${orderId}/status`, payload);
      
      const updatedOrders = orders.map(o => (o._id === orderId || o.id === orderId) ? { ...o, orderStatus: editStatus, trackingId: res.data.trackingId, courierName: res.data.courierName } : o);
      setOrders(updatedOrders);
      
      setSelectedOrder({ ...selectedOrder, orderStatus: editStatus, trackingId: res.data.trackingId, courierName: res.data.courierName });
      
      toast.success(`Order updated successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleReturnStatusUpdate = async (status) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    try {
      setUpdating(`return-${orderId}`);
      const res = await api.put(`/admin/orders/${orderId}/return-status`, { returnStatus: status });
      
      const updatedOrders = orders.map(o => (o._id === orderId || o.id === orderId) ? { ...o, returnStatus: status } : o);
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, returnStatus: status });
      toast.success(`Return status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update return status");
    } finally {
      setUpdating(null);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
      setEditStatus(res.data.orderStatus);
      setEditTrackingId(res.data.trackingId || "");
      setEditCourierName(res.data.courierName || "");
    } catch(err) {
      toast.error("Failed to fetch full order details");
    }
  }

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
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTION_REQUIRED' ? (o.orderStatus === 'PROCESSING' || o.returnStatus === 'REQUESTED' || o.orderStatus === 'NEW') : o.orderStatus === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const newOrdersCount = orders.filter(o => o.orderStatus === 'NEW').length;
  const actionRequiredCount = orders.filter(o => o.orderStatus === 'PROCESSING' || (o.returnStatus && o.returnStatus === 'REQUESTED')).length;
  const completedCount = orders.filter(o => o.orderStatus === 'DELIVERED').length;

  const copyDropshipAddress = (order) => {
    if (!order.address) return;
    const { name, phone, street, city, state, pincode } = order.address;
    // Assuming house and landmark might be part of street if they weren't saved strictly, but let's safely try to format it.
    
    const formattedAddress = `Name: ${name || ''}
Phone: ${phone || ''}
Address: ${street || ''}
City: ${city || ''}
State: ${state || ''}
Pincode: ${pincode || ''}`;

    navigator.clipboard.writeText(formattedAddress)
      .then(() => toast.success("Address copied for Dropshipping!"))
      .catch(() => toast.error("Failed to copy address"));
  };

  return (
    <Dashboard>
      <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Orders</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage customer orders, track fulfillments, and update statuses</p>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div 
            onClick={() => setStatusFilter('NEW')}
            style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>New Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{newOrdersCount}</div>
          </div>
          
          <div 
            onClick={() => setStatusFilter('ACTION_REQUIRED')}
            style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fca5a5', borderLeft: '4px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', marginBottom: '8px' }}>Action Required</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7f1d1d' }}>{actionRequiredCount}</div>
          </div>

          <div 
            onClick={() => setStatusFilter('DELIVERED')}
            style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Completed</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{completedCount}</div>
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
                <option value="ACTION_REQUIRED">Action Required</option>
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '16px 24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}
                </tbody>
              </table>
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
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '16px 24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.orderStatus);
                    return (
                      <tr 
                        key={order._id || order.id} 
                        style={{ borderBottom: '1px solid #e2e8f0', transition: '0.2s', cursor: 'pointer' }}
                        className="hover-bg-slate-50"
                        onClick={(e) => {
                          if (e.target.tagName !== 'SELECT') fetchOrderDetails(order._id || order.id);
                        }}
                      >
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {order.orderStatus === 'NEW' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} title="New Order" />}
                          {order.returnStatus === 'REQUESTED' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} title="Return Requested" />}
                          #{ (order._id || order.id).slice(-8).toUpperCase() }
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>{order.address?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.address?.city || 'No City'}, {order.address?.state || 'No State'}</div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
                          {order.items?.length || 0} items
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {statusStyle.icon} {order.orderStatus}
                          </span>
                          {order.returnStatus && order.returnStatus !== 'NONE' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff8f1', color: '#c2410c', border: '1px solid #fed7aa', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginTop: '6px' }}>
                              <RotateCcw size={12} /> Return: {order.returnStatus}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <ChevronRight size={18} color="#94a3b8" />
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

      {/* Slide-out Order Details Pane */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)'
        }}>
          {/* Overlay to close */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setSelectedOrder(null)}></div>
          
          <div style={{
            position: 'relative', width: '100%', maxWidth: '500px', background: 'white', height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Order Details</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>#{ (selectedOrder._id || selectedOrder.id).slice(-8).toUpperCase() }</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              
              {/* Status Update Block */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>UPDATE ORDER STATUS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={updating === (selectedOrder._id || selectedOrder.id)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white', cursor: 'pointer', fontWeight: 500 }}
                  >
                    <option value="NEW">New</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  {editStatus === 'SHIPPED' && (
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', marginTop: '4px' }}>
                      <input 
                        type="text" 
                        placeholder="Courier Name (e.g. Delhivery)" 
                        value={editCourierName} 
                        onChange={(e) => setEditCourierName(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Tracking ID" 
                        value={editTrackingId} 
                        onChange={(e) => setEditTrackingId(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleStatusUpdate}
                    disabled={updating === (selectedOrder._id || selectedOrder.id)}
                    style={{ background: '#0f172a', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
                  >
                    {updating === (selectedOrder._id || selectedOrder.id) ? 'Updating...' : 'Save Order Info'}
                  </button>
                </div>
              </div>

              {/* Return Request Block */}
              {selectedOrder.returnStatus && selectedOrder.returnStatus !== 'NONE' && (
                <div style={{ background: '#fff8f1', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fed7aa' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', marginBottom: '8px', textTransform: 'uppercase' }}>
                    <RotateCcw size={16} /> RETURN REQUEST: {selectedOrder.returnStatus}
                  </label>
                  {selectedOrder.returnReason && (
                    <p style={{ fontSize: '0.9rem', color: '#9a3412', margin: '0 0 12px 0', background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '6px' }}>
                      <strong>Reason:</strong> {selectedOrder.returnReason}
                    </p>
                  )}
                  {selectedOrder.returnStatus === 'REQUESTED' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleReturnStatusUpdate('APPROVED')}
                        disabled={updating === `return-${selectedOrder._id || selectedOrder.id}`}
                        style={{ flex: 1, background: '#166534', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Approve Return
                      </button>
                      <button 
                        onClick={() => handleReturnStatusUpdate('REJECTED')}
                        disabled={updating === `return-${selectedOrder._id || selectedOrder.id}`}
                        style={{ flex: 1, background: '#991b1b', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reject Return
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Current Tracking Info */}
              {(selectedOrder.trackingId || selectedOrder.courierName) && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Tracking Details</h4>
                  {selectedOrder.courierName && <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#14532d' }}><strong>Courier:</strong> {selectedOrder.courierName}</p>}
                  {selectedOrder.trackingId && <p style={{ margin: '0', fontSize: '0.9rem', color: '#14532d' }}><strong>Tracking ID:</strong> {selectedOrder.trackingId}</p>}
                </div>
              )}

              {/* Customer Info */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#64748b" /> Customer Details
                </h4>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 600 }}>{selectedOrder.address?.name}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#475569' }}>{selectedOrder.address?.email}</p>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569' }}>{selectedOrder.address?.phone}</p>
                </div>
              </div>

              {/* Shipping / Dropshipping Address */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#64748b" /> Dropship Address
                  </h4>
                  <button 
                    onClick={() => copyDropshipAddress(selectedOrder)}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: '0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <Copy size={14} /> Copy for Meesho
                  </button>
                </div>
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Name:</strong> {selectedOrder.address?.name}<br/>
                  <strong>Phone:</strong> {selectedOrder.address?.phone}<br/>
                  <strong>Address:</strong> {selectedOrder.address?.street}<br/>
                  <strong>City:</strong> {selectedOrder.address?.city}<br/>
                  <strong>State:</strong> {selectedOrder.address?.state}<br/>
                  <strong>Pincode:</strong> {selectedOrder.address?.pincode}
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={16} color="#64748b" /> Line Items ({selectedOrder.items?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
                      <div style={{ width: '60px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{item.name}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#64748b' }}>
                          Size: {item.size || 'N/A'} {item.color ? `| Color: ${item.color}` : ''}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>Qty: {item.quantity}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} color="#64748b" /> Payment Summary
                </h4>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Subtotal</span>
                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Shipping</span>
                    <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 500 }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Total Paid</span>
                    <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </Dashboard>
  );
}
