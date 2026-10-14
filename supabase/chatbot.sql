-- Límite persistente. Solo la función de servidor puede utilizarlo.
begin;
create table if not exists public.chat_limites(cliente text not null,ventana timestamptz not null,cantidad integer not null default 0,primary key(cliente,ventana));
alter table public.chat_limites enable row level security;
revoke all on public.chat_limites from anon,authenticated;
create or replace function public.permitir_chat(p_cliente text)
returns boolean language plpgsql security definer set search_path=public as $$
declare minuto timestamptz=date_trunc('minute',now());hora timestamptz=date_trunc('hour',now());dia timestamptz=date_trunc('day',now());n integer;
begin
 if p_cliente is null or p_cliente !~ '^[a-f0-9]{64}$' then return false; end if;
 -- Un bloqueo serializa también el presupuesto global: 300 consultas al día.
 perform pg_advisory_xact_lock(73918261);
 delete from chat_limites where ventana<dia;
 select cantidad into n from chat_limites where cliente='global' and ventana=dia;
 if coalesce(n,0)>=300 then return false;end if;
 select coalesce(sum(cantidad),0) into n from chat_limites where cliente=p_cliente and ventana>=hora;
 if n>=40 then return false;end if;
 select cantidad into n from chat_limites where cliente=p_cliente and ventana=minuto;
 if coalesce(n,0)>=10 then return false;end if;
 insert into chat_limites values(p_cliente,minuto,1) on conflict(cliente,ventana) do update set cantidad=chat_limites.cantidad+1;
 insert into chat_limites values('global',dia,1) on conflict(cliente,ventana) do update set cantidad=chat_limites.cantidad+1;
 return true;
end;
$$;
revoke all on function public.permitir_chat(text) from public,anon,authenticated;
grant execute on function public.permitir_chat(text) to service_role;
commit;
notify pgrst,'reload schema';
