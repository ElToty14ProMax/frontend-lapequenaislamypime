import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    blocking: false,
    message: '',
    toasts: [] as Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>,
    confirmDialog: null as null | {
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      danger: boolean;
      resolve: (value: boolean) => void;
    },
  }),
  actions: {
    start(message = 'Procesando...') {
      this.blocking = true;
      this.message = message;
    },
    stop() {
      this.blocking = false;
      this.message = '';
    },
    toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      this.toasts.push({ id, type, message });
      window.setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id);
      }, 4200);
    },
    confirm(options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      danger?: boolean;
    }) {
      return new Promise<boolean>((resolve) => {
        this.confirmDialog = {
          title: options.title,
          message: options.message,
          confirmText: options.confirmText ?? 'Confirmar',
          cancelText: options.cancelText ?? 'Cancelar',
          danger: options.danger ?? false,
          resolve,
        };
      });
    },
    answerConfirm(value: boolean) {
      this.confirmDialog?.resolve(value);
      this.confirmDialog = null;
    },
  },
});
