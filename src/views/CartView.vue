<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import { firstValidationMessage, money } from '@/services/api';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

const cart = useCartStore();
const ui = useUiStore();

function imageFor(item: any) {
  return item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
}

async function updateQuantity(id: number, quantity: number) {
  ui.start('Actualizando carrito...');
  try {
    await cart.update(id, quantity);
    ui.toast('Cantidad actualizada.', 'success');
  } catch (error) {
    ui.toast(firstValidationMessage(error), 'error');
  } finally {
    ui.stop();
  }
}

async function removeItem(id: number, name?: string) {
  const accepted = await ui.confirm({
    title: 'Quitar producto',
    message: `¿Quieres quitar ${name || 'este producto'} del carrito?`,
    confirmText: 'Sí, quitar',
    danger: true,
  });

  if (!accepted) return;

  ui.start('Quitando producto...');
  try {
    await cart.remove(id);
    ui.toast('Producto eliminado del carrito.', 'success');
  } catch (error) {
    ui.toast(firstValidationMessage(error), 'error');
  } finally {
    ui.stop();
  }
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
            <label class="compact-field">
              <span>Cantidad obligatoria</span>
              <input
                :value="item.quantity"
                class="qty-input"
                type="number"
                min="1"
                required
                @change="updateQuantity(item.id, Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <button class="danger-button" type="button" @click="removeItem(item.id, item.product?.name)">Quitar</button>
          </div>
        </article>
      </div>

      <aside class="panel">
        <h2>Resumen</h2>
        <p class="muted">{{ cart.count }} productos en {{ cart.currency }}</p>
        <p class="price">{{ money(cart.totalCents, cart.currency) }}</p>
        <div class="stack">
          <RouterLink class="primary-button" to="/checkout">Continuar al checkout</RouterLink>
          <RouterLink class="ghost-button" to="/catalogo">Continuar comprando</RouterLink>
        </div>
      </aside>
    </section>
  </main>
</template>
