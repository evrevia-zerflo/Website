import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const currentItems = get().items;
        const productId = product.id || product._id;
        const exists = currentItems.some(item => (item.id || item._id) === productId);

        if (exists) {
          set({ items: currentItems.filter(item => (item.id || item._id) !== productId) });
        } else {
          set({ 
            items: [...currentItems, {
              id: productId,
              _id: productId,
              name: product.name,
              price: product.price,
              category: product.category || 'Fashion',
              image: (product.images && product.images.length > 0) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : (product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80')
            }] 
          });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item => (item.id || item._id) === productId);
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter(item => (item.id || item._id) !== productId) });
      },

      clearWishlist: () => set({ items: [] })
    }),
    {
      name: 'evrevia-wishlist-storage',
    }
  )
);

export default useWishlistStore;
