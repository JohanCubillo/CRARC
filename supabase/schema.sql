-- Ejecutar una vez en SQL Editor del proyecto CRARC.
begin;
create table if not exists public.contactos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nombre text not null check (length(trim(nombre)) between 1 and 200),
  email text not null check (length(email) between 3 and 320 and position('@' in email) > 1),
  whatsapp text not null default '' check (length(whatsapp) <= 50),
  interes text not null default '' check (length(interes) <= 100),
  personas text not null default '' check (length(personas) <= 20),
  dieta text not null default '' check (length(dieta) <= 100),
  alergias text not null default '-' check (length(alergias) <= 2000),
  idioma text not null default 'es' check (idioma in ('es','en','fr','it')),
  pagina text not null default '' check (length(pagina) <= 500)
);
create table if not exists public.padrinos (
  id text primary key,
  nombre text not null,
  foto text not null default '',
  montos integer[] not null default '{10,25,50}',
  boton text not null default 'whatsapp' check (boton in ('whatsapp','paypal')),
  paypal text not null default '',
  especie text not null default '',
  historia text not null default '',
  activo boolean not null default true,
  orden integer not null default 0
);
alter table public.contactos enable row level security;
alter table public.padrinos enable row level security;
revoke all on public.contactos, public.padrinos from anon, authenticated;
grant insert (nombre,email,whatsapp,interes,personas,dieta,alergias,idioma,pagina) on public.contactos to anon;
grant usage on sequence public.contactos_id_seq to anon;
grant select on public.padrinos to anon;
drop policy if exists "Web envia contactos" on public.contactos;
create policy "Web envia contactos" on public.contactos for insert to anon with check (true);
drop policy if exists "Web lee padrinos activos" on public.padrinos;
create policy "Web lee padrinos activos" on public.padrinos for select to anon using (activo = true);
commit;
