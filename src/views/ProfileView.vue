<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Address } from '@/types/api';
import PageHeader from '@/components/ui/PageHeader.vue';

const auth = useAuthStore();
const addresses = ref<Address[]>([]);
const message = ref('');
const error = ref('');
const password = reactive({ current_password: '', password: '', password_confirmation: '' });

async function load() {
  addresses.value = await api.addresses();
}

async function changePassword() {
  message.value = '';
  error.value = '';
  try {
    const response = await api.changePassword(password);
    message.value = response.message;
    password.current_password = '';
    password.password = '';
    password.password_confirmation = '';
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

async function removeAddress(id: number) {
  await api.deleteAddress(id);
  await load();
}

onMounted(load);
</script>

<template>
  <main class="page">
    <PageHeader eyebrow="Cuenta" title="Perfil" :text="`${auth.user?.name} · ${auth.user?.email}`" />

    <section class="profile-layout">
      <div class="panel">
        <h2>Direcciones</h2>
        <div class="stack">
          <article v-for="address in addresses" :key="address.id" class="address-card">
            <strong>{{ address.label }} · {{ address.recipient_name }}</strong>
            <p class="muted">{{ address.street }}, {{ address.municipality }}, {{ address.province }}</p>
            <button class="danger-button" type="button" @click="removeAddress(address.id)">Eliminar</button>
          </article>
        </div>
      </div>

      <form class="panel admin-form" @submit.prevent="changePassword">
        <h2>Cambiar contraseña</h2>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
        <input v-model="password.current_password" type="password" placeholder="Contraseña actual" required />
        <input v-model="password.password" type="password" placeholder="Nueva contraseña" required />
        <input v-model="password.password_confirmation" type="password" placeholder="Confirmar nueva contraseña" required />
        <button class="primary-button" type="submit">Actualizar contraseña</button>
      </form>
    </section>
  </main>
</template>
