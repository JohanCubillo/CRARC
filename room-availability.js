(function(root){
  'use strict';
  function peak(stays, room, arrival, departure, exclude){
    const events = new Map();
    stays.filter(s=>s.id!==exclude && (s.habitacion_id===room.id || (!s.habitacion_id && s.habitacion===room.nombre)) && s.llegada<departure && s.salida>arrival).forEach(s=>{
      const a=s.llegada>arrival?s.llegada:arrival, b=s.salida<departure?s.salida:departure;
      events.set(a,(events.get(a)||0)+1); events.set(b,(events.get(b)||0)-1);
    });
    let count=0,max=0; [...events.keys()].sort().forEach(d=>{count+=events.get(d);max=Math.max(max,count);}); return max;
  }
  root.CRARC_ROOMS_DATA={peak};
})(typeof window==='undefined'?globalThis:window);
