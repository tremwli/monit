/* 원본 MVP 상태 기본값·저장 그대로 */
import {nextSat,ymd} from './utils.js';
import {DATA_SOURCE} from './data.js';
import {LEGACY,migrateRef} from './interests.js';

/* 샘플 데이터와 실제 데이터는 장소 id가 달라서 저장 공간을 나눠요 (예전 코스가 없는 장소를 가리키지 않게) */
export const KEY=DATA_SOURCE==='tourapi'?'monit-real-v1':'monit-mvp-v1';

export function defaults(){const sat=nextSat();return {
 onboarded:false, child:{name:'서아',age:5},
 /* 취향: 흥미 유형('a:키')과 관심 주제(낱말) 점수 0~1. 없는 항목은 0.5(모름)로 본다 (lib/interests.js) */
 taste:{'공룡':.62,'물놀이':.6,'동물':.48,'기차':.36,'식물':.5,'a:create':.36,'a:outdoor':.46,'a:literacy':.3},
 prevTaste:null, kidPicks:[], kidQuote:'',
 c:{startDate:sat,startTime:570,endDate:sat,endTime:780,
    schedules:[{id:'s1',name:'낮잠',start:780,end:900,color:'#93A9EE'},{id:'s2',name:'간식',start:660,end:675,color:'#FFD666'}],
    place:'near',maxTravel:30,mode:'car',adults:['엄마','아빠'],stroller:'bring',
    fac:['stroller','nursing','diaper','parking','pediatric'],feeMode:'paid',budget:100000,rainIndoor:true,
    wants:['공룡','물놀이'],energy:'high',novelty:'one',perDay:2,meal:true,avoidCrowd:true},
 lastCourse:null, history:[], visited:[], courses:[],
 diary:[], styles:{}, avoid:[]
}}

/* 예전 저장본에 새 필드(courses, diary, styles, avoid …)가 없을 수 있으니 기본값 위에 덮어쓴다 */
export function load(){try{const saved=JSON.parse(localStorage.getItem(KEY));if(!saved)return defaults();const S={...defaults(),...saved};
 /* 이전 버전 일기 항목에 id·photos·kind가 없으면 채워준다 */
 let migrated=false;
 S.diary=(S.diary||[]).map((e,i)=>{if(e.id&&e.photos)return e;migrated=true;return {id:e.id||('e-old-'+i+'-'+(e.createdAt||0)),kind:e.kind||'diary',title:e.title||'',photos:e.photos||[],placeId:e.placeId||null,reaction:e.reaction||null,...e}});
 /* 원본 8개 태그(dino, draw …)로 저장된 취향·원하는 곳·아이가 고른 것을 새 모델로 옮긴다 */
 const legacy=k=>k in LEGACY;
 if(Object.keys(S.taste||{}).some(legacy)||(S.c?.wants||[]).some(legacy)||(S.kidPicks||[]).some(legacy)){
  const mt=o=>{const r={};Object.entries(o||{}).forEach(([k,v])=>{r[migrateRef(k)]=v});return r};
  S.taste=mt(S.taste);if(S.prevTaste)S.prevTaste=mt(S.prevTaste);
  S.c={...S.c,wants:(S.c.wants||[]).map(migrateRef)};S.kidPicks=(S.kidPicks||[]).map(migrateRef);migrated=true}
 /* 예전 '1인 최대 요금'(feeMax) → 여행 총예산(budget). 처음엔 10만 원으로 둔다 */
 if(S.c&&S.c.budget==null){const {feeMax,...rest}=S.c;void feeMax;S.c={...rest,budget:100000};migrated=true}
 /* 출발 날짜가 이미 지났으면 다음 토요일로 옮긴다 (며칠짜리 일정이면 기간은 그대로) */
 const today=ymd(new Date());
 if(S.c&&S.c.startDate<today){const days=Math.max(0,Math.round((new Date(S.c.endDate)-new Date(S.c.startDate))/864e5));const a=nextSat();const b=new Date(a+'T00:00:00');b.setDate(b.getDate()+days);S.c={...S.c,startDate:a,endDate:ymd(b)};migrated=true}
 if(migrated)save(S);
 return S}catch(e){return defaults()}}
export function save(S){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
export function clear(){try{localStorage.removeItem(KEY)}catch(e){}}
