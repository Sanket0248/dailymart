import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],      // [{ product, qty }]
      coupon: null,   // { code, type, value, minOrder }

      // ── Add product or increment qty ──────────────────────────────────
      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { product, qty }] };
        });
      },

      // ── Remove product completely ─────────────────────────────────────
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      // ── Set exact qty (0 removes) ─────────────────────────────────────
      setQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, qty } : i
          ),
        }));
      },

      // ── Clear entire cart ─────────────────────────────────────────────
      clearCart: () => set({ items: [], coupon: null }),

      // ── Apply coupon ──────────────────────────────────────────────────
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      // ── Derived values (computed on the fly) ──────────────────────────
      getSubtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.qty,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
      getQty: (productId) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item ? item.qty : 0;
      },
      getCouponDiscount: () => {
        const { coupon } = get();
        const subtotal = get().getSubtotal();
        if (!coupon) return 0;
        if (subtotal < coupon.minOrder) return 0;
        if (coupon.type === 'flat') return coupon.value;
        if (coupon.type === 'percent')
          return Math.round((subtotal * coupon.value) / 100);
        return 0;
      },
      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 299 ? 0 : 30;
      },
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const delivery = get().getDeliveryFee();
        const discount = get().getCouponDiscount();
        return Math.max(0, subtotal + delivery - discount);
      },
    }),
    {
      name: 'dailymart-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
      // Migrate/sanitize old cart formats on hydration
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          // Drop any item that doesn't have a valid nested product object
          state.items = state.items.filter(
            (i) => i && i.product && typeof i.product === 'object' && i.product.id
          );
        }
      },
    }
  )
);
