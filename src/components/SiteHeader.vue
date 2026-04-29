<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Menu, Search, ShoppingCart, UserRound, X } from 'lucide-vue-next';

import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import type { CurrencyCode } from '@/types/api';

const auth = useAuthStore();
const cart = useCartStore();
const catalog = useCatalogStore();
const router = useRouter();
const open = ref(false);
const search = ref('');

const cartCount = computed(() => cart.count);

function setCurrency(currency: CurrencyCode) {
  catalog.setCurrency(currency);
}

function submitSearch() {
  router.push({ name: 'catalog', query: { q: search.value } });
  open.value = false;
}

async function logout() {
  await auth.logout();
  await router.push({ name: 'home' });
}
</script>

<template>
  <header class="site-header">
    <RouterLink class="brand" to="/" aria-label="La Pequeña Isla">
      <span class="brand-mark">LPI</span>
      <span>
        <strong>La Pequeña Isla</strong>
        <small>Gastronomia y comercio</small>
      </span>
    </RouterLink>

    <form class="header-search" @submit.prevent="submitSearch">
      <Search :size="18" />
      <input v-model="search" type="search" placeholder="Buscar alimentos, bebidas, hogar..." />
    </form>

    <nav :class="['main-nav', { open }]">
      <RouterLink to="/catalogo" @click="open = false">Catálogo</RouterLink>
      <RouterLink v-if="auth.isAuthenticated" to="/pedidos" @click="open = false">Pedidos</RouterLink>
      <RouterLink v-if="auth.isAdmin" to="/admin" @click="open = false">Admin</RouterLink>
      <RouterLink v-if="!auth.isAuthenticated" to="/login" @click="open = false">Entrar</RouterLink>
      <button v-else class="link-button" type="button" @click="logout">Salir</button>
    </nav>

    <div class="header-actions">
      <div class="segmented" aria-label="Moneda">
        <button :class="{ active: catalog.currency === 'USD' }" type="button" @click="setCurrency('USD')">USD</button>
        <button :class="{ active: catalog.currency === 'CUP' }" type="button" @click="setCurrency('CUP')">CUP</button>
      </div>

      <RouterLink v-if="auth.isAuthenticated" class="icon-button" to="/perfil" aria-label="Perfil">
        <UserRound :size="19" />
      </RouterLink>
      <RouterLink class="icon-button cart-button" to="/carrito" aria-label="Carrito">
        <ShoppingCart :size="20" />
        <span v-if="cartCount">{{ cartCount }}</span>
      </RouterLink>
      <button class="icon-button menu-button" type="button" aria-label="Menu" @click="open = !open">
        <X v-if="open" :size="22" />
        <Menu v-else :size="22" />
      </button>
    </div>
  </header>
</template>
