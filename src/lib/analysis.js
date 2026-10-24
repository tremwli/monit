/* 일기·대화 분석의 공통 정의. 서버(api/analyze.js)와 클라이언트가 함께 쓴다.
   의존성 없음 — 브라우저와 Node 양쪽에서 import 가능해야 한다. */

/* 관심사는 흥미 유형(고정 9개) + 관심 주제(열린 낱말) 두 층 — lib/interests.js 참고 */
import {AREAS,SEED_TOPICS,normalizeTopic,migrateRef,isArea,label} from './interests.js';
export {label};
/* 활동 성향: 같은 관심사라도 "보는 것"과 "하는 것"을 가른다 */
export const STYLE_TAGS={hands:'직접 해보기',watch:'구경하기',outdoor:'야외',indoor:'실내',quiet:'조용한 곳',lively:'북적한 곳'};

export function ageGroupOf(age){const n=Number(age)||0;return n>=7?'7-9':'4-6'}

/* 분석 모델(Gemini)에 보낼 시스템 프롬프트. 일기는 항상 부모가 쓴다 (육아일기). 연령대에 따라 어떤 신호를 더 볼지만 다르다.
   흥미 유형은 정해진 키 중에서, 관심 주제는 정해진 목록 없이 원문에 나온 대상을 짧은 명사로 뽑게 한다. */
export function systemPrompt(ageGroup,childName){
 const who=ageGroup==='7-9'
  ?`부모가 쓴 ${childName}(7~9세)의 육아일기. 아이가 한 말("또 가고 싶다", "싫어")을 인용한 부분과 아이가 스스로 고른 활동이 가장 강한 신호.`
  :`부모가 쓴 ${childName}(4~6세)의 육아일기. 오래 머문 것·반복한 것·울거나 피한 것 같은 행동이 가장 강한 신호.`;
 return `부모의 육아일기에서 아이의 흥미 유형, 관심 주제, 노는 방식을 추출한다. ${who}
흥미 유형(areas, 어떻게 노는가): ${Object.entries(AREAS).map(([k,v])=>`${k}=${v}`).join(' ')}
관심 주제(topics, 무엇에 빠졌는가): 원문에 나온 대상을 2~6자 한국어 명사로 (예: 공룡, 소방차, 개미, 우주). 목록 없음. 최대 5개.
노는 방식(styles): ${Object.entries(STYLE_TAGS).map(([k,v])=>`${k}=${v}`).join(' ')}
score 0~1 (좋아함≥0.6, 싫어함≤0.3, 언급만 0.5). quote는 원문에서 그대로 20자 이내. 근거 없는 항목 금지, 추측 금지.
avoid: 무서워하거나 싫어한 것, 알레르기. topic에 그 대상 명사. summary: 부모에게 보여줄 한 문장, "${childName}는 ~" 형태, 과장 없이.`;
}

/* 구조화 출력 스키마 */
const item=(key,keyType)=>({type:'object',properties:{[key]:keyType,score:{type:'number'},quote:{type:'string'}},required:[key,'score','quote'],additionalProperties:false});
export const OUTPUT_SCHEMA={
 type:'object',
 properties:{
  areas:{type:'array',items:item('tag',{type:'string',enum:Object.keys(AREAS)})},
  topics:{type:'array',items:item('topic',{type:'string'})},
  styles:{type:'array',items:item('tag',{type:'string',enum:Object.keys(STYLE_TAGS)})},
  avoid:{type:'array',items:{type:'object',properties:{item:{type:'string'},topic:{type:'string'},quote:{type:'string'}},required:['item','topic','quote'],additionalProperties:false}},
  summary:{type:'string'}
 },
 required:['areas','topics','styles','avoid','summary'],
 additionalProperties:false
};

/* 모델 응답(areas+topics) → 앱에서 쓰는 한 줄 목록 interests:[{tag:ref,score,quote}].
   흥미 유형은 'a:키', 주제는 같은 뜻끼리 묶은 이름(normalizeTopic). 같은 항목이 두 번 나오면 첫 것만 */
export function toInterests(parsed){
 const out=[],seen=new Set();
 const push=(ref,x)=>{if(!ref||seen.has(ref))return;seen.add(ref);out.push({tag:ref,score:Math.max(0,Math.min(1,Number(x.score)||0)),quote:x.quote||''})};
 (parsed.areas||[]).forEach(x=>{if(x.tag in AREAS)push('a:'+x.tag,x)});
 (parsed.topics||[]).forEach(x=>push(normalizeTopic(x.topic),x));
 return out;
}

/* 키가 없거나 서버가 죽었을 때 쓰는 단순 키워드 분석. 데모가 멈추지 않게 하는 안전망. */
/* 흥미 유형 단어 (일기 말투 기준). '책'은 '산책'에 걸려서 '책을'·'읽'처럼 쓴다 */
const AREA_KW={
 pretend:['역할','소꿉','흉내','병원놀이','엄마 놀이','상상'],create:['그림','그리','색칠','만들','공방'],build:['블록','레고','쌓','조립'],
 sport:['뛰','달리','트램펄린','수영','공차','축구','춤'],outdoor:['놀이터','그네','미끄럼','산책','자전거','공원'],games:['보드게임','퍼즐','숨바꼭질'],
 literacy:['책을','책 ','그림책','읽','동화'],skill:['배웠','연습','악기','피아노'],concept:['이름을','외워','물어봤','궁금']
};
const STYLE_KW={hands:['만지','만져','해봤','직접','먹이','체험'],watch:['봤다','구경','보기만','봤어'],outdoor:['밖','공원','숲','바다','야외'],indoor:['실내','안에서','집에서'],quiet:['조용'],lively:['시끄','사람 많','북적']};
const NEG=['싫','무서','울었','안 좋','지루','재미없','안 떠나'];
const POS=['좋아','재밌','재미있','또 ','신나','웃','안 떠났'];
function sentenceOf(text,kw){const s=text.split(/(?<=[.!?\n])/).find(x=>x.includes(kw));return (s||'').trim().slice(0,40)}
export function localAnalyze(text,childName){
 const t=String(text||'');const interests=[],styles=[],avoid=[];const seen=new Set();
 const tone=s=>NEG.some(n=>s.includes(n))?0.25:POS.some(p=>s.includes(p))?0.8:0.55;
 const add=(ref,kw)=>{if(seen.has(ref))return;seen.add(ref);const q=sentenceOf(t,kw);interests.push({tag:ref,score:tone(q||t),quote:q||kw})};
 /* 주제: 같은 뜻 사전(SEED_TOPICS)에서 찾는다. 한 글자 말은 건너뜀 */
 Object.entries(SEED_TOPICS).forEach(([name,al])=>{const kw=al.find(k=>k.trim().length>=2&&t.includes(k.trim()));if(kw)add(name,kw)});
 Object.entries(AREA_KW).forEach(([k,kws])=>{const kw=kws.find(w=>t.includes(w));if(kw)add('a:'+k,kw)});
 Object.entries(STYLE_KW).forEach(([tag,kws])=>{const kw=kws.find(k=>t.includes(k));if(!kw)return;const q=sentenceOf(t,kw);styles.push({tag,score:tone(q||t),quote:q||kw})});
 NEG.forEach(n=>{if(t.includes(n)){const q=sentenceOf(t,n);if(q&&!avoid.some(x=>x.quote===q)){const hit=Object.entries(SEED_TOPICS).find(([,al])=>al.some(k=>k.trim().length>=2&&q.includes(k.trim())));avoid.push({item:q.slice(0,20),topic:hit?hit[0]:'',quote:q})}}});
 const top=interests.filter(i=>i.score>=.6).map(i=>label(i.tag));
 const summary=top.length?`${childName}는 오늘 ${top.join(', ')}에 마음이 갔어요.`:`${childName}의 오늘 기록을 저장했어요.`;
 return {interests,styles,avoid:avoid.slice(0,3),summary,source:'local'};
}

/* 분석 결과를 취향 점수에 섞는다: 새 점수 = 0.7×기존(없으면 0.5) + 0.3×신호. 언급된 항목만.
   예전 일기(원본 8개 태그)도 그대로 들어오면 새 이름으로 옮겨서 섞는다 */
export function mergeTaste(taste,analysis){
 const next={...taste};
 (analysis.interests||[]).forEach(({tag,score})=>{const ref=isArea(tag)?tag:normalizeTopic(migrateRef(tag));if(!ref)return;const s=Math.max(0,Math.min(1,Number(score)||0));next[ref]=Math.max(0.05,Math.min(0.98,0.7*(next[ref]??.5)+0.3*s))});
 return next;
}
export function mergeStyles(styles,analysis){
 const next={...(styles||{})};
 (analysis.styles||[]).forEach(({tag,score})=>{const s=Math.max(0,Math.min(1,Number(score)||0));next[tag]=tag in next?0.7*next[tag]+0.3*s:s});
 return next;
}
