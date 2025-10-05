<template>
  <div>
    <div class="page-header">
      <h1>Gerenciamento de Cidades</h1>
    </div>

    <div class="form-container">
      <input type="text" v-model="newItem.nome" placeholder="Nome da cidade" />
      <select v-model="newItem.seccionalId">
        <option :value="null" disabled>Selecione a Seccional</option>
        <option v-for="seccional in seccionais" :key="seccional.id" :value="seccional.id">
          Seccional {{ seccional.nome }}
        </option>
      </select>
      <button @click="addItem" class="btn btn-primary">Adicionar Cidade</button>
    </div>

    <hr />
    
    <div class="filter-bar" style="justify-content: flex-start;">
      <div class="form-group" style="flex-grow: 0; ">
        <label for="seccionalFilter">Filtrar por Seccional:</label>
        <select id="seccionalFilter" v-model="selectedSeccionalFilter">
          <option :value="null">Mostrar Todas</option>
          <option v-for="seccional in seccionais" :key="seccional.id" :value="seccional.id">
            Seccional {{ seccional.nome }}
          </option>
        </select>
      </div>
    </div>

    <div class="table-responsive-wrapper" v-if="filteredItems.length > 0">
      <table>
        <thead>
          <tr>
            <th class="col-nome">Nome da Cidade</th>
            <th class="col-seccional">Seccional</th>
            <th class="col-status">Status</th>
            <th class="col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" :class="{ 'inactive-row': !item.ativo }">
            <td v-if="editingItemId === item.id">
              <input type="text" v-model="editFormData.nome" @keyup.enter="saveEdit(item.id)" class="inline-edit-input" />
            </td>
            <td v-else>{{ item.nome }}</td>
            
            <td v-if="editingItemId === item.id">
              <select v-model="editFormData.seccionalId" class="inline-edit-input">
                <option v-for="seccional in seccionais" :key="seccional.id" :value="seccional.id">
                  Seccional {{ seccional.nome }}
                </option>
              </select>
            </td>
            <td v-else>{{ getSeccionalNome(item.seccionalId) }}</td>
            
            <td>{{ item.ativo ? 'Ativo' : 'Inativo' }}</td>
            
            <td class="actions-cell">
              <template v-if="editingItemId === item.id">
                <button @click="saveEdit(item.id)" class="btn btn-success">Salvar</button>
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
    <p v-else class="no-results-message">Nenhuma cidade encontrada para o filtro selecionado.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import apiClient from '../../api/api';
import { useNotificationStore } from '../../stores/notificationStore';

const notificationStore = useNotificationStore();
const items = ref([]);
const seccionais = ref([]);
const newItem = reactive({ nome: '', seccionalId: null });
const selectedSeccionalFilter = ref(null);

const CIDADES_API_ENDPOINT = '/admin/cidades';
const OPTIONS_API_ENDPOINT = '/form-options';

const filteredItems = computed(() => {
  if (!selectedSeccionalFilter.value) return items.value;
  return items.value.filter(item => item.seccionalId === selectedSeccionalFilter.value);
});

// --- Lógica de Edição Inline ---
const editingItemId = ref(null);
const editFormData = reactive({ nome: '', seccionalId: null });

const startEdit = (item) => {
  editingItemId.value = item.id;
  editFormData.nome = item.nome;
  editFormData.seccionalId = item.seccionalId;
};

const cancelEdit = () => {
  editingItemId.value = null;
  editFormData.nome = '';
  editFormData.seccionalId = null;
};
// --- Fim da Lógica ---

const getSeccionalNome = (seccionalId) => {
  const seccional = seccionais.value.find(s => s.id === seccionalId);
  return seccional ? `Seccional ${seccional.nome}` : 'N/A';
};

const fetchItems = async () => {
  try {
    const [cidadesRes, optionsRes] = await Promise.all([
      apiClient.get(CIDADES_API_ENDPOINT),
      apiClient.get(OPTIONS_API_ENDPOINT)
    ]);
    items.value = cidadesRes.data;
    seccionais.value = optionsRes.data.seccionais;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar os dados." });
  }
};

const addItem = async () => {
  if (!newItem.nome.trim() || !newItem.seccionalId) {
    notificationStore.showNotification({ message: "Nome da cidade e seccional são obrigatórios." });
    return;
  }
  try {
    await apiClient.post(CIDADES_API_ENDPOINT, newItem);
    newItem.nome = '';
    newItem.seccionalId = null;
    await fetchItems();
    notificationStore.showNotification({ message: "Cidade adicionada com sucesso!", type: 'success' });
  } catch (err) {
    notificationStore.showNotification({ message: err.message || "Falha ao adicionar a cidade." });
  }
};

const saveEdit = async (id) => {
  if (!editFormData.nome.trim() || !editFormData.seccionalId) {
    notificationStore.showNotification({ message: "Todos os campos são obrigatórios." });
    return;
  }
  try {
    await apiClient.put(`${CIDADES_API_ENDPOINT}/${id}`, editFormData);
    await fetchItems();
    notificationStore.showNotification({ message: "Cidade atualizada com sucesso!", type: 'success' });
    cancelEdit();
  } catch (err) {
    notificationStore.showNotification({ message: err.message || "Falha ao atualizar a cidade." });
  }
};

const toggleStatus = async (item) => {
  const action = item.ativo ? 'desativar' : 'ativar';
  if (confirm(`Tem certeza que deseja ${action} este item?`)) {
    try {
      await apiClient.patch(`${CIDADES_API_ENDPOINT}/${item.id}`);
      await fetchItems();
      notificationStore.showNotification({ message: `Cidade ${action} com sucesso.`, type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: `Falha ao ${action} o item.` });
    }
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja EXCLUIR PERMANENTEMENTE este item?')) {
    try {
      await apiClient.delete(`${CIDADES_API_ENDPOINT}/${id}`);
      await fetchItems();
      notificationStore.showNotification({ message: "Cidade excluída com sucesso!", type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.response?.data?.message || 'Falha ao remover o item.' });
    }
  }
};

onMounted(fetchItems);
</script>

<style scoped>

.col-nome {
  width: 35%; /* Faz a coluna 'Nome' ocupar 60% do espaço da tabela */
}

.col-status {
  width: 15%; /* Faz a coluna 'Status' ocupar 20% do espaço da tabela */
}

.col-seccional {
  width: 15%; /* Faz a coluna 'Seccional' ocupar 20% do espaço da tabela */
}

.col-acoes {
  width: 35%; /* Faz a coluna 'Ações' ocupar 20% do espaço da tabela */
}

</style>