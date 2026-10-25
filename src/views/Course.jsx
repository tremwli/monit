/* 코스 만들기 5단계 (원본 V.c1~V.c5) + 시간 휠 */
import {useEffect,useRef} from 'react';
import {useStore} from '../store.jsx';
import {FAC,ICON} from '../lib/data.js';
import {STARTER_REFS,isArea,label} from '../lib/interests.js';
import {buildCourse,peopleOf} from '../lib/logic.js';
import {fmtT,fmtShort,fmtDate,demo,go,openPicker} from '../lib/utils.js';
import {StepHead,BottomCta,Chip,Seg,Switch,Icon,Face,Html} from '../components/ui.jsx';

/* ---------- 시간 휠 ---------- */
function Wheel({which}){
 const {S,set}=useStore();const ref=useRef(null);
 const t=which==='start'?S.c.startTime:S.c.endTime;const h=Math.floor(t/60),m=t%60;
 const ap=['오전','오후'],hs=[1,2,3,4,5,6,7,8,9,10,11,12],ms=Array.from({length:12},(_,i)=>i*5);
 useEffect(()=>{const w=ref.current;if(!w)return;
  const setCol=(name,idx)=>{w.querySelector(`[data-wheel="${name}"]`).scrollTop=idx*32};
  setCol('ap',h>=12?1:0);setCol('h',hs.indexOf(((h+11)%12)+1));setCol('m',Math.round(m/5)%12);
  let tm;const onScroll=()=>{clearTimeout(tm);tm=setTimeout(()=>{
   const apI=Math.round(w.querySelector('[data-wheel="ap"]').scrollTop/32),hi=Math.round(w.querySelector('[data-wheel="h"]').scrollTop/32),mi=Math.round(w.querySelector('[data-wheel="m"]').scrollTop/32);
   const h12=Math.min(11,Math.max(0,hi))+1,mm=Math.min(11,Math.max(0,mi))*5,a=Math.min(1,Math.max(0,apI));
   const v=(h12%12+(a?12:0))*60+mm;
   set(S=>{if(which==='start'){S.c.startTime=v;if(S.c.endDate===S.c.startDate&&S.c.endTime<=v)S.c.endTime=Math.min(1435,v+180)}else S.c.endTime=v});
  },120)};
  const cols=[...w.querySelectorAll('.wcol')];cols.forEach(c=>c.addEventListener('scroll',onScroll,{passive:true}));
  return()=>cols.forEach(c=>c.removeEventListener('scroll',onScroll));
 },[which]); // eslint-disable-line
 const col=(arr,fmt,name)=><div className="wcol" data-wheel={name}><div className="spacer"/>{arr.map(v=><div key={v}>{fmt(v)}</div>)}<div className="spacer"/></div>;
 return <div className="wheel" role="group" aria-label="시간 선택" ref={ref}><div className="band"/>{col(ap,v=>v,'ap')}{col(hs,v=>v,'h')}{col(ms,v=>String(v).padStart(2,'0'),'m')}</div>;
}

/* ---------- 1. 일정 ---------- */
export function C1(){
 const {S,set,UI,setUI}=useStore();const c=S.c;const n=S.child.name;const w=UI.wheel;
 const toMin=v=>{const [h,m]=v.split(':').map(Number);return h*60+m};
 return (
<div className="screen">
 <StepHead n={1} back="home" eyebrow="일정" title="언제 떠나요?" help="당일치기도, 며칠 여행도 괜찮아요"/>
 <div className="pad" style={{paddingTop:18}}>
  <div style={{borderTop:'1px solid var(--soft)',borderBottom:'1px solid var(--soft)'}}>
   <div className="row between" style={{height:56}}><span style={{fontSize:16}}>출발</span><div className="row gap6">
    <label className="pill"><span>{fmtDate(c.startDate)}</span><input type="date" onClick={openPicker} value={c.startDate} aria-label="출발 날짜" onChange={e=>{if(!e.target.value)return;set(S=>{S.c.startDate=e.target.value;if(S.c.endDate<S.c.startDate)S.c.endDate=S.c.startDate})}}/></label>
    <button type="button" className={'pill '+(w==='start'?'on':'')} aria-expanded={w==='start'} onClick={()=>setUI(u=>{u.wheel=u.wheel==='start'?null:'start'})}><span>{fmtT(c.startTime)}</span></button></div></div>
   {w==='start'?<Wheel which="start"/>:null}
   <div className="row between" style={{height:56,borderTop:'1px solid var(--soft)'}}><span style={{fontSize:16}}>돌아오기</span><div className="row gap6">
    <label className="pill"><span>{fmtDate(c.endDate)}</span><input type="date" onClick={openPicker} value={c.endDate} min={c.startDate} aria-label="돌아오는 날짜" onChange={e=>{if(!e.target.value)return;set(S=>{S.c.endDate=e.target.value<S.c.startDate?S.c.startDate:e.target.value})}}/></label>
    <button type="button" className={'pill '+(w==='end'?'on':'')} aria-expanded={w==='end'} onClick={()=>setUI(u=>{u.wheel=u.wheel==='end'?null:'end'})}><span>{fmtT(c.endTime)}</span></button></div></div>
   {w==='end'?<Wheel which="end"/>:null}
  </div>
 </div>
 <div className="pad section" style={{paddingTop:20}}>
  <div className="row between" style={{alignItems:'baseline'}}><div className="label">{n}의 일정</div><div className="small">이 시간은 피해서 짤게요</div></div>
  <div className="card" style={{padding:'4px 16px'}}>
   {c.schedules.length?c.schedules.map((s,i)=>(
    <div key={s.id} className="row gap10" style={{minHeight:50,borderBottom:i<c.schedules.length-1?'1px solid #E9ECEF':'none'}}>
     <span style={{width:10,height:10,borderRadius:999,background:s.color}}/>
     <input value={s.name} aria-label="일정 이름" style={{flex:1,minWidth:0,border:'none',background:'none',fontSize:15,outline:'none'}} onChange={e=>set(S=>{S.c.schedules[i].name=e.target.value})}/>
     <label className="pill" style={{height:32,fontSize:13,padding:'0 10px',background:'var(--paper)'}}><span>{fmtShort(s.start)}</span><input type="time" onClick={openPicker} step={300} value={fmtShort(s.start)} aria-label="시작 시간" onChange={e=>{if(e.target.value)set(S=>{S.c.schedules[i].start=toMin(e.target.value)})}}/></label>
     <span className="small">–</span>
     <label className="pill" style={{height:32,fontSize:13,padding:'0 10px',background:'var(--paper)'}}><span>{fmtShort(s.end)}</span><input type="time" onClick={openPicker} step={300} value={fmtShort(s.end)} aria-label="끝 시간" onChange={e=>{if(e.target.value)set(S=>{S.c.schedules[i].end=toMin(e.target.value)})}}/></label>
     <button type="button" className="iconbtn" aria-label="일정 삭제" style={{width:30,height:30,background:'transparent'}} onClick={()=>set(S=>{S.c.schedules.splice(i,1)})}><Icon name="close"/></button>
    </div>)):<div className="small" style={{padding:'14px 0'}}>등록된 일정이 없어요</div>}
  </div>
  <button type="button" className="chip" style={{justifyContent:'center',height:44,border:'1.5px dashed #B0B8C1',background:'var(--paper)'}} onClick={()=>set(S=>{S.c.schedules.push({id:'s'+Date.now(),name:'새 일정',start:960,end:1020,color:['#F28B82','#A9DDB4','#8EC1F2'][S.c.schedules.length%3]})})}><Icon name="plus"/>일정 추가 (수업, 병원, 약 먹는 시간 등)</button>
 </div>
 <BottomCta><a className="btn btn-primary" href="#/c2">다음</a></BottomCta>
</div>)}

/* ---------- 2. 장소 ---------- */
export function C2(){
 const {S,set}=useStore();const c=S.c;
 const opts=[['near','home','집 근처','출발 위치에서 가까운 곳 위주로'],['region','pin','지역 고르기','서울 · 경기 · 강원 · 제주 …'],['map','map','지도에서 직접 고르기','가고 싶은 동네를 지도에 표시해요'],['random','dice','어디든 좋아요 · 랜덤 추천','출발만 정하면 모닛이 골라줘요']];
 return (
<div className="screen">
 <StepHead n={2} back="c1" eyebrow="장소" title="어디서 놀까요?" help="지역을 고르거나, 모닛에게 맡겨도 돼요"/>
 <div className="pad col gap8" role="radiogroup" style={{paddingTop:18}}>
  {opts.map(([v,ic,t,d])=><button type="button" key={v} className={'radio '+(c.place===v?'on':'')} role="radio" aria-checked={c.place===v} onClick={()=>set(S=>{S.c.place=v})}><span className="ic"><Icon name={ic}/></span><span className="col" style={{flex:1,gap:2}}><span style={{fontSize:15,fontWeight:c.place===v?700:600}}>{t}</span><span className="small" style={{color:'var(--sub)'}}>{d}</span></span><span className="dot"/></button>)}
  {c.place==='region'||c.place==='map'?<div className="small" style={{padding:'4px 4px 0'}}>MVP에서는 샘플 지역 안에서 추천해요</div>:null}
 </div>
 <div className="pad section" style={{paddingTop:22}}>
  <div className="label">출발 위치</div>
  <button type="button" className="input row between" onClick={demo} style={{display:'flex',alignItems:'center'}}><span className="row gap8" style={{fontSize:14}}><Html s={ICON.home.replace('22','18').replace('22','18')}/>집 (샘플 위치)</span><span className="small">변경</span></button>
 </div>
 <div className="pad section" style={{paddingTop:22}}>
  <div className="label">한 번에 이동할 최대 시간</div>
  <Seg opts={[[15,'15분'],[30,'30분'],[60,'1시간']]} cur={c.maxTravel} onPick={v=>set(S=>{S.c.maxTravel=+v})}/>
 </div>
 <BottomCta><a className="btn btn-primary" href="#/c3">다음</a></BottomCta>
</div>)}

/* ---------- 3. 함께·이동 ---------- */
export function C3(){
 const {S,set}=useStore();const c=S.c;const n=S.child.name;
 const tg=(arr,v)=>{const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v)};
 return (
<div className="screen">
 <StepHead n={3} back="c2" eyebrow="함께·이동" title="누구랑, 어떻게 가요?" help="인원과 이동 방법에 맞춰 동선을 짜요"/>
 <div className="pad col" style={{paddingTop:18,gap:22}}>
  <div className="section"><div className="label">함께 가는 아이</div>
   <div className="row gap8"><div className="row gap10" style={{height:56,padding:'0 18px 0 8px',borderRadius:999,border:'2px solid var(--primary)',background:'#F3F8FE'}}><span style={{width:40,height:40,borderRadius:999,background:'var(--yellow)'}}/><span className="col"><span style={{fontSize:15,fontWeight:700}}>{n}</span><span className="small" style={{color:'var(--sub)'}}>{S.child.age}살</span></span></div>
   <button type="button" className="chip" onClick={demo} style={{height:56,padding:'0 18px',border:'1.5px dashed #B0B8C1',background:'var(--paper)'}}><Icon name="plus"/>아이 추가</button></div></div>
  <div className="section"><div className="label">함께 가는 어른</div>
   <div className="row gap6 wrap">{['엄마','아빠','할머니·할아버지','친구 가족'].map(a=><Chip key={a} on={c.adults.includes(a)} onClick={()=>set(S=>tg(S.c.adults,a))}>{a}</Chip>)}</div></div>
  <div className="section"><div className="label">이동 수단</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>{[['car','car','자가용'],['transit','bus','대중교통'],['walk','stroller','유모차·도보']].map(([v,ic,l])=><button type="button" key={v} className={'optcard '+(c.mode===v?'on':'')} aria-pressed={c.mode===v} onClick={()=>set(S=>{S.c.mode=v})}><span className="ic"><Icon name={ic}/></span>{l}</button>)}</div></div>
  <div className="section"><div className="label">유모차는요?</div>
   <div className="row gap6 wrap">{[['bring','가져가요'],['rent','현장에서 빌릴래요'],['none','필요 없어요']].map(([v,l])=><Chip key={v} on={c.stroller===v} onClick={()=>set(S=>{S.c.stroller=v;if(v==='none'){const i=S.c.fac.indexOf('stroller');if(i>=0)S.c.fac.splice(i,1)}})}>{l}</Chip>)}</div></div>
 </div>
 <BottomCta><a className="btn btn-primary" href="#/c4">다음</a></BottomCta>
</div>)}

/* ---------- 4. 원하는 곳 ---------- */
export function C4(){
 const {S,set}=useStore();const c=S.c;
 const tg=(arr,v)=>{const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v)};
 return (
<div className="screen">
 <StepHead n={4} back="c3" eyebrow="원하는 곳" title="어떤 곳이면 좋을까요?" help="고른 조건을 갖춘 곳으로만 코스를 짜요"/>
 <div className="pad col" style={{paddingTop:18,gap:22}}>
  <div className="section"><div className="label">편의시설</div><div className="row gap6 wrap">{['stroller','nursing','diaper','parking','elevator','babychair','kidsmenu'].map(f=><Chip key={f} on={c.fac.includes(f)} onClick={()=>set(S=>tg(S.c.fac,f))}>{FAC[f]}</Chip>)}</div></div>
  <div className="section"><div className="label">안전</div><div className="row gap6 wrap">{['pediatric','er','shade'].map(f=><Chip key={f} on={c.fac.includes(f)} onClick={()=>set(S=>tg(S.c.fac,f))}>{FAC[f]}</Chip>)}</div></div>
  <div className="section"><div className="row between" style={{alignItems:'baseline'}}><div className="label">여행 예산</div>{c.feeMode==='paid'?<span className="small">{peopleOf(S)}명 · 입장료·식사 합계</span>:null}</div>
   <div className="row gap6"><Chip on={c.feeMode==='free'} onClick={()=>set(S=>{S.c.feeMode='free'})}>무료만</Chip><Chip on={c.feeMode==='paid'} onClick={()=>set(S=>{S.c.feeMode='paid'})}>예산 정하기</Chip></div>
   {c.feeMode==='paid'?<>
    <label className="input row gap8" style={{display:'flex',alignItems:'center'}}><span className="small" style={{color:'var(--sub)',flexShrink:0}}>총예산</span><input inputMode="numeric" value={Number(c.budget||0).toLocaleString('ko-KR')} style={{flex:1,minWidth:0,border:'none',background:'none',fontSize:16,fontWeight:700,textAlign:'right',outline:'none'}} aria-label="여행 총예산" onChange={e=>{const v=e.target.value.replace(/\D/g,'');set(S=>{S.c.budget=+v||0})}}/><span style={{fontSize:16,fontWeight:700}}>원</span></label>
    <div className="row gap6 wrap">{[50000,100000,200000,300000].map(v=><Chip key={v} on={c.budget===v} onClick={()=>set(S=>{S.c.budget=v})}>{v/10000}만 원</Chip>)}</div>
   </>:null}
  </div>
  <div className="card row between" style={{padding:'14px 16px'}}><span className="col" style={{gap:2}}><span style={{fontSize:15,fontWeight:600}}>비 오면 실내로 바꾸기</span><span className="small">출발 전날 날씨를 보고 알려드려요</span></span><Switch on={c.rainIndoor} label="비 오면 실내로 바꾸기" onToggle={()=>set(S=>{S.c.rainIndoor=!S.c.rainIndoor})}/></div>
 </div>
 <BottomCta><a className="btn btn-primary" href="#/c5">다음</a></BottomCta>
</div>)}

/* ---------- 5. 아이 맞춤 ---------- */
export function C5(){
 const {S,set,setUI}=useStore();const c=S.c;const n=S.child.name;
 const faces=[['high','A','쌩쌩해요'],['mid','B','보통이에요'],['low','C','금방 지쳐요']];
 const tg=(arr,v)=>{const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v)};
 /* 아이가 요즘 좋아하는 주제(기본 목록에 없는 것 포함)를 앞에, 그다음 기본 선택지 */
 const mine=Object.entries(S.taste).filter(([k,v])=>!isArea(k)&&v>=.55).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
 const wantOpts=[...new Set([...c.wants,...mine,...STARTER_REFS])];
 const build=()=>{set(S=>{S.lastCourse=buildCourse(S)});setUI(u=>{u.rec={};u.photos={}});go('result')};
 return (
<div className="screen">
 <StepHead n={5} back="c4" eyebrow={n+' 맞춤'} title={n+'에게 맞춰볼까요?'} help={'이번 코스를 '+n+'가 좋아할 것들로 채워요'}/>
 <div className="pad col" style={{paddingTop:18,gap:22}}>
  <div className="section"><div className="row between"><div className="label">하고 싶은 것</div><a href="#/kid" style={{fontSize:13,fontWeight:600,textDecoration:'none'}}>{n}에게 물어보기</a></div>
   <div className="row gap6 wrap">{wantOpts.map(k=><Chip key={k} on={c.wants.includes(k)} onClick={()=>set(S=>tg(S.c.wants,k))}>{label(k)}</Chip>)}</div></div>
  <div className="section"><div className="label">요즘 {n} 체력</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>{faces.map(([v,f,l])=><button type="button" key={v} className={'optcard '+(c.energy===v?'on':'')} aria-pressed={c.energy===v} onClick={()=>set(S=>{S.c.energy=v})}><span className="ic"><Face level={f} size={26}/></span>{l}</button>)}</div></div>
  <div className="section"><div className="label">얼마나 모험해볼까요?</div><Seg opts={[['none','익숙한 곳'],['one','반반'],['many','새로운 곳']]} cur={c.novelty} onPick={v=>set(S=>{S.c.novelty=v})}/></div>
  <div className="section"><div className="label">하루에 들를 곳</div><Seg opts={[[2,'2곳'],[3,'3곳'],[4,'4곳']]} cur={c.perDay} onPick={v=>set(S=>{S.c.perDay=+v})}/></div>
  <div className="card" style={{padding:'2px 16px'}}>
   <div className="row between" style={{height:54,borderBottom:'1px solid #E9ECEF'}}><span style={{fontSize:15,fontWeight:600}}>식사 장소 넣기</span><Switch on={c.meal} label="식사 장소 넣기" onToggle={()=>set(S=>{S.c.meal=!S.c.meal})}/></div>
   <div className="row between" style={{height:60}}><span className="col" style={{gap:2}}><span style={{fontSize:15,fontWeight:600}}>사람 많은 곳 피하기</span><span className="small" style={{color:'var(--primaryInk)'}}>{n} 기록에서 배웠어요</span></span><Switch on={c.avoidCrowd} label="사람 많은 곳 피하기" onToggle={()=>set(S=>{S.c.avoidCrowd=!S.c.avoidCrowd})}/></div>
  </div>
 </div>
 <BottomCta><button type="button" className="btn btn-primary" onClick={build}>{n} 맞춤 코스 만들기</button></BottomCta>
</div>)}
