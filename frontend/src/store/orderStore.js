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
  }
}));

export default useOrderStore;
