import { defineStore } from 'pinia';

import { api, firstValidationMessage, tokenStorage } from '@/services/api';
import type { User } from '@/types/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    ready: false,
    error: '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user && tokenStorage.get()),
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async bootstrap() {
      if (this.ready) return;
      this.ready = true;
      if (!tokenStorage.get()) return;
      try {
        this.user = await api.me();
      } catch {
        tokenStorage.clear();
        this.user = null;
      }
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.login({ email, password });
        tokenStorage.set(response.token);
        this.user = response.user;
      } catch (error) {
        this.error = firstValidationMessage(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async register(payload: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.register(payload);
        tokenStorage.set(response.token);
        this.user = response.user;
      } catch (error) {
        this.error = firstValidationMessage(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async refresh() {
      if (!tokenStorage.get()) return;
      this.user = await api.me();
    },
    async logout() {
      try {
        if (tokenStorage.get()) await api.logout();
      } finally {
        tokenStorage.clear();
        this.user = null;
      }
    },
  },
});
