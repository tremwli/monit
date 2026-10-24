import {useStore} from '../store.jsx';
import {HOME} from '../lib/data.js';
import {buildCourse,hashtags,placeById} from '../lib/logic.js';
import {fmtT,fmtShort,fmtDate,travelLabel,toast,go,kakaoMapUrl} from '../lib/utils.js';
import {Thumb,Face,Icon,MapBox,BottomCta} from '../components/ui.jsx';

const COLS=['#FFE08A','#A9DDB4','#8EC1F2','#93A9EE','#FFE08A','#A9DDB4'];

export default function Result(){
 const {S,set,setUI}=useStore();const L=S.lastCourse;const n=S.child.name;const c=S.c;
 if(!L)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">아직 만든 코스가 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/c1">코스 만들기</a></div></div>;
 const multi=L.days.length>1;let num=0;
 const pts=[{...HOME,home:true}];const route=[HOME];let k=0;
 L.days.forEach(d=>d.items.forEach(it=>{if(it.kind==='place'){const p=placeById(it.id);k++;pts.push({lat:p.lat,lng:p.lng,num:k,color:COLS[(k-1)%6],label:p.name});route.push(p)}}));route.push(HOME);
 const s=L.days[0].items[0].time,e=L.days[L.days.length-1].items.slice(-1)[0].time;
 const focus=id=>{setUI(u=>{u.mapSel=id;u.mapCat='fit'});go('map')};
 return (
<div className="screen" style={{background:'radial-gradient(circle at 50% 160px,var(--sky1) 0,var(--sky2) 160px,var(--sky3) 320px,var(--paper) 321px)'}}>
 <MapBox id="resultMap" pts={pts} opts={{route,padTop:80,padBottom:60}} style={{height:330,background:'transparent'}}/>
 <div className="row between" style={{position:'absolute',top:16,left:16,right:16,zIndex:5}}>
  <a className="iconbtn white" href="#/c5" aria-label="조건 다시 보기"><Icon name="back"/></a>
  <a href="#/map" style={{height:40,padding:'0 14px',borderRadius:999,background:'var(--paper)',boxShadow:'0 2px 10px rgba(31,58,95,.12)',color:'#333D4B',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center'}}>지도 크게 보기</a>
 </div>
 <div className="sheet pad" style={{marginTop:-30,paddingTop:10,zIndex:4}}>
  <div style={{width:36,height:4,borderRadius:999,background:'#D1D6DB',margin:'0 auto'}}/>
  <div className="col gap6" style={{paddingTop:16}}>
   <div className="small">{fmtDate(L.days[0].date)}{multi?' – '+fmtDate(L.days[L.days.length-1].date):''} · {fmtT(s)} – {fmtT(e)}</div>
   <div style={{fontSize:23,fontWeight:700}}>{n}를 위한 {multi?L.days.length+'일':(e-s>300?'하루':'반나절')} 코스</div>
   <div className="row gap6 wrap" style={{paddingTop:4}}><span className="tag t-blue" style={{fontWeight:600}}>이동 {L.move}분</span><span className="tag t-yellow" style={{fontWeight:600}}>1인 약 {Math.round(L.fee/1000)}천 원</span><span className={'tag '+(L.relaxed?'t-red':'t-mint')} style={{fontWeight:600}}>{L.relaxed?'조건 일부 완화':'조건 모두 충족'}</span></div>
  </div>
  {L.days.map((d,di)=>(
   <div key={d.date}>
    {multi?<div style={{fontSize:15,fontWeight:700,padding:'16px 0 4px'}}>{di+1}일차 · {fmtDate(d.date)}</div>:null}
    <div className="col" style={{position:'relative',paddingTop:multi?6:16}}>
     <div aria-hidden="true" style={{position:'absolute',left:65,top:multi?22:32,bottom:18,width:2,background:'var(--line)'}}/>
     {d.items.map((it,i)=>{
      if(it.kind==='start')return <div key={i} className="tl" style={{height:34}}><span style={{fontSize:13,fontWeight:600,color:'var(--sub)'}}>{fmtShort(it.time)}</span><span style={{width:12,height:12,borderRadius:999,background:'var(--navy)',border:'2px solid #fff',justifySelf:'center',position:'relative'}}/><span style={{fontSize:14,fontWeight:600}}>{it.again?'다시 출발':'집에서 출발'}</span></div>;
      if(it.kind==='move')return <div key={i} className="tl" style={{height:24}}><span/><span/><span className="small">{travelLabel(it.mode)} {it.min}분</span></div>;
      if(it.kind==='note')return <div key={i} className="tl" style={{height:26}}><span className="small">{fmtShort(it.time)}</span><span style={{width:8,height:8,borderRadius:999,background:'#FFD666',justifySelf:'center',position:'relative'}}/><span className="small" style={{color:'var(--yellowInk)'}}>{it.text}</span></div>;
      if(it.kind==='end')return <div key={i} className="tl" style={{height:34}}><span style={{fontSize:13,fontWeight:600,color:'var(--sub)'}}>{fmtShort(it.time)}</span><span style={{width:12,height:12,borderRadius:999,background:'var(--peri)',border:'2px solid #fff',justifySelf:'center',position:'relative'}}/><span style={{fontSize:14,fontWeight:600}}>집 도착 {it.note?<span style={{fontSize:12,fontWeight:500,color:'var(--periInk)'}}>· {it.note}</span>:null}</span></div>;
      const p=placeById(it.id);num++;const col=COLS[(num-1)%6];
      return <div key={i} className="tl"><span style={{fontSize:13,fontWeight:600,color:'var(--sub)'}}>{fmtShort(it.time)}</span><span style={{width:20,height:20,borderRadius:999,background:col,color:'var(--navy)',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>{num}</span>
       <a href={kakaoMapUrl(p)} target="_blank" rel="noopener" aria-label={p.name+' 카카오맵에서 보기'} className="card row gap12" style={{padding:10,textAlign:'left',width:'100%',textDecoration:'none',color:'inherit'}}><Thumb p={p} size={64}/>
        <span className="col" style={{flex:1,minWidth:0,gap:4}}><span className="row between gap6"><span style={{fontSize:15,fontWeight:700}}>{p.name}</span>{it.isNew?<span className="tag t-mint" style={{fontWeight:700,padding:'2px 8px',fontSize:11}}>새로운 발견</span>:it.meal?null:<Face level={it.level}/>}</span>
        <span className="small" style={{color:'var(--sub)'}}>{it.meal?'식사 · ':''}{it.stay}분 머물러요</span>
        <span style={{fontSize:12,color:'var(--primaryInk)'}}>{hashtags(p)}</span></span><Icon name="pin"/></a></div>;
     })}
    </div>
   </div>))}
  {L.days.every(d=>d.count===0)?<div className="card" style={{padding:'14px 16px',marginTop:12,fontSize:14}}>시간 안에 들를 수 있는 곳을 찾지 못했어요. 돌아오는 시간이나 이동 시간을 늘려보세요.</div>:null}
  <div className="card row gap8" style={{padding:'12px 14px',marginTop:14,fontSize:13,color:'#333D4B'}}><Icon name="rain"/>{L.allIndoor?'비가 와도 그대로 가요 · 모두 실내예요':(c.rainIndoor?'비가 오면 실외 장소를 실내로 바꿔 알려드려요':'실외 장소가 포함돼 있어요')}</div>
 </div>
 <BottomCta><button type="button" className="btn btn-soft" style={{flex:1}} onClick={()=>{set(S=>{S.lastCourse=buildCourse(S)});toast('조건 그대로 새로 짰어요')}}>다시 만들기</button><a className="btn btn-primary" style={{flex:1.6}} href="#/record">다녀와서 기록하기</a></BottomCta>
</div>)}
