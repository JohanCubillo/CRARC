-- Panel privado CRARC. Ejecutar en SQL Editor después de schema.sql.
begin;
create table if not exists public.administradores (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;
grant select on public.administradores to authenticated;
drop policy if exists "Ver mi acceso" on public.administradores;
create policy "Ver mi acceso" on public.administradores for select to authenticated using (user_id = (select auth.uid()));
create table if not exists public.estadias (
 id uuid primary key default gen_random_uuid(),
 nombre text not null check(length(trim(nombre)) between 1 and 200),
 email text not null default '',
 habitacion text not null check(length(trim(habitacion)) between 1 and 100),
 llegada date not null,
 salida date not null check(salida > llegada),
 dia_libre integer check(dia_libre between 0 and 6),
 tarea_manana text not null default 'Cuidado y limpieza',
 tarea_tarde text not null default 'Alimentar animales',
 notas text not null default '',
 created_at timestamptz not null default now()
);
create table if not exists public.movimientos (
 id uuid primary key default gen_random_uuid(),
 tipo text not null check(tipo in ('ingreso','gasto')),
 estadia_id uuid references public.estadias(id) on delete restrict,
 fecha date not null default current_date,
 concepto text not null check(length(trim(concepto)) between 1 and 300),
 categoria text not null default 'Otros',
 monto numeric(14,2) not null check(monto > 0),
 moneda text not null check(moneda in ('USD','CRC')),
 created_at timestamptz not null default now(),
 check(tipo = 'ingreso' or estadia_id is null)
);
create table if not exists public.turnos (
 id uuid primary key default gen_random_uuid(),
 estadia_id uuid not null references public.estadias(id) on delete cascade,
 fecha date not null,
 libre boolean not null default false,
 manana text not null default '',
 tarde text not null default '',
 unique(estadia_id,fecha)
);
create index if not exists movimientos_fecha_idx on public.movimientos(fecha);
create index if not exists turnos_fecha_idx on public.turnos(fecha);
do $$
declare tabla text;
begin
 foreach tabla in array array['estadias','movimientos','turnos'] loop
  execute format('alter table public.%I enable row level security', tabla);
  execute format('revoke all on public.%I from anon, authenticated', tabla);
  execute format('grant select, insert, update, delete on public.%I to authenticated', tabla);
  execute format('drop policy if exists "Solo administradores" on public.%I', tabla);
  execute format('create policy "Solo administradores" on public.%I for all to authenticated using (exists (select 1 from public.administradores where user_id = (select auth.uid()))) with check (exists (select 1 from public.administradores where user_id = (select auth.uid())))', tabla);
 end loop;
end $$;
commit;

-- Después de crear tu usuario en Authentication > Users, autorízalo:
-- insert into public.administradores(user_id)
-- select id from auth.users where email = 'TU_CORREO' on conflict do nothing;
