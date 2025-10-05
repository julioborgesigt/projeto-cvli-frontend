<template>
  <div>
    <div class="page-header">
      <h1>Bem-vindo ao Dashboard!</h1>
    </div>
    
    <div v-if="loading" class="loading-message">Carregando dados...</div>
    
    <div v-else class="dashboard-grid">
      <div v-if="authStore.user" class="card">
        <h2 v-if="!authStore.isAdmin">Minhas Informações</h2>
        <h2 v-else>Filtros do Dashboard</h2>

        <ul v-if="!authStore.isAdmin" class="info-list">
          <li><strong>Responsável:</strong> <span>{{ authStore.user.responsavelCadastro || 'Não definido' }}</span></li>
          <li><strong>Cidade:</strong> <span>{{ authStore.user.Cidade?.nome || 'Não definida' }}</span></li>
          <li><strong>Seccional:</strong> <span>{{ authStore.user.Seccional?.nome || 'Não definida' }}</span></li>
        </ul>

        <div v-else>
          <ul class="info-list">
            <li>
              <strong>Seccional:</strong>
              <select v-model="filters.seccionalId">
                <option :value="null">Todas as Seccionais</option>
                <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
              </select>
            </li>
            <li>
              <strong>Cidade:</strong>
              <select v-model="filters.cidadeId" :disabled="!filters.seccionalId">
                <option :value="null">Todas as Cidades (da seccional)</option>
                <option v-for="c in filteredCidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
              </select>
            </li>
          </ul>
          <button @click="fetchDashboardData" class="btn btn-primary" :disabled="loading" style="margin-top: 1rem;">
            {{ loading ? 'Buscando...' : 'Aplicar Filtros' }}
          </button>
        </div>
      </div>

      <div class="card">
        <h2>Pendências</h2>
        <div class="kpi-container">
          <div class="kpi-item">
            <span class="kpi-value">{{ pendingOrdersCount }}</span>
            <span class="kpi-label">Pedidos Cautelares Pendentes (ano corrente)</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Índ. de Resolubilidade</h2>
        <div class="kpi-container">
          <div class="kpi-item">
            <span class="kpi-value">{{ resolvabilityRate.toFixed(1) }}%</span>
            <span class="kpi-label">dos casos (ano corrente)</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Total de Vítimas</h2>
        <div class="kpi-container">
          <div class="kpi-item">
            <span class="kpi-value">{{ victimsCount }}</span>
            <span class="kpi-label">vítimas nos registros (ano corrente)</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Total de Presos</h2>
        <div class="kpi-container">
          <div class="kpi-item">
            <span class="kpi-value">{{ arrestedCount }}</span>
            <span class="kpi-label">infratores presos (ano corrente)</span>
          </div>
        </div>
      </div>

      <div class="card full-width">
        <h2>Atividade Recente</h2>
        <p v-if="recentOccurrences.length === 0" class="no-results-message">Nenhuma ocorrência atualizada recentemente.</p>
        <div class="table-responsive-wrapper" v-else>
          <table>
            <thead>
              <tr>
                <th class="col-inquerito">Nº Inquérito</th>
                <th class="col-data-crime">Data do Crime</th>
                <th class="col-andamento">Andamento</th>
                <th class="col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ocorrencia in recentOccurrences" :key="ocorrencia.id">
                <td>{{ ocorrencia.numeroInquerito }}</td>
                <td>{{ new Date(ocorrencia.dataCrime).toLocaleDateString() }}</td>
                <td>{{ ocorrencia.andamentoProcedimento }}</td>
                <td class="actions-cell">
                  <router-link :to="`/app/ocorrencias/editar/${ocorrencia.id}`" class="btn btn-primary">
                    Ver / Editar
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiClient from '../api/api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const loading = ref(true);

const recentOccurrences = ref([]);
const pendingOrdersCount = ref(0);
const resolvabilityRate = ref(0.0);
const victimsCount = ref(0);
const arrestedCount = ref(0);

const seccionais = ref([]);
const cidades = ref([]);

const filters = reactive({
  seccionalId: null,
  cidadeId: null,
});

const filteredCidades = computed(() => {
  if (!filters.seccionalId) return [];
  return cidades.value.filter(c => c.seccionalId === filters.seccionalId);
});
watch(() => filters.seccionalId, () => { filters.cidadeId = null; });

const fetchOptions = async () => {
  if (authStore.isAdmin) {
    try {
      const response = await apiClient.get('/form-options');
      seccionais.value = response.data.seccionais;
      cidades.value = response.data.cidades;
    } catch (err) {
      console.error("Falha ao carregar opções de filtro.", err);
      notificationStore.showNotification({ message: "Falha ao carregar opções de filtro." });
    }
  }
};

const buildParams = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params;
};

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const config = {};
    if (authStore.isAdmin) {
      config.params = buildParams(filters);
    }
    const response = await apiClient.get('/dashboard/summary', config);
    
    const { data } = response;
    recentOccurrences.value = data.recentOccurrences;
    pendingOrdersCount.value = data.pendingOrdersCount;
    victimsCount.value = data.victimsCount;
    arrestedCount.value = data.arrestedCount;

    const stats = data.resolvabilityStats;
    if (stats && stats.totalOccurrences > 0) {
      resolvabilityRate.value = (stats.solvedOccurrences / stats.totalOccurrences) * 100;
    } else {
      resolvabilityRate.value = 0.0;
    }

    if (authStore.isAdmin && data.recentOccurrences.length === 0 && (!stats || stats.totalOccurrences === 0)) {
      notificationStore.showNotification({ message: 'Nenhum dado encontrado para os filtros selecionados.', type: 'info' });
    }
  } catch (err) {
    recentOccurrences.value = [];
    pendingOrdersCount.value = 0;
    resolvabilityRate.value = 0.0;
    victimsCount.value = 0;
    arrestedCount.value = 0;
    notificationStore.showNotification({ message: err.message || 'Não foi possível carregar os dados do dashboard.' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Executa as duas chamadas em paralelo para otimizar o carregamento
  Promise.all([
    fetchDashboardData(),
    fetchOptions()
  ]);
});
</script>

<style scoped>
/* Estilos locais que foram removidos: .feedback-popup e .feedback-popup.error */

.dashboard-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 1.5rem; 
}

.card { 
  background-color: var(--surface-color); 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  padding: 1.5rem; 
}
.card.full-width { 
  grid-column: 1 / -1; 
}
.card h2 { 
  margin-top: 0; 
  border-bottom: 1px solid var(--border-color); 
  padding-bottom: 0.75rem; 
  margin-bottom: 1rem; 
  font-size: 1.25rem;
}

.info-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}
.info-list li { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.75rem 0; 
}
.info-list li + li { 
  border-top: 1px solid var(--bg-color); 
}
.info-list li strong { 
  color: var(--text-color-muted); 
}
.info-list li select {
  width: 60%;
  padding: 0.4rem;
}

.kpi-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  text-align: center; 
  padding: 1rem 0; 
}
.kpi-item { 
  display: flex; 
  flex-direction: column; 
}
.kpi-value { 
  font-size: 3rem; 
  font-weight: 700; 
  color: var(--color-primary); 
}
.kpi-label { 
  font-size: 1rem; 
  color: var(--text-color-muted); 
}


table {

  min-width: 1000px;
  
}


.col-inquerito {
  width: 20%; /* Faz a coluna 'Nº Inquérito' ocupar 10% do espaço da tabela */
}

.col-data-crime {
  width: 20%; /* Faz a coluna 'Data do Crime' ocupar 15% do espaço da tabela */
}

.col-andamento {
  width: 40%; /* Faz a coluna 'Andamento' ocupar 10% do espaço da tabela */
}

.col-acoes {
  width: 20%; /* Faz a coluna 'Ações' ocupar 15% do espaço da tabela */
}


</style>