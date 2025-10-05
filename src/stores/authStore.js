// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiClient from '../api/api'; // <-- 1. Importa nossa instância centralizada

const getInitialUser = () => {
  const userString = localStorage.getItem('user');

  // 2. Verifica se o item existe e não é a string 'undefined'
  if (userString && userString !== 'undefined') {
    try {
      // 3. Tenta parsear, e se falhar, retorna nulo
      return JSON.parse(userString);
    } catch (e) {
      console.error("Erro ao parsear usuário do localStorage, limpando item corrompido:", e);
      localStorage.removeItem('user'); // Opcional: remove o dado inválido
      return null;
    }
  }
  return null; // Retorna nulo se não houver nada no localStorage
};


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: getInitialUser(),
  }),
  getters: {
    isAdmin: (state) => !!state.user?.isAdmin,
    isFirstLogin: (state) => !!state.user?.isFirstLogin,
  },
  actions: {
    async login(email, password) {
      try {
        const response = await apiClient.post('/login', { email, password });

        this.token = response.data.token;
        this.user = response.data.user;

        // 2. LÓGICA SIMPLIFICADA: Agora sempre salvamos a sessão no localStorage.
        // O interceptor garante a segurança do token, tornando a lógica
        // de "sessão temporária" desnecessária.
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async completeProfile(newPassword, responsavelCadastro) {
      try {
        // Esta chamada agora usará o apiClient que tem o interceptor,
        // garantindo que o token será enviado.
        await apiClient.post('/complete-profile', { newPassword, responsavelCadastro });
        await this.fetchUser();
      } catch (error) {
        throw error;
      }
    },

    async fetchUser() {
      if (this.token) {
        try {
          const response = await apiClient.get('/users/profile');
          this.user = response.data;
          localStorage.setItem('user', JSON.stringify(this.user));
        } catch (error) {
          console.error("Falha ao buscar usuário:", error);
          // O interceptor já cuida do logout em caso de 401
        }
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});