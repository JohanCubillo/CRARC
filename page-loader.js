(()=>{
 'use strict';
 const root=document.documentElement;let done=false;
 root.classList.add('page-loading');
 function finish(){
   if(done)return;done=true;root.classList.remove('page-loading');
   const loader=document.getElementById('siteLoader');if(loader){loader.classList.add('is-finished');loader.remove();}
 }
 // Se retira aunque un recurso externo tarde o falle.
 const timer=setTimeout(finish,4500);
 window.addEventListener('load',()=>{clearTimeout(timer);finish();},{once:true});
 window.addEventListener('pageshow',event=>{if(event.persisted){clearTimeout(timer);finish();}});
 if(document.readyState==='complete'){clearTimeout(timer);finish();}
})();
