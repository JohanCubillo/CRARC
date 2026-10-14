-- Ejecutar después de admin.sql. Conserva las estadías existentes.
begin;
create table if not exists public.habitaciones (
 id uuid primary key default gen_random_uuid(),
 nombre text not null unique check(length(trim(nombre)) between 1 and 100),
 capacidad integer not null check(capacidad between 1 and 1000),
 habilitada boolean not null default true
);
alter table public.estadias add column if not exists habitacion_id uuid references public.habitaciones(id) on delete restrict;
create index if not exists estadias_habitacion_fechas on public.estadias(habitacion_id,llegada,salida);
alter table public.habitaciones enable row level security;
drop policy if exists habitaciones_admin on public.habitaciones;
create policy habitaciones_admin on public.habitaciones for all to authenticated
 using(exists(select 1 from public.administradores where user_id=auth.uid()))
 with check(exists(select 1 from public.administradores where user_id=auth.uid()));
grant select,insert,update,delete on public.habitaciones to authenticated;

create or replace function public.ocupacion_habitacion(p_id uuid,p_nombre text,p_llegada date,p_salida date,p_excluir uuid default null)
returns integer language sql volatile security definer set search_path=public as $$
 with eventos as (
 select greatest(llegada,p_llegada) fecha,1 cambio from estadias
 where (habitacion_id=p_id or (habitacion_id is null and habitacion=p_nombre))
 and (p_excluir is null or id<>p_excluir) and llegada<p_salida and salida>p_llegada
 union all
 select least(salida,p_salida),-1 from estadias
 where (habitacion_id=p_id or (habitacion_id is null and habitacion=p_nombre))
 and (p_excluir is null or id<>p_excluir) and llegada<p_salida and salida>p_llegada
 ), diario as(select fecha,sum(cambio) cambio from eventos group by fecha),
 acumulado as(select sum(cambio) over(order by fecha) ocupados from diario)
 select coalesce(max(ocupados),0)::integer from acumulado;
$$;
revoke all on function public.ocupacion_habitacion(uuid,text,date,date,uuid) from public,anon,authenticated;

create or replace function public.disponibilidad_habitaciones(p_llegada date,p_salida date,p_personas integer default 1)
returns table(habitacion_id uuid,nombre text,capacidad integer,cupos integer,disponible boolean)
language plpgsql stable security definer set search_path=public as $$
begin
 if p_llegada is null or p_salida is null or p_salida<=p_llegada or p_personas is null or p_personas<1 or p_personas>1000 then
 raise exception 'Indica fechas válidas y una cantidad de personas mayor a cero.';
 end if;
 return query select h.id,h.nombre,h.capacidad,
 case when h.habilitada then greatest(0,h.capacidad-o.ocupados) else 0 end,
 h.habilitada and h.capacidad-o.ocupados>=p_personas
 from habitaciones h cross join lateral (select ocupacion_habitacion(h.id,h.nombre,p_llegada,p_salida) ocupados) o order by h.nombre;
end;
$$;
revoke all on function public.disponibilidad_habitaciones(date,date,integer) from public;
grant execute on function public.disponibilidad_habitaciones(date,date,integer) to anon,authenticated;

create or replace function public.validar_cupo_estadia()
returns trigger language plpgsql security definer set search_path=public as $$
declare cuarto habitaciones;
begin
 -- Las filas anteriores sin vínculo se conservan; las nuevas requieren un cuarto.
 if new.habitacion_id is null then
   if TG_OP='INSERT' or old.habitacion_id is not null or new.habitacion is distinct from old.habitacion or new.llegada is distinct from old.llegada or new.salida is distinct from old.salida then
     raise exception 'Selecciona una habitación registrada antes de guardar estas fechas.';
   end if;
   return new;
 end if;
 select * into cuarto from habitaciones where id=new.habitacion_id for update;
 if not found then raise exception 'La habitación no existe.'; end if;
 if not cuarto.habilitada and (TG_OP='INSERT' or new.habitacion_id is distinct from old.habitacion_id or new.llegada is distinct from old.llegada or new.salida is distinct from old.salida) then raise exception 'Esta habitación no está disponible.'; end if;
 if ocupacion_habitacion(cuarto.id,cuarto.nombre,new.llegada,new.salida,new.id)+1>cuarto.capacidad then
 raise exception 'No quedan cupos en esta habitación para las fechas seleccionadas.'; end if;
 new.habitacion=cuarto.nombre; return new;
end;
$$;
drop trigger if exists validar_cupo_estadia on public.estadias;
create trigger validar_cupo_estadia before insert or update on public.estadias for each row execute function public.validar_cupo_estadia();

create or replace function public.validar_capacidad_habitacion()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if ocupacion_habitacion(new.id,case when TG_OP='UPDATE' then old.nombre else new.nombre end,current_date,'infinity'::date)>new.capacidad then
 raise exception 'La capacidad es menor que las estadías actuales o futuras. Reasigna esas personas primero.'; end if;
 if TG_OP='UPDATE' and new.nombre is distinct from old.nombre and exists(select 1 from estadias where habitacion_id=new.id or (habitacion_id is null and habitacion=old.nombre)) then
 raise exception 'Esta habitación tiene estadías registradas. Conserva su nombre para mantener el vínculo.';
 end if;
 return new;
end;
$$;
drop trigger if exists validar_capacidad_habitacion on public.habitaciones;
create trigger validar_capacidad_habitacion before insert or update on public.habitaciones for each row execute function public.validar_capacidad_habitacion();
revoke all on function public.validar_cupo_estadia() from public;
revoke all on function public.validar_capacidad_habitacion() from public;
commit;
notify pgrst,'reload schema';

