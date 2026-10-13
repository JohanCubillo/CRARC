(function(root) {
  function snapshot(stays, shifts, day, leaders = {}) {
    const plan = root.CRARC_PLAN.plan(stays, shifts, day);
    const available = plan.filter(t => !t.libre);
    const valid = leaders.alimentacion !== leaders.preparacion &&
      available.some(t => t.estadia_id === leaders.alimentacion) &&
      available.some(t => t.estadia_id === leaders.preparacion);
    return {fecha:day, actualizado_at:new Date().toISOString(), valid,
      personas:stays.filter(s => s.llegada <= day && day < s.salida).map(s => {
        const t = plan.find(t => t.estadia_id === s.id);
        // Lista explícita de campos públicos; nunca copiar la estadía completa.
        return {nombre:s.nombre,libre:t.libre,
          encargado:!t.libre && (leaders.alimentacion === s.id || leaders.preparacion === s.id),
          rol_encargado:!t.libre && leaders.alimentacion === s.id ? 'Repartición y limpieza' : !t.libre && leaders.preparacion === s.id ? 'Cocina' : '',
          manana:t.libre ? '' : t.manana,tarde:t.libre ? '' : t.tarde,saved:t.saved};
      })};
  }
  root.CRARC_PUBLIC_BOARD = {snapshot};
})(typeof window === 'undefined' ? globalThis : window);
