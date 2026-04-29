import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/catalogo', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
    { path: '/productos/:slug', name: 'product', component: () => import('@/views/ProductDetailView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
    { path: '/registro', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
    { path: '/recuperar', name: 'forgot', component: () => import('@/views/ForgotPasswordView.vue'), meta: { guest: true } },
    { path: '/reset-password', name: 'reset', component: () => import('@/views/ResetPasswordView.vue'), meta: { guest: true } },
    { path: '/carrito', name: 'cart', component: () => import('@/views/CartView.vue'), meta: { auth: true } },
    { path: '/checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { auth: true } },
    { path: '/perfil', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { auth: true } },
    { path: '/pedidos', name: 'orders', component: () => import('@/views/OrdersView.vue'), meta: { auth: true } },
    { path: '/pedidos/:id', name: 'order-detail', component: () => import('@/views/OrderDetailView.vue'), meta: { auth: true } },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { auth: true, admin: true },
      children: [
        { path: '', name: 'admin', component: () => import('@/views/admin/AdminDashboardView.vue') },
        { path: 'productos', name: 'admin-products', component: () => import('@/views/admin/AdminProductsView.vue') },
        { path: 'categorias', name: 'admin-categories', component: () => import('@/views/admin/AdminCategoriesView.vue') },
        { path: 'pedidos', name: 'admin-orders', component: () => import('@/views/admin/AdminOrdersView.vue') },
        { path: 'usuarios', name: 'admin-users', component: () => import('@/views/admin/AdminUsersView.vue') },
        { path: 'descuentos', name: 'admin-discounts', component: () => import('@/views/admin/AdminDiscountsView.vue') },
        { path: 'tasas', name: 'admin-rates', component: () => import('@/views/admin/AdminRatesView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.bootstrap();

  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: auth.isAdmin ? 'admin' : 'home' };
  }

  if (to.meta.admin && !auth.isAdmin) {
    return { name: 'home' };
  }
});

export default router;
