begin;
create table if not exists public.encargados (
 fecha date primary key,
 alimentacion uuid references public.estadias(id) on delete restrict,
 preparacion uuid references public.estadias(id) on delete restrict,
 check(alimentacion is null or preparacion is null or alimentacion <> preparacion)
);
alter table public.encargados enable row level security;
revoke all on public.encargados from anon, authenticated;
grant select, insert, update on public.encargados to authenticated;
drop policy if exists "Administrar encargados" on public.encargados;
create policy "Administrar encargados" on public.encargados for all to authenticated
using(exists(select 1 from public.administradores where user_id = (select auth.uid())))
with check(exists(select 1 from public.administradores where user_id = (select auth.uid())));
-- Quita habitaciones de las copias ya publicadas.
alter table public.tablero_publico add column if not exists valido boolean not null default false;
drop policy if exists "Consultar tablero publicado" on public.tablero_publico;
create policy "Consultar tablero publicado" on public.tablero_publico for select to anon, authenticated using (valido);
drop policy if exists "Administradores consultan borradores" on public.tablero_publico;
create policy "Administradores consultan borradores" on public.tablero_publico for select to authenticated
using(exists(select 1 from public.administradores where user_id = (select auth.uid())));
update public.tablero_publico b set personas = coalesce((
 select jsonb_agg(p - 'habitacion') from jsonb_array_elements(b.personas) p
),'[]'::jsonb);
commit;
