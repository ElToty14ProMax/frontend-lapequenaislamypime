<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader.vue';
import type { Category } from '@/types/api';

const categories = ref<Category[]>([]);
const editingId = ref<number | undefined>();
const error = ref('');
const form = reactive({ parent_id: '', name: '', slug: '', description: '', sort_order: 0, is_active: true });

function allCategories() {
  return categories.value.flatMap((item) => [item, ...(item.children ?? [])]);
}

async function load() {
  categories.value = (await api.adminCategories()).data;
}

function edit(category: Category) {
  editingId.value = category.id;
  form.parent_id = category.parent_id ? String(category.parent_id) : '';
  form.name = category.name;
  form.slug = category.slug;
  form.description = category.description ?? '';
  form.sort_order = category.sort_order;
  form.is_active = category.is_active;
}

function reset() {
  editingId.value = undefined;
  Object.assign(form, { parent_id: '', name: '', slug: '', description: '', sort_order: 0, is_active: true });
}

async function save() {
  error.value = '';
  try {
    await api.saveCategory({ ...form, parent_id: form.parent_id ? Number(form.parent_id) : null }, editingId.value);
    reset();
    await load();
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

async function remove(id: number) {
  await api.deleteCategory(id);
  await load();
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Arquitectura del catálogo" title="Categorías" text="Crea categorías principales y subcategorías." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Nombre</th><th>Slug</th><th>Activa</th><th></th></tr></thead>
          <tbody>
            <template v-for="category in categories" :key="category.id">
              <tr>
                <td><strong>{{ category.name }}</strong></td><td>{{ category.slug }}</td><td>{{ category.is_active ? 'Sí' : 'No' }}</td>
                <td class="action-row"><button class="ghost-button" @click="edit(category)">Editar</button><button class="danger-button" @click="remove(category.id)">Eliminar</button></td>
              </tr>
              <tr v-for="child in category.children" :key="child.id">
                <td>· {{ child.name }}</td><td>{{ child.slug }}</td><td>{{ child.is_active ? 'Sí' : 'No' }}</td>
                <td class="action-row"><button class="ghost-button" @click="edit(child)">Editar</button><button class="danger-button" @click="remove(child.id)">Eliminar</button></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <form class="form-panel admin-form" @submit.prevent="save">
        <h2>{{ editingId ? 'Editar' : 'Nueva' }} categoría</h2>
        <select v-model="form.parent_id"><option value="">Sin categoría padre</option><option v-for="item in allCategories()" :key="item.id" :value="item.id">{{ item.name }}</option></select>
        <input v-model="form.name" placeholder="Nombre" required />
        <input v-model="form.slug" placeholder="Slug opcional" />
        <textarea v-model="form.description" placeholder="Descripción"></textarea>
        <input v-model.number="form.sort_order" type="number" min="0" placeholder="Orden" />
        <label><input v-model="form.is_active" type="checkbox" /> Activa</label>
        <button class="primary-button" type="submit">Guardar categoría</button>
        <button class="ghost-button" type="button" @click="reset">Limpiar</button>
      </form>
    </div>
  </section>
</template>
