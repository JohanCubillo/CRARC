-- Copia pública del tablero; las tablas administrativas siguen privadas.
begin;
create table if not exists public.tablero_publico (
 fecha date primary key,
 personas jsonb not null default '[]'::jsonb check(jsonb_typeof(personas) = 'array'),
 actualizado_at timestamptz not null default now()
);
alter table public.tablero_publico enable row level security;
revoke all on public.tablero_publico from anon, authenticated;
grant select on public.tablero_publico to anon, authenticated;
grant insert, update on public.tablero_publico to authenticated;
drop policy if exists "Consultar tablero publicado" on public.tablero_publico;
create policy "Consultar tablero publicado" on public.tablero_publico for select to anon, authenticated using (true);
drop policy if exists "Publicar tablero como administrador" on public.tablero_publico;
create policy "Publicar tablero como administrador" on public.tablero_publico for insert to authenticated
with check (exists(select 1 from public.administradores where user_id = (select auth.uid())));
drop policy if exists "Actualizar tablero como administrador" on public.tablero_publico;
create policy "Actualizar tablero como administrador" on public.tablero_publico for update to authenticated
using (exists(select 1 from public.administradores where user_id = (select auth.uid())))
with check (exists(select 1 from public.administradores where user_id = (select auth.uid())));
commit;
