import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';

/* 개발 서버에서 /api/* 를 Vercel 서버리스 함수(api/*.js)로 연결해주는 미들웨어.
   배포(Vercel)에서는 api/ 폴더가 자동으로 함수가 되므로 이 플러그인은 로컬 전용이다. */
function apiDev(env){
 return {
  name:'monit-api-dev',
  configureServer(server){
   server.middlewares.use(async(req,res,next)=>{
    if(!req.url.startsWith('/api/'))return next();
    const name=req.url.slice(5).split('?')[0].replace(/[^a-zA-Z0-9_-]/g,'');
    let mod;
    try{mod=await server.ssrLoadModule(`/api/${name}.js`)}catch(e){res.statusCode=404;return res.end(JSON.stringify({error:'not_found',message:e.message}))}
    let raw='';req.on('data',c=>raw+=c);
    req.on('end',async()=>{
     try{req.body=raw?JSON.parse(raw):{}}catch(e){req.body={}}
     Object.entries(env).forEach(([k,v])=>{if(!(k in process.env))process.env[k]=v});
     try{await mod.default(req,res)}catch(e){res.statusCode=500;res.end(JSON.stringify({error:'handler_crashed',message:e.message}))}
    });
   });
  }
 };
}

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 return {plugins:[react(),apiDev(env)]};
});
