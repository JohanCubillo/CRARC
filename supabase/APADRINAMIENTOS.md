# Activar PayPal y revisión de SINPE

1. Ejecuta `apadrinamientos.sql` en SQL Editor. Requiere las tablas existentes `padrinos`, `administradores` y `movimientos`. Agrega los seis animales iniciales si faltan, una tabla privada de reportes y un bucket privado para comprobantes.
2. En administración, abre **Animales y PayPal**, pulsa Configurar y pega el enlace HTTPS de PayPal de cada animal. Puedes usar enlaces de donación, suscripción o PayPal.Me. Solo se admiten dominios PayPal. Los botones quedan deshabilitados hasta configurar los enlaces.
3. En el index, cada tarjeta tiene **PayPal** y **SINPE Móvil**. SINPE usa el número y titular que ya muestra el sitio: 8305-0069, María de los Ángeles Morice. Confirma esos datos antes de difundir el sitio.
4. El padrino transfiere desde su banco y envía monto real en CRC, referencia, nombre, correo y comprobante JPG, PNG o PDF (hasta 5 MB). Los niveles de la tarjeta son USD: no hay conversión automática a colones.
5. En **Verificar SINPE**, abre el comprobante y compara con tu banco. Aceptar registra un único ingreso CRC en categoría Donaciones; rechazar no registra ingresos. La función bloquea el reporte durante la revisión y no duplica ingresos por doble clic o revisión concurrente. La referencia es única para evitar reportar dos veces la misma transferencia.

Los clientes solo pueden enviar reportes pendientes; no pueden ver otros reportes ni aceptar pagos. Los archivos son privados; el administrador recibe un enlace temporal al abrirlos. No se almacenan credenciales bancarias ni de PayPal.

PayPal abre un enlace externo. Sin una integración de webhook, no se confirma ni se contabiliza automáticamente un pago PayPal. El enlace define si es una donación única o suscripción; los niveles mensuales del sitio no crean por sí solos una suscripción. Un enlace PayPal.Me de usuario recibe el monto USD elegido; enlaces completos de donación se abren tal cual.

La aceptación SINPE es verificación humana, no consulta automática del banco. No envíes dinero de prueba: se puede comprobar el flujo con un registro identificado como prueba y rechazarlo. Tras activar el SQL, verifica carga de animales, enlace PayPal real, envío de comprobante, acceso privado y revisión. La migración remota no fue ejecutada desde este chat.
