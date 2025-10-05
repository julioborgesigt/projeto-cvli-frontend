<template>
  <div class="centered-form-container">
    <h1>Projeto CVLI</h1>
    <h2>Acesso ao Sistema</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">E-mail:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="btn btn-primary">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notificationStore';

// Variáveis reativas para os campos do formulário
const email = ref('');
const password = ref('');
const notificationStore = useNotificationStore();

// Instancia nossa store e o router
const authStore = useAuthStore();
const router = useRouter();

// Função que será chamada ao clicar em "Entrar"
const handleLogin = async () => {
  try {
    const loggedIn = await authStore.login(email.value, password.value);
    
    if (loggedIn) {
      if (authStore.isFirstLogin) {
        router.push('/complete-profile');
      } else {
        router.push('/app/dashboard');
      }
    }
  } catch (error) {
    notificationStore.showNotification({ message: error.message || 'E-mail ou senha inválidos. Tente novamente.' });
  }
};
</script>

<style scoped>
/* Todo o CSS foi removido daqui e agora é gerenciado pelo style.css global */
</style>