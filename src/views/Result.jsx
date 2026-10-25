import {useState,Fragment} from 'react';
import {useStore} from '../store.jsx';
import {HOME} from '../lib/data.js';
import {buildCourse,hashtags,placeById,courseEntry,statusOf,upsertCourse} from '../lib/logic.js';
import {fmtT,fmtShort,fmtDate,travelLabel,toast,go} from '../lib/utils.js';
import {Thumb,Face,Icon,MapBox,BottomCta} from '../components/ui.jsx';

/* 금액 표시: 1만 원 이상은 'n만 n천 원', 그 아래는 'n천 원' */
const won=v=>{v=Math.round(v/1000)*1000;if(!v)return '0원';const m=Math.floor(v/10000),k=(v%10000)/1000;return (m?m+'만 ':'')+(k?k+'천 ':'')+'원'};
const COLS=['#FFE08A','#A9DDB4','#8EC1F2','#93A9EE','#FFE08A','#A9DDB4'];

export default function Result(){
 const {S,set}=useStore();const [bigMap,setBigMap]=useState(false);const L=S.lastCourse;const n=S.child.name;const c=S.c;
 if(!L)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">아직 만든 코스가 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/c1">코스 만들기</a></div></div>;
 const multi=L.days.length>1;let num=0;
 const pts=[{...HOME,home:true}];const route=[HOME];let k=0;
 L.days.forEach(d=>d.items.forEach(it=>{if(it.kind==='place'){const p=placeById(it.id);k++;pts.push({lat:p.lat,lng:p.lng,num:k,color:COLS[(k-1)%6],label:p.name});route.push(p)}}));route.push(HOME);
 const s=L.days[0].items[0].time,e=L.days[L.days.length-1].items.slice(-1)[0].time;
 const entry=courseEntry(S,L.createdAt);const st=entry?statusOf(entry):null;
 const save=()=>{set(S=>{upsertCourse(S,S.lastCourse,{status:'saved'})});toast('저장한 코스에 담았어요')};
 /* 출발해도 이 코스 화면에 그대로 있고, 아래 버튼이 '다녀왔어요 · 만족도 남기기'로 바뀐다 */
 const start=()=>{set(S=>{upsertCourse(S,S.lastCourse,{status:'ongoing',startedAt:Date.now()})});toast('출발했어요')};
 /* 저장·출발한 코스는 그대로 두고, 새로 짠 코스만 바꾼다 */
 /* 새 코스는 통째로 다시, 저장·출발한 코스는 키를 유지해 목록의 그 항목을 고친다 */
 const apply=(opts,msg)=>{set(S=>{const old=S.lastCourse;const keep=st?{keepCreatedAt:old.createdAt}:{};S.lastCourse=buildCourse(S,{...opts,...keep});if(st)upsertCourse(S,S.lastCourse,{})});toast(msg)};
 const rebuild=()=>apply({},'경로를 다시 추천했어요');
 const ids=L.days.flatMap(d=>d.items.filter(it=>it.kind==='place'&&!it.meal).map(it=>it.id));
 /* 한 곳만 바꾸기: 그곳은 빼고 나머지는 그대로 두라고 알려준 채 다시 짠다 */
 const swap=id=>apply({exclude:[...(L.excluded||[]),id],prefer:ids.filter(x=>x!==id)},'다른 곳으로 바꿨어요');
 const drop=id=>apply({exclude:[...(L.excluded||[]),id],prefer:ids.filter(x=>x!==id),maxPlaces:Math.max(1,ids.length-1)},'코스에서 뺐어요');
 const editable=st!=='done';
 return (
<div className="screen" style={{background:'radial-gradient(circle at 50% 160px,var(--sky1) 0,var(--sky2) 160px,var(--sky3) 320px,var(--paper) 321px)'}}>
 <MapBox id="resultMap" pts={pts} opts={{route,padTop:80,padBottom:60}} style={{height:330,background:'transparent'}}/>
 <div className="row between" style={{position:'absolute',top:16,left:16,right:16,zIndex:5}}>
  <a className="iconbtn white" href="#/home" aria-label="홈으로"><Icon name="close"/></a>
  <button type="button" onClick={()=>setBigMap(true)} style={{border:'none',height:40,padding:'0 14px',borderRadius:999,background:'var(--paper)',boxShadow:'0 2px 10px rgba(31,58,95,.12)',color:'#333D4B',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center'}}>지도 크게 보기</button>
 </div>
 {/* 지도 크게 보기: 이 코스의 핀과 경로를 화면 가득. 닫으면 코스 화면으로 */}
 {bigMap?<div className="map-full">
  <MapBox id="resultMapBig" pts={pts} opts={{route,padTop:90,padBottom:60}} style={{height:'100dvh'}}/>
  <button type="button" className="iconbtn white" aria-label="지도 닫기" onClick={()=>setBigMap(false)} style={{position:'absolute',top:16,right:16,zIndex:5}}><Icon name="close"/></button>
 </div>:null}
 <div className="sheet pad" style={{marginTop:-30,paddingTop:10,zIndex:4,background:'var(--paperWarm)'}}>
  <div style={{width:36,height:4,borderRadius:999,background:'#D1D6DB',margin:'0 auto'}}/>
  <div className="col gap6" style={{paddingTop:16}}>
   <div className="row between"><div className="small">{fmtDate(L.days[0].date)}{multi?' – '+fmtDate(L.days[L.days.length-1].date):''} · {fmtT(s)} – {fmtT(e)}</div>{editable?<button type="button" className="chip" style={{height:30,fontSize:13}} onClick={rebuild}><Icon name="dice"/>경로 다시 추천</button>:null}</div>
   <div style={{fontFamily:'var(--deco)',fontSize:25,color:'var(--navy)',lineHeight:1.2}}>{n}를 위한 {multi?L.days.length+'일':(e-s>300?'하루':'반나절')} 코스</div>
   <div className="row gap6 wrap" style={{paddingTop:4}}><span className="tag t-blue" style={{fontWeight:600}}>이동 {L.move}분</span><span className="tag t-yellow" style={{fontWeight:600}}>{L.people?'총 약 '+won(L.fee):'1인 약 '+won(L.fee)}{L.budget?' / 예산 '+won(L.budget):''}</span><span className={'tag '+(L.relaxed?'t-red':'t-mint')} style={{fontWeight:600}}>{L.relaxed?'조건 일부 완화':'조건 모두 충족'}</span></div>
  </div>
  {L.days.map((d,di)=>(
   <div key={d.date}>
    {multi?<div style={{fontSize:15,fontWeight:700,padding:'16px 0 4px'}}>{di+1}일차 · {fmtDate(d.date)}</div>:null}
    <div className="trail" style={{paddingTop:multi?6:14}}>
     <div className="road" aria-hidden="true"/>
     {d.items.map((it,i)=>{
      if(it.kind==='start')return <Fragment key={i}><span className="t">{fmtShort(it.time)}</span><span className="pin"><Icon name="home"/></span><span className="lbl">{it.again?'다시 출발':'집에서 출발'}</span></Fragment>;
      if(it.kind==='move')return <Fragment key={i}><span/><span/><span className="hop"><Icon name={it.mode==='car'?'car':it.mode==='transit'?'bus':'stroller'}/>{travelLabel(it.mode)} {it.min}분</span></Fragment>;
      if(it.kind==='note')return <Fragment key={i}><span className="t">{fmtShort(it.time)}</span><span style={{width:8,height:8,borderRadius:999,background:'var(--yellow)',justifySelf:'center',position:'relative',zIndex:1}}/><span className="sticky">{it.text}</span></Fragment>;
      if(it.kind==='end')return <Fragment key={i}><span className="t">{fmtShort(it.time)}</span><span className="pin end"><Icon name="home"/></span><span className="lbl">집 도착{it.note?<span className="small" style={{fontWeight:500,color:'var(--periInk)'}}> · {it.note}</span>:null}</span></Fragment>;
      const p=placeById(it.id);num++;const col=COLS[(num-1)%6];
      return <Fragment key={i}><span className="t">{fmtShort(it.time)}</span><span className="sticker" style={{background:col}}>{num}</span>
       <div className={'stop '+(num%2?'odd':'even')} style={{animationDelay:(num*40)+'ms'}}>
        <a href={'#/place?id='+p.id} aria-label={p.name+' 자세히 보기'} className="body"><Thumb p={p} size={64} style={{borderRadius:18}}/>
         <span className="col" style={{flex:1,minWidth:0,gap:4}}><span className="row between gap6"><span style={{fontSize:15,fontWeight:700}}>{p.name}</span>{it.isNew?<span className="tag t-mint" style={{fontWeight:700,padding:'2px 8px',fontSize:11}}>새로운 발견</span>:it.meal?null:<Face level={it.level}/>}</span>
         <span className="small" style={{color:'var(--sub)'}}>{it.meal?'식사 · ':''}{it.stay}분 머물러요</span>
         <span style={{fontSize:12,color:'var(--primaryInk)'}}>{hashtags(p)}</span></span></a>
        {editable&&!it.meal?<span className="edit"><button type="button" className="chip" onClick={()=>swap(p.id)}>다른 곳으로</button><button type="button" className="chip" onClick={()=>drop(p.id)}>빼기</button></span>:null}
       </div></Fragment>;
     })}
    </div>
   </div>))}
  {L.days.every(d=>d.count===0)?<div className="card" style={{padding:'14px 16px',marginTop:12,fontSize:14}}>시간 안에 들를 수 있는 곳을 찾지 못했어요. 돌아오는 시간이나 이동 시간을 늘려보세요.</div>:null}
  <div className="card row gap8" style={{padding:'12px 14px',marginTop:14,fontSize:13,color:'#333D4B'}}><Icon name="rain"/>{L.allIndoor?'비가 와도 그대로 가요 · 모두 실내예요':(c.rainIndoor?'비가 오면 실외 장소를 실내로 바꿔 알려드려요':'실외 장소가 포함돼 있어요')}</div>
 </div>
 {/* 저장 안 한 코스: 저장 / 바로 시작. 저장한 코스: 시작. 출발한 코스: 다녀왔어요. 기록 끝난 코스: 기록 보기 */}
 <BottomCta>{st==='done'?<a className="btn btn-soft" href="#/courses">기록 보기</a>
  :st==='ongoing'?<button type="button" className="btn btn-primary" onClick={()=>go('record')}>다녀왔어요 · 만족도 남기기</button>
  :<><button type="button" className="btn btn-soft" style={{flex:1}} disabled={st==='saved'} onClick={save}>{st==='saved'?'저장됨':'코스 저장'}</button><button type="button" className="btn btn-primary" style={{flex:1.6}} onClick={start}>{st==='saved'?'시작하기':'바로 시작'}</button></>}</BottomCta>
</div>)}
