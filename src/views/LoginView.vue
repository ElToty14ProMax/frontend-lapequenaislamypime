<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const form = reactive({ email: '', password: '' });

async function submit() {
  await auth.login(form.email, form.password);
  await router.push(String(route.query.redirect || (auth.isAdmin ? '/admin' : '/')));
}
</script>

<template>
  <main class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Entrar</h1>
      <p class="muted">Accede para comprar, revisar pedidos y gestionar direcciones.</p>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <label class="field required-field">
        <span>Email</span>
        <input v-model="form.email" type="email" required autocomplete="email" />
      </label>
      <label class="field required-field">
        <span>Contraseña</span>
        <input v-model="form.password" type="password" required autocomplete="current-password" />
      </label>
      <button class="primary-button" type="submit" :disabled="auth.loading">Iniciar sesión</button>
      <p><RouterLink to="/recuperar">Recuperar contraseña</RouterLink> · <RouterLink to="/registro">Crear cuenta</RouterLink></p>
    </form>
  </main>
</template>
