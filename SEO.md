# Activar la indexación

Base: https://johancubillo.github.io/CRARC/
Sitemap: https://johancubillo.github.io/CRARC/sitemap.xml

1. En Google Search Console agrega una propiedad de prefijo de URL con la base. Verifica mediante etiqueta o archivo HTML: hay que publicar el código exacto generado por Google antes de verificar. No inventar códigos.
2. En Sitemaps envía la URL completa del sitemap. Inspecciona portada y voluntariado.html para solicitar indexación. Google decide si indexa y cuándo; no es inmediato ni garantizado.
3. En Bing Webmaster Tools importa la propiedad de Search Console ya verificada o verifica por separado. Envía el sitemap.
4. El español ahora está en el HTML y se conserva traducción por JavaScript. Para posicionar versiones en inglés hay que crear URLs separadas. No se añadieron hreflang ficticios.
5. index2.html, admin.html y turnos.html tienen noindex. Esto evita su indexación; no constituye seguridad ni control de acceso.
6. GitHub Pages usa /CRARC/. Los robots buscan /robots.txt en la raíz del dominio; /CRARC/robots.txt no controla este proyecto. Si se puede administrar johancubillo.github.io, allí se puede publicar robots.txt con el sitemap. Al pasar a dominio propio actualizar canónicas, sitemap y datos estructurados y crear robots.txt en su raíz.
7. Los datos estructurados no incluyen reseñas inventadas ni disponibilidad de cuartos. En futuras modificaciones actualizar el HTML inicial y el diccionario de idiomas.

Documentación: https://developers.google.com/search/docs/fundamentals/seo-starter-guide y https://www.bing.com/webmasters/.
