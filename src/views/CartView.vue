<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { money } from '@/services/api';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();

function imageFor(item: any) {
  return item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
}

onMounted(cart.load);
</script>

<template>
  <main class="page">
    <header class="section-heading elevated-title">
      <div>
        <p class="eyebrow">Compra protegida</p>
        <h1>Carrito</h1>
        <p class="muted">Revisa cantidades antes de confirmar tu pedido.</p>
      </div>
      <RouterLink class="ghost-button" to="/catalogo">Seguir comprando</RouterLink>
    </header>

    <EmptyState v-if="cart.items.length === 0 && !cart.loading" title="Tu carrito está vacío">
      <RouterLink class="primary-button" to="/catalogo">Ver catálogo</RouterLink>
    </EmptyState>

    <section v-else class="checkout-layout">
      <div class="cart-list">
        <article v-for="item in cart.items" :key="item.id" class="cart-item">
          <img :src="imageFor(item)" :alt="item.product?.name" />
          <div>
            <strong>{{ item.product?.name }}</strong>
            <p class="muted">{{ money(item.unit_price_cents, item.currency) }} por unidad</p>
          </div>
          <div class="action-row">
            <input
              :value="item.quantity"
              class="qty-input"
              type="number"
              min="1"
              @change="cart.update(item.id, Number(($event.target as HTMLInputElement).value))"
            />
            <button class="danger-button" type="button" @click="cart.remove(item.id)">Quitar</button>
          </div>
        </article>
      </div>

      <aside class="panel">
        <h2>Resumen</h2>
        <p class="muted">{{ cart.count }} productos en {{ cart.currency }}</p>
        <p class="price">{{ money(cart.totalCents, cart.currency) }}</p>
        <RouterLink class="primary-button" to="/checkout">Continuar al checkout</RouterLink>
      </aside>
    </section>
  </main>
</template>
