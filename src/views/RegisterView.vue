<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ name: '', email: '', phone: '', password: '', password_confirmation: '' });

async function submit() {
  await auth.register(form);
  await router.push('/');
}
</script>

<template>
  <main class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Crear cuenta</h1>
      <p class="muted">Necesitas una cuenta para usar el carrito y recibir seguimiento del pedido.</p>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <label class="field required-field"><span>Nombre</span><input v-model="form.name" required autocomplete="name" /></label>
      <label class="field required-field"><span>Email</span><input v-model="form.email" type="email" required autocomplete="email" /></label>
      <label class="field"><span>Teléfono</span><input v-model="form.phone" autocomplete="tel" /></label>
      <label class="field required-field"><span>Contraseña</span><input v-model="form.password" type="password" required autocomplete="new-password" /></label>
      <label class="field required-field"><span>Confirmar contraseña</span><input v-model="form.password_confirmation" type="password" required autocomplete="new-password" /></label>
      <button class="primary-button" type="submit" :disabled="auth.loading">Registrarme</button>
      <p>¿Ya tienes cuenta? <RouterLink to="/login">Entrar</RouterLink></p>
    </form>
  </main>
</template>
