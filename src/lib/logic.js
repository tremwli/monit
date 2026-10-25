/* 추천 로직. 전역 S 대신 첫 인자로 S를 받는다.
   실제 데이터(TourAPI)용으로 더한 것: 모르는 편의시설은 통과(facKnown), 운영시간·휴무일 확인(openOk).
   관심사는 흥미 유형 + 열린 주제 두 층(lib/interests.js). 일기에서 뽑은 노는 방식(S.styles)·조심할 것(S.avoid)도 점수에 쓴다. */
import {HOME,PLACES,MEAL_FAC,FAC} from './data.js';
import {travel,ymd,clamp} from './utils.js';
import {profileOf,mentions,matchesRef,isArea,migrateRef,normalizeTopic,label} from './interests.js';

const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
/* 직접 해보는 유형 (노는 방식 '직접 해보기' ↔ '구경하기'와 맞춰 본다) */
const HANDS_ON=['create','build','skill','sport','pretend'];

/* 아이 취향과 장소가 얼마나 맞는지 (0~1).
   주제: 아이가 가진 주제 중 이 장소가 다루는 것들. 가장 강한 신호가 주도한다(최고점 75% + 평균 25%) —
        곤충을 좋아하는 아이에게 곤충식물원은, 식물·동물에 관심이 없어도 '좋아해요'여야 하니까. 하나도 안 겹치면 0.45(모름).
   유형: 장소가 주는 흥미 유형들의 아이 점수 평균. 기록이 없는 유형은 0.5.
   주제가 겹치면 주제 55% + 유형 45%, 안 겹치면 유형 위주로 본다. */
export function fitOf(S,p){
 const pr=profileOf(p),T=S.taste||{};
 /* 주제가 장소 글에 없으면 상위 묶음(사마귀→곤충)으로도 맞춰본다 */
 const G=S.topicGroups||{};
 const tScores=Object.keys(T).filter(k=>!isArea(k)&&(mentions(p,k)||(G[k]&&mentions(p,G[k])))).map(k=>T[k]);
 const aScores=pr.areas.map(a=>T['a:'+a]??.5);
 const area=aScores.length?avg(aScores):.5;
 if(!tScores.length)return .45*.4+area*.6;
 const hi=Math.max(...tScores),topic=hi>=.5?.75*hi+.25*avg(tScores):avg(tScores);
 return .55*topic+.45*area;
}
/* 예전 이름 유지 (리포트 등에서 사용) */
export const avgTaste=fitOf;

/* 일기에서 나온 '조심할 것'(주제 낱말로 저장, 예: 물놀이)이 이 장소와 겹치는지 */
function avoidHit(S,p){return (S.avoid||[]).some(item=>{const t=normalizeTopic(item);return t.length>=2&&mentions(p,t)})}

export function scorePlace(S,p){
 const c=S.c,pr=profileOf(p),st=S.styles||{};let s=.62*fitOf(S,p)+.26*p.base;
 if((c.wants||[]).some(r=>matchesRef(p,r)))s+=.12;
 if(c.avoidCrowd&&p.crowd)s-=.1;
 if(c.energy==='low'){if(p.stay>55)s-=.08;if(!p.indoor)s-=.06}
 if(c.energy==='high'&&pr.areas.some(a=>a==='sport'||a==='outdoor'))s+=.04;
 /* 노는 방식(일기 분석): 기록이 있을 때만. 각각 최대 ±0.06 */
 if(st.outdoor!=null||st.indoor!=null)s+=.06*((st.outdoor??.5)-(st.indoor??.5))*(p.indoor?-1:1);
 if(st.lively!=null||st.quiet!=null)s+=.06*((st.lively??.5)-(st.quiet??.5))*(p.crowd?1:-1);
 if(st.hands!=null||st.watch!=null)s+=.06*((st.hands??.5)-(st.watch??.5))*(pr.areas.some(a=>HANDS_ON.includes(a))?1:-1);
 if(avoidHit(S,p))s-=.2;
 /* 실제 데이터: 꼭 필요하다고 고른 시설인데 정보가 없는 곳은 살짝 뒤로 (확인된 곳 먼저).
    '정보 없음'은 '없음'이 아니라서 작게만: 하나당 -0.02, 합쳐서 최대 -0.06. (전엔 -0.05씩 최대 -0.2라 취향보다 시설 정보 유무가 순위를 정했다) */
 if(p.facKnown)s-=Math.min(.06,.02*c.fac.filter(f=>!p.facKnown.includes(f)&&f!=='pediatric'&&f!=='er').length);
 return Math.max(0,Math.min(1,s))}

/* 다녀온 반응을 취향에 반영. 주제는 크게(±0.14~0.16), 흥미 유형은 넓은 범주라 그 절반만 */
export function learnFromVisit(S,p,v){
 const pr=profileOf(p),d=v==='like'?1:-1;
 const bump=(ref,amt)=>{S.taste[ref]=clamp((S.taste[ref]??.5)+amt)};
 pr.topics.forEach(t=>bump(t,d>0?.14:-.16));
 pr.areas.forEach(a=>bump('a:'+a,d>0?.07:-.08));
 return pr.topics.length+pr.areas.length;
}

/* 예전 8개 태그로 저장된 취향을 새 모델로 옮긴다 */
export function migrateTaste(taste){
 const out={};Object.entries(taste||{}).forEach(([k,v])=>{out[migrateRef(k)]=v});return out;
}
export {label};
export function isNewCandidate(S,p){return fitOf(S,p)<.42&&p.base>=.7&&!S.visited.includes(p.id)}
/* 점수 → 표정. 취향 0.6(프로필의 '좋아해요')으로 낼 수 있는 최대 점수가 0.7 안팎이라 기준을 거기에 맞춘다 */
export function levelOf(s,isNew){if(isNew)return 'C';return s>=.6?'A':s>=.46?'B':'C'}
export function passFilters(S,p,relax){
 const c=S.c;
 if(!relax){const need=c.fac.filter(f=>p.type==='meal'?MEAL_FAC.includes(f)||f==='stroller':!MEAL_FAC.includes(f));if(!need.every(f=>p.fac.includes(f)||(p.facKnown&&!p.facKnown.includes(f))))return false}
 if(c.feeMode==='free'&&p.fee>0&&p.type!=='meal')return false;
 /* 총예산: 한 곳 비용(1인 요금 × 인원)만으로 예산을 넘는 곳은 뺀다. 코스 전체 합계는 planDay에서 지갑으로 확인 */
 if(c.feeMode==='paid'&&p.fee*peopleOf(S)>budgetOf(S))return false;
 if(c.place==='near'&&travel(HOME,p,c.mode)>c.maxTravel)return false;
 return true}
/* 그날 문 열었는지, 도착~떠나는 시간이 운영시간 안인지. 정보가 없으면 통과. */
export function openOk(p,date,arrive,leave){
 if(p.closedDays&&p.closedDays.length&&date){const wd=new Date(date+'T00:00:00').getDay();if(p.closedDays.includes(wd))return false}
 if(p.open!=null&&arrive<p.open)return false;
 if(p.close!=null&&leave>p.close)return false;
 return true}
export function blocksFor(S){return S.c.schedules.filter(b=>b.end-b.start>20).map(b=>[b.start,b.end])}
export function softFor(S){return S.c.schedules.filter(b=>b.end-b.start<=20)}
export function dayList(S){const c=S.c;const out=[];const a=new Date(c.startDate+'T00:00:00'),b=new Date((c.endDate||c.startDate)+'T00:00:00');for(let d=new Date(a);d<=b&&out.length<3;d.setDate(d.getDate()+1))out.push(ymd(d));return out.length?out:[c.startDate]}
/* 함께 가는 사람 수: 고른 어른 + 아이 1명 */
export function peopleOf(S){return Math.max(1,(S.c.adults||[]).length)+1}
export function budgetOf(S){return Number(S.c.budget)||0}
/* wallet: {left} 여러 날에 걸쳐 남은 예산. 무료만 고른 경우엔 null(예산 확인 안 함) */
/* 이 장소에 몇 번 다녀왔는지 (기록 화면에서 저장한 방문 수) */
export function visitCount(S,id){return (S.history||[]).filter(h=>h.id===id).length}

/* opts: {prefer:Set(ids) 코스 수정 때 그대로 두고 싶은 곳, maxPlaces 하루 방문 수 덮어쓰기} */
export function planDay(S,date,used,relax,wallet,opts={}){
 const c=S.c,blocks=blocksFor(S),soft=softFor(S);
 const start=c.startTime,end=c.endTime>c.startTime?c.endTime:c.startTime+180;
 const limitAt=t=>{let L=end;blocks.forEach(([s,e])=>{if(s>=t&&s<L)L=s});return L};
 const inBlock=t=>blocks.find(([s,e])=>t>=s&&t<e);
 let t=start;const ib=inBlock(t);if(ib)t=ib[1];
 let pos=HOME,count=0,mealDone=!c.meal,newUsed=c.novelty==='none';
 const items=[{kind:'start',time:t}];
 const rand=c.place==='random';let lastJump=null;
 const ppl=peopleOf(S);const fits=p=>!wallet||p.fee*ppl<=wallet.left;const spend=p=>{if(wallet)wallet.left-=p.fee*ppl};
 const tryMeal=()=>{
  mealDone=true;
  const meals=PLACES.filter(m=>m.type==='meal'&&!used.has(m.id)&&passFilters(S,m,relax)).sort((a,b)=>travel(pos,a,c.mode)-travel(pos,b,c.mode));
  for(const m of meals){const tr=travel(pos,m,c.mode);if(!fits(m)||!openOk(m,date,t+tr,t+tr+m.stay))continue;if(t+tr+m.stay+travel(m,HOME,c.mode)<=limitAt(t)){items.push({kind:'move',min:tr,mode:c.mode});items.push({kind:'place',id:m.id,time:t+tr,stay:m.stay,score:.7,level:'B',meal:true});used.add(m.id);spend(m);pos=m;t+=tr+m.stay;return true}}
  return false};
 while(true){
  if(!mealDone&&t>=690&&t<840)tryMeal();
  if(count>=(opts.maxPlaces??c.perDay))break;
  const L=limitAt(t);
  const mealPending=!mealDone&&t<840&&L>700;
  let best=null;
  PLACES.filter(p=>p.type==='play'&&!used.has(p.id)&&passFilters(S,p,relax)).forEach(p=>{
   if(!fits(p))return;
   const tr=travel(pos,p,c.mode);if(tr>c.maxTravel+(c.place==='near'?0:15))return;
   /* 문 열기 전에 도착하면 40분까지는 기다렸다 들어가요 */
   let arr=t+tr;if(p.open!=null&&arr<p.open){if(p.open-arr>40)return;arr=p.open}
   const leave=arr+p.stay;const back=travel(p,HOME,c.mode);
   const reserve=mealPending?55:0;
   if(leave+back+reserve>L)return;
   if(!openOk(p,date,arr,leave))return;
   let s=scorePlace(S,p)-tr*.004+(rand?Math.random()*.6:0);
   /* 자주 간 곳은 코스에서 살짝 뒤로 — 안 가본 곳도 가보게. 화면의 '좋아할 확률'에는 영향 없음 */
   s-=Math.min(.12,.04*visitCount(S,p.id));
   if(opts.prefer&&opts.prefer.has(p.id))s+=.6;
   const nw=!newUsed&&count>=1&&isNewCandidate(S,p);
   if(nw)s+=c.novelty==='many'?.5:.3;
   if(!best||s>best.s)best={p,s,tr,arr,leave,nw};
  });
  if(!best){
   if(mealPending&&t>=630){tryMeal();continue}
   const blk=blocks.find(([s])=>s===L);
   if(blk&&L<end&&blk[1]<end-30){
    lastJump={len:items.length,t,pos};
    if(pos!==HOME)items.push({kind:'move',min:travel(pos,HOME,c.mode),mode:c.mode});
    const sch=c.schedules.find(x=>x.start===L);
    items.push({kind:'note',time:L,text:(sch?sch.name:'쉬는 시간')+' · 집에서 쉬어요'});
    t=blk[1];pos=HOME;items.push({kind:'start',time:t,again:true});continue}
   break}
  items.push({kind:'move',min:best.tr,mode:c.mode});
  const sc=scorePlace(S,best.p);
  items.push({kind:'place',id:best.p.id,time:best.arr,stay:best.p.stay,score:sc,level:levelOf(sc,best.nw),isNew:best.nw});
  soft.forEach(sb=>{if(sb.start>=t&&sb.start<best.leave)items.push({kind:'note',time:sb.start,text:sb.name+' 시간 · 장소 안에서 챙겨요'})});
  if(best.nw&&c.novelty!=='many')newUsed=true;
  used.add(best.p.id);spend(best.p);pos=best.p;t=best.leave;count++;
 }
 if(!mealDone&&t>=630&&t<840)tryMeal();
 if(lastJump&&items[items.length-1].kind==='start'&&items[items.length-1].again){items.length=lastJump.len;t=lastJump.t;pos=lastJump.pos}
 if(pos!==HOME){const back=travel(pos,HOME,c.mode);items.push({kind:'move',min:back,mode:c.mode});t+=back}
 const nextB=blocks.filter(([s])=>s>=t).sort((a,b)=>a[0]-b[0])[0];
 const nb=nextB&&S.c.schedules.find(x=>x.start===nextB[0]);
 items.push({kind:'end',time:t,note:nb?(nb.name+' 전 여유 '+(nextB[0]-t)+'분'):''});
 return {date,items,count};
}
/* 코스를 계산해서 반환한다 (S를 바꾸지 않음). 호출한 쪽에서 S.lastCourse에 넣는다. */
/* opts: {exclude:[ids] 이 코스에서 뺀 곳, prefer:[ids] 그대로 둘 곳, maxPlaces, keepCreatedAt 저장된 코스를 고칠 때 키 유지} */
export function buildCourse(S,opts={}){
 const excluded=[...(opts.exclude||[])];
 const used=new Set(excluded);let relaxed=false;
 const po={prefer:new Set(opts.prefer||[]),maxPlaces:opts.maxPlaces};
 const wallet=()=>S.c.feeMode==='paid'?{left:budgetOf(S)}:null;
 const w1=wallet();let days=dayList(S).map(d=>planDay(S,d,used,false,w1,po));
 if(days.every(d=>d.count===0)){relaxed=true;const u2=new Set(excluded),w2=wallet();days=dayList(S).map(d=>planDay(S,d,u2,true,w2,po))}
 const ids=[];days.forEach(d=>d.items.forEach(it=>{if(it.kind==='place')ids.push(it.id)}));
 /* fee: 여행 전체 예상 비용 = 장소마다 1인 요금 × 인원 (식사 포함) */
 const people=peopleOf(S);
 const fee=ids.reduce((a,id)=>a+PLACES.find(p=>p.id===id).fee,0)*people;
 const mv=days.reduce((a,d)=>a+d.items.filter(i=>i.kind==='move').reduce((x,i)=>x+i.min,0),0);
 const allIndoor=ids.every(id=>PLACES.find(p=>p.id===id).indoor);
 return {days,fee,people,budget:S.c.feeMode==='paid'?budgetOf(S):0,move:mv,relaxed,allIndoor,excluded,createdAt:opts.keepCreatedAt||Date.now()};
}
export function hashtags(p){const tg=p.theme?[p.theme]:[];profileOf(p).topics.forEach(t=>{if(t!==p.theme&&!tg.includes(t))tg.push(t)});['stroller','nursing','diaper','parking','pediatric','kidsmenu','babychair','elevator'].forEach(f=>{if(p.fac.includes(f))tg.push(FAC[f].replace(/ /g,'').replace('가능','OK'))});if(p.indoor)tg.push('실내');if(p.fee===0)tg.push('무료');return tg.slice(0,5).map(t=>'#'+t).join(' ')}
export function placeById(id){return PLACES.find(p=>p.id===id)}

/* 코스 상태: saved(저장만, 아직 안 감) → ongoing(출발함) → done(만족도까지 기록).
   S.courses에 코스마다 하나(key = 코스 createdAt). 예전 항목은 done 여부로 상태를 정한다 */
export function statusOf(k){return k.status||(k.done?'done':'saved')}
export function courseEntry(S,key){return (S.courses||[]).find(k=>k.key===key)}
/* 코스를 목록에 넣거나 상태를 바꾼다. patch로 status·rating·places 등을 덮어쓴다 */
export function upsertCourse(S,L,patch){
 const old=courseEntry(S,L.createdAt);
 const places=L.days.flatMap(d=>d.items.filter(it=>it.kind==='place').map(it=>({id:it.id,time:it.time,v:null,note:''})));
 const entry={key:L.createdAt,date:L.days[0].date,course:L,places,status:'saved',savedAt:Date.now(),...old,...patch};
 entry.done=entry.status==='done';
 S.courses=[entry,...(S.courses||[]).filter(k=>k.key!==entry.key)];
 return entry;
}
/* 코스가 끝나는 시각 (마지막 날 귀가 시간). 지나면 홈에서 만족도 조사를 권한다 */
export function courseEndAt(L){const d=L.days[L.days.length-1];const end=d.items[d.items.length-1].time;const t=new Date(d.date+'T00:00:00');t.setMinutes(end);return t.getTime()}
