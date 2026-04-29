<script setup lang="ts">
import { LoaderCircle, ShieldCheck } from 'lucide-vue-next';

defineProps<{
  active: boolean;
  message?: string;
}>();
</script>

<template>
  <Transition name="overlay-fade">
    <div v-if="active" class="loading-overlay" role="status" aria-live="assertive" aria-busy="true">
      <div class="loading-panel">
        <div class="loading-orbit">
          <LoaderCircle :size="36" class="loading-spinner" />
          <ShieldCheck :size="18" class="loading-shield" />
        </div>
        <strong>{{ message || 'Procesando de forma segura...' }}</strong>
        <span>No cierres esta ventana mientras termina la operación.</span>
      </div>
    </div>
  </Transition>
</template>
