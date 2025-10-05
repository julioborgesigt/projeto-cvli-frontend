<template>
  <div>
    <div class="page-header">
      <h1>{{ authStore.isAdmin ? 'Todas as Ocorrências' : 'Minhas Ocorrências' }}</h1>
    </div>

    <div class="filter-bar">
      <template v-if="authStore.isAdmin">
        <div class="form-group">
          <label>Filtrar por Seccional</label>
          <select v-model="filters.seccionalId">
            <option :value="null">Todas</option>
            <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Filtrar por Cidade</label>
          <select v-model="filters.cidadeId" :disabled="!filters.seccionalId">
            <option :value="null">Todas</option>
            <option v-for="c in filteredCidades" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </div>
      </template>

      <div class="form-group">
        <label>Filtrar por Ano</label>
        <select v-model="filters.year">
          <option :value="null">Todos</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Buscar por Nº Inquérito</label>
        <input type="text" v-model="filters.numeroInquerito" placeholder="Digite o número..." @keyup.enter="applyFilters" />
      </div>

      <div class="form-group">
        <label>Buscar por Vítima / Infrator</label>
        <input type="text" v-model="filters.nomePessoa" placeholder="Digite um nome..." @keyup.enter="applyFilters" />
      </div>
 
      <div class="form-group">
        <label>Ordenar por</label>
        <select v-model="filters.sortBy" @change="applyFilters">
          <option value="numero">Número do Inquérito</option>
          <option value="data">Data do Crime (Mais Recente)</option>
        </select>
      </div>

      <button @click="applyFilters" class="btn btn-primary">Buscar</button>
    </div>

    <div v-if="loading" class="loading-message">Carregando...</div>

    <div class="table-responsive-wrapper" v-if="ocorrencias.length > 0">
      <table>
        <thead>
          <tr>
            <th class="col-numero">Nº Inquérito</th>
            <th class="col-data">Data do Crime</th>
            <th class="col-vitima">Primeira Vítima</th>
            <th class="col-infrator">Primeiro Infrator</th>
            <th class="col-andamento">Andamento</th>
            <th class="col-elucidado">Elucidado?</th>
            <th class="col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ocorrencia in ocorrencias" :key="ocorrencia.id">
            <td>{{ ocorrencia.numeroInquerito }}</td>
            <td>{{ new Date(ocorrencia.dataCrime).toLocaleDateString() }}</td>
            <td>{{ ocorrencia.Vitimas && ocorrencia.Vitimas.length > 0 ? ocorrencia.Vitimas[0].nome : 'N/A' }}</td>
            <td>{{ ocorrencia.Infrators && ocorrencia.Infrators.length > 0 ? ocorrencia.Infrators[0].nome : 'N/A' }}</td>
            <td>{{ ocorrencia.andamentoProcedimento }}</td>
            <td>{{ ocorrencia.crimeElucidado ? 'Sim' : 'Não' }}</td>
            <td class="actions-cell">
              <router-link :to="'/app/ocorrencias/editar/' + ocorrencia.id" class="btn btn-primary">Editar</router-link>
              <button @click="deleteOcorrencia(ocorrencia.id)" class="btn btn-danger">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>  
    </div>
    <p v-else-if="!loading" class="no-results-message">Nenhuma ocorrência encontrada para os filtros aplicados.</p>

    <div v-if="totalPages > 1" class="pagination-controls">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-secondary">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }} (Total: {{ totalItems }})</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="btn btn-secondary">Próxima</button>
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

const ocorrencias = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);
const itemsPerPage = 10;

const seccionais = ref([]);
const cidades = ref([]);
const filters = reactive({
  seccionalId: null,
  cidadeId: null,
  numeroInquerito: '',
  year: new Date().getFullYear(),
  sortBy: 'data',
  nomePessoa: '', 
});

const fetchFilterOptions = async () => {
  if (authStore.isAdmin) {
    try {
      const response = await apiClient.get('/form-options');
      seccionais.value = response.data.seccionais;
      cidades.value = response.data.cidades;
    } catch (err) {
      notificationStore.showNotification({ message: "Falha ao carregar opções de filtro." });
    }
  }
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const filteredCidades = computed(() => {
  if (!filters.seccionalId) return cidades.value;
  return cidades.value.filter(c => c.seccionalId === filters.seccionalId);
});
watch(() => filters.seccionalId, () => { filters.cidadeId = null; });

const fetchOcorrencias = async (page = 1) => {
  loading.value = true;
  try {
    const cleanFilters = {};
    for (const key in filters) {
      if (filters[key]) {
        cleanFilters[key] = filters[key];
      }
    }
    
    cleanFilters.page = page;
    cleanFilters.limit = itemsPerPage;

    const response = await apiClient.get('/ocorrencias', { params: cleanFilters });
    
    ocorrencias.value = response.data.data;
    totalPages.value = response.data.pagination.totalPages;
    currentPage.value = response.data.pagination.currentPage;
    totalItems.value = response.data.pagination.totalItems;

  } catch (err) {
    notificationStore.showNotification({ message: err.message || 'Falha ao carregar ocorrências.' });
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchOcorrencias(page);
  }
};

const applyFilters = () => {
  fetchOcorrencias(1);
};

const deleteOcorrencia = async (id) => {
  if (confirm('Tem certeza de que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.')) {
    try {
      await apiClient.delete(`/ocorrencias/${id}`);
      // Recarrega a página atual para refletir a remoção
      fetchOcorrencias(currentPage.value); 
      notificationStore.showNotification({ message: 'Ocorrência excluída com sucesso.', type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.message || 'Falha ao excluir a ocorrência.' });
    }
  }
};

onMounted(() => {
  Promise.all([
    fetchOcorrencias(),
    fetchFilterOptions()
  ]);
});
</script>

<style scoped>

table {
 
  min-width: 1400px;

}

.col-numero {
  width: 10%; /* Faz a coluna 'Nº Inquérito' ocupar 10% do espaço da tabela */
}

.col-data {
  width: 7%; /* Faz a coluna 'Data do Crime' ocupar 15% do espaço da tabela */
}

.col-vitima {
  width: 20%; /* Faz a coluna 'Vítima' ocupar 20% do espaço da tabela */
}

.col-infrator {
  width: 20%; /* Faz a coluna 'Infrator' ocupar 20% do espaço da tabela */
}

.col-andamento {
  width: 25%; /* Faz a coluna 'Andamento' ocupar 10% do espaço da tabela */
}

.col-elucidado {
  width: 8%; /* Faz a coluna 'Elucidado' ocupar 10% do espaço da tabela */
}

.col-acoes {
  width: 15%; /* Faz a coluna 'Ações' ocupar 10% do espaço da tabela */
}


</style>


