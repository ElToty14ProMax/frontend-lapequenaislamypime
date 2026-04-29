<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import StatusBadge from '@/components/StatusBadge.vue';
import { api, money } from '@/services/api';
import { statusLabel } from '@/utils/status';
import type { Order } from '@/types/api';

const route = useRoute();
const order = ref<Order | null>(null);
const cancellationLink = computed(() => {
  if (!order.value) return '#';
  return `https://wa.me/?text=${encodeURIComponent(`Hola, quiero solicitar la cancelación o modificación del pedido ${order.value.number}.`)}`;
});

onMounted(async () => {
  order.value = await api.order(Number(route.params.id));
});
</script>

<template>
  <main v-if="order" class="page">
    <header class="section-heading">
      <div>
        <h1>Pedido {{ order.number }}</h1>
        <p class="muted">{{ new Date(order.created_at).toLocaleString('es-CU') }}</p>
      </div>
      <StatusBadge :status="order.status" />
    </header>

    <section class="checkout-layout">
      <div class="stack">
        <section class="panel">
          <h2>Productos</h2>
          <table>
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ money(item.total_cents, item.currency) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section class="panel">
          <h2>Seguimiento</h2>
          <article v-for="history in order.histories" :key="history.id" class="address-card">
            <StatusBadge :status="history.to_status" />
            <p class="muted">{{ new Date(history.created_at).toLocaleString('es-CU') }}</p>
            <p v-if="history.comment">{{ history.comment }}</p>
          </article>
        </section>
      </div>

      <aside class="panel">
        <h2>Resumen</h2>
        <p>Pago: <strong>{{ statusLabel(order.payment_status) }}</strong></p>
        <p>Factura: <strong>{{ order.invoice?.number || 'Pendiente' }}</strong></p>
        <p class="price">{{ money(order.total_cents, order.currency) }}</p>
        <div class="action-row">
          <RouterLink class="secondary-button" to="/catalogo">Continuar comprando</RouterLink>
          <RouterLink class="ghost-button" to="/pedidos">Volver a pedidos</RouterLink>
          <a
            v-if="order.status === 'pending'"
            class="danger-button"
            :href="cancellationLink"
            target="_blank"
            rel="noreferrer"
          >
            Solicitar cancelación
          </a>
        </div>
        <h3>Domicilio</h3>
        <p class="muted">{{ order.address?.street }}, {{ order.address?.municipality }}, {{ order.address?.province }}</p>
      </aside>
    </section>
  </main>
</template>
