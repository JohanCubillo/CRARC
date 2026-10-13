# Formularios recibidos

El formulario de `conocenos.html` envía a `contactos` mediante `supabase-client.js`. No se conecta a Google Sheets para guardar nuevos envíos. Los envíos desde WhatsApp también intentan guardar la consulta, pero abrir WhatsApp no garantiza que se guardó.

Ejecuta `formularios-admin.sql` en SQL Editor. Crea `contactos` si falta y permite consulta solo a usuarios incluidos en `administradores`. Conserva los registros existentes. Después recarga administración y abre **Formularios recibidos**. Puedes buscar por nombre, correo o WhatsApp y filtrar por interés. Los detalles incluyen número de personas, dieta, alergias, idioma y página de origen. Nada de esto aparece en Turnos.

Envía una consulta real de prueba desde `conocenos.html` y pulsa **Actualizar consultas** en administración. La integración preparada localmente no confirma un envío real hasta verificar esa fila. Los contactos históricos de Google Sheets no se han importado. Recibir una consulta no crea automáticamente una estadía.
