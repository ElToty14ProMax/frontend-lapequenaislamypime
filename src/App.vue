<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import SiteHeader from '@/components/SiteHeader.vue';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';

const auth = useAuthStore();
const catalog = useCatalogStore();

onMounted(async () => {
  await Promise.allSettled([auth.bootstrap(), catalog.loadCategories()]);
});
</script>

<template>
  <SiteHeader />
  <RouterView />
</template>
