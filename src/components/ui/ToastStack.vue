<script setup lang="ts">
import { CheckCircle2, Info, XCircle } from 'lucide-vue-next';

import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast">
      <article v-for="toast in ui.toasts" :key="toast.id" :class="['toast-item', toast.type]">
        <CheckCircle2 v-if="toast.type === 'success'" :size="19" />
        <XCircle v-else-if="toast.type === 'error'" :size="19" />
        <Info v-else :size="19" />
        <span>{{ toast.message }}</span>
      </article>
    </TransitionGroup>
  </div>
</template>
