-- Tablero calculado en cada consulta. No requiere cron ni publicación diaria.
create or replace function public.tablero_del_dia(p_fecha date default null)
returns jsonb
language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare
 target_day date := coalesce(p_fecha,(now() at time zone 'America/Costa_Rica')::date);
 current_day date := (now() at time zone 'America/Costa_Rica')::date;
 day date;
 work jsonb := '{}'::jsonb;
 last_tasks jsonb := '{}'::jsonb;
 available_count integer;
 feeding_target integer;
 fixed_feeding integer;
 feeding_slots integer;
 ordinal integer;
 offset_count integer;
 item record;
 assigned_count integer;
 task text;
 feeding text := 'Alimentar animales';
 preparation text := 'Cortar frutas y preparar alimentos';
 leader_delivery text;
 leader_kitchen text;
 result jsonb;
begin
 if target_day < current_day - 31 or target_day > current_day + 31 then
  raise exception 'El tablero permite consultar hasta 31 días antes o después de hoy';
 end if;
 select min(s.llegada) into day from public.estadias s where s.llegada <= target_day;
 while day is not null and day <= target_day loop
  select coalesce(jsonb_object_agg(s.id::text,jsonb_build_object(
   'libre',coalesce(t.libre,s.dia_libre = extract(dow from day)::integer,false),
   'manana','', 'tarde',coalesce(t.tarde,''),
   'saved',t.id is not null
  )),'{}'::jsonb) into work
  from public.estadias s
  left join public.turnos t on t.estadia_id=s.id and t.fecha=day
  where s.llegada <= day and day < s.salida;
  select count(*) into available_count from jsonb_each(work) w where not (w.value->>'libre')::boolean;
  ordinal := floor(extract(epoch from (day::timestamp at time zone 'UTC')) / 86400)::integer;
  offset_count := case when available_count=0 then 0 else ordinal % available_count end;
  feeding_target := case when ordinal % 2=0 then (available_count+1)/2 else available_count/2 end;
  select count(*) into fixed_feeding from jsonb_each(work) w
   where not (w.value->>'libre')::boolean and (w.value->>'saved')::boolean and w.value->>'tarde'=feeding;
  feeding_slots := greatest(0,feeding_target-fixed_feeding);
  assigned_count := 0;
  for item in
   select a.key,a.value from (
    select w.key,w.value,row_number() over(order by w.key)-1 as position
    from jsonb_each(work) w where not (w.value->>'libre')::boolean
   ) a
   where not ((a.value->>'saved')::boolean and a.value->>'tarde' in (feeding,preparation))
   order by case last_tasks->>a.key when preparation then 0 when feeding then 2 else 1 end,
    (a.position-offset_count+available_count) % greatest(available_count,1)
  loop
   task := case when assigned_count < feeding_slots then feeding else preparation end;
   work := jsonb_set(work,array[item.key,'tarde'],to_jsonb(task));
   assigned_count := assigned_count+1;
  end loop;
  for item in select w.key,w.value from jsonb_each(work) w loop
   if (item.value->>'libre')::boolean then
    work := jsonb_set(jsonb_set(work,array[item.key,'manana'],'""'::jsonb),array[item.key,'tarde'],'""'::jsonb);
   else
    task := item.value->>'tarde';
    work := jsonb_set(work,array[item.key,'manana'],to_jsonb(case when task=feeding then preparation else feeding end));
    last_tasks := jsonb_set(last_tasks,array[item.key],to_jsonb(task),true);
   end if;
  end loop;
  day := day+1;
 end loop;
 -- Mantener la última elección administrativa mientras ambos sigan disponibles.
 select e.alimentacion::text,e.preparacion::text into leader_delivery,leader_kitchen
 from public.encargados e where e.fecha <= target_day order by e.fecha desc limit 1;
 if not coalesce(work ? leader_delivery,false) or coalesce((work->leader_delivery->>'libre')::boolean,true) then leader_delivery:=null; end if;
 if not coalesce(work ? leader_kitchen,false) or coalesce((work->leader_kitchen->>'libre')::boolean,true) then leader_kitchen:=null; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'nombre',s.nombre,'libre',(w.value->>'libre')::boolean,
  'manana',w.value->>'manana','tarde',w.value->>'tarde','saved',(w.value->>'saved')::boolean,
  'encargado',coalesce(s.id::text in (leader_delivery,leader_kitchen),false),
  'rol_encargado',case when s.id::text=leader_kitchen then 'Cocina' when s.id::text=leader_delivery then 'Repartición y limpieza' else '' end
 ) order by s.nombre),'[]'::jsonb) into result
 from jsonb_each(work) w join public.estadias s on s.id::text=w.key;
 return jsonb_build_object('fecha',target_day,'personas',result,'calculado_at',now());
end;
$$;
revoke all on function public.tablero_del_dia(date) from public;
grant execute on function public.tablero_del_dia(date) to anon, authenticated;
