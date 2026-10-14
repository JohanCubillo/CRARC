(()=>{
 'use strict';
 const root=document.documentElement;let started=Date.now(),done=false,maximum,minimum;
 function start(){
   clearTimeout(maximum);clearTimeout(minimum);done=false;started=Date.now();root.classList.add('page-loading');
   const loader=document.getElementById('siteLoader');
   if(loader){loader.classList.remove('is-finished');const fill=loader.querySelector('.site-loader-fill');if(fill){fill.style.animation='none';void fill.offsetWidth;fill.style.animation='';}}
   maximum=setTimeout(finish,4500);
 }
 function finish(){
   if(done)return;done=true;clearTimeout(maximum);clearTimeout(minimum);root.classList.remove('page-loading');
 }
 function ready(){clearTimeout(minimum);minimum=setTimeout(finish,Math.max(0,950-(Date.now()-started)));}
 start();
 window.addEventListener('load',ready,{once:true});
 window.addEventListener('pageshow',event=>{if(event.persisted){start();ready();}});
 window.addEventListener('pagehide',finish);
 if(document.readyState==='complete')ready();
})();
