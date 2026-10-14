const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'admin.html'),'utf8');
assert.match(html,/<aside id="adminSidebar" hidden>/,'menú oculto desde el HTML');
const elements=new Map(),classes=new Set();
const document={getElementById(id){if(!elements.has(id))elements.set(id,{hidden:true,replaceChildren(){},textContent:''});return elements.get(id);},querySelectorAll(){return[];},body:{classList:{add:n=>classes.add(n),remove:n=>classes.delete(n)}}};
const context={document,window:{},Intl,Date,CRARC_SPONSOR_ADMIN:{clear(){}},rooms:[],roomsReady:false,testAllowed:false,testLoadFails:false};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'admin.js'),'utf8').replace(/init\(\);\s*$/,''),context);
vm.runInContext("db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:testAllowed?{user_id:'admin'}:null,error:null})})})})};reload=async()=>{if(testLoadFails)throw Error('No connection')};",context);
const run=code=>vm.runInContext(code,context);
(async()=>{
 await run('authorize(null)');assert.equal(document.getElementById('adminSidebar').hidden,true);
 await assert.rejects(run("authorize({user:{id:'guest'}})"));assert.equal(document.getElementById('adminSidebar').hidden,true);
 context.testAllowed=true;await run("authorize({user:{id:'admin'}})");assert.equal(document.getElementById('adminSidebar').hidden,false);assert.ok(classes.has('admin-authorized'));
 run('hideWorkspace()');assert.equal(document.getElementById('adminSidebar').hidden,true);assert.ok(!classes.has('admin-authorized'));
 context.testLoadFails=true;await assert.rejects(run("authorize({user:{id:'admin'}})"));assert.equal(document.getElementById('adminSidebar').hidden,true);
 console.log('PASS: menú oculto sin sesión, sin permiso, al salir y ante errores; visible solo con acceso confirmado.');
})().catch(e=>{console.error(e);process.exitCode=1;});
