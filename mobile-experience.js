'use strict';
(function(){
  const mobile=window.matchMedia('(max-width:680px)'),reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const copy={es:['Anterior','Siguiente','Desliza para ver más','Animales para apadrinar','Galería','Cómo trabajamos'],en:['Previous','Next','Swipe to see more','Animals to sponsor','Gallery','How we work'],fr:['Précédent','Suivant','Glissez pour voir plus','Animaux à parrainer','Galerie','Notre travail'],it:['Precedente','Successivo','Scorri per vedere altro','Animali da adottare','Galleria','Come lavoriamo']};
  function install(id,random){
    const grid=document.getElementById(id);if(!grid)return;
    let index=0,started=false,activeKey='',frame;
    const controls=document.createElement('div');controls.className='mobile-carousel-controls';
    const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');
    prev.type=next.type='button';prev.textContent='‹';next.textContent='›';label.setAttribute('aria-live','polite');label.setAttribute('aria-atomic','true');controls.append(prev,label,next);grid.after(controls);
    const cards=()=>Array.from(grid.children);
    const key=card=>card?.querySelector('img')?.getAttribute('src')||'';
    const position=card=>card.getBoundingClientRect().left-grid.getBoundingClientRect().left+grid.scrollLeft;
    function refreshLabel(){
      const words=copy[document.documentElement.lang]||copy.es;
      prev.setAttribute('aria-label',words[0]);next.setAttribute('aria-label',words[1]);
      grid.setAttribute('aria-label',words[id==='howGrid'?5:random?3:4]);
      label.replaceChildren(document.createTextNode(`${cards().length?index+1:0} / ${cards().length}`));const hint=document.createElement('small');hint.textContent=words[2];label.appendChild(hint);
      controls.hidden=cards().length<2;
    }
    function go(target,smooth=true){
      const list=cards();if(!list.length)return;
      index=(target+list.length)%list.length;activeKey=key(list[index]);refreshLabel();
      if(mobile.matches)grid.scrollTo({left:position(list[index]),behavior:smooth&&!reduced.matches?'smooth':'auto'});
    }
    function rebuild(){
      const list=cards();if(!list.length){refreshLabel();return;}
      if(mobile.matches&&!started){index=random?Math.floor(Math.random()*list.length):0;started=true;}
      else if(activeKey){const found=list.findIndex(c=>key(c)===activeKey);index=found>=0?found:Math.min(index,list.length-1);}
      go(index,false);
    }
    prev.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
    grid.addEventListener('scroll',()=>{if(!mobile.matches)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const list=cards();if(!list.length)return;let closest=0;list.forEach((card,i)=>{if(Math.abs(position(card)-grid.scrollLeft)<Math.abs(position(list[closest])-grid.scrollLeft))closest=i;});if(index===closest)return;index=closest;activeKey=key(list[index]);refreshLabel();});},{passive:true});
    new MutationObserver(rebuild).observe(grid,{childList:true});
    new MutationObserver(refreshLabel).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    if(mobile.addEventListener)mobile.addEventListener('change',rebuild);else mobile.addListener(rebuild);
    window.addEventListener('resize',()=>{if(mobile.matches)go(index,false);});
    rebuild();
  }
  install('sponsorGrid',true);install('masonry',false);install('howGrid',false);
})();
