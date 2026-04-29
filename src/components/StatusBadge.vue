<script setup lang="ts">
import { statusLabel } from '@/utils/status';

defineProps<{ status: string }>();
</script>

<template>
  <span :class="['status-badge', status]">{{ statusLabel(status) }}</span>
</template>
