/* Vercel 서버리스 함수: POST /api/analyze
   body: {text, ageGroup: '4-6'|'7-9', childName}
   → {interests, styles, avoid, summary, source:'claude'}
   API 키는 서버 환경변수 ANTHROPIC_API_KEY에서만 읽는다. 프론트에 절대 넣지 않는다. */
import Anthropic from '@anthropic-ai/sdk';
import {systemPrompt,OUTPUT_SCHEMA,INTEREST_TAGS,STYLE_TAGS} from '../src/lib/analysis.js';

const MODEL='claude-opus-5-5';

export default async function handler(req,res){
 if(req.method!=='POST'){res.statusCode=405;return res.end(JSON.stringify({error:'method_not_allowed'}))}
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(!process.env.ANTHROPIC_API_KEY){res.statusCode=503;return res.end(JSON.stringify({error:'no_key',message:'ANTHROPIC_API_KEY가 설정되지 않았어요'}))}

 let body=req.body;
 if(typeof body==='string'){try{body=JSON.parse(body)}catch(e){body=null}}
 const text=String(body?.text||'').trim();
 const ageGroup=body?.ageGroup==='7-9'?'7-9':'4-6';
 const childName=String(body?.childName||'아이').slice(0,20);
 if(text.length<2){res.statusCode=400;return res.end(JSON.stringify({error:'empty_text'}))}
 if(text.length>4000){res.statusCode=400;return res.end(JSON.stringify({error:'too_long'}))}

 const client=new Anthropic();
 try{
  const response=await client.messages.create({
   model:MODEL,
   max_tokens:4000,
   output_config:{effort:'low',format:{type:'json_schema',schema:OUTPUT_SCHEMA}},
   system:systemPrompt(ageGroup,childName),
   messages:[{role:'user',content:`기록:\n"""\n${text}\n"""`}],
  });
  if(response.stop_reason==='refusal'){res.statusCode=422;return res.end(JSON.stringify({error:'refusal'}))}
  const textBlock=response.content.find(b=>b.type==='text');
  const parsed=JSON.parse(textBlock?.text||'{}');
  /* 목록 밖 태그는 버린다 (스키마가 막지만 한 번 더) */
  parsed.interests=(parsed.interests||[]).filter(i=>i.tag in INTEREST_TAGS);
  parsed.styles=(parsed.styles||[]).filter(i=>i.tag in STYLE_TAGS);
  parsed.avoid=parsed.avoid||[];
  parsed.source='claude';
  res.statusCode=200;res.end(JSON.stringify(parsed));
 }catch(err){
  const status=err instanceof Anthropic.AuthenticationError?401:err instanceof Anthropic.RateLimitError?429:err instanceof Anthropic.APIError?(err.status||502):500;
  console.error('[analyze]',err?.message||err);
  res.statusCode=status;res.end(JSON.stringify({error:'analyze_failed',message:err?.message||String(err)}));
 }
}
