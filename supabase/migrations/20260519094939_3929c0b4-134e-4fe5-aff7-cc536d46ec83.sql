
-- ENUMS
create type public.app_role as enum ('admin', 'customer');
create type public.product_category as enum ('fruit', 'legume');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled');
create type public.payment_method as enum ('mobile_money', 'cash_on_delivery');
create type public.payment_status as enum ('pending', 'paid', 'failed');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.product_category not null,
  price_per_kg numeric(10,2) not null check (price_per_kg >= 0),
  stock_kg numeric(10,2) not null default 0 check (stock_kg >= 0),
  featured boolean not null default false,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

-- PRODUCT IMAGES
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_images enable row level security;
create index on public.product_images(product_id);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  delivery_address text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index on public.orders(user_id);

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price_per_kg numeric(10,2) not null,
  quantity_kg numeric(10,2) not null,
  subtotal numeric(10,2) not null
);
alter table public.order_items enable row level security;
create index on public.order_items(order_id);

-- TRIGGERS - updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();

-- AUTO PROFILE + ROLE on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS POLICIES

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.has_role(auth.uid(), 'admin'));
create policy "profiles_delete_admin" on public.profiles for delete using (public.has_role(auth.uid(), 'admin'));

-- user_roles
create policy "user_roles_select_own" on public.user_roles for select using (auth.uid() = user_id);
create policy "user_roles_select_admin" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- products (public read, admin write)
create policy "products_select_all" on public.products for select using (true);
create policy "products_admin_all" on public.products for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- product_images
create policy "product_images_select_all" on public.product_images for select using (true);
create policy "product_images_admin_all" on public.product_images for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- orders
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_select_admin" on public.orders for select using (public.has_role(auth.uid(), 'admin'));
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_admin" on public.orders for update using (public.has_role(auth.uid(), 'admin'));
create policy "orders_delete_admin" on public.orders for delete using (public.has_role(auth.uid(), 'admin'));

-- order_items
create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_items_select_admin" on public.order_items for select using (public.has_role(auth.uid(), 'admin'));
create policy "order_items_insert_own" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects for insert with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product_images_admin_update" on storage.objects for update using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
