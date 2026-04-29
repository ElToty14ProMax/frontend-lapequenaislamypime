export const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  created: 'Creado',
  completed: 'Completado',
  failed: 'Fallido',
};

export function statusLabel(status?: string | null) {
  if (!status) return 'Pendiente';
  return statusLabels[status] ?? status.replace(/_/g, ' ');
}
