import { defineStore } from 'pinia';

import { api } from '@/services/api';
import type { Category, CurrencyCode, Paginated, Product } from '@/types/api';

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    currency: (localStorage.getItem('lpi_currency') as CurrencyCode) || 'USD',
    categories: [] as Category[],
    products: null as Paginated<Product> | null,
    loading: false,
  }),
  actions: {
    setCurrency(currency: CurrencyCode) {
      this.currency = currency;
      localStorage.setItem('lpi_currency', currency);
    },
    async loadCategories() {
      this.categories = await api.categories();
    },
    async loadProducts(filters: Record<string, string | number | undefined> = {}) {
      this.loading = true;
      try {
        this.products = await api.products({ ...filters, currency: this.currency });
      } finally {
        this.loading = false;
      }
    },
  },
});
