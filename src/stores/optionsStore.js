import { defineStore } from 'pinia';
import apiClient from '../api/api';
import { useAuthStore } from './authStore';

export const useOptionsStore = defineStore('options', {
  // 1. Estado: Onde os dados serão armazenados
  state: () => ({
    faccoes: [],
    bairros: [],
    andamentos: [],
    seccionais: [],
    cidades: [],
    tiposPedido: [],
    statusPedido: [],
    tiposPrisao: [],
    ocorrencias: [],
    loading: false,
    error: null,
  }),

  // 2. Ações: Funções que alteram o estado
  actions: {
    async fetchOptions() {
      // Se já estiver carregando ou os dados já tiverem sido carregados, não faz nada
      if (this.loading || this.faccoes.length > 0) {
        return;
      }

      this.loading = true;
      this.error = null;
      
      const authStore = useAuthStore();
      if (!authStore.token) {
        this.error = 'Usuário não autenticado.';
        this.loading = false;
        return;
      }

      try {
        // Usa o apiClient, que já cuida da URL base e da autenticação
        const response = await apiClient.get('/form-options');

        // Preenche o estado com os dados recebidos da API
        this.faccoes = response.data.faccoes;
        this.bairros = response.data.bairros;
        this.andamentos = response.data.andamentos;
        this.seccionais = response.data.seccionais;
        this.cidades = response.data.cidades;
        this.tiposPedido = response.data.tiposPedido;
        this.statusPedido = response.data.statusPedido;
        this.tiposPrisao = response.data.tiposPrisao;
        this.ocorrencias = response.data.ocorrencias;

      } catch (err) {
        this.error = 'Falha ao carregar opções do formulário.';
        console.error('Erro em fetchOptions:', err);
      } finally {
        this.loading = false;
      }
    },
  },
});