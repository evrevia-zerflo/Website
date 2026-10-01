import { create } from 'zustand';
import api from '../api/client';

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/orders/me');
      set({ orders: res.data, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch orders", err);
      set({ error: err.response?.data?.detail || err.message, isLoading: false });
    }
  },

  fetchOrderById: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/orders/${orderId}`);
      set({ currentOrder: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch order details", err);
      set({ error: err.response?.data?.detail || err.message, isLoading: false });
      return null;
    }
  },

  requestReturn: async (orderId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/orders/${orderId}/return`, { reason });
      // Update local state orders array
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(o => (o._id === orderId) ? { ...o, returnStatus: res.data.returnStatus, returnReason: res.data.returnReason } : o);
      set({ orders: updatedOrders, isLoading: false });
      return res.data;
    } catch (err) {
      console.error("Failed to request return", err);
      const errorMessage = err.response?.data?.detail || err.message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  }
}));

export default useOrderStore;
