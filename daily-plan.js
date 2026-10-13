/* Reparto compartido por administración y página de consulta. */
(function (root) {
  const FEED = 'Alimentar animales';
  const PREP = 'Cortar frutas y preparar alimentos';
  const date = d => new Date(`${d}T12:00:00Z`);
  function plan(stays, shifts, target, replace = false) {
    const candidates = stays.filter(s => s.llegada <= target);
    if (!candidates.length) return [];
    const first = candidates.reduce((d,s) => s.llegada < d ? s.llegada : d, target);
    const records = new Map(shifts.map(t => [`${t.fecha}:${t.estadia_id}`,t]));
    const lastTask = new Map();
    let result = [];
    for (let cursor = date(first); cursor <= date(target); cursor.setUTCDate(cursor.getUTCDate()+1)) {
      const day = cursor.toISOString().slice(0,10);
      const active = candidates.filter(s => s.llegada <= day && day < s.salida);
      const items = active.map(s => {
        const saved = records.get(`${day}:${s.id}`);
        return {
          estadia_id:s.id, fecha:day,
          libre:saved ? saved.libre : s.dia_libre != null && Number(s.dia_libre) === cursor.getUTCDay(),
          manana:saved ? saved.manana : s.tarea_manana,
          tarde:saved ? saved.tarde : '',
          saved:!!saved
        };
      });
      const available = items.filter(t => !t.libre);
      // Prioriza la tarea contraria a la última jornada trabajada.
      const rank = t => lastTask.get(t.estadia_id) === PREP ? 0 : lastTask.get(t.estadia_id) === FEED ? 2 : 1;
      const ordinal = Math.floor(cursor.getTime()/86400000);
      const ids = available.map(t => t.estadia_id).sort();
      const offset = ids.length ? ordinal % ids.length : 0;
      const tie = t => (ids.indexOf(t.estadia_id) - offset + ids.length) % ids.length;
      const fixed = available.filter(t => t.saved && !(replace && day === target));
      const changing = available.filter(t => !t.saved || replace && day === target).sort((a,b) => rank(a)-rank(b) || tie(a)-tie(b));
      // Un número impar alterna cuál grupo recibe la persona adicional.
      const feedingTarget = ordinal % 2 ? Math.floor(available.length/2) : Math.ceil(available.length/2);
      const slots = Math.max(0,feedingTarget-fixed.filter(t => t.tarde === FEED).length);
      changing.forEach((t,i) => { t.tarde = i < slots ? FEED : PREP; });
      available.forEach(t => { if (t.tarde === FEED || t.tarde === PREP) lastTask.set(t.estadia_id,t.tarde); });
      result = items;
    }
    return result;
  }
  root.CRARC_PLAN = {plan, FEED, PREP};
})(typeof window === 'undefined' ? globalThis : window);
