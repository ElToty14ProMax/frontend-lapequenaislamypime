<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import MetricCard from '@/components/ui/MetricCard.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { api, money } from '@/services/api';

const stats = reactive({ products: 0, categories: 0, orders: 0, users: 0, revenue: 0 });

onMounted(async () => {
  const [products, categories, orders, users] = await Promise.all([
    api.adminProducts({ per_page: 1 }),
    api.adminCategories(),
    api.adminOrders({ per_page: 10 }),
    api.adminUsers({ per_page: 1 }),
  ]);
  stats.products = products.total;
  stats.categories = categories.total;
  stats.orders = orders.total;
  stats.users = users.total;
  stats.revenue = orders.data.reduce((total, order) => total + order.total_cents, 0);
});
</script>

<template>
  <section class="admin-page">
    <PageHeader
      eyebrow="Centro operativo"
      title="Administración"
      text="Gestión operativa de productos, categorías, clientes, pedidos, descuentos y conversión USD/CUP."
    />
    <div class="stats-grid">
      <MetricCard label="Productos" :value="stats.products" />
      <MetricCard label="Categorías" :value="stats.categories" tone="green" />
      <MetricCard label="Pedidos" :value="stats.orders" tone="gold" />
      <MetricCard label="Usuarios" :value="stats.users" />
    </div>
    <section class="panel" style="margin-top: 18px">
      <h2>Ventas recientes</h2>
      <p class="price">{{ money(stats.revenue, 'USD') }}</p>
      <p class="muted">Suma de los ultimos pedidos cargados desde la API.</p>
    </section>
  </section>
</template>
