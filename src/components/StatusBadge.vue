<script setup lang="ts">
defineProps<{ status: string }>();

const labels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};
</script>

<template>
  <span :class="['status-badge', status]">{{ labels[status] ?? status }}</span>
</template>
