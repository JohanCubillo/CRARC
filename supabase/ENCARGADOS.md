# Encargados por fecha

Ejecuta `encargados.sql` después de `tablero-publico.sql` si aún no lo hiciste. Luego recarga administración, abre Organización del día, selecciona la fecha y elige dos personas distintas: encargado de cocina y encargado de repartición y limpieza. Pulsa Guardar encargados. Este cambio de roles no requiere SQL adicional.

Se puede elegir cualquier persona presente y disponible, independientemente de su tarea de la tarde. Debe haber exactamente dos encargados distintos antes de publicar. Si solo hay una persona disponible, se necesita registrar o habilitar una segunda persona real; no se duplica la persona. Los encargados se eligen por fecha y pueden conservar su función aunque cambien sus tareas. Por compatibilidad, la columna `preparacion` guarda cocina y `alimentacion` guarda repartición y limpieza.

Turnos muestra arriba un bloque «¿Tienes dudas? Consulta a los encargados», con ambos nombres y sus funciones. También identifica su función junto a su nombre en los grupos de tareas. No muestra habitaciones ni botón de imprimir. Administración conserva habitaciones para gestionar estadías. Fechas sin dos encargados válidos quedan ocultas; si un encargado deja de estar presente o tiene día libre, revisa la elección y vuelve a publicar.
