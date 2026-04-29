<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LocateFixed, MapPin } from 'lucide-vue-next';

import EmptyState from '@/components/EmptyState.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import { api, firstValidationMessage, money } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';
import type { Address } from '@/types/api';

const auth = useAuthStore();
const cart = useCartStore();
const ui = useUiStore();
const route = useRoute();
const router = useRouter();
const addresses = ref<Address[]>([]);
const selectedAddressId = ref<number | null>(null);
const notes = ref('');
const error = ref('');
const success = ref('');
const saving = ref(false);
const selectingAddress = ref(false);
const showAddressForm = ref(false);
const locating = ref(false);
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
  latitude: null,
  longitude: null,
  is_default: true,
});

const selectedAddress = computed(() => addresses.value.find((item) => item.id === selectedAddressId.value));
const mapQuery = computed(() => {
  if (!selectedAddress.value) return 'Santa Clara, Villa Clara, Cuba';
  if (selectedAddress.value.latitude && selectedAddress.value.longitude) {
    return `${selectedAddress.value.latitude},${selectedAddress.value.longitude}`;
  }
  return `${selectedAddress.value.street}, ${selectedAddress.value.municipality}, ${selectedAddress.value.province}, Cuba`;
});

async function load() {
  await cart.load();
  addresses.value = await api.addresses();
  selectedAddressId.value = addresses.value.find((item) => item.is_default)?.id ?? addresses.value[0]?.id ?? null;
  showAddressForm.value = addresses.value.length === 0;
}

async function saveAddress() {
  error.value = '';
  success.value = '';
  ui.start('Guardando dirección...');
  try {
    const address = await api.createAddress(addressForm);
    addresses.value.unshift(address);
    selectedAddressId.value = address.id;
    showAddressForm.value = false;
    selectingAddress.value = false;
    success.value = 'Dirección guardada y seleccionada para este pedido.';
    ui.toast(success.value, 'success');
  } catch (err) {
    error.value = firstValidationMessage(err);
    ui.toast(error.value, 'error');
  } finally {
    ui.stop();
  }
}

function useCurrentLocation() {
  error.value = '';
  if (!navigator.geolocation) {
    error.value = 'Tu navegador no permite obtener la ubicación automáticamente.';
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      addressForm.latitude = Number(position.coords.latitude.toFixed(7));
      addressForm.longitude = Number(position.coords.longitude.toFixed(7));
      locating.value = false;
      ui.toast('Ubicación marcada. Revisa la dirección antes de guardar.', 'success');
    },
    () => {
      locating.value = false;
      error.value = 'No se pudo obtener tu ubicación. Puedes escribir la dirección manualmente.';
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function approvalUrl(paypal: Record<string, any>) {
  return paypal.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;
}

async function payWithPaypal() {
  if (!selectedAddressId.value) {
    error.value = 'Debes seleccionar o crear una dirección antes de pagar.';
    showAddressForm.value = true;
    return;
  }
  saving.value = true;
  error.value = '';
  ui.start('Creando pedido y conectando con PayPal...');
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
    ui.stop();
  }
}

async function captureReturn() {
  const token = String(route.query.token ?? '');
  if (!token) return;
  error.value = '';
  success.value = '';
  try {
    ui.start('Confirmando pago con PayPal...');
    const order = await api.capturePaypalOrder(token);
    await cart.clear();
    success.value = `Pago confirmado. Factura generada para el pedido ${order.number}.`;
    await router.replace({ name: 'order-detail', params: { id: order.id } });
  } catch (err) {
    error.value = firstValidationMessage(err);
  } finally {
    ui.stop();
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
      text="PayPal procesa el pedido en USD. Si tu cuenta está en otra moneda, PayPal debe convertirla o permitir pago internacional."
    />

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>

    <EmptyState v-if="cart.items.length === 0" title="No hay productos para pagar" text="Agrega productos al carrito antes del checkout." />

    <section v-else class="checkout-layout">
      <div class="stack">
        <section class="panel">
          <div class="section-heading compact-heading">
            <div>
              <p class="eyebrow">Obligatorio para comprar</p>
              <h2>Dirección de entrega</h2>
            </div>
            <button class="ghost-button" type="button" @click="showAddressForm = !showAddressForm">
              {{ showAddressForm ? 'Ocultar formulario' : 'Nueva dirección' }}
            </button>
          </div>

          <div v-if="selectedAddress && !selectingAddress" class="selected-address">
            <MapPin :size="22" />
            <div>
              <strong>{{ selectedAddress.label }} · {{ selectedAddress.recipient_name }}</strong>
              <p class="muted">{{ selectedAddress.street }}, {{ selectedAddress.municipality }}, {{ selectedAddress.province }}</p>
            </div>
            <button class="secondary-button" type="button" @click="selectingAddress = true">Seleccionar otra</button>
          </div>

          <div v-if="selectingAddress || !selectedAddress" class="stack">
            <label v-for="address in addresses" :key="address.id" class="address-card selectable-address">
              <input v-model="selectedAddressId" type="radio" :value="address.id" @change="selectingAddress = false" />
              <span>
                <strong>{{ address.label }} · {{ address.recipient_name }}</strong>
                <p class="muted">{{ address.street }}, {{ address.municipality }}, {{ address.province }}</p>
              </span>
            </label>
          </div>

          <p v-if="!addresses.length && !showAddressForm" class="error">
            Debes crear una dirección obligatoriamente para poder comprar.
          </p>

          <form v-if="showAddressForm" class="admin-form address-form" @submit.prevent="saveAddress">
            <h3>Nueva dirección</h3>
            <label class="field required-field">
              <span>Nombre de quien recibe</span>
              <input v-model="addressForm.recipient_name" required autocomplete="name" />
            </label>
            <label class="field required-field">
              <span>Teléfono</span>
              <input v-model="addressForm.phone" required autocomplete="tel" />
            </label>
            <label class="field required-field">
              <span>Provincia</span>
              <input v-model="addressForm.province" required />
            </label>
            <label class="field required-field">
              <span>Municipio</span>
              <input v-model="addressForm.municipality" required />
            </label>
            <label class="field required-field">
              <span>Calle, número, edificio</span>
              <input v-model="addressForm.street" required />
            </label>
            <label class="field">
              <span>Entre calles</span>
              <input v-model="addressForm.between_streets" />
            </label>
            <label class="field">
              <span>Referencia de entrega</span>
              <textarea v-model="addressForm.reference"></textarea>
            </label>
            <button class="secondary-button" type="button" :disabled="locating" @click="useCurrentLocation">
              <LocateFixed :size="18" />
              {{ locating ? 'Marcando ubicación...' : 'Marcar mi ubicación' }}
            </button>
            <p class="muted">
              El mapa sirve como referencia visual. Para convertir un pin en dirección exacta hace falta activar un
              servicio de geocodificación en el backend.
            </p>
            <button class="primary-button" type="submit">Guardar y seleccionar</button>
          </form>
        </section>

        <section v-if="selectedAddress" class="panel">
          <h2>Ubicación</h2>
          <iframe
            class="map-frame"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :src="`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`"
          ></iframe>
        </section>
      </div>

      <aside class="panel">
        <h2>Pedido</h2>
        <p class="muted">{{ cart.count }} productos</p>
        <p class="price">{{ money(cart.totalCents, cart.currency) }}</p>
        <label class="field">
          <span>Notas para domicilio</span>
          <textarea v-model="notes" placeholder="Indicaciones para la entrega"></textarea>
        </label>
        <p class="muted">
          Si tu cuenta de PayPal está en reales u otra moneda, PayPal normalmente hace la conversión. Si no permite pagar,
          revisa que la cuenta o el sandbox acepte pagos internacionales en USD.
        </p>
        <button class="primary-button" type="button" :disabled="saving || !selectedAddressId" @click="payWithPaypal">
          Pagar con PayPal
        </button>
      </aside>
    </section>
  </main>
</template>
