// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

import DefaultLayout from '../layouts/DefaultLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import OcorrenciaFormView from '../views/OcorrenciaFormView.vue';
import OcorrenciaListView from '../views/OcorrenciaListView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import AdminFaccoesView from '../views/admin/AdminFaccoesView.vue'; // <-- Importe a nova view
import AdminCidadesView from '../views/admin/AdminCidadesView.vue';
import BairrosView from '../views/BairrosView.vue';
import AdminTiposPrisaoView from '../views/admin/AdminTiposPrisaoView.vue';
import AdminAndamentosView from '../views/admin/AdminAndamentosView.vue';
import AdminTiposPedidoView from '../views/admin/AdminTiposPedidoView.vue';
import AdminStatusPedidoView from '../views/admin/AdminStatusPedidoView.vue';
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import CompleteProfileView from '../views/CompleteProfileView.vue';
import PedidosCautelaresView from '../views/PedidosCautelaresView.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  
  // Rotas do Usuário Comum
  {
    path: '/app',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: DashboardView },
      { path: 'ocorrencias/nova', name: 'NovaOcorrencia', component: OcorrenciaFormView },
      { path: 'ocorrencias', name: 'ListarOcorrencias', component: OcorrenciaListView },
      { path: 'ocorrencias/editar/:id', name: 'EditarOcorrencia', component: OcorrenciaFormView, props: true },
      { path: 'bairros', name: 'GerenciarBairros', component: BairrosView },
      { path: 'pedidos-cautelares', name: 'GerenciarPedidos', component: PedidosCautelaresView },
    
    ]
  },

  { 
    path: '/complete-profile', 
    name: 'CompleteProfile', 
    component: CompleteProfileView, 
    meta: { requiresAuth: true }
  },

  // Rota separada para o Admin
  {
    path: '/admin',
    component: DefaultLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboardView },
      // Por enquanto, o link do menu leva direto para /admin/emails
      { path: 'users', name: 'AdminUsers', component: AdminUsersView },
      { path: 'faccoes', name: 'AdminFaccoes', component: AdminFaccoesView },
      { path: 'cidades', name: 'AdminCidades', component: AdminCidadesView },
      { path: 'tipos-prisao', name: 'AdminTiposPrisao', component: AdminTiposPrisaoView },
      { path: 'andamentos', name: 'AdminAndamentos', component: AdminAndamentosView },
      { path: 'tipos-pedido', name: 'AdminTiposPedido', component: AdminTiposPedidoView },
      { path: 'status-pedido', name: 'AdminStatusPedido', component: AdminStatusPedidoView },
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Guarda de navegação
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Se o token existe mas os dados do usuário não foram carregados, busca agora
  // Garante que os dados do usuário sejam carregados se houver token
  if (authStore.token && !authStore.user && !authStore.isFirstLogin) {
    await authStore.fetchUser();
  }
  
  // Se for o primeiro login, força o usuário a ir para a tela de finalização
  if (authStore.isFirstLogin && to.name !== 'CompleteProfile') {
    return next({ name: 'CompleteProfile' });
  }

  // Se a rota exige admin e o usuário logado não é admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard' }); // Redireciona para o dashboard comum
  }
  
  // Se a rota exige login e o usuário não tem token
  if (to.meta.requiresAuth && !authStore.token) {
    return next({ name: 'Login' });
  }

  // Se o usuário está logado e tenta acessar a página de login
  if (authStore.token && to.name === 'Login') {
    return next({ name: 'Dashboard' });
  }

  next(); // Permite a navegação
});

export default router;