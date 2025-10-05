// src/api/api.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
});

// Interceptor de Requisição (A Solução para o Erro 401)
// Esta função é executada ANTES de cada requisição ser enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Importa a store de autenticação DENTRO do interceptor
    const authStore = useAuthStore();

    // Se houver um token na store, adiciona ao cabeçalho da requisição
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta (Para lidar com erros globais, como sessão expirada)
// Esta função é executada sempre que recebemos uma RESPOSTA da API.
apiClient.interceptors.response.use(
  (response) => {
    // Se a resposta for sucesso (status 2xx), apenas a retorna
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não Autorizado)
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      // Recarrega a aplicação, forçando o usuário para a tela de login
      window.location.reload(); 
    }

    // Extrai a mensagem de erro para ser usada nos pop-ups
    const errorMessage = error.response?.data?.message || error.message;

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;