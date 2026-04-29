<script setup lang="ts">
import { ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';

const email = ref('');
const status = ref('');
const error = ref('');

async function submit() {
  status.value = '';
  error.value = '';
  try {
    const response = await api.forgotPassword(email.value);
    status.value = response.status;
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}
</script>

<template>
  <main class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Recuperar contraseña</h1>
      <p class="muted">Te enviaremos el enlace de recuperación al correo registrado.</p>
      <p v-if="status" class="success">{{ status }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <label class="field"><span>Email</span><input v-model="email" type="email" required /></label>
      <button class="primary-button" type="submit">Enviar enlace</button>
    </form>
  </main>
</template>
