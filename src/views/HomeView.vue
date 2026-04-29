<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Clock, MapPin, ShieldCheck, Truck, WalletCards } from 'lucide-vue-next';

import ProductCard from '@/components/ProductCard.vue';
import AppButton from '@/components/ui/AppButton.vue';
import MetricCard from '@/components/ui/MetricCard.vue';
import Reveal from '@/components/ui/Reveal.vue';
import heroImage from '@/assets/hero-storefront.png';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import type { Product } from '@/types/api';

const catalog = useCatalogStore();
const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();
const featuredQuery = { per_page: 6, sort: 'newest' };

onMounted(() => catalog.loadProducts(featuredQuery));
watch(() => catalog.currency, () => catalog.loadProducts(featuredQuery));

async function add(product: Product) {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: `/productos/${product.slug}` } });
    return;
  }
  await cart.add(product.id, 1);
}
</script>

<template>
  <main>
    <section class="hero">
      <img :src="heroImage" alt="Fachada inspirada en La Pequeña Isla" />
      <div class="hero-content">
        <span class="hero-kicker">Compra online activa en Santa Clara</span>
        <h1>La Pequeña Isla</h1>
        <p>
          Alimentos, bebidas, productos para el hogar y compras online con servicio a domicilio desde Santa Clara hacia
          Villa Clara, Matanzas, Cienfuegos, Sancti Spíritus y Ciego de Ávila.
        </p>
        <div class="hero-actions">
          <AppButton to="/catalogo">Comprar ahora</AppButton>
          <AppButton variant="secondary" href="https://www.facebook.com/share/156hw1ihCY/">Facebook</AppButton>
          <AppButton
            variant="secondary"
            href="https://www.instagram.com/la_pequena_isla?utm_source=qr&igsh=MTJ1aHVrYWw5bW84dw=="
          >
            Instagram
          </AppButton>
        </div>
        <div class="hero-meta">
          <span class="glass-chip">PayPal en USD</span>
          <span class="glass-chip">Precios en CUP</span>
          <span class="glass-chip">Domicilio coordinado</span>
        </div>
      </div>
    </section>

    <div class="page">
      <section class="info-strip" aria-label="Información comercial">
        <Reveal class="info-item" :delay="0">
          <Truck :size="24" />
          <strong>Domicilio gratis</strong>
          <span>Dentro de Santa Clara y tarifa adicional fuera de la ciudad.</span>
        </Reveal>
        <Reveal class="info-item" :delay="80">
          <WalletCards :size="24" />
          <strong>USD y CUP</strong>
          <span>Precios visibles en ambas monedas y PayPal para pagos desde el exterior.</span>
        </Reveal>
        <Reveal class="info-item" :delay="160">
          <MapPin :size="24" />
          <strong>Calle 1ra No.14</strong>
          <span>Avenida Sandino y Carretera Central, Santa Clara.</span>
        </Reveal>
        <Reveal class="info-item" :delay="240">
          <Clock :size="24" />
          <strong>Lunes a sábado</strong>
          <span>8:00 am a 5:00 pm. Domingo 8:00 am a 12:00 pm.</span>
        </Reveal>
      </section>

      <section class="surface-split">
        <Reveal class="brand-story">
          <span class="glass-chip">Gastronomía y comercio</span>
          <h2>Una tienda local con experiencia digital.</h2>
          <p>
            El sistema está pensado para compra repetida: búsqueda rápida, moneda visible, carrito protegido,
            direcciones guardadas, seguimiento de pedidos y administración clara.
          </p>
          <div class="hero-actions">
            <AppButton to="/registro" variant="secondary">Crear cuenta</AppButton>
            <AppButton to="/pedidos" variant="ghost">Ver pedidos</AppButton>
          </div>
        </Reveal>
        <Reveal class="service-map" :delay="120">
          <MetricCard label="Cobertura" value="5 provincias" tone="green">
            <p class="muted">Villa Clara, Matanzas, Cienfuegos, Sancti Spíritus y Ciego de Ávila.</p>
          </MetricCard>
          <MetricCard label="Horario" value="8:00 - 5:00" tone="gold">
            <p class="muted">Domingo hasta las 12:00 pm.</p>
          </MetricCard>
          <MetricCard label="Compra segura" value="PayPal">
            <p class="muted"><ShieldCheck :size="16" /> Sin credenciales de pago guardadas en el frontend.</p>
          </MetricCard>
        </Reveal>
      </section>

      <section class="section-heading">
        <div>
          <p class="eyebrow">Inventario actualizado</p>
          <h2>Productos recientes</h2>
          <p>Disponibilidad, stock y precios sincronizados con el sistema.</p>
        </div>
        <RouterLink class="ghost-button" to="/catalogo">Ver catálogo</RouterLink>
      </section>

      <section class="products-grid">
        <Reveal v-for="(product, index) in catalog.products?.data" :key="product.id" :delay="index * 65">
          <ProductCard :product="product" @add="add" />
        </Reveal>
      </section>
    </div>
  </main>
</template>
