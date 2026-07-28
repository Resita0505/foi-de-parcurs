-- Rulează tot acest script o singură dată, în Supabase: SQL Editor > New query > paste > Run

create extension if not exists "uuid-ossp";

-- MAȘINI
create table if not exists vehicles (
  id uuid primary key default uuid_generate_v4(),
  plate_number text not null,
  consumption_norm numeric,
  dsv_authorization_number text,
  dsv_expiry date,
  itv_expiry date,
  rovinieta_expiry date,
  insurance_expiry date,
  created_at timestamptz default now()
);

-- ȘOFERI
create table if not exists drivers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  license_number text,
  created_at timestamptz default now()
);

-- FOI DE PARCURS
create table if not exists trip_sheets (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id) on delete set null,
  driver_id uuid references drivers(id) on delete set null,
  trip_date date not null,
  route text,
  km_start numeric,
  km_end numeric,
  fuel_added numeric,
  notes text,
  created_at timestamptz default now()
);

-- ALIMENTĂRI
create table if not exists fuel_logs (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id) on delete set null,
  driver_id uuid references drivers(id) on delete set null,
  fuel_date date not null,
  liters numeric not null,
  cost numeric,
  station text,
  km_at_fueling numeric,
  notes text,
  created_at timestamptz default now()
);

-- SETĂRI FIRMĂ (un singur rând)
create table if not exists settings (
  id int primary key default 1,
  company_name text,
  cui text,
  address text,
  constraint settings_singleton check (id = 1)
);

insert into settings (id, company_name, cui, address)
values (1, '', '', '')
on conflict (id) do nothing;

-- ACCES DESCHIS, FĂRĂ AUTENTIFICARE
-- Dezactivăm RLS și dăm acces complet rolurilor anon/authenticated,
-- pentru ca aplicația să funcționeze fără login.
alter table vehicles disable row level security;
alter table drivers disable row level security;
alter table trip_sheets disable row level security;
alter table fuel_logs disable row level security;
alter table settings disable row level security;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
