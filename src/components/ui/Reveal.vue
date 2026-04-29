<script setup lang="ts">
import { onMounted, ref } from 'vue';

withDefaults(
  defineProps<{
    delay?: number;
    as?: string;
  }>(),
  {
    delay: 0,
    as: 'div',
  },
);

const el = ref<HTMLElement | null>(null);
const visible = ref(false);

onMounted(() => {
  if (!el.value) return;

  if (!('IntersectionObserver' in window)) {
    visible.value = true;
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.18 },
  );

  observer.observe(el.value);
});
</script>

<template>
  <component :is="as" ref="el" :class="['reveal', { 'is-visible': visible }]" :style="{ transitionDelay: `${delay}ms` }">
    <slot />
  </component>
</template>
