<template>
  <div class="centered-form-container">
    <h1>Finalizar Cadastro</h1>
    <h2>Bem-vindo(a)! Por favor, defina uma nova senha e informe seu nome.</h2>
    <form @submit.prevent="handleCompleteProfile">
      <div class="form-group">
        <label for="responsavel">Nome do Responsável:</label>
        <input type="text" id="responsavel" v-model="responsavelCadastro" required />
      </div>
      <div class="form-group">
        <label for="new-password">Nova Senha:</label>
        <input type="password" id="new-password" v-model="newPassword" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirme a Nova Senha:</label>
        <input type="password" id="confirm-password" v-model="confirmPassword" required />
      </div>
      
      <button type="submit" class="btn btn-primary">Salvar e Acessar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notificationStore';

const responsavelCadastro = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const notificationStore = useNotificationStore();

const authStore = useAuthStore();
const router = useRouter();

const handleCompleteProfile = async () => {
  if (newPassword.value !== confirmPassword.value) {
    notificationStore.showNotification({ message: 'As senhas não coincidem.' });
    return;
  }
  try {
    await authStore.completeProfile(newPassword.value, responsavelCadastro.value);
    // Após completar, redireciona para o dashboard principal
    router.push('/app/dashboard');
    notificationStore.showNotification({ message: 'Cadastro finalizado com sucesso!', type: 'success' });
  } catch (error) {
    notificationStore.showNotification({ message: error.message || 'Não foi possível salvar os dados.' });
  }
};
</script>

<style scoped>
/* Todo o CSS foi removido daqui e agora é gerenciado pelo style.css global */
</style>