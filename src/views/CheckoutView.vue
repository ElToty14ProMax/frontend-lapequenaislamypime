<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EmptyState from '@/components/EmptyState.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { api, firstValidationMessage, money } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import type { Address } from '@/types/api';

const auth = useAuthStore();
const cart = useCartStore();
const route = useRoute();
const router = useRouter();
const addresses = ref<Address[]>([]);
const selectedAddressId = ref<number | null>(null);
const notes = ref('');
const error = ref('');
const success = ref('');
const saving = ref(false);
const addressForm = reactive<Partial<Address>>({
  label: 'Casa',
  recipient_name: auth.user?.name ?? '',
  phone: auth.user?.phone ?? '',
  country: 'Cuba',
  province: 'Villa Clara',
  municipality: 'Santa Clara',
  street: '',
  between_streets: '',
  reference: '',
  is_default: true,
});

const selectedAddress = computed(() => addresses.value.find((item) => item.id === selectedAddressId.value));

async function load() {
  await cart.load();
  addresses.value = await api.addresses();
  selectedAddressId.value = addresses.value.find((item) => item.is_default)?.id ?? addresses.value[0]?.id ?? null;
}

async function saveAddress() {
  error.value = '';
  try {
    const address = await api.createAddress(addressForm);
    addresses.value.unshift(address);
    selectedAddressId.value = address.id;
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

function approvalUrl(paypal: Record<string, any>) {
  return paypal.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;
}

async function payWithPaypal() {
  if (!selectedAddressId.value) {
    error.value = 'Debes seleccionar o crear una dirección.';
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    const order = await api.createCheckoutOrder({
      address_id: selectedAddressId.value,
      currency: cart.currency,
      notes: notes.value || undefined,
    });
    const paypal = await api.createPaypalOrder(order.id);
    const redirect = approvalUrl(paypal.paypal);
    if (redirect) {
      window.location.href = redirect;
    } else {
      success.value = `Pedido ${order.number} creado. PayPal no devolvió enlace de aprobación.`;
    }
  } catch (err) {
    error.value = firstValidationMessage(err);
  } finally {
    saving.value = false;
  }
}

async function captureReturn() {
  const token = String(route.query.token ?? '');
  if (!token) return;
  error.value = '';
  success.value = '';
  try {
    const order = await api.capturePaypalOrder(token);
    await cart.clear();
    success.value = `Pago confirmado. Factura generada para el pedido ${order.number}.`;
    await router.replace({ name: 'order-detail', params: { id: order.id } });
  } catch (err) {
    error.value = firstValidationMessage(err);
  }
}

onMounted(async () => {
  await load();
  await captureReturn();
});
</script>

<template>
  <main class="page">
    <PageHeader
      eyebrow="Pago y domicilio"
      title="Checkout"
      text="PayPal se procesa en USD. La API conserva el snapshot de conversión USD/CUP del pedido."
    />

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>

    <EmptyState v-if="cart.items.length === 0" title="No hay productos para pagar" text="Agrega productos al carrito antes del checkout." />

    <section v-else class="checkout-layout">
      <div class="stack">
        <section class="panel">
          <h2>Dirección</h2>
          <div v-if="addresses.length" class="stack">
            <label v-for="address in addresses" :key="address.id" class="address-card">
              <input v-model="selectedAddressId" type="radio" :value="address.id" />
              <strong>{{ address.label }} · {{ address.recipient_name }}</strong>
              <p class="muted">{{ address.street }}, {{ address.municipality }}, {{ address.province }}</p>
            </label>
          </div>
          <form class="admin-form" @submit.prevent="saveAddress">
            <h3>Nueva dirección</h3>
            <input v-model="addressForm.recipient_name" placeholder="Nombre de quien recibe" required />
            <input v-model="addressForm.phone" placeholder="Teléfono" required />
            <input v-model="addressForm.province" placeholder="Provincia" required />
            <input v-model="addressForm.municipality" placeholder="Municipio" required />
            <input v-model="addressForm.street" placeholder="Calle, numero, edificio" required />
            <input v-model="addressForm.between_streets" placeholder="Entre calles" />
            <textarea v-model="addressForm.reference" placeholder="Referencia de entrega"></textarea>
            <button class="secondary-button" type="submit">Guardar dirección</button>
          </form>
        </section>

        <section v-if="selectedAddress" class="panel">
          <h2>Ubicación</h2>
          <iframe
            class="map-frame"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :src="`https://www.google.com/maps?q=${encodeURIComponent(`${selectedAddress.street}, ${selectedAddress.municipality}, ${selectedAddress.province}, Cuba`)}&output=embed`"
          ></iframe>
        </section>
      </div>

      <aside class="panel">
        <h2>Pedido</h2>
        <p class="muted">{{ cart.count }} productos</p>
        <p class="price">{{ money(cart.totalCents, cart.currency) }}</p>
        <label class="field">
          <span>Notas</span>
          <textarea v-model="notes" placeholder="Indicaciones para domicilio"></textarea>
        </label>
        <button class="primary-button" type="button" :disabled="saving" @click="payWithPaypal">Pagar con PayPal</button>
      </aside>
    </section>
  </main>
</template>
