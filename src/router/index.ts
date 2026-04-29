import { createRouter, createWebHistory } from 'vue-router';

import { useSeo } from '@/composables/useSeo';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: 'Compra online', description: 'Alimentos, bebidas y productos para el hogar con domicilio desde Santa Clara.' } },
    { path: '/catalogo', name: 'catalog', component: () => import('@/views/CatalogView.vue'), meta: { title: 'Catálogo', description: 'Explora productos, categorías, precios en USD/CUP y disponibilidad de La Pequeña Isla.' } },
    { path: '/productos/:slug', name: 'product', component: () => import('@/views/ProductDetailView.vue'), meta: { title: 'Producto', description: 'Detalle de producto, precio, stock y disponibilidad.' } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true, title: 'Iniciar sesión', description: 'Accede a tu cuenta para comprar y seguir tus pedidos.' } },
    { path: '/registro', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true, title: 'Crear cuenta', description: 'Crea tu cuenta para comprar en La Pequeña Isla.' } },
    { path: '/recuperar', name: 'forgot', component: () => import('@/views/ForgotPasswordView.vue'), meta: { guest: true, title: 'Recuperar contraseña', description: 'Recupera el acceso a tu cuenta.' } },
    { path: '/reset-password', name: 'reset', component: () => import('@/views/ResetPasswordView.vue'), meta: { guest: true } },
    { path: '/carrito', name: 'cart', component: () => import('@/views/CartView.vue'), meta: { auth: true, title: 'Carrito', description: 'Revisa productos, cantidades y total de compra.' } },
    { path: '/checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { auth: true, title: 'Checkout', description: 'Confirma dirección y pago seguro con PayPal.' } },
    { path: '/perfil', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { auth: true, title: 'Perfil', description: 'Gestiona tu cuenta, direcciones y contraseña.' } },
    { path: '/pedidos', name: 'orders', component: () => import('@/views/OrdersView.vue'), meta: { auth: true, title: 'Mis pedidos', description: 'Historial y seguimiento de pedidos.' } },
    { path: '/pedidos/:id', name: 'order-detail', component: () => import('@/views/OrderDetailView.vue'), meta: { auth: true, title: 'Detalle de pedido', description: 'Estado, factura, domicilio y seguimiento del pedido.' } },
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

router.afterEach((to) => {
  useSeo({
    title: String(to.meta.title ?? 'La Pequeña Isla'),
    description: String(to.meta.description ?? 'Ecommerce de alimentos, bebidas y productos para el hogar en Santa Clara, Cuba.'),
  });
});

export default router;
