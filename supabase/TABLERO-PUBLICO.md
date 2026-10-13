# Activar el tablero para el QR

1. Ejecuta `tablero-publico.sql` en SQL Editor de Supabase.
2. Abre `admin.html`, inicia sesión y entra a Organización del día.
3. Pulsa **Actualizar tablero público** para publicar el plan.
4. Abre `https://johancubillo.github.io/CRARC/turnos.html` sin iniciar sesión. Usa esa dirección para el QR.

El tablero publica solo nombres, tareas, encargados y días libres. No se publican habitaciones, correos, pagos, notas, fechas de llegada/salida ni identificadores personales. Ejecuta también `encargados.sql` y elige los encargados por fecha antes de publicar. Las tablas administrativas conservan su acceso privado. Los visitantes solo pueden leer la copia pública, no modificarla.

Al abrir el panel o guardar un cambio se recalcula y publica hoy, los próximos 14 días y la fecha seleccionada. Mantén el panel actualizado cuando cambien personas o tareas. Las fechas sin publicación muestran un aviso. La consulta pública se refresca cada minuto mientras está visible. Si eliges otra fecha en administración, pulsa **Actualizar tablero público** para publicarla.

La migración debe ejecutarse antes de que el tablero pueda mostrar los datos. Comprobar en ventana privada: consulta sin contraseña; administración continúa solicitando acceso; los equipos coinciden con el panel.
