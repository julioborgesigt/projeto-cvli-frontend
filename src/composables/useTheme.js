// src/composables/useTheme.js
import { ref, onMounted, watch } from 'vue';

// Acessa a preferência do sistema operacional
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

export function useTheme() {
  // Tenta carregar o tema do localStorage, ou usa 'system' como padrão
  const currentTheme = ref(localStorage.getItem('theme') || 'system');

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const handleSystemThemeChange = () => {
    // Se o tema do sistema for claro, aplica o tema claro, senão, o escuro
    if (prefersLight.matches) {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }
  };

  // Observa mudanças na preferência de tema do usuário
  watch(currentTheme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
      handleSystemThemeChange();
    } else {
      applyTheme(newTheme);
    }
  });

  // Aplica o tema na inicialização
  onMounted(() => {
    if (currentTheme.value === 'system') {
      handleSystemThemeChange();
    } else {
      applyTheme(currentTheme.value);
    }
  });

  // Escuta por mudanças no tema do sistema operacional
  prefersLight.addEventListener('change', () => {
    if (currentTheme.value === 'system') {
      handleSystemThemeChange();
    }
  });

  // Função para ser chamada pelo botão de alternância
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  };

  return {
    currentTheme,
    toggleTheme,
  };
}