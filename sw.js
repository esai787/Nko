const CACHE='nko-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const FONTCSS='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Noto+Sans+NKo&display=swap';

self.addEventListener('install',e=>{
 e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await c.addAll(SHELL);
  try{
   const r=await fetch(FONTCSS);
   const css=await r.clone().text();
   await c.put(FONTCSS,r);
   const urls=[...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]);
   await Promise.all(urls.map(async u=>{try{const fr=await fetch(u,{mode:'no-cors'});await c.put(u,fr);}catch(_){}}));
  }catch(_){}
  self.skipWaiting();
 })());
});

self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k!==CACHE)await caches.delete(k);}
  await self.clients.claim();
 })());
});

self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(u.origin===location.origin){
  e.respondWith(fetch(req).then(r=>{
   if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
   return r;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
 }else if(u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('gstatic.com')){
  e.respondWith(caches.match(req,{ignoreVary:true}).then(r=>r||fetch(req).then(res=>{
   const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;
  })));
 }
});
