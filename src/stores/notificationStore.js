// src/stores/notificationStore.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    type: '', // 'success', 'error', ou 'info'
    visible: false,
    timeoutId: null, // Armazena o ID do timeout
  }),

  actions: {
    showNotification({ message, type = 'error', timeout = 4000 }) {
      // Se já houver um pop-up, limpa o timeout anterior
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.message = message;
      this.type = type;
      this.visible = true;

      // Define um novo timeout para esconder o pop-up, usando o valor passado
      this.timeoutId = setTimeout(() => {
        this.hideNotification();
      }, timeout); // <-- A MUDANÇA ESTÁ AQUI
    },

    hideNotification() {
      this.visible = false;
      // Reseta o estado após o pop-up sumir
      setTimeout(() => {
        this.message = '';
        this.type = '';
        this.timeoutId = null;
      }, 300); // Aguarda a transição de fade-out
    },
  },
});