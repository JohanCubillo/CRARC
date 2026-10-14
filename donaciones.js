'use strict';
(async()=>{
 const grid=document.getElementById('donationAnimals'),status=document.getElementById('donationStatus'),amount=document.getElementById('paypalAmount');let animals=[];
 function render(){
   grid.replaceChildren();
   animals.forEach(animal=>{
     const card=document.createElement('article');card.className='donation-card';
     if(animal.foto){const img=document.createElement('img');img.src=animal.foto;img.alt=animal.nombre;img.loading='lazy';card.append(img);}
     const body=document.createElement('div');body.className='donation-card-body';const title=document.createElement('h3');title.textContent=animal.nombre;body.append(title);
     if(animal.historia){const text=document.createElement('p');text.textContent=animal.historia;body.append(text);}
     const actions=document.createElement('div');actions.className='donation-actions';const link=CRARC_SPONSOR_PAYMENTS.paypalLink(animal.paypal,amount.validity.valid?Number(amount.value):0);
     if(link){const paypal=document.createElement('a');paypal.className='btn btn-green';paypal.textContent='Donar con PayPal';paypal.href=link;paypal.target='_blank';paypal.rel='noopener noreferrer';actions.append(paypal);}
     else{const note=document.createElement('p');note.className='note';note.textContent='PayPal pendiente de configurar para este animal.';actions.append(note);}
     const sinpe=document.createElement('button');sinpe.type='button';sinpe.className='btn';sinpe.textContent='Enviar comprobante SINPE';sinpe.onclick=()=>CRARC_SPONSOR_PAYMENTS.openSinpe({id:animal.id,name:animal.nombre},'8305-0069','María de los Ángeles Morice');actions.append(sinpe);body.append(actions);card.append(body);grid.append(card);
   });
 }
 amount.onchange=render;
 try{animals=await CRARC_DB.getSponsors();render();status.textContent=animals.length?'':'No hay animales activos para apadrinar. Escríbenos para coordinar tu aporte.';}
 catch{status.textContent='No pudimos cargar los animales. Puedes usar el SINPE indicado y coordinar por WhatsApp con el equipo.';}
})();
