<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <main class="admin-shell">
    <aside class="admin-nav panel">
      <RouterLink to="/admin">Resumen</RouterLink>
      <RouterLink to="/admin/productos">Productos</RouterLink>
      <RouterLink to="/admin/categorias">Categorías</RouterLink>
      <RouterLink to="/admin/pedidos">Pedidos</RouterLink>
      <RouterLink to="/admin/usuarios">Usuarios</RouterLink>
      <RouterLink to="/admin/descuentos">Descuentos</RouterLink>
      <RouterLink to="/admin/tasas">Tasas USD/CUP</RouterLink>
    </aside>
    <RouterView />
  </main>
</template>
