<template>
  <div>
    <div class="page-header">
      <h1>Gerenciamento de Pedidos Cautelares</h1>
      <p>Visualize e edite o andamento dos pedidos cautelares da sua cidade.</p>
    </div>

    <div class="filter-bar">
      <div class="form-group">
        <label>Buscar por Nº Ocorrência / Processo</label>
        <input 
          type="text" 
          v-model="filters.searchQuery" 
          placeholder="Digite o número..."
          @keyup.enter="fetchItems"
        />
      </div>
      <div class="form-group">
        <label>Filtrar por Tipo</label>
        <select v-model="filters.tipo">
          <option :value="null">Todos</option>
          <option v-for="opt in tiposOptions" :key="opt.id" :value="opt.nome">{{ opt.nome }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Filtrar por Andamento</label>
        <select v-model="filters.andamento">
          <option :value="null">Todos</option>
          <option v-for="opt in andamentosOptions" :key="opt.id" :value="opt.nome">{{ opt.nome }}</option>
        </select>
      </div>
      <button @click="fetchItems" class="btn btn-primary">Buscar</button>
      <div class="export-buttons" style="margin-left: auto; flex-grow: 0; display: flex; gap: 0.5rem;">
        <button @click="exportToPDF" :disabled="!items.length" class="btn btn-secondary">Exportar PDF</button>
        <button @click="exportToXLSX" :disabled="!items.length" class="btn btn-secondary">Exportar XLSX</button>
      </div>
    </div>

    <div v-if="loading" class="loading-message">Carregando pedidos...</div>

    <div class="table-responsive-wrapper" v-if="items.length > 0">
    <table>
      <thead>
        <tr>
          <th class="col-inquerito">Nº Inquérito da Ocorrência</th>
          <th class="col-processo">Nº Processo Principal</th> 
          <th class="col-tipo">Tipo de Pedido</th>
          <th class="col-andamento">Andamento</th>
          <th class="col-processo-cautelar">Nº Processo Cautelar</th>
          <th class="col-senha">Senha</th>
          <th class="col-acoes">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.Ocorrencium ? item.Ocorrencium.numeroInquerito : 'N/A' }}</td>
           <td>{{ item.Ocorrencium ? (item.Ocorrencium.numeroProcessoPrincipal || 'Não informado') : 'N/A' }}</td>
          <td>{{ item.tipo }}</td>
          <td>
            <template v-if="editingItemId === item.id">
              <select v-model="editFormData.andamento" class="inline-edit-input">
                <option v-for="opt in andamentosOptions" :key="opt.id" :value="opt.nome">{{ opt.nome }}</option>
              </select>
            </template>
            <template v-else>
              {{ item.andamento }}
            </template>
          </td>
          <td>
            <template v-if="editingItemId === item.id">
              <input type="text" v-model="editFormData.numeroProcesso" class="inline-edit-input" placeholder="Não informado" />
            </template>
            <template v-else>
              {{ item.numeroProcesso || 'Não informado' }}
            </template>
          </td>
          <td>
            <template v-if="editingItemId === item.id">
              <input type="text" v-model="editFormData.senha" class="inline-edit-input" placeholder="Não informado" />
            </template>
            <template v-else>
              {{ item.senha || 'Não informado' }}
            </template>
          </td>
          <td class="actions-cell">
            <template v-if="editingItemId === item.id">
              <button @click="saveItem(item.id)" class="btn btn-success">Salvar</button>
              <button @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
            </template>
            <template v-else>
              <button @click="startEdit(item)" class="btn btn-primary">Editar</button>
              <button @click="deleteItem(item.id)" class="btn btn-danger">Excluir</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    <p v-else-if="!loading" class="no-results-message">Nenhum pedido cautelar encontrado para os filtros aplicados.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '../api/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();
const items = ref([]);
const loading = ref(true);

const filters = reactive({
  tipo: null,
  andamento: null,
  searchQuery: '',
});

const andamentosOptions = ref([]);
const tiposOptions = ref([]);

const editingItemId = ref(null);
const editFormData = reactive({
  andamento: '',
  numeroProcesso: '',
  senha: '',
});

const API_ENDPOINT = '/pedidos';

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
    const response = await apiClient.get(API_ENDPOINT, { params: buildParams(filters) });
    items.value = response.data;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar os pedidos cautelares." });
  } finally {
    loading.value = false;
  }
};

const fetchOptions = async () => {
  try {
    const res = await apiClient.get('/form-options');
    andamentosOptions.value = res.data.statusPedido;
    tiposOptions.value = res.data.tiposPedido;
  } catch (err) {
    notificationStore.showNotification({ message: "Falha ao carregar opções para filtros." });
  }
};

const startEdit = (item) => {
  editingItemId.value = item.id;
  editFormData.andamento = item.andamento;
  editFormData.numeroProcesso = item.numeroProcesso || '';
  editFormData.senha = item.senha || '';
};

const cancelEdit = () => {
  editingItemId.value = null;
};

const saveItem = async (id) => {
  try {
    await apiClient.put(`${API_ENDPOINT}/${id}`, editFormData);
    cancelEdit();
    await fetchItems();
    notificationStore.showNotification({ message: 'Pedido atualizado com sucesso!', type: 'success' });
  } catch (err) {
    notificationStore.showNotification({ message: err.message || "Falha ao salvar as alterações." });
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir este pedido cautelar? Esta ação não pode ser desfeita.')) {
    try {
      await apiClient.delete(`${API_ENDPOINT}/${id}`);
      await fetchItems();
      notificationStore.showNotification({ message: 'Pedido excluído com sucesso!', type: 'success' });
    } catch (err) {
      notificationStore.showNotification({ message: err.message || "Falha ao excluir o pedido." });
    }
  }
};

const prepareExportData = () => {
  const headers = ["Nº Inquérito Ocorrência", "Nº Processo Principal", "Tipo de Pedido", "Andamento", "Nº Processo Cautelar", "Senha"];
  const body = items.value.map(item => [
    item.Ocorrencium?.numeroInquerito || 'N/A',
    item.Ocorrencium?.numeroProcessoPrincipal || 'Não informado',
    item.tipo,
    item.andamento,
    item.numeroProcesso || 'Não informado',
    item.senha || 'Não informado'
  ]);
  return { headers, body };
};

const exportToPDF = () => {
  if (!items.value.length) return;
  const { headers, body } = prepareExportData();
  const doc = new jsPDF();
  doc.text("Relatório de Pedidos Cautelares", 14, 15);
  autoTable(doc, { head: [headers], body, startY: 25 });
  doc.save('pedidos_cautelares.pdf');
};

const exportToXLSX = () => {
  if (!items.value.length) return;
  const { headers, body } = prepareExportData();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
  XLSX.writeFile(workbook, "pedidos_cautelares.xlsx");
};

onMounted(() => {
  Promise.all([
    fetchItems(),
    fetchOptions()
  ]);
});
</script>

<style scoped>
table {

  min-width: 1600px;
  
}


.col-inquerito {
  width: 14%; /* Faz a coluna 'Nº Inquérito' ocupar 10% do espaço da tabela */
}

.col-processo {
  width: 20%; /* Faz a coluna 'Nº Processo Principal' ocupar 15% do espaço da tabela */
}

.col-tipo {
  width: 10%; /* Faz a coluna 'Tipo de Pedido' ocupar 10% do espaço da tabela */
}

.col-andamento {
  width: 15%; /* Faz a coluna 'Andamento' ocupar 15% do espaço da tabela */
}

.col-processo-cautelar {
  width: 20%; /* Faz a coluna 'Nº Processo Cautelar' ocupar 10% do espaço da tabela */
}

.col-senha {
  width: 10%; /* Faz a coluna 'Senha' ocupar 8% do espaço da tabela */
}

.col-acoes {
  width: 11%; /* Faz a coluna 'Ações' ocupar 10% do espaço da tabela */
}




</style>