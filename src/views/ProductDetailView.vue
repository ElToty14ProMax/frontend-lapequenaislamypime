<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { useSeo } from '@/composables/useSeo';
import { firstValidationMessage, money, api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import type { Product } from '@/types/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const catalog = useCatalogStore();
const product = ref<Product | null>(null);
const quantity = ref(1);
const loading = ref(false);
const error = ref('');

const image = computed(
  () => product.value?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    product.value = await api.product(String(route.params.slug), catalog.currency);
    useSeo({
      title: product.value.name,
      description: product.value.description || `Compra ${product.value.name} en La Pequeña Isla con precios en USD y CUP.`,
      image: product.value.images?.[0]?.url,
      type: 'product',
    });
  } catch (err) {
    error.value = firstValidationMessage(err);
  } finally {
    loading.value = false;
  }
}

async function addToCart() {
  if (!product.value) return;
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  await cart.add(product.value.id, quantity.value);
  await router.push({ name: 'cart' });
}

watch(() => catalog.currency, load);
onMounted(load);
</script>

<template>
  <main class="page">
    <EmptyState v-if="error" title="Producto no disponible" :text="error" />
    <section v-else-if="product" class="product-detail">
      <div class="detail-image">
        <img :src="image" :alt="product.name" />
      </div>
      <aside class="panel">
        <p class="eyebrow">{{ product.category?.name || 'Producto' }}</p>
        <h1>{{ product.name }}</h1>
        <p class="muted">{{ product.description || 'Producto disponible en La Pequeña Isla.' }}</p>
        <p class="price">{{ money(product.display_price_cents ?? 0, catalog.currency) }}</p>
        <p><strong>Stock:</strong> {{ product.track_inventory ? product.stock : 'Disponible por pedido' }}</p>
        <p><strong>Unidad:</strong> {{ product.unit }}</p>
        <div class="qty-row">
          <label class="field">
            <span>Cantidad</span>
            <input v-model.number="quantity" type="number" min="1" :max="product.stock || undefined" />
          </label>
          <button class="primary-button" type="button" :disabled="product.stock <= 0" @click="addToCart">
            Agregar al carrito
          </button>
        </div>
        <p v-if="cart.error" class="error">{{ cart.error }}</p>
      </aside>
    </section>
  </main>
</template>
