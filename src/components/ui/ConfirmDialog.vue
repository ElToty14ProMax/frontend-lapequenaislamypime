<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <Transition name="overlay-fade">
    <div v-if="ui.confirmDialog" class="confirm-overlay" role="dialog" aria-modal="true">
      <section class="confirm-panel">
        <div class="confirm-icon" :class="{ danger: ui.confirmDialog.danger }">
          <AlertTriangle :size="24" />
        </div>
        <h2>{{ ui.confirmDialog.title }}</h2>
        <p>{{ ui.confirmDialog.message }}</p>
        <div class="action-row">
          <button class="ghost-button" type="button" @click="ui.answerConfirm(false)">
            {{ ui.confirmDialog.cancelText }}
          </button>
          <button :class="ui.confirmDialog.danger ? 'danger-button' : 'primary-button'" type="button" @click="ui.answerConfirm(true)">
            {{ ui.confirmDialog.confirmText }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>
