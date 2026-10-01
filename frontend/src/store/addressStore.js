import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useAddressStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      isLoading: false,
      error: null,

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      fetchAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get('/auth/profile/addresses');
          set({ addresses: res.data, isLoading: false });
          if (res.data.length > 0 && !get().selectedAddressId) {
            set({ selectedAddressId: res.data[0].id });
          }
        } catch (err) {
          console.error("Failed to fetch addresses", err);
          set({ error: err.message, isLoading: false });
        }
      },

      addAddress: async (newAddr) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/profile/addresses', newAddr);
          const updatedAddresses = res.data;
          set({ addresses: updatedAddresses, isLoading: false });
          // Auto select if it's the first one or set to default
          const added = updatedAddresses[updatedAddresses.length - 1];
          if (added) {
            set({ selectedAddressId: added.id });
            return added.id;
          }
        } catch (err) {
          console.error("Failed to add address", err);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      updateAddress: async (id, updatedAddr) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put(`/auth/profile/addresses/${id}`, updatedAddr);
          set({ addresses: res.data, isLoading: false });
        } catch (err) {
          console.error("Failed to update address", err);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      deleteAddress: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.delete(`/auth/profile/addresses/${id}`);
          const updatedAddresses = res.data;
          let newSelected = get().selectedAddressId;
          if (newSelected === id) {
            newSelected = updatedAddresses[0]?.id || null;
          }
          set({ addresses: updatedAddresses, selectedAddressId: newSelected, isLoading: false });
        } catch (err) {
          console.error("Failed to delete address", err);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;
      }
    }),
    {
      name: 'evrevia-address-storage',
      partialize: (state) => ({ selectedAddressId: state.selectedAddressId }) // Only persist selected ID, let DB handle actual addresses
    }
  )
);

export default useAddressStore;
