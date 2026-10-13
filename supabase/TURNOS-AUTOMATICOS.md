# Activar rotación sin actualización administrativa diaria

Ejecuta `turnos-automaticos.sql` en SQL Editor. Requiere las tablas existentes `estadias`, `turnos` y `encargados`. El tablero público llama una función de lectura que calcula las tareas por fecha y devuelve solo nombres, tareas, días libres y encargados.

El reparto alterna según la última jornada trabajada y mantiene grupos equilibrados. La mañana es la tarea contraria a la tarde. Los cambios manuales guardados para una fecha tienen prioridad. El día de salida queda fuera de las jornadas. El cálculo usa los datos actuales; no guarda nuevas filas ni modifica pagos o estadías.

La última elección de los dos encargados se conserva en los siguientes días mientras estén presentes y disponibles. Si alguien sale o tiene día libre, aparece pendiente de asignar en su función: se debe elegir su reemplazo en administración. Cambiar las tareas no cambia por sí solo los encargados.

El tablero consulta cada minuto y cambia de fecha automáticamente al llegar el nuevo día en Costa Rica si está en modo Hoy. Una fecha elegida manualmente permanece fija hasta pulsar Hoy. Se pueden consultar fechas dentro de 31 días antes o después de hoy.

No hace falta abrir administración, repartir ni publicar cada día. Registrar llegadas, salidas, días libres y excepciones sigue correspondiendo a administración. Las antiguas copias publicadas se conservan, pero el tablero ya no depende de ellas. Tras ejecutar el SQL, verifica hoy y mañana en Turnos; con seis disponibles sin excepciones, deben aparecer tres y tres con las tareas intercambiadas. La función remota no se ha ejecutado desde este chat.
