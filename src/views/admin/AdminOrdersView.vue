<script setup lang="ts">
import { onMounted, ref } from 'vue';

import StatusBadge from '@/components/StatusBadge.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { api, firstValidationMessage, money } from '@/services/api';
import { useUiStore } from '@/stores/ui';
import type { Order, OrderStatus, Paginated } from '@/types/api';
import { statusLabel } from '@/utils/status';

const orders = ref<Paginated<Order> | null>(null);
const ui = useUiStore();
const selected = ref<Order | null>(null);
const status = ref<OrderStatus>('preparing');
const comment = ref('');
const error = ref('');

const statuses: OrderStatus[] = ['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

async function load() {
  orders.value = await api.adminOrders();
}

async function open(order: Order) {
  selected.value = await api.adminOrder(order.id);
  status.value = selected.value.status;
}

async function updateStatus() {
  if (!selected.value) return;
  error.value = '';
  ui.start('Actualizando pedido...');
  try {
    selected.value = await api.updateOrderStatus(selected.value.id, status.value, comment.value || undefined);
    comment.value = '';
    await load();
    ui.toast('Estado del pedido actualizado.', 'success');
  } catch (err) {
    error.value = firstValidationMessage(err);
    ui.toast(error.value, 'error');
  } finally {
    ui.stop();
  }
}

async function quickStatus(nextStatus: OrderStatus) {
  if (!selected.value) return;
  const accepted = await ui.confirm({
    title: 'Cambiar estado',
    message: `¿Quieres marcar el pedido ${selected.value.number} como ${statusLabel(nextStatus).toLowerCase()}?`,
    confirmText: 'Sí, actualizar',
    danger: nextStatus === 'cancelled' || nextStatus === 'refunded',
  });
  if (!accepted) return;
  status.value = nextStatus;
  await updateStatus();
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Operaciones" title="Pedidos" text="Seguimiento de estado y notificaciones por correo desde Laravel." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th>Total</th><th></th></tr></thead>
          <tbody>
            <tr v-for="order in orders?.data" :key="order.id">
              <td>{{ order.number }}</td>
              <td>{{ order.user?.name }}<br /><span class="muted">{{ order.user?.email }}</span></td>
              <td><StatusBadge :status="order.status" /></td>
              <td>{{ money(order.total_cents, order.currency) }}</td>
              <td><button class="ghost-button" @click="open(order)">Ver</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <aside class="form-panel" v-if="selected">
        <h2>{{ selected.number }}</h2>
        <p class="price">{{ money(selected.total_cents, selected.currency) }}</p>
        <p class="muted">{{ selected.address?.street }}, {{ selected.address?.municipality }}</p>
        <form class="admin-form" @submit.prevent="updateStatus">
          <select v-model="status"><option v-for="item in statuses" :key="item" :value="item">{{ statusLabel(item) }}</option></select>
          <textarea v-model="comment" placeholder="Comentario para historial"></textarea>
          <button class="primary-button" type="submit">Actualizar estado</button>
        </form>
        <div class="action-row" style="margin-top: 12px">
          <button class="secondary-button" type="button" @click="quickStatus('preparing')">Preparar</button>
          <button class="secondary-button" type="button" @click="quickStatus('out_for_delivery')">Enviar</button>
          <button class="secondary-button" type="button" @click="quickStatus('delivered')">Entregar</button>
          <button class="danger-button" type="button" @click="quickStatus('cancelled')">Cancelar</button>
        </div>
        <h3>Productos</h3>
        <p v-for="item in selected.items" :key="item.id">{{ item.quantity }} x {{ item.product_name }}</p>
      </aside>
    </div>
  </section>
</template>
