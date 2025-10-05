<template>
  <div>
    <div class="page-header">
      <h1>Gerenciamento de Tipos de Prisão</h1>
      <p>Adicione, edite ou remova os tipos de prisão que podem ser selecionados no sistema.</p>
    </div>

    <div class="form-container">
      <input type="text" v-model="newItemName" placeholder="Ex: Flagrante PC" @keyup.enter="addItem" />
      <button @click="addItem" class="btn btn-primary">Adicionar Tipo</button>
    </div>

    <div class="table-responsive-wrapper" v-if="items.length > 0">
      <table>
        <thead>
          <tr>
            <th class="col-nome">Nome</th>
            <th class="col-status">Status</th>
            <th class="col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" :class="{ 'inactive-row': !item.ativo }">
            <td v-if="editingItemId === item.id">
              <input type="text" v-model="editFormData.nome" @keyup.enter="saveEdit(item.id)" class="inline-edit-input" />
            </td>
            <td v-else>{{ item.nome }}</td>
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
    <p v-else class="no-results-message">Nenhum tipo de prisão cadastrado.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '../../api/api';
import { useNotificationStore } from '../../stores/notificationStore';

const notificationStore = useNotificationStore();
const items = ref([]);
const newItemName = ref('');

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

const API_ENDPOINT = '/admin/tipos-prisao';

const fetchItems = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINT);
    items.value = response.data;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar a lista." });
  }
};

const addItem = async () => {
  if (!newItemName.value.trim()) return;
  try {
    await apiClient.post(API_ENDPOINT, { nome: newItemName.value });
    newItemName.value = '';
    await fetchItems();
    notificationStore.showNotification({ message: "Tipo de prisão adicionado com sucesso!", type: 'success' });
  } catch (err) {
    notificationStore.showNotification({ message: err.message || 'Falha ao adicionar o item.' });
  }
};

const saveEdit = async (id) => {
  if (!editFormData.nome.trim()) {
    notificationStore.showNotification({ message: "O nome não pode ficar em branco." });
    return;
  }
  try {
    await apiClient.put(`${API_ENDPOINT}/${id}`, { nome: editFormData.nome });
    await fetchItems();
    notificationStore.showNotification({ message: "Tipo de prisão atualizado com sucesso!", type: 'success' });
    cancelEdit();
  } catch (err) {
    notificationStore.showNotification({ message: err.message || 'Falha ao atualizar o item.' });
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja EXCLUIR PERMANENTEMENTE este item?')) {
    try {
      await apiClient.delete(`${API_ENDPOINT}/${id}`);
      await fetchItems();
      notificationStore.showNotification({ message: "Tipo de prisão excluído com sucesso!", type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.response?.data?.message || 'Falha ao remover o item.' });
    }
  }
};

const toggleStatus = async (item) => {
  const action = item.ativo ? 'desativar' : 'ativar';
  if (confirm(`Tem certeza que deseja ${action} este item?`)) {
    try {
      await apiClient.patch(`${API_ENDPOINT}/${item.id}`);
      await fetchItems();
      notificationStore.showNotification({ message: `Tipo de prisão ${action} com sucesso.`, type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: `Falha ao ${action} o item.` });
    }
  }
};

onMounted(fetchItems);
</script>