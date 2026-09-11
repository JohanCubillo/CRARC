# CRAC Web — Guía de despliegue

Tres partes: **A)** conectar el formulario a Google Sheets, **B)** publicar en GitHub Pages, **C)** apuntar el dominio desde Squarespace.

---

## A) Formulario → Google Sheets (base de datos)

Hacerlo **con la cuenta Google del centro** (así los datos quedan en manos de ellos).

1. Crear una hoja nueva en [sheets.google.com](https://sheets.google.com). Nombre sugerido: `CRAC - Contactos Web`.
2. En la hoja: **Extensiones → Apps Script**. Borrar lo que aparezca y pegar todo el contenido de `codigo-apps-script.gs`. Guardar (Ctrl+S).
3. **Implementar → Nueva implementación → ⚙️ → Aplicación web**:
   - Descripción: `Formulario web`
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario** ← importante, si no el formulario no puede escribir
4. Autorizar los permisos que pide (avisará que la app "no está verificada": *Configuración avanzada → Ir a... (no seguro)* → Permitir. Es normal, es tu propio script).
5. Copiar la **URL de la aplicación web** (termina en `/exec`).
6. En `conocenos.html`, pegarla en la constante del inicio:
   ```js
   const SHEETS_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
   ```
7. Probar: llenar el formulario → "Enviar" → debe aparecer la fila en la hoja y llegar el correo de aviso.

Notas:
- Si cambiás el código del script después, hay que hacer **Implementar → Administrar implementaciones → editar → Nueva versión** (no basta con guardar).
- El correo de aviso se cambia en `NOTIFY_EMAIL` dentro del script (o `""` para desactivarlo).
- El botón de WhatsApp funciona siempre, sin configurar nada. El número se cambia en `WHATSAPP_NUMBER` (en ambos HTML).

---

## B) Publicar en GitHub Pages (gratis)

1. Crear un repo (o usar uno existente) y subir: `index.html`, `conocenos.html`.
2. En el repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`** → Save.
3. En 1–2 minutos el sitio queda en `https://USUARIO.github.io/REPO/`.

Recomendado para producción: descargar las imágenes a una carpeta `images/` del repo en vez de hotlinkearlas (del repo de argerie y del CDN de Squarespace), y cambiar la constante `BASE` en `conocenos.html` y las URLs en `IMAGES` de `index.html` a rutas locales. Así el sitio no depende de servidores ajenos.

---

## C) Dominio: de Squarespace a GitHub Pages

⚠️ Este paso **apaga el sitio viejo** de Squarespace en ese dominio. Coordinarlo con la dueña del centro.

1. En el repo: **Settings → Pages → Custom domain** → escribir `www.costaricaanimalrescuecenter.org` → Save.
2. En el panel de Squarespace: **Settings → Domains → costaricaanimalrescuecenter.org → DNS Settings**, y configurar:

   | Tipo  | Host | Valor                |
   |-------|------|----------------------|
   | A     | @    | 185.199.108.153      |
   | A     | @    | 185.199.109.153      |
   | A     | @    | 185.199.110.153      |
   | A     | @    | 185.199.111.153      |
   | CNAME | www  | `USUARIO.github.io`  |

   (Eliminar los registros A/CNAME viejos de Squarespace que apunten a su plataforma.)
3. Esperar la propagación (minutos a algunas horas). Cuando GitHub valide el dominio, activar **Enforce HTTPS** en Settings → Pages.
4. Verificar que `https://www.costaricaanimalrescuecenter.org` y el dominio sin `www` carguen el sitio nuevo.
5. Opcional (ahorro): cancelar la **suscripción del sitio** de Squarespace, manteniendo solo el **dominio** (renovación anual aparte). No cancelar el dominio.

---

## D) Panel de padrinos (pestaña "Padrinos" de la hoja)

La sección **Padrinos** del index se administra desde la hoja de cálculo, sin tocar código.

1. Tras pegar el script (parte A), en el editor de Apps Script elegí la función `crearHojaPadrinos` y dale ▶ Ejecutar. Se crea la pestaña "Padrinos" con los 3 animales de ejemplo.
2. En `index.html`, pegá la misma URL `/exec` en:
   ```js
   const CONFIG_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
   ```
3. Desde ese momento, lo que se edite en la pestaña manda:

   | Columna  | Qué hace |
   |----------|----------|
   | ID       | `a1`/`a2`/`a3` usan los textos traducidos de la página. Un ID nuevo (`a4`...) = animal nuevo, con los textos de la hoja (iguales en todos los idiomas). |
   | Nombre   | Nombre que se muestra y va en el mensaje de WhatsApp/PayPal. |
   | Especie / Historia | Solo para animales nuevos (en a1-a3 dejarlas vacías). |
   | Foto (URL) | Enlace directo a la imagen. |
   | Montos   | Ej: `10,25,50`. Se muestran como opciones. |
   | Boton    | `whatsapp` abre el chat con el mensaje armado; `paypal` abre PayPal con el monto elegido. |
   | PayPal   | Usuario de paypal.me (ej: `crarccr` → cobra `paypal.me/crarccr/25USD`) **o** un enlace completo de PayPal (donación, botón alojado o **suscripción** — ese se abre tal cual, ideal para cobros mensuales de verdad). |
   | Activo   | `NO` oculta el animal sin borrar la fila. |

4. Los cambios aparecen al recargar la página. Si el endpoint no responde, la página muestra los animales por defecto que trae el código — nunca queda en blanco.

Requisito para PayPal: el centro necesita su cuenta PayPal (idealmente Business). Con crear su paypal.me ya funciona; para suscripciones mensuales, se crea el plan en PayPal y se pega el enlace en la columna.

---

## Resumen de constantes editables

| Archivo         | Constante         | Qué es                                        |
|-----------------|-------------------|-----------------------------------------------|
| ambos HTML      | `WHATSAPP_NUMBER` | WhatsApp del centro (`506` + número)          |
| conocenos.html  | `SHEETS_ENDPOINT` | URL `/exec` del Apps Script (parte A)         |
| index.html      | `CONFIG_ENDPOINT` | La misma URL `/exec` (activa el panel, parte D) |
| conocenos.html  | `BASE`            | De dónde salen las fotos                      |
| index.html      | `IMAGES`, `VIDEO` | Fotos y video del hero                        |
| index.html      | `PAYMENT`         | SINPE y cuentas BAC                           |
| index.html      | `SPONSORS`        | Animales apadrinables y montos                |
| codigo-apps-script.gs | `NOTIFY_EMAIL` | Correo que recibe los avisos              |
