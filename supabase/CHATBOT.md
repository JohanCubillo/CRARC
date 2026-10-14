# Activar el asistente Groq

1. Revoca cualquier clave de Groq compartida en el chat y crea otra en https://console.groq.com/keys. No la agregues al repositorio.
2. En SQL Editor ejecuta `habitaciones.sql` (si falta) y `chatbot.sql`.
3. Supabase → Edge Functions → Secrets: agrega `GROQ_API_KEY` con la nueva clave. Opcional: `GROQ_MODEL`, por defecto `openai/gpt-oss-120b`. Supabase proporciona `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` al servidor.
4. Edge Functions → crea una función desde el editor llamada exactamente `chatbot`. Pega `functions/chatbot/index.ts` y despliega. Desactiva “Verify JWT / Verify JWT with legacy secret”, pues la consulta es pública. No pegues la clave en el editor.
5. Abre `index2.html`, pulsa “¿Tienes dudas?” y prueba una pregunta. En “Consultar habitaciones” prueba fechas con estadías y sin ellas.

Con CLI autenticada, alternativa: `supabase functions deploy chatbot --project-ref jiigafsjrrcndmjfassc --no-verify-jwt`.

Las consultas de cuartos leen datos reales; no crean reservas ni escriben estadías. Solo se presentan nombres de habitaciones, capacidad y cupos. La función no consulta huéspedes, pagos ni formularios. Límites propios: 10 consultas por minuto y 40 por hora por IP, y 300 diarias en total. Los límites de Groq también aplican. No se guardan mensajes en la base de datos; las preguntas generales se envían a Groq. El chat aparece en las dos páginas de inicio.

La restricción de origen limita navegadores, pero no sustituye autenticación ni protección contra bots. Para mayor tráfico considera CAPTCHA. Los límites globales evitan uso sin presupuesto ilimitado.

Documentación: https://supabase.com/docs/guides/functions/secrets y https://console.groq.com/docs/text-chat.


Actualización: el asistente consulta habitaciones también mediante conversación cuando cuenta con fechas y personas. Hoy se calcula en Costa Rica; pide aclaración para fechas ambiguas. Tarifas de voluntariado: compartida USD50, privada USD70, hotel USD95 por noche. Estas tarifas se distinguen de las entradas de visitantes.
