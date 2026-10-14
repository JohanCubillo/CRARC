// La clave de Groq se configura como secreto GROQ_API_KEY en Supabase.
const origins = new Set(['https://johancubillo.github.io','https://www.costaricaanimalesrescuecenter.org','https://costaricaanimalesrescuecenter.org']);
const knowledge = `Eres el asistente del Costa Rica Animal Rescue Center (CRARC). Responde brevemente en el idioma del visitante. El centro rescata y rehabilita vida silvestre y mantiene un santuario para animales que no pueden volver a la naturaleza. Está en Cebadilla de Turrúcares, Alajuela, Costa Rica. Visitas: lunes a domingo de 8:00 a 16:00. Recorrido aproximado de una hora con guía. Entradas: nacionales adultos ₡6.000 y niños ₡4.000; extranjeros adultos USD20 y niños USD10. Se puede consultar por voluntariado, visitas y giras educativas en conocenos.html#contacto. Apadrinamientos: botones PayPal o SINPE de cada animal en la página; el equipo verifica los comprobantes. No confirmes pagos ni reservas. Para habitaciones pide fechas de llegada y salida y cantidad de personas y recomienda usar Consultar habitaciones en este chat. No inventes disponibilidad, precios de alojamiento, enlaces de pago ni nombres de huéspedes. Si no sabes un dato, remite al formulario de contacto. Nunca solicites contraseñas, tarjetas ni claves. No tienes acceso a datos personales ni puedes modificar registros.`;
Deno.serve(async req => {
 const origin=req.headers.get('origin')||'';
 const headers={'Access-Control-Allow-Origin':origins.has(origin)?origin:'https://johancubillo.github.io','Access-Control-Allow-Headers':'content-type, apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Content-Type':'application/json'};
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(!origins.has(origin)) return reply({error:'Origen no permitido.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Método no permitido.'},405);
 const key=Deno.env.get('GROQ_API_KEY'),url=Deno.env.get('SUPABASE_URL'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!key || !url || !service)return reply({error:'El asistente todavía no está activado. Usa el formulario de contacto.'},503);
 try{
   const raw=await req.text();if(raw.length>18000)return reply({error:'El mensaje es demasiado largo.'},413);
   const body=JSON.parse(raw);
   if(!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>12||body.messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>1200)||body.messages.at(-1).role!=='user')return reply({error:'Mensaje inválido.'},400);
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
   const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+ip));
   const token=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
   const budget=await fetch(url+'/rest/v1/rpc/permitir_chat',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({p_cliente:token}),signal:AbortSignal.timeout(10000)});
   if(!budget.ok)return reply({error:'El asistente requiere configuración. Usa el formulario de contacto.'},503);
   if(await budget.json()!==true)return reply({error:'Llegamos al límite de consultas. Intenta más tarde o usa el formulario de contacto.'},429);
   let rooms=null;
   if(body.arrival || body.departure){
     const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
     if(!date(body.arrival)||!date(body.departure)||body.departure<=body.arrival||!Number.isInteger(body.people)||body.people<1||body.people>1000)return reply({error:'Revisa las fechas y cantidad de personas.'},400);
     const response=await fetch(url+'/rest/v1/rpc/disponibilidad_habitaciones',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({p_llegada:body.arrival,p_salida:body.departure,p_personas:body.people}),signal:AbortSignal.timeout(10000)});
     if(!response.ok)return reply({error:'No pudimos verificar los cuartos. Contacta al equipo; no podemos confirmar disponibilidad.'},503);
     rooms=await response.json();
     // Se presenta el resultado exacto: la IA no decide ni confirma reservas.
     return reply({answer:`Disponibilidad consultada del ${body.arrival} al ${body.departure} para ${body.people} persona(s). Cada habitación indica si puede alojar a todo el grupo. Esto no bloquea cupos ni confirma una reserva. Para reservar, envía el formulario de contacto.`,rooms});
   }
   const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:Deno.env.get('GROQ_MODEL')||'llama-3.3-70b-versatile',messages:[{role:'system',content:knowledge},...body.messages],temperature:0.2,max_completion_tokens:500}),signal:AbortSignal.timeout(25000)});
   if(!response.ok)return reply({error:'El asistente no puede responder ahora. Intenta más tarde o usa el formulario de contacto.'},response.status===429?429:502);
   const data=await response.json(),answer=data.choices?.[0]?.message?.content;
   if(typeof answer!=='string'||!answer.trim())throw new Error('empty');
   return reply({answer});
 }catch{ return reply({error:'No pudimos responder. Intenta nuevamente o usa el formulario de contacto.'},502); }
});
