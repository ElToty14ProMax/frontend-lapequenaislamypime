<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { api, money } from '@/services/api';
import type { Order, Paginated } from '@/types/api';

const orders = ref<Paginated<Order> | null>(null);

onMounted(async () => {
  orders.value = await api.orders();
});
</script>

<template>
  <main class="page">
    <PageHeader
      eyebrow="Seguimiento"
      title="Mis pedidos"
      text="Consulta el historial, estado de entrega y facturas generadas."
    />

    <EmptyState v-if="orders?.data.length === 0" title="Aún no tienes pedidos" />
    <section v-else class="stack">
      <RouterLink v-for="order in orders?.data" :key="order.id" class="order-card" :to="{ name: 'order-detail', params: { id: order.id } }">
        <strong>{{ order.number }}</strong>
        <StatusBadge :status="order.status" />
        <p class="muted">{{ new Date(order.created_at).toLocaleString('es-CU') }} · {{ money(order.total_cents, order.currency) }}</p>
      </RouterLink>
    </section>
  </main>
</template>
