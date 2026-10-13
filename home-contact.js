'use strict';
(function(){
  const form=document.getElementById('homeContactForm');
  if(!form)return;
  const keys=['title','intro','description','name','email','whatsapp','interest','visit','volunteer','donate','people','diet','regular','vegetarian','vegan','gluten','allergies','send','sending','success','error'];
  const translations={
    es:['Visitas y voluntariado','Cuéntanos cómo quieres participar','Envíanos tus datos y te contactaremos para coordinar tu experiencia en el centro.','Nombre','Correo','WhatsApp con código de país','¿Qué te interesa?','Visitar el centro','Hacer voluntariado','Donar','Número de personas','Dieta','Regular','Vegetariana','Vegana','Sin gluten','Alergias o necesidades alimentarias','Enviar consulta','Enviando…','¡Recibimos tu consulta! Te contactaremos pronto.','No se pudo guardar la consulta. Inténtalo de nuevo.'],
    en:['Visits and volunteering','Tell us how you would like to take part','Send us your details and we will contact you to arrange your experience at the center.','Name','Email','WhatsApp with country code','What are you interested in?','Visit the center','Volunteer','Donate','Number of people','Diet','Regular','Vegetarian','Vegan','Gluten free','Allergies or dietary needs','Send inquiry','Sending…','We received your inquiry! We will contact you soon.','Your inquiry could not be saved. Please try again.'],
    fr:['Visites et bénévolat','Dites-nous comment vous souhaitez participer','Envoyez vos coordonnées et nous vous contacterons pour organiser votre expérience au centre.','Nom','E-mail','WhatsApp avec indicatif du pays','Que souhaitez-vous faire ?','Visiter le centre','Faire du bénévolat','Faire un don','Nombre de personnes','Régime alimentaire','Habituel','Végétarien','Végétalien','Sans gluten','Allergies ou besoins alimentaires','Envoyer la demande','Envoi…','Nous avons reçu votre demande ! Nous vous contacterons bientôt.','Votre demande n’a pas pu être enregistrée. Veuillez réessayer.'],
    it:['Visite e volontariato','Raccontaci come vuoi partecipare','Invia i tuoi dati e ti contatteremo per organizzare la tua esperienza al centro.','Nome','Email','WhatsApp con prefisso internazionale','Cosa ti interessa?','Visitare il centro','Fare volontariato','Donare','Numero di persone','Dieta','Regolare','Vegetariana','Vegana','Senza glutine','Allergie o esigenze alimentari','Invia richiesta','Invio…','Abbiamo ricevuto la tua richiesta! Ti contatteremo presto.','Non è stato possibile salvare la richiesta. Riprova.']
  };
  const text=()=>Object.fromEntries(keys.map((key,i)=>[key,(translations[document.documentElement.lang]||translations.es)[i]]));
  let state='', sending=false;
  function translate(){
    const dict=text();document.querySelectorAll('[data-home-i18n]').forEach(el=>el.textContent=dict[el.dataset.homeI18n]);
    document.getElementById('homeContactStatus').textContent=state?dict[state]:'';
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(sending||!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));
    Object.keys(data).forEach(key=>data[key]=data[key].trim());
    if(!data.nombre){form.elements.nombre.setCustomValidity(text().name);form.elements.nombre.reportValidity();return;}
    data.alergias=data.alergias||'-';data.idioma=document.documentElement.lang;data.pagina=location.pathname;
    const btn=document.getElementById('homeContactSend'), status=document.getElementById('homeContactStatus');
    sending=true;btn.disabled=true;state='sending';status.className='';translate();
    try{await CRARC_DB.saveContact(data);form.reset();state='success';status.className='success';}
    catch(error){state='error';status.className='error';}
    finally{sending=false;btn.disabled=false;translate();}
  });
  form.elements.nombre.addEventListener('input',()=>form.elements.nombre.setCustomValidity(''));
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  translate();
})();
