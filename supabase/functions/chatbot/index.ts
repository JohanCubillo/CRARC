// La clave de Groq se configura como secreto GROQ_API_KEY en Supabase.
const origins = new Set(['https://johancubillo.github.io','https://www.costaricaanimalesrescuecenter.org','https://costaricaanimalesrescuecenter.org']);
const volunteerInfo={"instalaciones": ["Lavadora y tendedero", "Refrigeradora", "Electricidad", "Servicios y duchas", "WiFi", "Piscina", "Área común", "Hamacas"], "dormitorios": ["Habitaciones de 6 a 12 camas", "Incluimos sábanas y mosquitero", "Las cobijas NO están incluidas"], "que_traer": ["Linterna frontal para moverte de noche", "Botas de montaña o tenis", "Toalla propia para ducharte o nadar", "Mosquitero nuevo y ropa abrigada para dormir (o una cobija: de noche refresca)"], "horario_orientativo": ["7:00 am: Desayuno", "8:00 am: Reunión obligatoria", "8:30 – 11:00 am: Trabajo: tareas generales y proyectos", "11:00 am – 1:30 pm: Tiempo libre", "12:00 pm: Almuerzo", "1:30 pm: Reunión obligatoria", "2:00 – 5:00 pm: Trabajo: tareas generales y proyectos", "4:00 pm: Criaturas nocturnas", "6:00 pm: Cena", "Después: Tiempo libre el resto del día"], "contacto": "volunteering@costaricaanimalrescuecenter.org; WhatsApp +506 8522-8125", "participar": "Formulario en conocenos.html#contacto. Las tareas y días libres dependen del tablero turnos.html. No hay requisitos de edad, estancia mínima ni reglas de internados confirmados; consultar al equipo.", "actividades_tiempo_libre": ["Noches de película cuando quieran, utilizando el proyector del centro.", "Noches de karaoke los jueves.", "Noches de bar los sábados.", "Piscina siempre que las personas estén en su tiempo libre."], "donar_frutas_o_alimentos": "Si alguien quiere donar frutas o alimentos, invítalo a contactar al centro por WhatsApp https://wa.me/50685228125 para coordinar qué necesitan y la entrega. No inventes alimentos aceptados, cantidades ni horarios de recepción."};
const knowledge = `Eres Queso, el asistente del Costa Rica Animal Rescue Center (CRARC). El centro SÍ tiene piscina. Cuando te pregunten si hay piscina, responde que sí. La piscina puede usarse cuando las personas estén en su tiempo libre. No inventes otras reglas ni costos. Actividades: películas con el proyector cuando quieran, karaoke los jueves y noches de bar los sábados. No inventes horas exactas ni precios de estas actividades. Si no tienes información de una instalación o servicio, no afirmes que no existe; indica que el equipo debe confirmarlo. Responde brevemente en el idioma del visitante. El centro rescata y rehabilita vida silvestre y mantiene un santuario para animales que no pueden volver a la naturaleza. Está en Cebadilla de Turrúcares, Alajuela, Costa Rica. Visitas: lunes a domingo de 8:00 a 16:00. Recorrido aproximado de una hora con guía. Entradas: nacionales adultos ₡6.000 y niños ₡4.000; extranjeros adultos USD20 y niños USD10. Se puede consultar por voluntariado, visitas y giras educativas en conocenos.html#contacto. Apadrinamientos: botones PayPal o SINPE de cada animal en la página; el equipo verifica los comprobantes. No confirmes pagos ni reservas. Tarifas de alojamiento para voluntariado por noche: habitación compartida USD50, privada USD70 y hotel USD95. Son tarifas de voluntariado, no entradas para visitantes. No uses tarifas de visitantes para cotizar voluntariado. No presupongas si el precio es por persona o por habitación; el equipo debe confirmar esa condición. Para habitaciones pide llegada, salida y cantidad de personas. Cuando tengas estos tres datos, llama consultar_habitaciones EN ESTA RESPUESTA. Convierte mañana y otras fechas relativas usando la fecha actual proporcionada. Si un rango es ambiguo, pide las fechas exactas antes de consultar. No digas que estás verificando, que responderás después ni que esperen: no trabajas en segundo plano. Si una respuesta anterior prometió verificar, corrígela y ejecuta la herramienta con los datos del historial, o pide los datos faltantes. No presentes disponibilidad sin una consulta ejecutada. Usa texto simple sin Markdown ni asteriscos. No inventes disponibilidad, precios de alojamiento, enlaces de pago ni nombres de huéspedes. Si no sabes un dato, remite al formulario de contacto. Nunca solicites contraseñas, tarjetas ni claves. No tienes acceso a datos personales ni puedes modificar registros.`;
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
   async function consultRooms(body){
     let rooms=null;
     const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
     if(!date(body.arrival)||!date(body.departure)||body.departure<=body.arrival||!Number.isInteger(body.people)||body.people<1||body.people>1000)return reply({error:'Revisa las fechas y cantidad de personas.'},400);
     const response=await fetch(url+'/rest/v1/rpc/disponibilidad_habitaciones',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({p_llegada:body.arrival,p_salida:body.departure,p_personas:body.people}),signal:AbortSignal.timeout(10000)});
     if(!response.ok)return reply({error:'No pudimos verificar los cuartos. Contacta al equipo; no podemos confirmar disponibilidad.'},503);
     rooms=await response.json();
     // Se presenta el resultado exacto: la IA no decide ni confirma reservas.
     return reply({answer:`Disponibilidad consultada del ${body.arrival} al ${body.departure} para ${body.people} persona(s). Cada habitación indica si puede alojar a todo el grupo. Esto no bloquea cupos ni confirma una reserva. Para reservar, envía el formulario de contacto.`,rooms});
   }
   if(body.arrival || body.departure)return await consultRooms(body);
   const currentDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
   const tools=[{type:'function',function:{name:'consultar_habitaciones',description:'Consultar ahora los cupos reales para fechas exactas. Requiere llegada, salida y personas, sin inventar datos.',parameters:{type:'object',properties:{arrival:{type:'string',description:'Llegada YYYY-MM-DD'},departure:{type:'string',description:'Salida YYYY-MM-DD; es exclusiva'},people:{type:'integer',minimum:1,maximum:1000}},required:['arrival','departure','people'],additionalProperties:false}}}];
   const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:Deno.env.get('GROQ_MODEL')||'openai/gpt-oss-120b',messages:[{role:'system',content:knowledge+' Información de voluntariado.html: '+JSON.stringify(volunteerInfo)+' El horario laboral del voluntariado no es el horario de visitas. Las reuniones son obligatorias. Se recomienda confirmar con el equipo si se debe traer mosquitero propio, ya que se proporciona uno y la lista sugiere uno nuevo. Fecha actual en Costa Rica: '+currentDate},...body.messages],tools,tool_choice:'auto',temperature:0.2,max_completion_tokens:1500,reasoning_effort:'low'}),signal:AbortSignal.timeout(25000)});
   if(!response.ok){
     let detail={};try{detail=await response.json();}catch{}
     console.error('Groq request rejected',JSON.stringify({status:response.status,code:detail.error?.code,type:detail.error?.type}));
     const errors={401:'Groq rechazó la clave API. Actualiza GROQ_API_KEY en Secrets.',403:'Groq no permite esta petición. Revisa los permisos y el estado de la cuenta.',404:'El modelo configurado no está disponible en Groq.',429:'Groq alcanzó su límite de consultas. Intenta más tarde.'};
     return reply({error:errors[response.status]||'Groq rechazó la consulta. Revisa Logs de la función chatbot.'},response.status===429?429:502);
   }
   const data=await response.json(),message=data.choices?.[0]?.message;
   if(message?.tool_calls?.length){
     const call=message.tool_calls[0];
     if(call.function?.name!=='consultar_habitaciones')return reply({error:'No pudimos verificar esa consulta. Usa Consultar habitaciones.'},502);
     let args;try{args=JSON.parse(call.function.arguments);}catch{return reply({error:'Revisa las fechas en Consultar habitaciones.'},400);}
     return await consultRooms(args);
   }
   let answer=message?.content;
   if(typeof answer!=='string'||!answer.trim())throw new Error('empty');
   if(/(estoy|estamos|voy a|vamos a)\s+(consult|verific|revis)|en breve.{0,35}confirm|esper[ae].{0,25}momento/i.test(answer))answer='Para verificar cupos necesito llegada, salida y cantidad de personas. Puedes escribir esos datos aquí o usar Consultar habitaciones. La consulta se realiza al enviar; no queda una verificación pendiente.';
   return reply({answer});
 }catch{ return reply({error:'No pudimos responder. Intenta nuevamente o usa el formulario de contacto.'},502); }
});
