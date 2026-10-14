const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../conocenos.html'),'utf8');
for(const [i,match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()){if(match[0].includes('application/ld+json'))JSON.parse(match[1]);else new vm.Script(match[1],{filename:`inline-${i}.js`});}
assert.ok(!html.includes('id="heroBg"'));
assert.ok(!html.includes('id="imgVis"'));assert.ok(!html.includes('id="waBtn"'));
assert.ok(html.includes('about-redesign.css'));
assert.ok(html.includes('id="aboutContactForm"'));
assert.ok(/id="fNombre"[^>]*required/.test(html));assert.ok(/id="fEmail"[^>]*required/.test(html));
const handlers={},nodes={};
const node=id=>nodes[id]||(nodes[id]={disabled:false,textContent:'',addEventListener:(event,handler)=>handlers[id+':'+event]=handler,reportValidity:()=>true,reset(){this.resetCount=(this.resetCount||0)+1;}});
const data={nombre:'Ana',email:'ana@example.com',whatsapp:'',interes:'voluntario',personas:'1',dieta:'regular',alergias:'-',idioma:'es',pagina:'/CRARC/conocenos.html'};
let failed=false,saved;
const dict={sendSending:'Enviando',sendOk:'Recibido',sendErr:'Error'};
const source=html.slice(html.indexOf('function guardarEnHoja'),html.indexOf('document.getElementById("footYear").textContent'));
vm.runInNewContext(source,{document:{getElementById:node,querySelectorAll:()=>[{reportValidity:()=>true}],documentElement:{lang:'es'}},collectForm:()=>({dict,data,texto:'Consulta'}),CRARC_DB:{saveContact:async row=>{if(failed)throw Error('Error');saved=row;}},I18N:{es:dict},window:{open(){}},WHATSAPP_NUMBER:'50685228125'});
(async()=>{
 await handlers['aboutContactForm:submit']({preventDefault(){}});
 assert.equal(saved.pagina,'/CRARC/conocenos.html');assert.equal(node('formStatus').textContent,'Recibido');assert.equal(node('aboutContactForm').resetCount,1);assert.equal(node('sendBtn').disabled,false);
 failed=true;await handlers['aboutContactForm:submit']({preventDefault(){}});
 assert.equal(node('formStatus').textContent,'Error');assert.equal(node('aboutContactForm').resetCount,1);assert.equal(node('sendBtn').disabled,false);
 console.log('PASS: scripts, hero sin foto, campos requeridos, envio Supabase y errores sin borrar datos.');
})().catch(e=>{console.error(e);process.exitCode=1;});
