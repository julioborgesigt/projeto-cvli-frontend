<template>
  <Transition name="fade">
    <div v-if="visible" :class="['notification-popup', type]">
      <div class="notification-content">
        <span class="icon">{{ iconSymbol }}</span>
        <p>{{ message }}</p>
      </div>
      <button @click="notificationStore.hideNotification()" class="close-btn">&times;</button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'; // Importa 'computed'
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();
// Pega as propriedades da store como refs reativas
const { message, type, visible } = storeToRefs(notificationStore);

// Cria a computed property para o ícone
const iconSymbol = computed(() => {
  switch (type.value) {
    case 'success':
      return '✓';
    case 'info':
      return 'ℹ'; // Ícone para informação
    case 'error':
    default:
      return '✗';
  }
});
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 400px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
}

.notification-popup.success {
  background-color: var(--color-success);
}

.notification-popup.error {
  background-color: var(--color-danger);
}

.notification-popup.info {
  background-color: var(--color-primary); /* NOVO ESTILO ADICIONADO */
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.notification-content p {
  margin: 0;
  color: white; /* Garante que o texto do parágrafo seja branco */
}

.icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 0 0 0 15px;
}
.close-btn:hover {
  opacity: 1;
}

/* Animação de Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>