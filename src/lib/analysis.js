/* 일기·대화 분석의 공통 정의. 서버(api/analyze.js)와 클라이언트가 함께 쓴다.
   의존성 없음 — 브라우저와 Node 양쪽에서 import 가능해야 한다. */

/* 관심사 태그: 원본 MVP의 taste 키와 같아야 추천에 바로 반영된다 */
export const INTEREST_TAGS={dino:'공룡',water:'물놀이',animal:'동물',draw:'그리기',train:'기차',plant:'식물',play:'뛰어놀기',book:'책'};
/* 활동 성향: 같은 관심사라도 "보는 것"과 "하는 것"을 가른다 */
export const STYLE_TAGS={hands:'직접 해보기',watch:'구경하기',outdoor:'야외',indoor:'실내',quiet:'조용한 곳',lively:'북적한 곳'};

export function ageGroupOf(age){const n=Number(age)||0;return n>=7?'7-9':'4-6'}

/* 분석 모델(Gemini)에 보낼 시스템 프롬프트. 연령대에 따라 "누가 쓴 글인지"와 "무엇을 신호로 볼지"가 다르다 */
/* 일기는 항상 부모가 쓴다 (육아일기). 연령대에 따라 어떤 신호를 더 볼지만 다르다.
   토큰 절약: 태그 설명은 스키마의 enum이 이미 제한하므로 한글 이름만 짧게 준다. 약 250토큰. */
export function systemPrompt(ageGroup,childName){
 const who=ageGroup==='7-9'
  ?`부모가 쓴 ${childName}(7~9세)의 육아일기. 아이가 한 말("또 가고 싶다", "싫어")을 인용한 부분과 아이가 스스로 고른 활동이 가장 강한 신호.`
  :`부모가 쓴 ${childName}(4~6세)의 육아일기. 오래 머문 것·반복한 것·울거나 피한 것 같은 행동이 가장 강한 신호.`;
 return `부모의 육아일기에서 아이의 관심사와 활동 성향을 추출한다. ${who}
태그: ${Object.entries(INTEREST_TAGS).map(([k,v])=>`${k}=${v}`).join(' ')}
성향: ${Object.entries(STYLE_TAGS).map(([k,v])=>`${k}=${v}`).join(' ')}
score 0~1 (좋아함≥0.6, 싫어함≤0.3, 언급만 0.5). quote는 원문에서 그대로 20자 이내. 근거 없는 태그 금지, 추측 금지.
avoid: 무서워하거나 싫어한 것, 알레르기. summary: 부모에게 보여줄 한 문장, "${childName}는 ~" 형태, 과장 없이.`;
}

/* 구조화 출력 스키마 (output_config.format) */
export const OUTPUT_SCHEMA={
 type:'object',
 properties:{
  interests:{type:'array',items:{type:'object',properties:{tag:{type:'string',enum:Object.keys(INTEREST_TAGS)},score:{type:'number'},quote:{type:'string'}},required:['tag','score','quote'],additionalProperties:false}},
  styles:{type:'array',items:{type:'object',properties:{tag:{type:'string',enum:Object.keys(STYLE_TAGS)},score:{type:'number'},quote:{type:'string'}},required:['tag','score','quote'],additionalProperties:false}},
  avoid:{type:'array',items:{type:'object',properties:{item:{type:'string'},quote:{type:'string'}},required:['item','quote'],additionalProperties:false}},
  summary:{type:'string'}
 },
 required:['interests','styles','avoid','summary'],
 additionalProperties:false
};

/* 키가 없거나 서버가 죽었을 때 쓰는 단순 키워드 분석. 데모가 멈추지 않게 하는 안전망. */
const KEYWORDS={
 dino:['공룡','티라노','화석','뼈'],water:['물놀이','수영','분수','바다','계곡','물에'],animal:['동물','토끼','강아지','고양이','양','사자','호랑이','먹이'],
 draw:['그림','그리','색칠','만들','공방'],train:['기차','지하철','열차','버스','자동차'],plant:['꽃','나무','식물','숲','풀'],play:['뛰','놀이터','미끄럼','그네','달리'],book:['책','도서관','읽']
};
const STYLE_KW={hands:['만지','만져','해봤','직접','먹이','체험'],watch:['봤다','구경','보기만','봤어'],outdoor:['밖','공원','숲','바다','야외'],indoor:['실내','안에서','집에서'],quiet:['조용'],lively:['시끄','사람 많','북적']};
const NEG=['싫','무서','울었','안 좋','지루','재미없','안 떠나'];
const POS=['좋아','재밌','재미있','또 ','신나','웃','안 떠났'];
function sentenceOf(text,kw){const s=text.split(/(?<=[.!?\n])/).find(x=>x.includes(kw));return (s||'').trim().slice(0,40)}
export function localAnalyze(text,childName){
 const t=String(text||'');const interests=[],styles=[],avoid=[];
 const tone=s=>NEG.some(n=>s.includes(n))?0.25:POS.some(p=>s.includes(p))?0.8:0.55;
 Object.entries(KEYWORDS).forEach(([tag,kws])=>{const kw=kws.find(k=>t.includes(k));if(!kw)return;const q=sentenceOf(t,kw);interests.push({tag,score:tone(q||t),quote:q||kw})});
 Object.entries(STYLE_KW).forEach(([tag,kws])=>{const kw=kws.find(k=>t.includes(k));if(!kw)return;const q=sentenceOf(t,kw);styles.push({tag,score:tone(q||t),quote:q||kw})});
 NEG.forEach(n=>{if(t.includes(n)){const q=sentenceOf(t,n);if(q)avoid.push({item:q.slice(0,20),quote:q})}});
 const top=interests.filter(i=>i.score>=.6).map(i=>INTEREST_TAGS[i.tag]);
 const summary=top.length?`${childName}는 오늘 ${top.join(', ')}에 마음이 갔어요.`:`${childName}의 오늘 기록을 저장했어요.`;
 return {interests,styles,avoid:avoid.slice(0,3),summary,source:'local'};
}

/* 분석 결과를 취향 점수에 섞는다: 새 점수 = 0.7×기존 + 0.3×신호 (언급된 태그만) */
export function mergeTaste(taste,analysis){
 const next={...taste};
 (analysis.interests||[]).forEach(({tag,score})=>{if(!(tag in next))return;const s=Math.max(0,Math.min(1,Number(score)||0));next[tag]=Math.max(0.05,Math.min(0.98,0.7*next[tag]+0.3*s))});
 return next;
}
export function mergeStyles(styles,analysis){
 const next={...(styles||{})};
 (analysis.styles||[]).forEach(({tag,score})=>{const s=Math.max(0,Math.min(1,Number(score)||0));next[tag]=tag in next?0.7*next[tag]+0.3*s:s});
 return next;
}
