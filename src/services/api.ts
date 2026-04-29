import type {
  Address,
  ApiErrorPayload,
  Cart,
  Category,
  CurrencyCode,
  Discount,
  ExchangeRate,
  LoginResponse,
  Order,
  OrderStatus,
  Paginated,
  Product,
  User,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'lpi_token';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message ?? 'No se pudo completar la solicitud.');
    this.status = status;
    this.errors = payload.errors;
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type QueryValue = string | number | boolean | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function request<T>(path: string, options: RequestInit = {}, query?: Record<string, QueryValue>): Promise<T> {
  const headers = new Headers(options.headers);
  const token = tokenStorage.get();

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(buildUrl(path, query), { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  login: (payload: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) =>
    request<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<User>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    request<{ status: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { token: string; email: string; password: string; password_confirmation: string }) =>
    request<{ status: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  changePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    request<{ message: string }>('/auth/password', { method: 'PUT', body: JSON.stringify(payload) }),

  categories: () => request<Category[]>('/categories'),
  products: (query: Record<string, QueryValue>) => request<Paginated<Product>>('/products', {}, query),
  product: (slug: string, currency: CurrencyCode) => request<Product>(`/products/${slug}`, {}, { currency }),

  addresses: () => request<Address[]>('/addresses'),
  createAddress: (payload: Partial<Address>) =>
    request<Address>('/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  updateAddress: (id: number, payload: Partial<Address>) =>
    request<Address>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAddress: (id: number) => request<void>(`/addresses/${id}`, { method: 'DELETE' }),

  cart: () => request<Cart>('/cart'),
  addCartItem: (payload: { product_id: number; quantity: number; currency: CurrencyCode }) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateCartItem: (id: number, quantity: number) =>
    request(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (id: number) => request<void>(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request<void>('/cart', { method: 'DELETE' }),

  createCheckoutOrder: (payload: { address_id: number; currency: CurrencyCode; notes?: string }) =>
    request<Order>('/checkout/orders', { method: 'POST', body: JSON.stringify(payload) }),
  createPaypalOrder: (orderId: number) =>
    request<{ payment: unknown; paypal: Record<string, any> }>(`/checkout/orders/${orderId}/paypal`, { method: 'POST' }),
  capturePaypalOrder: (paypal_order_id: string) =>
    request<Order>('/checkout/paypal/capture', { method: 'POST', body: JSON.stringify({ paypal_order_id }) }),
  orders: (page = 1) => request<Paginated<Order>>('/orders', {}, { page }),
  order: (id: number) => request<Order>(`/orders/${id}`),

  adminProducts: (query: Record<string, QueryValue> = {}) => request<Paginated<Product>>('/admin/products', {}, query),
  adminProduct: (id: number) => request<Product>(`/admin/products/${id}`),
  saveProduct: (payload: Partial<Product> & { images?: Array<{ url: string; alt?: string; is_primary?: boolean }> }, id?: number) =>
    request<Product>(id ? `/admin/products/${id}` : '/admin/products', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: number) => request<void>(`/admin/products/${id}`, { method: 'DELETE' }),

  adminCategories: (page = 1) => request<Paginated<Category>>('/admin/categories', {}, { page, per_page: 100 }),
  saveCategory: (payload: Partial<Category>, id?: number) =>
    request<Category>(id ? `/admin/categories/${id}` : '/admin/categories', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id: number) => request<void>(`/admin/categories/${id}`, { method: 'DELETE' }),

  adminOrders: (query: Record<string, QueryValue> = {}) => request<Paginated<Order>>('/admin/orders', {}, query),
  adminOrder: (id: number) => request<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: OrderStatus, comment?: string) =>
    request<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, comment }) }),

  adminUsers: (query: Record<string, QueryValue> = {}) => request<Paginated<User>>('/admin/users', {}, query),
  saveUser: (payload: Partial<User> & { password?: string }, id?: number) =>
    request<User>(id ? `/admin/users/${id}` : '/admin/users', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    }),

  adminDiscounts: (page = 1) => request<Paginated<Discount>>('/admin/discounts', {}, { page }),
  saveDiscount: (payload: Partial<Discount>, id?: number) =>
    request<Discount>(id ? `/admin/discounts/${id}` : '/admin/discounts', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    }),
  deleteDiscount: (id: number) => request<void>(`/admin/discounts/${id}`, { method: 'DELETE' }),

  exchangeRates: () => request<Paginated<ExchangeRate>>('/admin/exchange-rates'),
  createExchangeRate: (payload: { base_currency: 'USD'; quote_currency: 'CUP'; rate: number; source?: string }) =>
    request<ExchangeRate>('/admin/exchange-rates', { method: 'POST', body: JSON.stringify(payload) }),
};

export function firstValidationMessage(error: unknown) {
  if (error instanceof ApiError && error.errors) {
    const first = Object.values(error.errors)[0]?.[0];
    return first ?? error.message;
  }
  return error instanceof Error ? error.message : 'Ocurrio un error inesperado.';
}

export function money(cents = 0, currency: CurrencyCode = 'USD') {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'CUP' ? 'code' : 'symbol',
  }).format(cents / 100);
}
