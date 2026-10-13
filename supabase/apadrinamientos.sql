begin;
insert into public.padrinos(id,nombre,foto,orden) values
 ('a1','Grumpy','images/animals/grumpybebe.jpeg',1),('a2','Sharleen','images/animals/eyes.jpeg',2),
 ('a3','Lola','images/animals/lola.jpeg',3),('a4','Gandy','images/animals/ghandy.jpeg',4),
 ('a5','Daniel','images/animals/daniel.jpeg',5),('a6','Bamboo','images/animals/toro.jpeg',6)
on conflict(id) do nothing;
grant select,insert,update on public.padrinos to authenticated;
drop policy if exists "Administrar animales padrinos" on public.padrinos;
create policy "Administrar animales padrinos" on public.padrinos for all to authenticated
using(exists(select 1 from public.administradores where user_id=(select auth.uid())))
with check(exists(select 1 from public.administradores where user_id=(select auth.uid())));
create table if not exists public.apadrinamientos_sinpe (
 id uuid primary key,
 animal_id text not null references public.padrinos(id),
 nombre text not null check(length(trim(nombre)) between 1 and 200),
 email text not null check(length(email) between 3 and 320 and position('@' in email)>1),
 monto numeric(14,2) not null check(monto>0),
 fecha date not null,
 referencia text not null unique check(length(trim(referencia)) between 3 and 100),
 comprobante text not null,
 estado text not null default 'pendiente' check(estado in ('pendiente','aceptado','rechazado')),
 created_at timestamptz not null default now(),
 revisado_at timestamptz,
 revisado_por uuid references auth.users(id),
 movimiento_id uuid unique references public.movimientos(id),
 check(comprobante ~ ('^'||id::text||'/comprobante\.(jpg|png|pdf)$'))
);
alter table public.apadrinamientos_sinpe enable row level security;
revoke all on public.apadrinamientos_sinpe from anon,authenticated;
grant insert(id,animal_id,nombre,email,monto,fecha,referencia,comprobante) on public.apadrinamientos_sinpe to anon;
grant select on public.apadrinamientos_sinpe to authenticated;
drop policy if exists "Reportar SINPE" on public.apadrinamientos_sinpe;
create policy "Reportar SINPE" on public.apadrinamientos_sinpe for insert to anon
with check(estado='pendiente' and exists(select 1 from public.padrinos p where p.id=animal_id and p.activo));
drop policy if exists "Revisar SINPE privados" on public.apadrinamientos_sinpe;
create policy "Revisar SINPE privados" on public.apadrinamientos_sinpe for select to authenticated
using(exists(select 1 from public.administradores where user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('comprobantes-sinpe','comprobantes-sinpe',false,5242880,array['image/jpeg','image/png','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Enviar comprobante SINPE" on storage.objects;
create policy "Enviar comprobante SINPE" on storage.objects for insert to anon
with check(bucket_id='comprobantes-sinpe' and name ~ '^[0-9a-f-]{36}/comprobante\.(jpg|png|pdf)$');
drop policy if exists "Administradores ven comprobantes" on storage.objects;
create policy "Administradores ven comprobantes" on storage.objects for select to authenticated
using(bucket_id='comprobantes-sinpe' and exists(select 1 from public.administradores where user_id=(select auth.uid())));
create or replace function public.revisar_sinpe(p_id uuid,p_aceptar boolean)
returns text language plpgsql security definer set search_path=pg_catalog
as $$
declare payment public.apadrinamientos_sinpe%rowtype; movement uuid; animal_name text;
begin
 if not exists(select 1 from public.administradores where user_id=auth.uid()) then raise exception 'Sin autorización'; end if;
 if p_aceptar is null then raise exception 'Selecciona aceptar o rechazar'; end if;
 select * into payment from public.apadrinamientos_sinpe where id=p_id for update;
 if not found then raise exception 'Reporte no encontrado'; end if;
 if payment.estado<>'pendiente' then return payment.estado; end if;
 if p_aceptar then
  select nombre into animal_name from public.padrinos where id=payment.animal_id;
  insert into public.movimientos(tipo,fecha,concepto,categoria,monto,moneda)
  values('ingreso',payment.fecha,'Apadrinamiento SINPE: '||animal_name,'Donaciones',payment.monto,'CRC') returning id into movement;
 end if;
 update public.apadrinamientos_sinpe set estado=case when p_aceptar then 'aceptado' else 'rechazado' end,
 revisado_at=now(),revisado_por=auth.uid(),movimiento_id=movement where id=p_id;
 return case when p_aceptar then 'aceptado' else 'rechazado' end;
end;
$$;
revoke all on function public.revisar_sinpe(uuid,boolean) from public;
grant execute on function public.revisar_sinpe(uuid,boolean) to authenticated;
commit;
