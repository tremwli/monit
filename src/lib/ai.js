/* 클라이언트에서 분석 API를 부른다. 서버가 키가 없거나 실패하면 로컬 키워드 분석으로 넘어간다. */
import {localAnalyze} from './analysis.js';

export async function analyzeText({text,ageGroup,childName}){
 try{
  const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,ageGroup,childName})});
  if(r.ok){const data=await r.json();return {...data,source:'claude'}}
  const err=await r.json().catch(()=>({}));
  if(r.status===503||err.error==='no_key')return {...localAnalyze(text,childName),fallbackReason:'no_key'};
  return {...localAnalyze(text,childName),fallbackReason:err.message||('http_'+r.status)};
 }catch(e){
  return {...localAnalyze(text,childName),fallbackReason:'network'};
 }
}
