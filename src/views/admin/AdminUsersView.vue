<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader.vue';
import type { Paginated, User } from '@/types/api';

const users = ref<Paginated<User> | null>(null);
const editingId = ref<number | undefined>();
const error = ref('');
const form = reactive({ name: '', email: '', phone: '', role: 'customer', password: '', active: true });

async function load() {
  users.value = await api.adminUsers();
}

function edit(user: User) {
  editingId.value = user.id;
  form.name = user.name;
  form.email = user.email;
  form.phone = user.phone ?? '';
  form.role = user.role;
  form.password = '';
  form.active = user.active;
}

function reset() {
  editingId.value = undefined;
  Object.assign(form, { name: '', email: '', phone: '', role: 'customer', password: '', active: true });
}

async function save() {
  error.value = '';
  try {
    const payload = { ...form, password: form.password || undefined } as any;
    await api.saveUser(payload, editingId.value);
    reset();
    await load();
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Accesos" title="Usuarios" text="Administra clientes, administradores y cambios de contraseña." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="user in users?.data" :key="user.id">
              <td>{{ user.name }}</td><td>{{ user.email }}</td><td>{{ user.role }}</td><td>{{ user.active ? 'Sí' : 'No' }}</td>
              <td><button class="ghost-button" @click="edit(user)">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <form class="form-panel admin-form" @submit.prevent="save">
        <h2>{{ editingId ? 'Editar' : 'Nuevo' }} usuario</h2>
        <input v-model="form.name" placeholder="Nombre" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.phone" placeholder="Teléfono" />
        <select v-model="form.role"><option value="customer">Cliente</option><option value="admin">Administrador</option></select>
        <input v-model="form.password" type="password" :placeholder="editingId ? 'Nueva contraseña opcional' : 'Contraseña'" :required="!editingId" />
        <label><input v-model="form.active" type="checkbox" /> Activo</label>
        <button class="primary-button" type="submit">Guardar usuario</button>
        <button class="ghost-button" type="button" @click="reset">Limpiar</button>
      </form>
    </div>
  </section>
</template>
