<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next';

import { money } from '@/services/api';
import type { Product } from '@/types/api';

defineProps<{
  product: Product;
  adding?: boolean;
}>();

defineEmits<{
  add: [product: Product];
}>();

function imageFor(product: Product) {
  return product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
}
</script>

<template>
  <article class="product-card">
    <RouterLink class="product-image" :to="{ name: 'product', params: { slug: product.slug } }">
      <img :src="imageFor(product)" :alt="product.images?.[0]?.alt || product.name" loading="lazy" />
      <span v-if="product.track_inventory && product.stock <= product.low_stock_threshold" class="stock-chip low">
        Poco stock
      </span>
      <span v-else-if="product.stock > 0" class="stock-chip">Disponible</span>
    </RouterLink>
    <div class="product-card-body">
      <p class="eyebrow">{{ product.category?.name || product.brand || product.unit }}</p>
      <RouterLink class="product-title" :to="{ name: 'product', params: { slug: product.slug } }">
        {{ product.name }}
      </RouterLink>
      <p class="muted">{{ product.unit }} · Stock {{ product.track_inventory ? product.stock : 'abierto' }}</p>
      <div class="product-bottom">
        <strong>{{ money(product.display_price_cents ?? product.price_usd_cents ?? 0, product.display_currency ?? 'USD') }}</strong>
        <button class="icon-button primary" type="button" :disabled="adding || product.stock <= 0" @click="$emit('add', product)">
          <ShoppingCart :size="18" />
        </button>
      </div>
    </div>
  </article>
</template>
