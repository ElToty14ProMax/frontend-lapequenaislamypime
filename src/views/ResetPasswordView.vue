<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { api, firstValidationMessage } from '@/services/api';

const route = useRoute();
const form = reactive({
  token: String(route.query.token ?? ''),
  email: String(route.query.email ?? ''),
  password: '',
  password_confirmation: '',
});
const status = ref('');
const error = ref('');

async function submit() {
  status.value = '';
  error.value = '';
  try {
    const response = await api.resetPassword(form);
    status.value = response.status;
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}
</script>

<template>
  <main class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Cambiar contraseña</h1>
      <p v-if="status" class="success">{{ status }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <label class="field"><span>Token</span><input v-model="form.token" required /></label>
      <label class="field"><span>Email</span><input v-model="form.email" type="email" required /></label>
      <label class="field"><span>Nueva contraseña</span><input v-model="form.password" type="password" required /></label>
      <label class="field"><span>Confirmar</span><input v-model="form.password_confirmation" type="password" required /></label>
      <button class="primary-button" type="submit">Actualizar</button>
    </form>
  </main>
</template>
