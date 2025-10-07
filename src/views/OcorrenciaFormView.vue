<template>
  <div class="form-container-main">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Editar Ocorrência' : 'Cadastro de Ocorrência' }}</h1>
    </div>
    
    <form @submit.prevent="submitForm">
      
      <fieldset v-if="authStore.isAdmin">
        <legend>Localidade da Ocorrência</legend>
        <div class="form-row">
          <div class="form-group">
            <label>Seccional</label>
            <select v-model="adminSelectedSeccionalId">
              <option :value="null" disabled>Selecione uma seccional...</option>
              <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cidade</label>
            <select v-model="ocorrencia.cidadeId" required :disabled="!adminSelectedSeccionalId">
              <option :value="null" disabled>Selecione uma cidade...</option>
              <option v-for="c in filteredCitiesForAdmin" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset v-if="!authStore.isAdmin && !isEditMode">
        <legend>Localidade da Ocorrência</legend>
        <div class="form-row">
            <div class="form-group">
                <label>Sua Seccional</label>
                <input type="text" :value="userSeccionalName" disabled />
            </div>
            <div class="form-group">
                <label>Sua Cidade</label>
                <input type="text" :value="userCidadeName" disabled />
            </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Dados Gerais</legend>
        <div class="form-row">
          <div class="form-group">
            <label>Nº IP (xxx-xxxxx/xxxx)</label>
            <input 
              type="text" 
              v-model="ocorrencia.numeroInquerito" 
              @input="applyInqueritoMask"
              @blur="checkInqueritoUniqueness" 
              :class="{ 'is-valid': inqueritoStatus === 'valid', 'is-invalid': inqueritoStatus === 'invalid' }"
              placeholder="000-00000/0000"
              required 
            />
            <small v-if="inqueritoMessage" :class="`feedback-message-${inqueritoStatus}`">{{ inqueritoMessage }}</small>
          </div>
          <div class="form-group">
            <label>Facção da Área</label>
            <select v-model="ocorrencia.faccaoArea" :disabled="formDisabled">
              <option disabled value="">Selecione...</option>
              <option v-for="faccao in faccoes" :key="faccao.id" :value="faccao.nome">{{ faccao.nome }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data do Crime</label>
            <input type="date" v-model="ocorrencia.dataCrime" required :disabled="formDisabled" />
          </div>
          <div class="form-group">
            <label>Bairro do Crime</label>
            <select v-model="ocorrencia.bairro" required :disabled="formDisabled || (authStore.isAdmin && !ocorrencia.cidadeId)">
                <option disabled value="">Selecione...</option>
                <option v-for="bairro in filteredBairros" :key="bairro.id" :value="bairro.nome">{{ bairro.nome }}</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset :disabled="formDisabled">
        <legend>Vítimas</legend>
        <div v-for="(vitima, index) in ocorrencia.vitimas" :key="index" class="dynamic-section">
          <div class="dynamic-section-header">
            <h4>Vítima {{ index + 1 }}</h4>
            <button type="button" @click="removeVitima(index)" v-if="ocorrencia.vitimas.length > 1" class="btn-remove">-</button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nome da Vítima</label>
              <input type="text" v-model="vitima.nome" required />
            </div>
            <div class="form-group">
              <label>Facção da Vítima</label>
              <select v-model="vitima.faccao">
                <option disabled value="">Selecione...</option>
                 <option v-for="faccao in faccoes" :key="faccao.id" :value="faccao.nome">{{ faccao.nome }}</option>
              </select>
            </div>
          </div>
        </div>
        <button type="button" @click="addVitima" class="btn-add">+ Adicionar Vítima</button>
      </fieldset>

      <fieldset :disabled="formDisabled">
        <legend>Elucidação do Crime</legend>
        <div class="form-group" style="max-width: 250px;">
          <label>Crime Elucidado?</label>
          <select v-model="ocorrencia.crimeElucidado" required>
            <option :value="true">Sim</option>
            <option :value="false">Não</option>
          </select>
        </div>
        <div v-if="ocorrencia.crimeElucidado">
          <hr>
          <h3>Infratores</h3>
          <div v-for="(infrator, index) in ocorrencia.infratores" :key="index" class="dynamic-section">
            <div class="dynamic-section-header">
              <h4>Infrator {{ index + 1 }}</h4>
              <button type="button" @click="removeInfrator(index)" v-if="ocorrencia.infratores.length > 0" class="btn-remove">-</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Nome do Infrator</label>
                <input type="text" v-model="infrator.nome" required />
              </div>
              <div class="form-group">
                <label>Facção do Infrator</label>
                <select v-model="infrator.faccao">
                   <option disabled value="">Selecione...</option>
                   <option v-for="faccao in faccoes" :key="faccao.id" :value="faccao.nome">{{ faccao.nome }}</option>
                </select>
              </div>
            </div>
            <div class="form-row checkbox-group">
              <label><input type="checkbox" v-model="infrator.indiciado" /> Indiciado</label>
              <label><input type="checkbox" v-model="infrator.preso" /> Preso</label>
            </div>
            <div v-if="infrator.preso" class="form-row">
              <div class="form-group">
                <label>Tipo de Prisão</label>
                <select v-model="infrator.tipoPrisao" required>
                  <option disabled value="">Selecione...</option>
                  <option v-for="tipo in tiposPrisao" :key="tipo.id" :value="tipo.nome">{{ tipo.nome }}</option>
                </select>
              </div>
            </div>
          </div>
          <button type="button" @click="addInfrator" class="btn-add">+ Adicionar Infrator</button>
        </div>
      </fieldset>

      <fieldset :disabled="formDisabled">
        <legend>Pedidos Cautelares</legend>
        <div v-for="(pedido, index) in ocorrencia.pedidosCautelares" :key="index" class="dynamic-section" >
          <div class="dynamic-section-header">
            <h4>Pedido Cautelar {{ index + 1 }}</h4>
            <button type="button" @click="removePedidoCautelar(index)" class="btn-remove">-</button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Pedido</label>
              <select v-model="pedido.tipo" required>
                <option disabled value="">Selecione...</option>
                <option v-for="tipo in tiposPedido" :key="tipo.id" :value="tipo.nome">{{ tipo.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Andamento do Pedido</label>
              <select v-model="pedido.andamento" required>
                <option disabled value="">Selecione...</option>
                <option v-for="status in statusPedido" :key="status.id" :value="status.nome">{{ status.nome }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Número do Processo Cautelar</label>
              <input type="text" v-model="pedido.numeroProcesso" @input="applyProcessoMask($event, pedido, 'numeroProcesso')" placeholder="0000000-00.0000.0.00.0000" />
            </div>
            <div class="form-group">
              <label>Senha do Processo</label>
              <input type="text" v-model="pedido.senha" />
            </div>
          </div>
        </div>
        <button type="button" @click="addPedidoCautelar" class="btn-add">+ Adicionar Pedido Cautelar</button>
      </fieldset>
      
     <fieldset :disabled="formDisabled">
        <legend>Andamento</legend>
        <div class="form-row">
          <div class="form-group">
            <label>Andamento do Procedimento</label>
            <select v-model="ocorrencia.andamentoProcedimento" required>
              <option disabled value="">Selecione...</option>
              <option v-for="andamento in andamentos" :key="andamento.id" :value="andamento.nome">{{ andamento.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Número do Processo Principal</label>
            <input type="text" v-model="ocorrencia.numeroProcessoPrincipal" @input="applyProcessoMask($event, ocorrencia, 'numeroProcessoPrincipal')" placeholder="0000000-00.0000.0.00.0000" />
          </div>
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-success">{{ isEditMode ? 'Atualizar Ocorrência' : 'Salvar Ocorrência' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useOptionsStore } from '../stores/optionsStore';
import { storeToRefs } from 'pinia';

const props = defineProps({ id: String });
const router = useRouter();
const authStore = useAuthStore();
const optionsStore = useOptionsStore();
const notificationStore = useNotificationStore();

const { faccoes, bairros, seccionais, cidades, andamentos, tiposPedido, statusPedido, tiposPrisao } = storeToRefs(optionsStore);

const isEditMode = ref(false);
const inqueritoStatus = ref(null);
const inqueritoMessage = ref('');
const isInitializing = ref(true);
const adminSelectedSeccionalId = ref(null);

const ocorrencia = reactive({
  dataCrime: '', numeroInquerito: '', faccaoArea: '', vitimas: [], crimeElucidado: false,
  infratores: [], pedidosCautelares: [], andamentoProcedimento: '', numeroProcessoPrincipal: '',
  cidadeId: null, bairro: '',
});

const formDisabled = computed(() => !isEditMode.value && inqueritoStatus.value !== 'valid');

const checkInqueritoUniqueness = async () => {
  const formatRegex = /^\d{3}-\d{5}\/\d{4}$/;
  if (!formatRegex.test(ocorrencia.numeroInquerito)) {
    inqueritoStatus.value = null;
    inqueritoMessage.value = '';
    return;
  }
  inqueritoStatus.value = 'validating';
  inqueritoMessage.value = 'Verificando...';
  try {
    const payload = { numeroInquerito: ocorrencia.numeroInquerito, ocorrenciaId: isEditMode.value ? props.id : null };
    const response = await apiClient.post('/ocorrencias/check-uniqueness', payload);
    inqueritoStatus.value = response.data.isUnique ? 'valid' : 'invalid';
    inqueritoMessage.value = response.data.message;
  } catch (error) {
    inqueritoStatus.value = 'invalid';
    inqueritoMessage.value = 'Erro ao verificar. Tente novamente.';
    notificationStore.showNotification({ message: inqueritoMessage.value });
  }
};

const userCidadeName = computed(() => authStore.user?.Cidade?.nome || 'Não definida');
const userSeccionalName = computed(() => authStore.user?.Seccional?.nome || 'Não definida');
const filteredCitiesForAdmin = computed(() => !adminSelectedSeccionalId.value ? [] : cidades.value.filter(c => c.seccionalId === adminSelectedSeccionalId.value));
const filteredBairros = computed(() => {
  const cityId = authStore.isAdmin ? ocorrencia.cidadeId : authStore.user.cidadeId;
  if (!cityId) return [];
  return bairros.value.filter(b => b.cidadeId === cityId);
});

watch(adminSelectedSeccionalId, () => { if (!isInitializing.value) ocorrencia.cidadeId = null; });
watch(() => ocorrencia.cidadeId, () => { if (!isInitializing.value) ocorrencia.bairro = ''; });

const addVitima = () => ocorrencia.vitimas.push({ nome: '', faccao: '' });
const removeVitima = (index) => ocorrencia.vitimas.splice(index, 1);
const addInfrator = () => ocorrencia.infratores.push({ nome: '', faccao: '', indiciado: false, preso: false, tipoPrisao: null });
const removeInfrator = (index) => ocorrencia.infratores.splice(index, 1);
const addPedidoCautelar = () => ocorrencia.pedidosCautelares.push({ tipo: '', andamento: '', numeroProcesso: '', senha: '' });
const removePedidoCautelar = (index) => ocorrencia.pedidosCautelares.splice(index, 1);

const applyProcessoMask = (event, object, field) => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 20);
  let maskedValue = value.substring(0, 7);
  if (value.length > 7) maskedValue += '-' + value.substring(7, 9);
  if (value.length > 9) maskedValue += '.' + value.substring(9, 13);
  if (value.length > 13) maskedValue += '.' + value.substring(13, 14);
  if (value.length > 14) maskedValue += '.' + value.substring(14, 16);
  if (value.length > 16) maskedValue += '.' + value.substring(16, 20);
  object[field] = maskedValue;
};

const fetchOcorrenciaById = async (id) => {
  try {
    const response = await apiClient.get(`/ocorrencias/${id}`);
    const data = response.data;
    Object.assign(ocorrencia, data);
    if (ocorrencia.dataCrime) ocorrencia.dataCrime = new Date(ocorrencia.dataCrime).toISOString().split('T')[0];
    ocorrencia.vitimas = data.Vitimas || [];
    ocorrencia.infratores = data.Infrators || [];
    ocorrencia.pedidosCautelares = data.PedidoCautelars || [];
    if (authStore.isAdmin) {
      const cidadeDaOcorrencia = cidades.value.find(c => c.id === ocorrencia.cidadeId);
      if (cidadeDaOcorrencia) adminSelectedSeccionalId.value = cidadeDaOcorrencia.seccionalId;
    }
    if (ocorrencia.vitimas.length === 0) addVitima();
  } catch (error) {
    notificationStore.showNotification({ message: error.message || 'Falha ao carregar dados da ocorrência.' });
  }
};

onMounted(async () => {
  isInitializing.value = true;
  if (props.id) {
    isEditMode.value = true;
    await fetchOcorrenciaById(props.id);
  } else {
    isEditMode.value = false;
    addVitima();
  }
  isInitializing.value = false;
});

const submitForm = async () => {
  try {
    if (isEditMode.value) {
      await apiClient.put(`/ocorrencias/${props.id}`, ocorrencia);
      notificationStore.showNotification({ message: 'Ocorrência atualizada com sucesso!', type: 'success' }); 
    } else {
      await apiClient.post('/ocorrencias', ocorrencia);
      notificationStore.showNotification({ message: 'Ocorrência criada com sucesso!', type: 'success' }); 
    }
    setTimeout(() => router.push('/app/ocorrencias'), 1500);
  } catch (error) {
    notificationStore.showNotification({ message: error.message || "Falha ao salvar ocorrência." });
  }
};

const applyInqueritoMask = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1-$2');
  if (value.length > 9) value = value.replace(/^(\d{3}-\d{5})(\d)/, '$1/$2');
  ocorrencia.numeroInquerito = value.slice(0, 14);
};
</script>

<style scoped>
/* Estilos específicos para este formulário complexo */
.form-container-main { max-width: 900px; margin: auto; }
fieldset { border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1.5rem; padding: 1.5rem; background-color: var(--surface-color); }
legend { font-weight: bold; padding: 0 0.5rem; }
.form-row { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem; }
.form-row > .form-group { flex: 1; min-width: 250px; }
.dynamic-section { border-left: 3px solid var(--color-primary); padding-left: 1.0rem; margin-top: 1.5rem; margin-bottom: 1.5rem; margin-left: -1.0rem;}
.checkbox-group { align-items: center; gap: 1.5rem; padding-top: 1rem; }
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; }
.dynamic-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-add, .btn-remove { padding: 0.2rem 0.6rem; font-size: 1rem; cursor: pointer; border: 1px solid var(--border-color); background-color: var(--surface-color); border-radius: 4px; line-height: 1.5; }
.btn-add { color: var(--color-success); border-color: var(--color-success); margin-top: 0.5rem; }
.btn-remove { color: var(--color-danger); border-color: var(--color-danger); }
input.is-valid { border-color: var(--color-success); box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.4); }
input.is-invalid { border-color: var(--color-danger); box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.4); }
small[class^="feedback-message-"] { margin-top: 0.25rem; font-size: 0.8rem; }
.feedback-message-validating { color: var(--text-color-muted); }
.feedback-message-valid { color: var(--color-success); }
.feedback-message-invalid { color: var(--color-danger); }
.form-actions {
  display: flex;
  justify-content: flex-end; /* Alinha o botão (ou botões) à direita */
  margin-top: 0.5rem;          /* Espaço controlado acima do botão */
  margin-bottom: 0.5rem;       /* ESPAÇO ABAIXO do botão, como solicitado */
}
</style>