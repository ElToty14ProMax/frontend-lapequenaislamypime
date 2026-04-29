<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  text?: string;
}>();
</script>

<template>
  <header class="page-title elevated-title">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p v-if="text">{{ text }}</p>
    <slot />
  </header>
</template>
