# SEO del dominio definitivo

Dominio: https://fundacioncrarc.org/
Sitemap: https://fundacioncrarc.org/sitemap.xml
Robots: https://fundacioncrarc.org/robots.txt

El archivo CNAME conserva fundacioncrarc.org. GitHub Pages debe mantener activado Enforce HTTPS cuando esté disponible.

## Google y Bing
1. Agregar fundacioncrarc.org en Google Search Console. Para una propiedad de dominio, copiar el registro TXT exacto que Google proporciona y añadirlo en GoDaddy sin eliminar los TXT existentes. También se puede verificar una propiedad de prefijo https://fundacioncrarc.org/ mediante etiqueta o archivo HTML.
2. Enviar sitemap.xml desde Search Console y solicitar indexación de portada, voluntariado, donaciones y Conócenos.
3. Agregar el dominio en Bing Webmaster Tools, importar la propiedad verificada si corresponde y enviar el sitemap.
4. Si se había verificado e indexado el sitio de GitHub Pages, revisar sus redirecciones y el procedimiento de cambio de dirección de Search Console antes de tramitarlo.

## Queso
El código actualizado en supabase/functions/chatbot/index.ts permite fundacioncrarc.org y www.fundacioncrarc.org, conservando el origen anterior. Reemplazar el código de la función chatbot en Supabase y desplegar. No cambiar los secretos de Groq ni los datos de la base.

## Contenido
El español está presente en el HTML. Para posicionar versiones en inglés se necesitan URLs traducidas independientes. index2.html, admin.html y turnos.html conservan noindex. Las canónicas, Open Graph y datos estructurados apuntan al dominio definitivo. Actualizar el HTML inicial y el diccionario de idiomas al modificar el contenido.
