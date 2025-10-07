<template>
  <div>
    <div class="page-header">
      <h1>Gerenciamento de Usuários</h1>
      <p>Crie novas contas de usuário para as delegacias.</p>
    </div>

    <div class="form-container">
      <input type="email" v-model="newItem.email" placeholder="E-mail do usuário" />
      <input type="password" v-model="newItem.password" placeholder="Senha Padrão" />
      <select v-model="newItem.seccionalId">
        <option :value="null" disabled>Selecione a Seccional</option>
        <option v-for="seccional in seccionais" :key="seccional.id" :value="seccional.id">
          {{ seccional.nome }}
        </option>
      </select>
      <select v-model="newItem.cidadeId" :disabled="!newItem.seccionalId">
        <option :value="null" disabled>Selecione a Cidade</option>
        <option v-for="cidade in filteredCidades" :key="cidade.id" :value="cidade.id">
          {{ cidade.nome }}
        </option>
      </select>
      <button @click="addItem" class="btn btn-primary">Criar Usuário</button>
    </div>

    <div v-if="loading" class="loading-message">Carregando usuários...</div>

    <div class="table-responsive-wrapper" v-else-if="items.length > 0">
    <table>
      <thead>
        <tr>
          <th>E-mail</th>
          <th>Cidade</th>
          <th>Seccional</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in items" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ user.Cidade ? user.Cidade.nome : 'N/A' }}</td>
          <td>{{ user.Seccional ? user.Seccional.nome : 'N/A' }}</td>
          <td class="actions-cell">
            <button @click="deleteItem(user.id)" class="btn btn-danger">Remover</button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <p v-else class="no-results-message">Nenhum usuário cadastrado.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiClient from '../../api/api';
import { useNotificationStore } from '../../stores/notificationStore';

const USERS_API_ENDPOINT = '/admin/users';
const OPTIONS_API_ENDPOINT = '/form-options';

const items = ref([]);
const seccionais = ref([]);
const cidades = ref([]);
const newItem = reactive({ email: '', password: '', seccionalId: null, cidadeId: null });
const notificationStore = useNotificationStore();
const loading = ref(true); // <-- MUDANÇA: Adicionado estado de loading

const filteredCidades = computed(() => {
  if (!newItem.seccionalId) return [];
  return cidades.value.filter(c => c.seccionalId === newItem.seccionalId);
});
watch(() => newItem.seccionalId, () => { newItem.cidadeId = null; });

const fetchItems = async () => {
  loading.value = true; // <-- MUDANÇA: Gerencia estado de loading
  try {
    const [usersRes, optionsRes] = await Promise.all([
      apiClient.get(USERS_API_ENDPOINT),
      apiClient.get(OPTIONS_API_ENDPOINT)
    ]);
    
    items.value = usersRes.data;
    seccionais.value = optionsRes.data.seccionais;
    cidades.value = optionsRes.data.cidades;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar os dados." });
  } finally {
    loading.value = false; // <-- MUDANÇA: Gerencia estado de loading
  }
};

const addItem = async () => {
  if (!newItem.email || !newItem.password || !newItem.cidadeId) {
    notificationStore.showNotification({ message: "Todos os campos são obrigatórios." });
    return;
  }
  try {
    await apiClient.post(USERS_API_ENDPOINT, newItem);
    Object.assign(newItem, { email: '', password: '', seccionalId: null, cidadeId: null });
    await fetchItems();
    notificationStore.showNotification({ message: 'Usuário criado com sucesso!', type: 'success' });
  } catch (err) {
    notificationStore.showNotification({ message: err.message || "Falha ao criar usuário." });
    newItem.password = ''; 
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja remover este usuário?')) {
    try {
      await apiClient.delete(`${USERS_API_ENDPOINT}/${id}`);
      await fetchItems();
      notificationStore.showNotification({ message: 'Usuário removido com sucesso!', type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.message || "Falha ao remover o usuário." });
    }
  }
};

onMounted(fetchItems);
</script>