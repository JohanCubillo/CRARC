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

## Comprobación del 18 de octubre de 2026
- Portada, Conócenos, Voluntariado, Donaciones, robots.txt y sitemap.xml: HTTP 200; canónicas de las páginas verificadas en fundacioncrarc.org.
- Acceso declarado en robots.txt para Googlebot, bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User y PerplexityBot. Esto no demuestra que esos servicios hayan visitado o indexado el sitio.
- Preguntas frecuentes visibles en voluntariado y traducidas con el selector. No se añadieron archivos llms.txt ni promesas de posicionamiento: Google no requiere archivos especiales para sus funciones de IA.
- Pendiente: prueba de propiedad en Google Search Console mediante TXT real generado por la cuenta del usuario; envío del sitemap allí y en Bing Webmaster Tools. No se han enviado desde esta sesión por falta de propiedad verificada.
- Recomendado después: actualizar el sitio web del perfil real de Google Business y las redes oficiales para enlazar al dominio nuevo; obtener reseñas auténticas y enlaces de organizaciones relacionadas.

Fuentes: https://developers.google.com/search/docs/appearance/ai-features y https://developers.openai.com/api/docs/bots y https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler.

## IndexNow
Se añadió indexnow-key.txt como prueba de control del sitio. tools/submit-indexnow.ps1 verifica que esté publicado y notifica las cuatro URLs del sitemap a https://api.indexnow.org/indexnow. HTTP 200 confirma recepción; HTTP 202 indica recepción pendiente de verificar la clave. Ninguno garantiza indexación. Google no usa este envío.
