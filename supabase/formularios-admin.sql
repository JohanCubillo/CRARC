-- Crear almacenamiento del formulario si falta y habilitar su consulta privada.
begin;
create table if not exists public.contactos (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 nombre text not null check(length(trim(nombre)) between 1 and 200),
 email text not null check(length(email) between 3 and 320 and position('@' in email)>1),
 whatsapp text not null default '' check(length(whatsapp)<=50),
 interes text not null default '' check(length(interes)<=100),
 personas text not null default '' check(length(personas)<=20),
 dieta text not null default '' check(length(dieta)<=100),
 alergias text not null default '-' check(length(alergias)<=2000),
 idioma text not null default 'es' check(idioma in ('es','en','fr','it')),
 pagina text not null default '' check(length(pagina)<=500)
);
alter table public.contactos enable row level security;
revoke all on public.contactos from anon, authenticated;
grant insert(nombre,email,whatsapp,interes,personas,dieta,alergias,idioma,pagina) on public.contactos to anon;
grant usage on sequence public.contactos_id_seq to anon;
grant select on public.contactos to authenticated;
drop policy if exists "Web envia contactos" on public.contactos;
create policy "Web envia contactos" on public.contactos for insert to anon with check(true);
drop policy if exists "Administradores leen formularios" on public.contactos;
create policy "Administradores leen formularios" on public.contactos for select to authenticated
using(exists(select 1 from public.administradores where user_id=(select auth.uid())));
commit;
