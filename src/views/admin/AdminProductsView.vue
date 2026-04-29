<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage, money } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader.vue';
import type { Category, Paginated, Product } from '@/types/api';

const products = ref<Paginated<Product> | null>(null);
const categories = ref<Category[]>([]);
const editingId = ref<number | undefined>();
const error = ref('');
const form = reactive({
  category_id: '',
  sku: '',
  name: '',
  slug: '',
  description: '',
  brand: '',
  unit: 'unidad',
  status: 'active',
  track_inventory: true,
  stock: 0,
  low_stock_threshold: 5,
  price_usd: 0,
  price_cup: 0,
  image_url: '',
});

function flattenCategories(items: Category[]) {
  return items.flatMap((category) => [category, ...(category.children ?? [])]);
}

async function load() {
  const [productPage, categoryPage] = await Promise.all([api.adminProducts(), api.adminCategories()]);
  products.value = productPage;
  categories.value = flattenCategories(categoryPage.data);
}

function edit(product: Product) {
  editingId.value = product.id;
  form.category_id = String(product.category_id);
  form.sku = product.sku;
  form.name = product.name;
  form.slug = product.slug;
  form.description = product.description ?? '';
  form.brand = product.brand ?? '';
  form.unit = product.unit;
  form.status = product.status;
  form.track_inventory = product.track_inventory;
  form.stock = product.stock;
  form.low_stock_threshold = product.low_stock_threshold;
  form.price_usd = (product.price_usd_cents ?? 0) / 100;
  form.price_cup = (product.price_cup_cents ?? 0) / 100;
  form.image_url = product.images?.[0]?.url ?? '';
}

function reset() {
  editingId.value = undefined;
  Object.assign(form, {
    category_id: '',
    sku: '',
    name: '',
    slug: '',
    description: '',
    brand: '',
    unit: 'unidad',
    status: 'active',
    track_inventory: true,
    stock: 0,
    low_stock_threshold: 5,
    price_usd: 0,
    price_cup: 0,
    image_url: '',
  });
}

async function save() {
  error.value = '';
  try {
    await api.saveProduct(
      {
        category_id: Number(form.category_id),
        sku: form.sku,
        name: form.name,
        slug: form.slug || undefined,
        description: form.description,
        brand: form.brand,
        unit: form.unit,
        status: form.status as Product['status'],
        track_inventory: form.track_inventory,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        price_usd_cents: Math.round(Number(form.price_usd) * 100),
        price_cup_cents: Math.round(Number(form.price_cup) * 100),
        images: form.image_url ? [{ url: form.image_url, alt: form.name, is_primary: true }] : [],
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
  await api.deleteProduct(id);
  await load();
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Inventario" title="Productos" text="Gestiona precio, stock, categoría, estado e imágenes." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Producto</th><th>Stock</th><th>USD</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr v-for="product in products?.data" :key="product.id">
              <td><strong>{{ product.name }}</strong><br /><span class="muted">{{ product.sku }}</span></td>
              <td>{{ product.stock }}</td>
              <td>{{ money(product.price_usd_cents ?? 0, 'USD') }}</td>
              <td>{{ product.status }}</td>
              <td class="action-row"><button class="ghost-button" @click="edit(product)">Editar</button><button class="danger-button" @click="remove(product.id)">Eliminar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <form class="form-panel admin-form" @submit.prevent="save">
        <h2>{{ editingId ? 'Editar' : 'Nuevo' }} producto</h2>
        <select v-model="form.category_id" required><option value="">Categoria</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select>
        <input v-model="form.sku" placeholder="SKU" required />
        <input v-model="form.name" placeholder="Nombre" required />
        <input v-model="form.slug" placeholder="Slug opcional" />
        <textarea v-model="form.description" placeholder="Descripción"></textarea>
        <input v-model="form.brand" placeholder="Marca" />
        <input v-model="form.unit" placeholder="Unidad" />
        <select v-model="form.status"><option value="active">Activo</option><option value="draft">Borrador</option><option value="archived">Archivado</option></select>
        <label><input v-model="form.track_inventory" type="checkbox" /> Controlar inventario</label>
        <input v-model.number="form.stock" type="number" min="0" placeholder="Stock" />
        <input v-model.number="form.low_stock_threshold" type="number" min="0" placeholder="Alerta de stock" />
        <input v-model.number="form.price_usd" type="number" min="0" step="0.01" placeholder="Precio USD" />
        <input v-model.number="form.price_cup" type="number" min="0" step="0.01" placeholder="Precio CUP" />
        <input v-model="form.image_url" type="url" placeholder="URL de imagen" />
        <button class="primary-button" type="submit">Guardar producto</button>
        <button class="ghost-button" type="button" @click="reset">Limpiar</button>
      </form>
    </div>
  </section>
</template>
