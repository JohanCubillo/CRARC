'use strict';
(()=>{
 const track=document.getElementById('cuteGalleryTrack');if(!track)return;
 const previous=document.getElementById('cutePrevious'),next=document.getElementById('cuteNext'),status=document.getElementById('cutePosition'),cards=Array.from(track.children),reduced=matchMedia('(prefers-reduced-motion:reduce)');let frame;
 const words={es:['Fotos anteriores','Fotos siguientes','de'],en:['Previous photos','Next photos','of'],fr:['Photos précédentes','Photos suivantes','sur'],it:['Foto precedenti','Foto successive','di']};
 const position=card=>card.getBoundingClientRect().left-track.getBoundingClientRect().left+track.scrollLeft;
 function current(){let closest=0;cards.forEach((card,i)=>{if(Math.abs(position(card)-track.scrollLeft)<Math.abs(position(cards[closest])-track.scrollLeft))closest=i;});return closest;}
 function visible(){return Math.max(1,Math.round(track.clientWidth/(cards[0].getBoundingClientRect().width+18)));}
 function update(){const w=words[document.documentElement.lang]||words.es,i=current();previous.setAttribute('aria-label',w[0]);next.setAttribute('aria-label',w[1]);status.textContent=`${i+1}${visible()>1?'–'+Math.min(cards.length,i+visible()):''} ${w[2]} ${cards.length}`;previous.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;}
 function move(direction){const target=Math.max(0,Math.min(cards.length-1,current()+direction*visible()));track.scrollTo({left:position(cards[target]),behavior:reduced.matches?'auto':'smooth'});}
 previous.onclick=()=>move(-1);next.onclick=()=>move(1);
 track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
 track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
 window.addEventListener('resize',update);new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});update();
})();
