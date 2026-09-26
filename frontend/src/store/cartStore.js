import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';
import useAuthStore from './authStore';

const VALID_COUPONS = {
  'EVREVIA10': { code: 'EVREVIA10', type: 'percentage', value: 10, label: '10% OFF' },
  'WELCOME300': { code: 'WELCOME300', type: 'fixed', value: 300, label: '₹300 OFF' },
  'FESTIVE20': { code: 'FESTIVE20', type: 'percentage', value: 20, label: '20% OFF' },
};

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      coupon: null,
      couponError: null,

      toggleCartDrawer: (isOpen) => set({ isCartOpen: typeof isOpen === 'boolean' ? isOpen : !get().isCartOpen }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: async (product, quantity = 1, selectedSize = 'M', selectedColor = 'Default') => {
        const currentItems = get().items;
        const productId = product.id || product._id;
        
        const existingIndex = currentItems.findIndex(
          item => item.productId === productId && item.size === selectedSize && item.color === selectedColor
        );
        
        let newItems;
        if (existingIndex > -1) {
          newItems = [...currentItems];
          newItems[existingIndex].quantity += quantity;
        } else {
          newItems = [...currentItems, { 
            productId,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : Math.round(Number(product.price) * 1.25),
            image: product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
            size: selectedSize,
            color: selectedColor,
            quantity 
          }];
        }
        
        set({ items: newItems, isCartOpen: true });
        
        // Sync with backend if logged in
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await api.post('/cart', {
              userId: user.id || user._id,
              items: newItems.map(item => ({ productId: item.productId, quantity: item.quantity, size: item.size, color: item.color }))
            });
          } catch (err) {
            console.error("Failed to sync cart:", err);
          }
        }
      },
      
      updateQuantity: async (productId, quantity, size = 'M', color = 'Default') => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color);
          return;
        }
        
        const newItems = get().items.map(item => {
          if (item.productId === productId && item.size === size && item.color === color) {
            return { ...item, quantity };
          }
          return item;
        });
        
        set({ items: newItems });
      },

      removeFromCart: async (productId, size = 'M', color = 'Default') => {
        const newItems = get().items.filter(
          item => !(item.productId === productId && item.size === size && item.color === color)
        );
        set({ items: newItems });
        
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await api.post('/cart', {
              userId: user.id || user._id,
              items: newItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
            });
          } catch (err) {
            console.error("Failed to sync cart:", err);
          }
        }
      },
      
      applyCoupon: (code) => {
        const cleanCode = code ? code.trim().toUpperCase() : '';
        if (VALID_COUPONS[cleanCode]) {
          set({ coupon: VALID_COUPONS[cleanCode], couponError: null });
          return { success: true, coupon: VALID_COUPONS[cleanCode] };
        } else {
          set({ couponError: 'Invalid coupon code. Try WELCOME300 or EVREVIA10' });
          return { success: false, error: 'Invalid coupon code' };
        }
      },

      removeCoupon: () => set({ coupon: null, couponError: null }),

      clearCart: () => set({ items: [], coupon: null, couponError: null }),
      
      getCartSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getCartSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;
        
        if (coupon.type === 'percentage') {
          return Math.round((subtotal * coupon.value) / 100);
        } else if (coupon.type === 'fixed') {
          return Math.min(coupon.value, subtotal);
        }
        return 0;
      },

      getShippingCost: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0 || subtotal >= 1499) return 0; // Free shipping over ₹1,499
        return 99; // Standard shipping fee ₹99
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingCost();
        return Math.max(0, subtotal - discount + shipping);
      }
    }),
    {
      name: 'evrevia-cart-storage',
    }
  )
);

export default useCartStore;
