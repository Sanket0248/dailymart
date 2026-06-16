import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAddressStore = create(
  persist(
    (set) => ({
      addresses: [],
      addAddress: (address) => set((state) => ({ 
        addresses: [...state.addresses, { ...address, id: `a${Date.now()}` }] 
      })),
      updateAddress: (id, address) => set((state) => ({
        addresses: state.addresses.map((a) => a.id === id ? { ...a, ...address } : a)
      })),
      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id)
      }))
    }),
    {
      name: 'balajitraders-addresses',
    }
  )
);
