<template>
  <router-view />
  <NotificationPopup /> </template>

<script setup>

// Importe o componente que acabamos de criar
import NotificationPopup from './components/NotificationPopup.vue';
import { useTheme } from './composables/useTheme';

// Inicializa a lógica do tema para toda a aplicação
useTheme();

</script>