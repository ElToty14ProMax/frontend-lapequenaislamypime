import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    blocking: false,
    message: '',
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
  },
});
