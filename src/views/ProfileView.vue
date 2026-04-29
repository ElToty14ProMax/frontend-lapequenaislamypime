<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import { api, firstValidationMessage } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import type { Address } from '@/types/api';

const auth = useAuthStore();
const ui = useUiStore();
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
  ui.start('Actualizando contraseña...');
  try {
    const response = await api.changePassword(password);
    message.value = response.message;
    ui.toast('Contraseña actualizada.', 'success');
    password.current_password = '';
    password.password = '';
    password.password_confirmation = '';
  } catch (err) {
    error.value = firstValidationMessage(err);
    ui.toast(error.value, 'error');
  } finally {
    ui.stop();
  }
}

async function removeAddress(address: Address) {
  const accepted = await ui.confirm({
    title: 'Eliminar dirección',
    message: `¿Seguro que quieres eliminar la dirección "${address.label || address.street}"?`,
    confirmText: 'Sí, eliminar',
    danger: true,
  });

  if (!accepted) return;

  ui.start('Eliminando dirección...');
  try {
    await api.deleteAddress(address.id);
    await load();
    ui.toast('Dirección eliminada.', 'success');
  } catch (err) {
    ui.toast(firstValidationMessage(err), 'error');
  } finally {
    ui.stop();
  }
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
            <button class="danger-button" type="button" @click="removeAddress(address)">Eliminar</button>
          </article>
        </div>
      </div>

      <form class="panel admin-form" @submit.prevent="changePassword">
        <h2>Cambiar contraseña</h2>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
        <label class="field required-field">
          <span>Contraseña actual</span>
          <input v-model="password.current_password" type="password" required />
        </label>
        <label class="field required-field">
          <span>Nueva contraseña</span>
          <input v-model="password.password" type="password" required />
        </label>
        <label class="field required-field">
          <span>Confirmar nueva contraseña</span>
          <input v-model="password.password_confirmation" type="password" required />
        </label>
        <button class="primary-button" type="submit">Actualizar contraseña</button>
      </form>
    </section>
  </main>
</template>
