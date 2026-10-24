/* 원본 MVP 추천 로직 그대로. 전역 S 대신 첫 인자로 S를 받는다. */
import {HOME,PLACES,MEAL_FAC,INTEREST,FAC} from './data.js';
import {travel,ymd} from './utils.js';

export function avgTaste(S,p){if(!p.ints.length)return .5;return p.ints.reduce((a,i)=>a+(S.taste[i]||.3),0)/p.ints.length}
export function scorePlace(S,p){
 const c=S.c;let s=.62*avgTaste(S,p)+.26*p.base;
 if(p.ints.some(i=>c.wants.includes(i)))s+=.12;
 if(c.avoidCrowd&&p.crowd)s-=.1;
 if(c.energy==='low'){if(p.stay>55)s-=.08;if(!p.indoor)s-=.06}
 if(c.energy==='high'&&p.ints.includes('play'))s+=.04;
 return Math.max(0,Math.min(1,s))}
export function isNewCandidate(S,p){return avgTaste(S,p)<.42&&p.base>=.7&&!S.visited.includes(p.id)}
export function levelOf(s,isNew){if(isNew)return 'C';return s>=.72?'A':s>=.52?'B':'C'}
export function passFilters(S,p,relax){
 const c=S.c;
 if(!relax){const need=c.fac.filter(f=>p.type==='meal'?MEAL_FAC.includes(f)||f==='stroller':!MEAL_FAC.includes(f));if(!need.every(f=>p.fac.includes(f)))return false}
 if(c.feeMode==='free'&&p.fee>0&&p.type!=='meal')return false;
 if(c.feeMode==='paid'&&p.fee>(Number(c.feeMax)||0)&&p.type!=='meal')return false;
 if(c.place==='near'&&travel(HOME,p,c.mode)>c.maxTravel)return false;
 return true}
export function blocksFor(S){return S.c.schedules.filter(b=>b.end-b.start>20).map(b=>[b.start,b.end])}
export function softFor(S){return S.c.schedules.filter(b=>b.end-b.start<=20)}
export function dayList(S){const c=S.c;const out=[];const a=new Date(c.startDate+'T00:00:00'),b=new Date((c.endDate||c.startDate)+'T00:00:00');for(let d=new Date(a);d<=b&&out.length<3;d.setDate(d.getDate()+1))out.push(ymd(d));return out.length?out:[c.startDate]}
export function planDay(S,date,used,relax){
 const c=S.c,blocks=blocksFor(S),soft=softFor(S);
 const start=c.startTime,end=c.endTime>c.startTime?c.endTime:c.startTime+180;
 const limitAt=t=>{let L=end;blocks.forEach(([s,e])=>{if(s>=t&&s<L)L=s});return L};
 const inBlock=t=>blocks.find(([s,e])=>t>=s&&t<e);
 let t=start;const ib=inBlock(t);if(ib)t=ib[1];
 let pos=HOME,count=0,mealDone=!c.meal,newUsed=c.novelty==='none';
 const items=[{kind:'start',time:t}];
 const rand=c.place==='random';let lastJump=null;
 const tryMeal=()=>{
  mealDone=true;
  const meals=PLACES.filter(m=>m.type==='meal'&&!used.has(m.id)&&passFilters(S,m,relax)).sort((a,b)=>travel(pos,a,c.mode)-travel(pos,b,c.mode));
  for(const m of meals){const tr=travel(pos,m,c.mode);if(t+tr+m.stay+travel(m,HOME,c.mode)<=limitAt(t)){items.push({kind:'move',min:tr,mode:c.mode});items.push({kind:'place',id:m.id,time:t+tr,stay:m.stay,score:.7,level:'B',meal:true});used.add(m.id);pos=m;t+=tr+m.stay;return true}}
  return false};
 while(true){
  if(!mealDone&&t>=690&&t<840)tryMeal();
  if(count>=c.perDay)break;
  const L=limitAt(t);
  const mealPending=!mealDone&&t<840&&L>700;
  let best=null;
  PLACES.filter(p=>p.type==='play'&&!used.has(p.id)&&passFilters(S,p,relax)).forEach(p=>{
   const tr=travel(pos,p,c.mode);if(tr>c.maxTravel+(c.place==='near'?0:15))return;
   const leave=t+tr+p.stay;const back=travel(p,HOME,c.mode);
   const reserve=mealPending?55:0;
   if(leave+back+reserve>L)return;
   let s=scorePlace(S,p)-tr*.004+(rand?Math.random()*.6:0);
   const nw=!newUsed&&count>=1&&isNewCandidate(S,p);
   if(nw)s+=c.novelty==='many'?.5:.3;
   if(!best||s>best.s)best={p,s,tr,leave,nw};
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
  items.push({kind:'place',id:best.p.id,time:t+best.tr,stay:best.p.stay,score:sc,level:levelOf(sc,best.nw),isNew:best.nw});
  soft.forEach(sb=>{if(sb.start>=t&&sb.start<best.leave)items.push({kind:'note',time:sb.start,text:sb.name+' 시간 · 장소 안에서 챙겨요'})});
  if(best.nw&&c.novelty!=='many')newUsed=true;
  used.add(best.p.id);pos=best.p;t=best.leave;count++;
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
export function buildCourse(S){
 const used=new Set();let relaxed=false;
 let days=dayList(S).map(d=>planDay(S,d,used,false));
 if(days.every(d=>d.count===0)){relaxed=true;const u2=new Set();days=dayList(S).map(d=>planDay(S,d,u2,true))}
 const ids=[];days.forEach(d=>d.items.forEach(it=>{if(it.kind==='place')ids.push(it.id)}));
 const fee=ids.reduce((a,id)=>a+PLACES.find(p=>p.id===id).fee,0);
 const mv=days.reduce((a,d)=>a+d.items.filter(i=>i.kind==='move').reduce((x,i)=>x+i.min,0),0);
 const allIndoor=ids.every(id=>PLACES.find(p=>p.id===id).indoor);
 return {days,fee,move:mv,relaxed,allIndoor,createdAt:Date.now()};
}
export function hashtags(p){const tg=p.theme?[p.theme]:[];p.ints.forEach(i=>{if(INTEREST[i]!==p.theme)tg.push(INTEREST[i])});['stroller','nursing','diaper','parking','pediatric','kidsmenu','babychair','elevator'].forEach(f=>{if(p.fac.includes(f))tg.push(FAC[f].replace(/ /g,'').replace('가능','OK'))});if(p.indoor)tg.push('실내');if(p.fee===0)tg.push('무료');return tg.slice(0,5).map(t=>'#'+t).join(' ')}
export function placeById(id){return PLACES.find(p=>p.id===id)}
