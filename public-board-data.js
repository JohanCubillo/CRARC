(function(root) {
  function snapshot(stays, shifts, day) {
    const plan = root.CRARC_PLAN.plan(stays, shifts, day);
    return {fecha:day, actualizado_at:new Date().toISOString(),
      personas:stays.filter(s => s.llegada <= day && day < s.salida).map(s => {
        const t = plan.find(t => t.estadia_id === s.id);
        // Lista explícita de campos públicos; nunca copiar la estadía completa.
        return {nombre:s.nombre,habitacion:s.habitacion,libre:t.libre,
          manana:t.libre ? '' : t.manana,tarde:t.libre ? '' : t.tarde,saved:t.saved};
      })};
  }
  root.CRARC_PUBLIC_BOARD = {snapshot};
})(typeof window === 'undefined' ? globalThis : window);
