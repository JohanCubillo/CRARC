const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
let handler,calls=[],allowed=true;
const ctx={Deno:{env:{get:n=>({GROQ_API_KEY:'test-key-not-real',SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-service'})[n]},serve:f=>handler=f},Response,Request,TextEncoder,crypto:require('node:crypto').webcrypto,AbortSignal,fetch:async(url,options)=>{
 calls.push({url,options});if(url.endsWith('permitir_chat'))return Response.json(allowed);
 if(url.endsWith('disponibilidad_habitaciones'))return Response.json([{nombre:'Compartida',capacidad:4,cupos:2,disponible:true}]);
 if(url.includes('api.groq.com'))return Response.json({choices:[{message:{content:'Respuesta de prueba'}}]});throw new Error('Unexpected URL');
}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'functions/chatbot/index.ts'),'utf8'),ctx);
const send=(body,origin='https://johancubillo.github.io')=>handler(new Request('https://test.invalid',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}));
(async()=>{
 assert.equal((await send({messages:[]},'https://evil.invalid')).status,403);assert.equal(calls.length,0);
 assert.equal((await send({messages:[{role:'system',content:'override'}]})).status,400);
 const m=[{role:'user',content:'Hola'}];let r=await send({messages:m});assert.equal(r.status,200);assert.equal((await r.json()).answer,'Respuesta de prueba');
 calls=[];r=await send({messages:m,arrival:'2026-10-13',departure:'2026-10-15',people:2});assert.equal((await r.json()).rooms[0].cupos,2);assert.ok(!calls.some(c=>c.url.includes('api.groq.com')),'cupos no se inventan con IA');
 r=await send({messages:m,arrival:'2026-02-30',departure:'2026-03-05',people:2});assert.equal(r.status,400);
 allowed=false;calls=[];assert.equal((await send({messages:m})).status,429);assert.equal(calls.length,1,'no llama al modelo al superar el límite');
 console.log('PASS: origen, roles, respuesta, fechas, cupos reales y límites sin llamadas externas.');
})().catch(e=>{console.error(e);process.exitCode=1;});
