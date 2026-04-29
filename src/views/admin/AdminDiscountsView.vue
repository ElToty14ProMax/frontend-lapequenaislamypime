<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader.vue';
import type { Category, Discount, Paginated, Product } from '@/types/api';

const discounts = ref<Paginated<Discount> | null>(null);
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const editingId = ref<number | undefined>();
const error = ref('');
const form = reactive({
  product_id: '',
  category_id: '',
  code: '',
  name: '',
  type: 'percent',
  value: 0,
  starts_at: '',
  ends_at: '',
  usage_limit: '',
  is_active: true,
});

async function load() {
  const [discountPage, productPage, categoryPage] = await Promise.all([
    api.adminDiscounts(),
    api.adminProducts({ per_page: 100 }),
    api.adminCategories(),
  ]);
  discounts.value = discountPage;
  products.value = productPage.data;
  categories.value = categoryPage.data.flatMap((category) => [category, ...(category.children ?? [])]);
}

function edit(discount: Discount) {
  editingId.value = discount.id;
  form.product_id = discount.product_id ? String(discount.product_id) : '';
  form.category_id = discount.category_id ? String(discount.category_id) : '';
  form.code = discount.code ?? '';
  form.name = discount.name;
  form.type = discount.type;
  form.value = Number(discount.value);
  form.starts_at = discount.starts_at?.slice(0, 16) ?? '';
  form.ends_at = discount.ends_at?.slice(0, 16) ?? '';
  form.usage_limit = discount.usage_limit ? String(discount.usage_limit) : '';
  form.is_active = discount.is_active;
}

function reset() {
  editingId.value = undefined;
  Object.assign(form, {
    product_id: '',
    category_id: '',
    code: '',
    name: '',
    type: 'percent',
    value: 0,
    starts_at: '',
    ends_at: '',
    usage_limit: '',
    is_active: true,
  });
}

async function save() {
  error.value = '';
  try {
    await api.saveDiscount(
      {
        product_id: form.product_id ? Number(form.product_id) : null,
        category_id: form.category_id ? Number(form.category_id) : null,
        code: form.code || null,
        name: form.name,
        type: form.type as Discount['type'],
        value: Number(form.value),
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      },
      editingId.value,
    );
    reset();
    await load();
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

async function remove(id: number) {
  await api.deleteDiscount(id);
  await load();
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Promociones" title="Descuentos" text="Ofertas por producto, categoría o código promocional." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Valor</th><th>Activo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="discount in discounts?.data" :key="discount.id">
              <td><strong>{{ discount.name }}</strong><br /><span class="muted">{{ discount.code || 'Sin código' }}</span></td>
              <td>{{ discount.type }}</td>
              <td>{{ discount.value }}</td>
              <td>{{ discount.is_active ? 'Sí' : 'No' }}</td>
              <td class="action-row"><button class="ghost-button" @click="edit(discount)">Editar</button><button class="danger-button" @click="remove(discount.id)">Eliminar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <form class="form-panel admin-form" @submit.prevent="save">
        <h2>{{ editingId ? 'Editar' : 'Nuevo' }} descuento</h2>
        <input v-model="form.name" placeholder="Nombre" required />
        <input v-model="form.code" placeholder="Codigo opcional" />
        <select v-model="form.type"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo</option></select>
        <input v-model.number="form.value" type="number" min="0" step="0.01" placeholder="Valor" required />
        <select v-model="form.product_id"><option value="">Producto opcional</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option></select>
        <select v-model="form.category_id"><option value="">Categoría opcional</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select>
        <input v-model="form.starts_at" type="datetime-local" />
        <input v-model="form.ends_at" type="datetime-local" />
        <input v-model="form.usage_limit" type="number" min="1" placeholder="Límite de usos" />
        <label><input v-model="form.is_active" type="checkbox" /> Activo</label>
        <button class="primary-button" type="submit">Guardar descuento</button>
        <button class="ghost-button" type="button" @click="reset">Limpiar</button>
      </form>
    </div>
  </section>
</template>
