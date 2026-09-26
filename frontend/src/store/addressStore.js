import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_INITIAL_ADDRESSES = [
  {
    id: 'addr-1',
    fullName: 'Sharif Rahman',
    mobile: '9876543210',
    pincode: '800001',
    house: 'House #42, Al-Rahman Villa',
    street: 'Boring Road, Near Canal',
    landmark: 'Opposite Central Park',
    city: 'Patna',
    state: 'Bihar',
    isDefault: true,
  }
];

const useAddressStore = create(
  persist(
    (set, get) => ({
      addresses: DEFAULT_INITIAL_ADDRESSES,
      selectedAddressId: 'addr-1',

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      addAddress: (newAddr) => {
        const id = 'addr-' + Date.now();
        const addressObj = {
          ...newAddr,
          id,
          isDefault: get().addresses.length === 0 ? true : Boolean(newAddr.isDefault),
        };

        let updated = [...get().addresses];
        if (addressObj.isDefault) {
          updated = updated.map(a => ({ ...a, isDefault: false }));
        }

        updated.push(addressObj);
        set({ addresses: updated, selectedAddressId: id });
        return id;
      },

      updateAddress: (id, updatedFields) => {
        const updated = get().addresses.map(addr => {
          if (addr.id === id) {
            return { ...addr, ...updatedFields };
          }
          if (updatedFields.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
        set({ addresses: updated });
      },

      deleteAddress: (id) => {
        const updated = get().addresses.filter(a => a.id !== id);
        let newSelected = get().selectedAddressId;
        if (newSelected === id) {
          newSelected = updated[0]?.id || null;
        }
        set({ addresses: updated, selectedAddressId: newSelected });
      },

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;
      }
    }),
    {
      name: 'evrevia-address-storage',
    }
  )
);

export default useAddressStore;
