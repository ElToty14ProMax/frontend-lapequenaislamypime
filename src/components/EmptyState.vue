<script setup lang="ts">
defineProps<{
  title: string;
  text?: string;
}>();
</script>

<template>
  <section class="empty-state">
    <h2>{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <slot />
  </section>
</template>
