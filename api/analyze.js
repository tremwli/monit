/* Vercel 서버리스 함수: POST /api/analyze
   body: {text, ageGroup: '4-6'|'7-9', childName}
   → {interests:[{tag,score,quote}], styles, avoid, summary, source:'gemini'}
   interests의 tag는 흥미 유형('a:키') 또는 관심 주제(낱말) — src/lib/interests.js
   API 키는 서버 환경변수 GEMINI_API_KEY에서만 읽는다. 프론트에 절대 넣지 않는다. */
import {systemPrompt,OUTPUT_SCHEMA,STYLE_TAGS,toInterests} from '../src/lib/analysis.js';

/* 태그 고르기는 Flash-Lite로 충분. 호출 1회 ≈ 입력 290 + 출력 160 토큰, 1원 미만.
   2.5 Flash-Lite는 신규 키에 막혀 있어서(404) 3.5를 쓴다. */
const MODEL=process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
const URL='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent';

/* Gemini의 responseSchema는 OpenAPI 3.0 부분집합이라 additionalProperties를 모른다 → 빼고 보낸다 */
function toGeminiSchema(s){
 if(Array.isArray(s))return s.map(toGeminiSchema);
 if(s&&typeof s==='object'){const o={};for(const [k,v] of Object.entries(s)){if(k==='additionalProperties')continue;o[k]=toGeminiSchema(v)}return o}
 return s;
}
const SCHEMA=toGeminiSchema(OUTPUT_SCHEMA);

/* 모델이 준 quote가 원문에 없으면, 글자 2개 단위로 가장 많이 겹치는 원문 문장으로 바꾼다 */
function snapQuote(text,quote){
 quote=String(quote||'').trim();
 if(!quote||text.includes(quote))return quote.slice(0,40);
 const grams=s=>{const g=new Set();const t=s.replace(/\s+/g,'');for(let i=0;i<t.length-1;i++)g.add(t.slice(i,i+2));return g};
 const q=grams(quote);let best='',bestN=0;
 for(const sent of text.split(/(?<=[.!?。\n])\s*|(?<=다)\.?\s+/).map(x=>x.trim()).filter(Boolean)){
  let n=0;for(const g of grams(sent))if(q.has(g))n++;
  if(n>bestN){bestN=n;best=sent}
 }
 return (bestN>=2?best:quote).slice(0,40);
}

export default async function handler(req,res){
 if(req.method!=='POST'){res.statusCode=405;return res.end(JSON.stringify({error:'method_not_allowed'}))}
 res.setHeader('Content-Type','application/json; charset=utf-8');
 const key=process.env.GEMINI_API_KEY;
 if(!key){res.statusCode=503;return res.end(JSON.stringify({error:'no_key',message:'GEMINI_API_KEY가 설정되지 않았어요'}))}

 let body=req.body;
 if(typeof body==='string'){try{body=JSON.parse(body)}catch(e){body=null}}
 const text=String(body?.text||'').trim();
 const ageGroup=body?.ageGroup==='7-9'?'7-9':'4-6';
 const childName=String(body?.childName||'아이').slice(0,20);
 if(text.length<2){res.statusCode=400;return res.end(JSON.stringify({error:'empty_text'}))}
 if(text.length>4000){res.statusCode=400;return res.end(JSON.stringify({error:'too_long'}))}

 try{
  const r=await fetch(URL,{
   method:'POST',
   headers:{'x-goog-api-key':key,'Content-Type':'application/json'},
   body:JSON.stringify({
    system_instruction:{parts:[{text:systemPrompt(ageGroup,childName)}]},
    contents:[{role:'user',parts:[{text:`기록:\n"""\n${text}\n"""`}]}],
    generationConfig:{
     responseMimeType:'application/json',
     responseSchema:SCHEMA,
     maxOutputTokens:600, /* 구조화 출력이라 넘칠 일 없음. 출력 상한을 고정해 비용을 막는다 */
     temperature:0.2,
    },
   }),
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok){
   const msg=data?.error?.message||('HTTP '+r.status);
   console.error('[analyze]',r.status,msg);
   /* 키 문제·한도 초과는 상태를 그대로 넘겨 클라이언트가 폴백하게 한다 */
   res.statusCode=r.status===400&&/API key/i.test(msg)?401:r.status;
   return res.end(JSON.stringify({error:'analyze_failed',message:msg}));
  }
  const cand=data.candidates?.[0];
  if(!cand||cand.finishReason==='SAFETY'||cand.finishReason==='PROHIBITED_CONTENT'){res.statusCode=422;return res.end(JSON.stringify({error:'refusal'}))}
  const raw=(cand.content?.parts||[]).map(p=>p.text||'').join('');
  const parsed=JSON.parse(raw||'{}');
  /* 흥미 유형은 목록 밖이면 버리고(스키마가 막지만 한 번 더), 주제는 같은 뜻끼리 묶는다(toInterests).
     quote는 원문 구절로 되돌린다 (Flash-Lite가 가끔 바꿔 씀) */
  const snap=x=>({...x,quote:snapQuote(text,x.quote)});
  parsed.interests=toInterests(parsed).map(snap);delete parsed.areas;delete parsed.topics;
  parsed.styles=(parsed.styles||[]).filter(i=>i.tag in STYLE_TAGS).map(snap);
  parsed.avoid=(parsed.avoid||[]).map(snap);
  parsed.source='gemini';
  res.statusCode=200;res.end(JSON.stringify(parsed));
 }catch(err){
  console.error('[analyze]',err?.message||err);
  res.statusCode=500;res.end(JSON.stringify({error:'analyze_failed',message:err?.message||String(err)}));
 }
}
