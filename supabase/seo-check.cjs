const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.join(__dirname,'..'),base='https://johancubillo.github.io/CRARC/';
for(const name of ['index.html','conocenos.html','voluntariado.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.ok(html.includes(`href="${base}${name==='index.html'?'':name}"`));
 const body=html.slice(html.indexOf('<body>'),html.indexOf('</main>'));
 assert.match(body,/<h1[^>]*>[^<]+/,'h1 visible sin JavaScript');
 assert.ok(!/<(?:h[1-3]|p|a|span)[^>]*data-i18n(?:-html)?="[^"]+"[^>]*>\s*<\//.test(body),'textos principales completos');
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema['@graph'][0]['@type'],'Organization');
 for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(!m[1].includes('application/ld+json'))new vm.Script(m[2]);}
}
const volunteering=fs.readFileSync(path.join(root,'voluntariado.html'),'utf8').split('<body>')[1];
assert.ok(volunteering.includes('$95'));assert.match(volunteering,/data-i18n="c6">Piscina</);
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,4);assert.ok(!/admin|turnos|index2/.test(sitemap));
for(const name of ['admin.html','turnos.html','index2.html'])assert.match(fs.readFileSync(path.join(root,name),'utf8'),/name="robots" content="noindex/);
assert.match(fs.readFileSync(path.join(root,'chatbot.js'),'utf8'),/https:\/\/wa.me\/50685228125/);
const donation=fs.readFileSync(path.join(root,'donaciones.html'),'utf8');assert.ok(donation.includes('8305-0069'));assert.ok(donation.includes('donaciones.html'));JSON.parse(donation.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
console.log('PASS: contenido sin JS, scripts, canónicas, JSON-LD, piscina, precios, sitemap, noindex y WhatsApp.');
