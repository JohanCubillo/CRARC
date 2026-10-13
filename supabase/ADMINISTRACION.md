# Activar el panel de administración

1. Ejecuta `admin.sql` completo en SQL Editor del proyecto CRARC. No modifica los contactos ni los padrinos.
2. En **Authentication > Users > Add user > Create new user**, crea tu usuario con correo y contraseña. Confirma el correo desde el dashboard si aparece la opción. No compartas la contraseña por el chat.
3. Ejecuta esta consulta cambiando el correo por el que creaste:

```sql
insert into public.administradores(user_id)
select id from auth.users where email = 'tu-correo@ejemplo.com'
on conflict do nothing;
```

4. Publica `admin.html`, `admin.css`, `admin.js` y `supabase-client.js` junto con el `index.html` actualizado. Entra mediante **Administración** en el pie de página.

Solo los usuarios incluidos en `administradores` pueden consultar o modificar estadías, movimientos y turnos. Un visitante o un usuario registrado sin autorización no tiene acceso a esos datos. Agrega más administradores repitiendo los pasos 2 y 3.

## Uso

- **Personas y estadías:** nombre, habitación o cama, llegada, salida, día libre semanal, dos tareas habituales y notas. Una persona puede tener múltiples estadías. El día de salida no cuenta como noche ni como jornada de trabajo. Usa notas para aclaraciones sobre las habitaciones.
- **Pagos:** registra cada pago con su fecha y moneda. La ficha suma todos los pagos asociados a esa estadía, incluidos pagos parciales. No representa deuda pendiente ni facturación: registra dinero efectivamente recibido.
- **Organización del día:** selecciona una fecha. Puedes marcar un día libre excepcional, ajustar ambas tareas y guardar. Sin asignación guardada, el reparto automático alterna las tareas según la última jornada trabajada. Con seis disponibles, alimentan tres y preparan alimentos tres; al día siguiente se intercambian. Si cambian los integrantes, se prioriza alternar y mantener grupos equilibrados. Con número impar, la persona adicional alterna entre grupos según la fecha. Las asignaciones guardadas tienen prioridad; pulsa **Repartir tareas de la tarde** para reemplazarlas por un reparto equilibrado. Si necesitas fijar el plan antes de cambiar estadías, guarda el reparto del día.
- **Tablero del día:** abre `turnos.html` desde Organización del día. Muestra todas las personas presentes, dos equipos, días libres, habitación y tareas de mañana y tarde. Puedes cambiar fecha, actualizar o imprimir. Requiere el mismo acceso privado; no muestra pagos ni correos. No requiere SQL adicional.
- **Ingresos y gastos:** registra, edita o elimina movimientos. Los gastos admiten categorías. Puedes registrar otros ingresos sin asociarlos a una persona.
- **Resumen:** ingresos, gastos, balance mensual, gráficas de seis meses y categorías de gastos. USD y CRC siempre se consultan por separado; no se convierten ni se suman entre monedas.

No se ha ejecutado esta migración remota ni publicado el panel. Después de activarlo, verifica: acceso autorizado, ingreso sin autorización rechazado, una estadía de prueba, dos pagos en monedas distintas, un gasto y un reparto con un día libre. El panel requiere conexión a Internet para Supabase y su biblioteca de autenticación.
