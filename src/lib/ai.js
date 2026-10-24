/* 클라이언트에서 분석 API를 부른다.
   비용 절감 규칙: 짧은 글은 LLM 없이 로컬 분석, 같은 글은 캐시 재사용.
   서버가 키가 없거나 실패하면 로컬 키워드 분석으로 넘어간다. */
import {localAnalyze} from './analysis.js';

const MIN_LEN_FOR_LLM=15;
const CACHE_KEY='monit-analyze-cache-v1';
const CACHE_MAX=50;

function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return (h>>>0).toString(36)}
function loadCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY))||{}}catch(e){return {}}}
function saveCache(c){try{const keys=Object.keys(c);if(keys.length>CACHE_MAX)keys.slice(0,keys.length-CACHE_MAX).forEach(k=>delete c[k]);localStorage.setItem(CACHE_KEY,JSON.stringify(c))}catch(e){}}

export async function analyzeText({text,ageGroup,childName}){
 const t=String(text||'').trim();
 if(t.length<MIN_LEN_FOR_LLM)return {...localAnalyze(t,childName),fallbackReason:'short'};
 const key=hash(ageGroup+'|'+childName+'|'+t);
 const cache=loadCache();
 if(cache[key])return {...cache[key],cached:true};
 try{
  const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,ageGroup,childName})});
  if(r.ok){const data={...(await r.json()),source:'gemini'};cache[key]=data;saveCache(cache);return data}
  const err=await r.json().catch(()=>({}));
  if(r.status===503||err.error==='no_key')return {...localAnalyze(t,childName),fallbackReason:'no_key'};
  return {...localAnalyze(t,childName),fallbackReason:err.message||('http_'+r.status)};
 }catch(e){
  return {...localAnalyze(t,childName),fallbackReason:'network'};
 }
}
