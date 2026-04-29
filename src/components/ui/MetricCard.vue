<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'gold' | 'ink';
}>();
</script>

<template>
  <article :class="['metric-card', tone ?? 'blue']">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <slot />
  </article>
</template>
