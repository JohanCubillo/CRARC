(function(root) {
  function snapshot(stays, shifts, day, leaders = {}) {
    const plan = root.CRARC_PLAN.plan(stays, shifts, day);
    const feeding = plan.filter(t => !t.libre && t.tarde === root.CRARC_PLAN.FEED);
    const prep = plan.filter(t => !t.libre && t.tarde === root.CRARC_PLAN.PREP);
    const valid = (!feeding.length || feeding.some(t => t.estadia_id === leaders.alimentacion)) &&
      (!prep.length || prep.some(t => t.estadia_id === leaders.preparacion));
    return {fecha:day, actualizado_at:new Date().toISOString(), valid,
      personas:stays.filter(s => s.llegada <= day && day < s.salida).map(s => {
        const t = plan.find(t => t.estadia_id === s.id);
        // Lista explícita de campos públicos; nunca copiar la estadía completa.
        return {nombre:s.nombre,libre:t.libre,
          encargado:!t.libre && (t.tarde === root.CRARC_PLAN.FEED && leaders.alimentacion === s.id || t.tarde === root.CRARC_PLAN.PREP && leaders.preparacion === s.id),
          manana:t.libre ? '' : t.manana,tarde:t.libre ? '' : t.tarde,saved:t.saved};
      })};
  }
  root.CRARC_PUBLIC_BOARD = {snapshot};
})(typeof window === 'undefined' ? globalThis : window);
