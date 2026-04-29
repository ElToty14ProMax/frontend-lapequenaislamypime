<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { api, firstValidationMessage } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader.vue';
import type { ExchangeRate, Paginated } from '@/types/api';

const rates = ref<Paginated<ExchangeRate> | null>(null);
const error = ref('');
const form = reactive({ rate: 120, source: 'admin' });

async function load() {
  rates.value = await api.exchangeRates();
}

async function save() {
  error.value = '';
  try {
    await api.createExchangeRate({
      base_currency: 'USD',
      quote_currency: 'CUP',
      rate: Number(form.rate),
      source: form.source,
    });
    await load();
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

onMounted(load);
</script>

<template>
  <section class="admin-page">
    <PageHeader eyebrow="Monedas" title="Tasa USD/CUP" text="La tasa queda historizada y cada pedido toma su snapshot." />
    <p v-if="error" class="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="table-shell">
        <table>
          <thead><tr><th>Tasa</th><th>Fuente</th><th>Desde</th><th>Hasta</th></tr></thead>
          <tbody>
            <tr v-for="rate in rates?.data" :key="rate.id">
              <td>1 USD = {{ rate.rate }} CUP</td>
              <td>{{ rate.source }}</td>
              <td>{{ new Date(rate.valid_from).toLocaleString('es-CU') }}</td>
              <td>{{ rate.valid_to ? new Date(rate.valid_to).toLocaleString('es-CU') : 'Actual' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <form class="form-panel admin-form" @submit.prevent="save">
        <h2>Nueva tasa</h2>
        <input v-model.number="form.rate" type="number" min="0.0001" step="0.0001" required />
        <input v-model="form.source" placeholder="Fuente" />
        <button class="primary-button" type="submit">Publicar tasa</button>
      </form>
    </div>
  </section>
</template>
