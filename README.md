# CRAC Web — Costa Rica Animal Rescue Center

Sitio estático de dos páginas para el centro de rescate, con soporte de
4 idiomas (ES/EN/FR/IT), formulario conectado a Google Sheets/WhatsApp
y sección de padrinos administrable desde una hoja de cálculo.

## Estructura

| Archivo / carpeta | Qué es |
|---|---|
| `index.html` | Página principal: hero (imagen o video), cómo trabajamos, impacto, crecimiento, **padrinos**, galería, **formas de donar** (SINPE + BAC), footer |
| `conocenos.html` | Quiénes somos, historia, animales rescatados, voluntariado + precios, hospital, visítanos, giras, **formulario**, FAQ |
| `images/` | Fotos locales del centro |
| `apps-script/codigo-apps-script.gs` | Backend en Google Apps Script: guarda el formulario en Sheets y sirve la configuración de padrinos |
| `INSTRUCCIONES.md` | **Guía completa**: conectar Sheets, publicar en GitHub Pages, apuntar el dominio desde Squarespace y usar el panel de padrinos |
| `descargar-imagenes-squarespace.sh` | Opcional: baja las imágenes que aún vienen del CDN de Squarespace y las deja locales (hacerlo antes de cancelar Squarespace) |

## Configuración rápida

Tras desplegar el Apps Script (INSTRUCCIONES.md, parte A), pegar la URL `/exec` en:

- `conocenos.html` → `SHEETS_ENDPOINT` (formulario → hoja "Contactos")
- `index.html` → `CONFIG_ENDPOINT` (panel de padrinos → hoja "Padrinos")

Otras constantes editables: `WHATSAPP_NUMBER` (ambos HTML), `PAYMENT` y `VIDEO` (index).
