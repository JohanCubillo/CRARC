const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../home-contact.js'),'utf8');
const handlers={},elements={nombre:{addEventListener(){},setCustomValidity(){},reportValidity(){}}};
let reset=0,saved,broken=false;
const form={elements,addEventListener:(event,fn)=>handlers[event]=fn,reportValidity:()=>true,reset:()=>reset++};
const status={},button={},doc={documentElement:{lang:'es'},querySelectorAll:()=>[],getElementById:id=>id==='homeContactForm'?form:id==='homeContactStatus'?status:button};
const values={nombre:' Ana ',email:'ana@example.com',whatsapp:'123',interes:'voluntario',personas:'2',dieta:'vegana',alergias:''};
class FormDataMock{constructor(){}*[Symbol.iterator](){yield*Object.entries(values);}}
vm.runInNewContext(source,{document:doc,location:{pathname:'/CRARC/'},FormData:FormDataMock,MutationObserver:class{observe(){}},CRARC_DB:{saveContact:async data=>{if(broken)throw Error('Error');saved=data;}}});
(async()=>{
 await handlers.submit({preventDefault(){}});
 assert.equal(saved.nombre,'Ana');assert.equal(saved.pagina,'/CRARC/');assert.equal(saved.alergias,'-');assert.equal(saved.idioma,'es');
 assert.equal(reset,1);assert.equal(button.disabled,false);assert.equal(status.className,'success');
 broken=true;await handlers.submit({preventDefault(){}});
 assert.equal(reset,1);assert.equal(status.className,'error');assert.equal(button.disabled,false);
 console.log('PASS: envio desde index, campos de Supabase, confirmacion y conservacion de datos ante error.');
})().catch(e=>{console.error(e);process.exitCode=1;});
