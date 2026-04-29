<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import SiteHeader from '@/components/SiteHeader.vue';
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';
import { useUiStore } from '@/stores/ui';

const auth = useAuthStore();
const catalog = useCatalogStore();
const ui = useUiStore();

onMounted(async () => {
  await Promise.allSettled([auth.bootstrap(), catalog.loadCategories()]);
});
</script>

<template>
  <SiteHeader />
  <RouterView v-slot="{ Component, route }">
    <Transition name="route-fade" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
  <LoadingOverlay :active="ui.blocking" :message="ui.message" />
</template>
