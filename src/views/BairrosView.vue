<template>
  <div>
    <div v-if="authStore.isAdmin">
      <div class="page-header">
        <h1>Gerenciamento de Bairros (Admin)</h1>
        <p>Adicione, edite ou remova bairros de qualquer cidade do sistema.</p>
      </div>

      <div class="filter-bar">
        <h3>Filtrar Bairros</h3>
        <input type="text" v-model="filters.nome" placeholder="Pesquisar por nome..." @keyup.enter="fetchItems" />
        <select v-model="filters.seccionalId">
          <option :value="null">Todas as Seccionais</option>
          <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
        </select>
        <select v-model="filters.cidadeId" :disabled="!filters.seccionalId">
          <option :value="null">Todas as Cidades</option>
          <option v-for="c in filteredCidadesForFilter" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
        <div class="button-group" style="display: flex; gap: 0.5rem; flex-grow: 0;">
          <button @click="fetchItems" class="btn btn-primary" :disabled="loading">{{ loading ? 'Buscando...' : 'Buscar' }}</button>
          <button @click="clearFilters" class="btn btn-secondary">Limpar</button>
        </div>
      </div>
      
      <div class="form-container">
        <select v-model="newItem.seccionalId">
          <option :value="null" disabled>Selecione a Seccional</option>
          <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
        </select>
        <select v-model="newItem.cidadeId" :disabled="!newItem.seccionalId">
          <option :value="null" disabled>Selecione a Cidade</option>
          <option v-for="c in filteredCidadesForCreate" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
        <input type="text" v-model="newItem.nome" placeholder="Nome do novo bairro" />
        <button @click="addItem" class="btn btn-primary" :disabled="!newItem.cidadeId || !newItem.nome">Adicionar Bairro</button>
      </div>
    </div>

    <div v-else>
      <div class="page-header">
        <h1>Gerenciamento de Bairros</h1>
        <p>Adicione ou remova os bairros da sua cidade.</p>
      </div>
      <div class="form-container">
        <input type="text" v-model="newItemName" placeholder="Nome do novo bairro" @keyup.enter="addItem" />
        <button @click="addItem" class="btn btn-primary">Adicionar Bairro</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-message">Carregando bairros...</div>
  
    <div class="table-responsive-wrapper" v-if="!loading && items.length > 0">
    <table>
      <thead>
        <tr>
          <th class="col-nome">Nome</th>
          <th v-if="authStore.isAdmin" class="col-cidade">Cidade</th>
          <th class="col-status">Status</th>
          <th class="col-acoes">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" :class="{ 'inactive-row': !item.ativo }">
          <td v-if="editingItemId === item.id">
            <input type="text" v-model="editFormData.nome" @keyup.enter="saveEdit(item)" class="inline-edit-input" />
          </td>
          <td v-else>{{ item.nome }}</td>
          <td v-if="authStore.isAdmin">{{ getCidadeNome(item.cidadeId) }}</td>
          <td>{{ item.ativo ? 'Ativo' : 'Inativo' }}</td>
          <td class="actions-cell">
            <template v-if="editingItemId === item.id">
              <button @click="saveEdit(item)" class="btn btn-success">Salvar</button>
              <button @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
            </template>
            <template v-else>
              <button @click="startEdit(item)" class="btn btn-primary" :disabled="!item.ativo">Editar</button>
              <button @click="toggleStatus(item)" :class="['btn', item.ativo ? 'btn-disable' : 'btn-enable']">
                {{ item.ativo ? 'Desativar' : 'Ativar' }}
              </button>
              <button @click="deleteItem(item.id)" class="btn btn-danger">Excluir</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    <p v-else-if="!loading" class="no-results-message">Nenhum bairro encontrado para os filtros aplicados.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import apiClient from '../api/api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const items = ref([]);
const loading = ref(true);

const newItemName = ref('');
const seccionais = ref([]);
const cidades = ref([]);
const newItem = reactive({ nome: '', seccionalId: null, cidadeId: null });
const filters = reactive({ nome: '', seccionalId: null, cidadeId: null });

const ADMIN_API_ENDPOINT = '/admin/bairros';
const USER_API_ENDPOINT = '/bairros';
const API_ENDPOINT = authStore.isAdmin ? ADMIN_API_ENDPOINT : USER_API_ENDPOINT;

// --- Lógica de Edição Inline ---
const editingItemId = ref(null);
const editFormData = reactive({ nome: '' });

const startEdit = (item) => {
  editingItemId.value = item.id;
  editFormData.nome = item.nome;
};

const cancelEdit = () => {
  editingItemId.value = null;
  editFormData.nome = '';
};
// --- Fim da Lógica ---

const filteredCidadesForCreate = computed(() => !newItem.seccionalId ? [] : cidades.value.filter(c => c.seccionalId === newItem.seccionalId));
const filteredCidadesForFilter = computed(() => !filters.seccionalId ? [] : cidades.value.filter(c => c.seccionalId === filters.seccionalId));
watch(() => newItem.seccionalId, () => { newItem.cidadeId = null; });
watch(() => filters.seccionalId, () => { filters.cidadeId = null; });

const fetchAdminOptions = async () => {
  if (authStore.isAdmin) {
    try {
      const res = await apiClient.get('/form-options');
      seccionais.value = res.data.seccionais;
      cidades.value = res.data.cidades;
    } catch (err) {
      notificationStore.showNotification({ message: "Falha ao carregar opções de filtro." });
    }
  }
};

const buildParams = (filtersObj) => {
  const params = new URLSearchParams();
  Object.entries(filtersObj).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params;
};

const fetchItems = async () => {
  loading.value = true;
  try {
    const config = {};
    if (authStore.isAdmin) {
      config.params = buildParams(filters);
    }
    const response = await apiClient.get(API_ENDPOINT, config); 
    items.value = response.data;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar a lista de bairros." });
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.nome = '';
  filters.seccionalId = null;
  filters.cidadeId = null;
  fetchItems();
};

const addItem = async () => {
  try {
    let payload;
    if (authStore.isAdmin) {
      if (!newItem.nome.trim() || !newItem.cidadeId) {
        notificationStore.showNotification({ message: "Selecione a seccional, a cidade e digite o nome do bairro." });
        return;
      }
      payload = { nome: newItem.nome, cidadeId: newItem.cidadeId };
    } else {
      if (!newItemName.value.trim()) return;
      payload = { nome: newItemName.value };
    }

    await apiClient.post(API_ENDPOINT, payload);
    newItemName.value = '';
    newItem.nome = '';
    await fetchItems();
    notificationStore.showNotification({ message: "Bairro adicionado com sucesso!", type: 'success' });
  } catch (err) {
    notificationStore.showNotification({ message: err.message || "Falha ao adicionar o bairro." });
  }
};

const saveEdit = async (item) => {
  if (!editFormData.nome.trim()) {
    notificationStore.showNotification({ message: "O nome não pode ficar em branco." });
    return;
  }
  try {
    const payload = authStore.isAdmin 
      ? { nome: editFormData.nome, cidadeId: item.cidadeId } 
      : { nome: editFormData.nome };
    await apiClient.put(`${API_ENDPOINT}/${item.id}`, payload);
    await fetchItems();
    notificationStore.showNotification({ message: "Bairro atualizado com sucesso!", type: 'success' });
    cancelEdit();
  } catch (err) { 
    notificationStore.showNotification({ message: err.message || "Falha ao atualizar o bairro." });
  }
};

const toggleStatus = async (item) => {
  const action = item.ativo ? 'desativar' : 'ativar';
  if (confirm(`Tem certeza que deseja ${action} este item?`)) {
    try {
      await apiClient.patch(`${API_ENDPOINT}/${item.id}`);
      await fetchItems();
      notificationStore.showNotification({ message: `Bairro ${action} com sucesso.`, type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: `Falha ao ${action} o bairro.` });
    }
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja EXCLUIR PERMANENTEMENTE este item?')) {
    try {
      await apiClient.delete(`${API_ENDPOINT}/${id}`);
      await fetchItems();
      notificationStore.showNotification({ message: "Bairro excluído com sucesso!", type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.response?.data?.message || "Falha ao remover o item." });
    }
  }
};

const getCidadeNome = (cidadeId) => {
  const cidade = cidades.value.find(c => c.id === cidadeId);
  return cidade ? cidade.nome : 'N/A';
};

onMounted(() => {
  if (authStore.isAdmin) {
    Promise.all([fetchItems(), fetchAdminOptions()]);
  } else {
    fetchItems();
  }
});
</script>

<style scoped>
.filter-bar h3 {
  width: 100%;
  flex-basis: 100%;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.col-nome {
  width: 25%; /* Faz a coluna 'Nome' ocupar 60% do espaço da tabela */
}

.col-cidade {
  width: 25%; /* Faz a coluna 'Cidades' ocupar 20% do espaço da tabela */
}

.col-status {
  width: 15%; /* Faz a coluna 'Status' ocupar 20% do espaço da tabela */
}

.col-acoes {
  width: 35%; /* Faz a coluna 'Ações' ocupar 20% do espaço da tabela */
}

</style>