# Encargados por fecha

Ejecuta `encargados.sql` después de `tablero-publico.sql`. Luego recarga administración, abre Organización del día, selecciona la fecha y elige un encargado de alimentación y uno de preparación. Pulsa Guardar encargados.

Solo se pueden elegir personas disponibles del equipo correspondiente. Cada equipo con personas debe tener un encargado antes de publicar. Si un equipo está vacío, no puede tener encargado. Los encargados se eligen por fecha: al alternar las tareas al día siguiente, se deben elegir los encargados de los nuevos equipos. Un encargado trabaja dentro de su equipo, no se añade una persona extra al reparto.

El tablero público marca a cada encargado y lo coloca primero en su grupo. No muestra habitaciones ni botón de imprimir. Administración conserva habitaciones para gestionar estadías. Los datos publicados ya existentes se limpian de habitaciones al ejecutar el SQL. Fechas sin encargados válidos quedan ocultas; si cambias tareas o días libres, revisa los encargados y vuelve a publicar.
