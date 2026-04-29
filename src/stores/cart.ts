import { defineStore } from 'pinia';

import { api, firstValidationMessage } from '@/services/api';
import { useCatalogStore } from '@/stores/catalog';
import type { Cart } from '@/types/api';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null as Cart | null,
    loading: false,
    error: '',
  }),
  getters: {
    items: (state) => state.cart?.items ?? [],
    count: (state) => (state.cart?.items ?? []).reduce((total, item) => total + item.quantity, 0),
    totalCents: (state) =>
      (state.cart?.items ?? []).reduce((total, item) => total + item.unit_price_cents * item.quantity, 0),
    currency: (state) => state.cart?.currency ?? useCatalogStore().currency,
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.cart = await api.cart();
      } finally {
        this.loading = false;
      }
    },
    async add(product_id: number, quantity = 1) {
      this.error = '';
      const catalog = useCatalogStore();
      try {
        await api.addCartItem({ product_id, quantity, currency: catalog.currency });
        await this.load();
      } catch (error) {
        this.error = firstValidationMessage(error);
        throw error;
      }
    },
    async update(id: number, quantity: number) {
      await api.updateCartItem(id, quantity);
      await this.load();
    },
    async remove(id: number) {
      await api.removeCartItem(id);
      await this.load();
    },
    async clear() {
      await api.clearCart();
      this.cart = null;
    },
  },
});
