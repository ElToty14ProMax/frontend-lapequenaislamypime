export type CurrencyCode = 'USD' | 'CUP';
export type UserRole = 'admin' | 'customer';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  url: string;
  alt?: string | null;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Product {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  unit: string;
  status: ProductStatus;
  track_inventory: boolean;
  stock: number;
  low_stock_threshold: number;
  price_usd_cents?: number | null;
  price_cup_cents?: number | null;
  display_price_cents?: number;
  display_currency?: CurrencyCode;
  category?: Category;
  images?: ProductImage[];
  discounts?: Discount[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  active: boolean;
  addresses?: Address[];
}

export interface Address {
  id: number;
  label?: string;
  recipient_name: string;
  phone: string;
  country?: string;
  province: string;
  municipality: string;
  street: string;
  between_streets?: string | null;
  reference?: string | null;
  postal_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_default?: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  currency: CurrencyCode;
  product?: Product;
}

export interface Cart {
  id: number;
  currency: CurrencyCode;
  status: string;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  sku?: string | null;
  quantity: number;
  unit_price_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: CurrencyCode;
}

export interface Payment {
  id: number;
  provider: string;
  provider_order_id?: string | null;
  provider_capture_id?: string | null;
  status: string;
  currency: CurrencyCode;
  amount_cents: number;
}

export interface Invoice {
  id: number;
  number: string;
  currency: CurrencyCode;
  total_cents: number;
  issued_at: string;
}

export interface OrderHistory {
  id: number;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  comment?: string | null;
  created_at: string;
  user?: User;
}

export interface Order {
  id: number;
  number: string;
  user_id: number;
  status: OrderStatus;
  payment_status: string;
  currency: CurrencyCode;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  notes?: string | null;
  paid_at?: string | null;
  created_at: string;
  user?: User;
  address?: Address;
  items?: OrderItem[];
  payments?: Payment[];
  invoice?: Invoice | null;
  histories?: OrderHistory[];
}

export interface Discount {
  id: number;
  product_id?: number | null;
  category_id?: number | null;
  code?: string | null;
  name: string;
  type: 'percent' | 'fixed';
  value: string | number;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  used_count?: number;
  is_active: boolean;
  product?: Product;
  category?: Category;
}

export interface ExchangeRate {
  id: number;
  base_currency: 'USD';
  quote_currency: 'CUP';
  rate: string | number;
  source?: string | null;
  valid_from: string;
  valid_to?: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}
