# Conectar CRARC a Supabase

El cliente está configurado en `supabase-client.js` con la URL y clave pública del proyecto. No requiere contraseña de PostgreSQL ni `supabase login`.

1. En Supabase, abre **SQL Editor** y crea una consulta nueva.
2. Copia todo `supabase/schema.sql`, pégalo y pulsa **Run**.
3. Abre **Table Editor**: deben aparecer `contactos` y `padrinos`.
4. Agrega los padrinos en `padrinos`. Usa los IDs `a1` a `a6` para conservar las descripciones traducidas existentes. `foto` admite una URL o ruta de imagen del sitio; `montos` es una lista de enteros, por ejemplo `[10,25,50]`. Las filas con `activo = true` se muestran por `orden`.
5. Publica los HTML modificados y `supabase-client.js` juntos.
6. Envía un contacto de prueba desde `conocenos.html` y verifica su fila en Table Editor.

Si no hay padrinos en la tabla, se mantienen los animales predeterminados de la web. No se han migrado los datos de Google Sheets. Los contactos se administran desde el dashboard: la clave pública permite enviarlos, pero no leerlos, modificarlos ni borrarlos. Los padrinos solo admiten lectura pública; se editan desde el dashboard.

Los envíos públicos pueden recibir spam. Antes de una campaña con mucho tráfico, conviene agregar validación de CAPTCHA mediante una función de servidor.

Esta integración está preparada localmente; ejecutar el SQL y comprobar un envío real confirma la conexión. No se ha ejecutado SQL remoto ni publicado el sitio.
