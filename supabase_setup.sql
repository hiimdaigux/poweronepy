-- ═══════════════════════════════════════════════════
-- POWER ONE PY — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════

-- 1. CONFIGURACIÓN DEL SITIO
create table if not exists config (
  id integer primary key default 1,
  wa text default '595981570126',
  city text default 'Asunción, Paraguay',
  email text default 'info@poweronepy.com',
  address text default 'Asunción, Paraguay',
  hours text default 'Lun-Sáb 08:00 - 18:00',
  hero_desc text default 'Tu destino de tecnología en Paraguay.',
  empresa text default 'Power One Py',
  ruc text default '80000000-0',
  timbrado text default '',
  fac_nro integer default 1,
  rec_nro integer default 1,
  pres_nro integer default 1,
  admin_password text default 'admin123',
  updated_at timestamptz default now()
);
insert into config (id) values (1) on conflict (id) do nothing;

-- 2. CATEGORÍAS
create table if not exists categories (
  id bigint primary key generated always as identity,
  name text not null unique,
  icon text default '📦',
  created_at timestamptz default now()
);
insert into categories (name, icon) values
  ('Electrónica','📱'),('Informática','💻'),('Car Audio','🚗')
on conflict (name) do nothing;

-- 3. PRODUCTOS
create table if not exists products (
  id bigint primary key generated always as identity,
  name text not null,
  cat text not null,
  description text default '',
  price text default '',
  badge text default '',
  discount integer default 0,
  img text default '',
  active boolean default true,
  created_at timestamptz default now(),
  admin_password text default 'admin123',
  updated_at timestamptz default now()
);

-- 4. STREAMING
create table if not exists streaming (
  id bigint primary key generated always as identity,
  name text not null,
  icon text default '🎬',
  description text default '',
  price text default '',
  combo boolean default true,
  active boolean default true,
  created_at timestamptz default now()
);
insert into streaming (name, icon, description, price) values
  ('Netflix','🎬','Plan estándar con anuncios o premium. HD/4K.','25.000 Gs.'),
  ('Disney+','🏰','Disney, Marvel, Star Wars, Pixar.','22.000 Gs.'),
  ('HBO Max','👑','Series HBO, Warner y contenido exclusivo.','22.000 Gs.'),
  ('Spotify','🎵','Música sin anuncios, descargas premium.','15.000 Gs.'),
  ('YouTube Premium','▶️','Sin anuncios, YouTube Music incluido.','18.000 Gs.'),
  ('Prime Video','📦','Series y películas Amazon originales.','18.000 Gs.'),
  ('Paramount+','⭐','CBS, MTV, Nickelodeon y más.','18.000 Gs.'),
  ('Apple TV+','🍎','Apple Originals exclusivos.','20.000 Gs.')
on conflict do nothing;

-- 5. SERVICIOS (garantía, envío, etc.)
create table if not exists services (
  id bigint primary key generated always as identity,
  icon text default '⚡',
  name text not null,
  description text default '',
  created_at timestamptz default now()
);
insert into services (icon, name, description) values
  ('🛡️','Garantía de fábrica','Todos nuestros productos con garantía oficial.'),
  ('🚚','Envío a todo el país','Enviamos por encomienda a cualquier punto de Paraguay.'),
  ('💬','Asesoramiento personalizado','Te ayudamos a elegir el producto ideal.'),
  ('💳','Facilidades de pago','Transferencia, efectivo y cuotas sin interés.')
on conflict do nothing;

-- 6. CLIENTES
create table if not exists clientes (
  id bigint primary key generated always as identity,
  ruc text default '',
  nombre text not null,
  tipo text default 'Persona Física',
  email text default '',
  telefono text default '',
  ciudad text default '',
  direccion text default '',
  limite_credito numeric default 0,
  notas text default '',
  created_at timestamptz default now()
);

-- 7. PROVEEDORES
create table if not exists proveedores (
  id bigint primary key generated always as identity,
  ruc text default '',
  nombre text not null,
  contacto text default '',
  telefono text default '',
  email text default '',
  ciudad text default '',
  direccion text default '',
  banco text default '',
  notas text default '',
  created_at timestamptz default now()
);

-- 8. STOCK / INVENTARIO
create table if not exists stock (
  id bigint primary key generated always as identity,
  cod text default '',
  nombre text not null,
  categoria text default '',
  descripcion text default '',
  qty integer default 0,
  qty_min integer default 5,
  precio_costo text default '',
  precio_venta text default '',
  proveedor_id bigint references proveedores(id) on delete set null,
  ubicacion text default '',
  created_at timestamptz default now(),
  admin_password text default 'admin123',
  updated_at timestamptz default now()
);

-- 9. MOVIMIENTOS DE STOCK
create table if not exists movimientos (
  id bigint primary key generated always as identity,
  tipo text not null check (tipo in ('entrada','salida','ajuste')),
  fecha date not null default current_date,
  stock_id bigint references stock(id) on delete set null,
  producto_nombre text not null,
  cantidad integer not null,
  precio_unitario text default '',
  contacto text default '',
  referencia text default '',
  notas text default '',
  created_at timestamptz default now()
);

-- 10. PRESUPUESTOS
create table if not exists presupuestos (
  id bigint primary key generated always as identity,
  numero integer not null,
  fecha date default current_date,
  cliente_id bigint references clientes(id) on delete set null,
  cliente_nombre text default 'Sin cliente',
  items jsonb default '[]',
  total numeric default 0,
  notas text default '',
  valido_hasta date,
  estado text default 'vigente',
  created_at timestamptz default now()
);

-- 11. FACTURAS
create table if not exists facturas (
  id bigint primary key generated always as identity,
  numero text not null,
  numero_interno integer,
  fecha date default current_date,
  cliente_id bigint references clientes(id) on delete set null,
  cliente_nombre text default 'Consumidor Final',
  cliente_ruc text default '',
  items jsonb default '[]',
  total numeric default 0,
  condicion_pago text default 'Contado',
  notas text default '',
  timbrado text default '',
  created_at timestamptz default now()
);

-- 12. RECIBOS
create table if not exists recibos (
  id bigint primary key generated always as identity,
  numero text not null,
  numero_interno integer,
  fecha date default current_date,
  cliente_id bigint references clientes(id) on delete set null,
  pagador_nombre text not null,
  monto numeric not null,
  concepto text not null,
  forma_pago text default 'Efectivo',
  referencia text default '',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Acceso público de lectura
-- para que el sitio pueda leer sin autenticación
-- ═══════════════════════════════════════════════════
alter table config enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table streaming enable row level security;
alter table services enable row level security;
alter table clientes enable row level security;
alter table proveedores enable row level security;
alter table stock enable row level security;
alter table movimientos enable row level security;
alter table presupuestos enable row level security;
alter table facturas enable row level security;
alter table recibos enable row level security;

-- Lectura pública para tablas del sitio
create policy "public read config"      on config      for select using (true);
create policy "public read categories"  on categories  for select using (true);
create policy "public read products"    on products    for select using (true);
create policy "public read streaming"   on streaming   for select using (true);
create policy "public read services"    on services    for select using (true);

-- Escritura/lectura completa con anon key (admin usa la misma key)
-- En producción podés restringir esto con Supabase Auth
create policy "anon all config"        on config        for all using (true) with check (true);
create policy "anon all categories"    on categories    for all using (true) with check (true);
create policy "anon all products"      on products      for all using (true) with check (true);
create policy "anon all streaming"     on streaming     for all using (true) with check (true);
create policy "anon all services"      on services      for all using (true) with check (true);
create policy "anon all clientes"      on clientes      for all using (true) with check (true);
create policy "anon all proveedores"   on proveedores   for all using (true) with check (true);
create policy "anon all stock"         on stock         for all using (true) with check (true);
create policy "anon all movimientos"   on movimientos   for all using (true) with check (true);
create policy "anon all presupuestos"  on presupuestos  for all using (true) with check (true);
create policy "anon all facturas"      on facturas      for all using (true) with check (true);
create policy "anon all recibos"       on recibos       for all using (true) with check (true);
