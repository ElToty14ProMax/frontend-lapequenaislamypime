<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import ProductCard from '@/components/ProductCard.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import Reveal from '@/components/ui/Reveal.vue';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import type { Product } from '@/types/api';

const catalog = useCatalogStore();
const auth = useAuthStore();
const cart = useCartStore();
const route = useRoute();
const router = useRouter();

const filters = reactive({
  q: String(route.query.q ?? ''),
  category_id: String(route.query.category_id ?? ''),
  min_price: '',
  max_price: '',
  sort: 'newest',
});

async function load() {
  await catalog.loadProducts({ ...filters, per_page: 15 });
}

async function add(product: Product) {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  await cart.add(product.id, 1);
}

watch(() => catalog.currency, load);
onMounted(load);
</script>

<template>
  <main class="page">
    <PageHeader
      eyebrow="Compra inteligente"
      title="Catálogo"
      text="Filtra por categoría, precio y moneda. El carrito solo está disponible después de iniciar sesión."
    />

    <section class="catalog-layout">
      <aside class="filters panel">
        <h2>Filtros</h2>
        <form @submit.prevent="load">
          <label class="field">
            <span>Búsqueda</span>
            <input v-model="filters.q" type="search" placeholder="Arroz, pollo, refresco..." />
          </label>
          <label class="field">
            <span>Categoría</span>
            <select v-model="filters.category_id">
              <option value="">Todas</option>
              <template v-for="category in catalog.categories" :key="category.id">
                <option :value="category.id">{{ category.name }}</option>
                <option v-for="child in category.children" :key="child.id" :value="child.id">
                  {{ category.name }} / {{ child.name }}
                </option>
              </template>
            </select>
          </label>
          <label class="field">
            <span>Precio mínimo</span>
            <input v-model="filters.min_price" type="number" min="0" step="0.01" />
          </label>
          <label class="field">
            <span>Precio máximo</span>
            <input v-model="filters.max_price" type="number" min="0" step="0.01" />
          </label>
          <label class="field">
            <span>Orden</span>
            <select v-model="filters.sort">
              <option value="newest">Recientes</option>
              <option value="name">Nombre</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </label>
          <button class="primary-button" type="submit">Aplicar filtros</button>
        </form>
      </aside>

      <div>
        <EmptyState v-if="!catalog.loading && catalog.products?.data.length === 0" title="No hay productos" text="Prueba con otros filtros o revisa otra moneda." />
        <section v-else class="products-grid">
          <Reveal v-for="(product, index) in catalog.products?.data" :key="product.id" :delay="index * 45">
            <ProductCard :product="product" @add="add" />
          </Reveal>
        </section>
      </div>
    </section>
  </main>
</template>
