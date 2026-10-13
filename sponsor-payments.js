'use strict';
window.CRARC_SPONSOR_PAYMENTS=(function(){
  function paypalLink(value,amount){
    if(!value)return null;
    try{
      const url=new URL(value);
      if(url.protocol!=='https:' || url.username || url.password || !['paypal.com','paypal.me'].some(h=>url.hostname===h||url.hostname.endsWith('.'+h)))return null;
      if(url.hostname==='paypal.me' && url.pathname.split('/').filter(Boolean).length===1 && Number(amount)>0)url.pathname=url.pathname.replace(/\/$/,'')+'/'+amount+'USD';
      return url.href;
    }catch(e){return null;}
  }
  let dialog,animal,busy=false;
  const words={es:['Enviar comprobante SINPE','Nombre','Correo','Monto transferido (₡)','Fecha del pago','Número de referencia','Comprobante (JPG, PNG o PDF, máximo 5 MB)','Enviar para revisión','Cancelar','Envía el SINPE a','Titular','El monto es en colones. No se convierte automáticamente el aporte en dólares.','Comprobante enviado. Queda pendiente de revisión por el centro.','No se pudo registrar. Revisa la referencia y vuelve a intentarlo.'],en:['Submit SINPE receipt','Name','Email','Amount transferred (₡)','Payment date','Reference number','Receipt (JPG, PNG or PDF, max 5 MB)','Submit for review','Cancel','Send SINPE to','Account holder','Enter the amount in colones. The USD tier is not automatically converted.','Receipt submitted. Pending review by the center.','Could not register. Check the reference and try again.'],fr:['Envoyer le justificatif SINPE','Nom','E-mail','Montant transféré (₡)','Date du paiement','Numéro de référence','Justificatif (JPG, PNG ou PDF, max 5 Mo)','Envoyer pour vérification','Annuler','Envoyez le SINPE au','Titulaire','Saisissez le montant en colones. Le montant en dollars n’est pas converti automatiquement.','Justificatif envoyé. En attente de vérification.','Échec de l’enregistrement. Vérifiez la référence et réessayez.'],it:['Invia ricevuta SINPE','Nome','Email','Importo trasferito (₡)','Data del pagamento','Numero di riferimento','Ricevuta (JPG, PNG o PDF, max 5 MB)','Invia per verifica','Annulla','Invia SINPE a','Intestatario','Inserisci l’importo in colones. L’importo in dollari non viene convertito automaticamente.','Ricevuta inviata. In attesa di verifica.','Registrazione non riuscita. Controlla il riferimento e riprova.']};
  function openSinpe(selected,number,holder){
    if(busy)return;
    animal=selected;
    const w=words[document.documentElement.lang]||words.es;
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='sinpe-dialog';document.body.appendChild(dialog);
      dialog.onclose=()=>document.body.classList.remove('sinpe-open');
      dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    }
    dialog.replaceChildren();
    const header=document.createElement('div');header.className='sinpe-header';
    const h=document.createElement('h2');h.id='sinpeTitle';h.textContent=w[0]+' · '+animal.name;header.appendChild(h);
    dialog.setAttribute('aria-labelledby','sinpeTitle');
    const close=document.createElement('button');close.type='button';close.className='sinpe-close';close.textContent='×';
    close.setAttribute('aria-label',({es:'Cerrar formulario',en:'Close form',fr:'Fermer le formulaire',it:'Chiudi modulo'})[document.documentElement.lang]||'Cerrar formulario');close.onclick=()=>dialog.close();header.appendChild(close);dialog.appendChild(header);
    const content=document.createElement('div');content.className='sinpe-scroll';dialog.appendChild(content);
    const info=document.createElement('p');info.textContent=`${w[9]} ${number} · ${w[10]}: ${holder}`;content.appendChild(info);
    const hint=document.createElement('p');hint.className='sinpe-hint';hint.textContent=w[11];content.appendChild(hint);
    const f=document.createElement('form');
    f.innerHTML=`<div class="sinpe-grid"><label>${w[1]}<input name="nombre" maxlength="200" required autocomplete="name"></label><label>${w[2]}<input name="email" type="email" maxlength="320" required autocomplete="email"></label><label>${w[3]}<input name="monto" type="number" min="0.01" step="0.01" required></label><label>${w[4]}<input name="fecha" type="date" required></label><label>${w[5]}<input name="referencia" minlength="3" maxlength="100" required></label><label>${w[6]}<input name="archivo" type="file" accept="image/jpeg,image/png,application/pdf" required></label></div><div class="sinpe-actions"><button type="button" class="btn sinpe-cancel">${w[8]}</button><button type="submit" class="btn btn-green">${w[7]}</button></div><p role="status" aria-live="polite"></p>`;
    f.elements.fecha.value=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    f.querySelector('.sinpe-cancel').onclick=()=>dialog.close();
    f.onsubmit=async e=>{
      e.preventDefault();if(busy)return;
      const receipt=f.elements.archivo.files[0], extensions={'image/jpeg':'jpg','image/png':'png','application/pdf':'pdf'};
      const status=f.querySelector('[role=status]');
      if(!receipt || !extensions[receipt.type] || receipt.size>5242880){status.textContent=w[6];return;}
      busy=true;const buttons=f.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
      try{
        const id=crypto.randomUUID(),path=`${id}/comprobante.${extensions[receipt.type]}`;
        const upload=await fetch(`${CRARC_DB.url}/storage/v1/object/comprobantes-sinpe/${path}`,{method:'POST',headers:{apikey:CRARC_DB.key,'Content-Type':receipt.type,'x-upsert':'false'},body:receipt});
        if(!upload.ok)throw Error('Upload');
        await CRARC_DB.request('apadrinamientos_sinpe',{method:'POST',body:JSON.stringify({id,animal_id:animal.id,nombre:f.elements.nombre.value.trim(),email:f.elements.email.value.trim(),monto:Number(f.elements.monto.value),fecha:f.elements.fecha.value,referencia:f.elements.referencia.value.trim(),comprobante:path})});
        f.reset();status.textContent=w[12];f.querySelector('button[type=submit]').hidden=true;
      }catch(error){status.textContent=w[13];}
      finally{busy=false;buttons.forEach(b=>b.disabled=false);}
    };
    content.appendChild(f);document.body.classList.add('sinpe-open');dialog.showModal();
  }
  return {paypalLink,openSinpe};
})();
