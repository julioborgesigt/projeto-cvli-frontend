<template>
  <div class="app-layout">
    <button class="menu-toggle" @click="toggleSidebar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <div 
      class="overlay" 
      :class="{ 'is-visible': isSidebarOpen }" 
      @click="closeSidebar"
    ></div>

    <aside class="sidebar" :class="{ 'is-open': isSidebarOpen }">
      <h2>CVLI</h2>
      <button @click="toggleTheme" class="theme-toggle-btn">
        <span v-if="currentTheme === 'light'">🌙</span>
        <span v-else>☀️</span>
        Mudar Tema
      </button>
      <nav>
        <router-link to="/app/dashboard" @click="closeSidebar">Dashboard</router-link>
        <router-link to="/app/ocorrencias/nova" @click="closeSidebar">Nova Ocorrência</router-link>
        <router-link to="/app/ocorrencias" @click="closeSidebar">Listar Ocorrências</router-link>
        <router-link to="/app/bairros" @click="closeSidebar">Gerenciar Bairros</router-link>
        <router-link to="/app/pedidos-cautelares" @click="closeSidebar">Gerenciar Pedidos</router-link>
        
        <div v-if="authStore.isAdmin" class="admin-section">
          <router-link to="/admin/dashboard" class="admin-link" @click="closeSidebar">Dashboard de Gráficos</router-link>
          <router-link to="/admin/users" class="admin-link" @click="closeSidebar">Gerenciar Usuários</router-link>
          <router-link to="/admin/faccoes" class="admin-link" @click="closeSidebar">Gerenciar Facções</router-link>
          <router-link to="/admin/cidades" class="admin-link" @click="closeSidebar">Gerenciar Cidades</router-link>
          <router-link to="/admin/tipos-prisao" class="admin-link" @click="closeSidebar">Gerenciar Tipos de Prisão</router-link>
          <router-link to="/admin/andamentos" class="admin-link" @click="closeSidebar">Gerenciar Andamentos</router-link>
          <router-link to="/admin/tipos-pedido" class="admin-link" @click="closeSidebar">Gerenciar Tipos de Pedido</router-link>
          <router-link to="/admin/status-pedido" class="admin-link" @click="closeSidebar">Gerenciar Status de Pedido</router-link>
        </div>
      </nav>
      
      <button @click="handleLogout" class="logout-button btn">Sair</button>
    </aside>
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // 1. Garanta que 'onMounted' está importado
import { useAuthStore } from '../stores/authStore';
import { useOptionsStore } from '../stores/optionsStore'; // 2. Importe a optionsStore
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';

const authStore = useAuthStore();
const optionsStore = useOptionsStore(); // 3. Crie uma instância da store
const router = useRouter();

const { currentTheme, toggleTheme } = useTheme();

// Lógica para controlar a sidebar
const isSidebarOpen = ref(false);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// 4. A LÓGICA QUE FALTAVA:
// Quando o layout principal for montado, ele chamará a ação para buscar
// todas as opções de formulário e preencher a store.
onMounted(() => {
  optionsStore.fetchOptions();
});
</script>

<style scoped>
/* O CSS daqui permanece o mesmo */
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
}
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s, border-color 0.2s;
}
.sidebar h2 {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 2.5rem;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.sidebar nav a {
  color: var(--text-color-muted);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1em;
  transition: color 0.2s, background-color 0.2s;
}
.sidebar nav a:hover {
  color: var(--text-color);
  background-color: var(--bg-color);
}
.sidebar nav a.router-link-exact-active {
  background-color: var(--color-primary);
  color: white;
}
.logout-button {
  margin-top: auto;
  background-color: var(--surface-color);
  color: var(--color-danger);
  border: 1px solid var(--border-color);
}
.logout-button:hover {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}
.main-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative; /* Necessário para o z-index da sidebar funcionar bem */
}
.admin-section {
  margin-top: 2rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.admin-section .admin-link {
  font-size: 1em;
}

.theme-toggle-btn {
   /* Empurra para o fundo, antes do botão de sair */
  margin-bottom: 1rem;
  background-color: var(--surface-color);
  color: var(--text-color-muted);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  cursor: pointer;
  padding: 0.6em 1.2em;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
}
.theme-toggle-btn:hover {
  background-color: var(--bg-color);
  color: var(--text-color);
}
.theme-toggle-btn span {
  font-size: 1.2rem;
}
/* Adicione ao final do seu style.css */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>