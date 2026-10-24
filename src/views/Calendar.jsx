/* 캘린더 탭: 월간 달력(사진·색 표시) + 엽서 컬렉션 + 이번 달 제일 좋아한 것 */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {ymd,go} from '../lib/utils.js';
import {entriesInMonth,entriesOnDay,monthTopTags,entryTitle,entryTint,fmtMd} from '../lib/journal.js';
import {TabBar,Icon} from '../components/ui.jsx';
import Photo from '../components/Photo.jsx';

/* 폴라로이드: 흰 테두리 안에 사진, 아래 넓은 여백에 손글씨 제목과 날짜, 카드마다 살짝 기울임 */
function Postcard({e,i=0,size=124}){const photoH=Math.round(size*.68);const tilt=[-1.6,1.2,-0.8,1.8][i%4];return (
 <a href={'#/entry?id='+e.id} style={{width:size,flexShrink:0,textDecoration:'none',color:'inherit',scrollSnapAlign:'start',padding:'6px 2px'}}>
  <div style={{background:'#fff',borderRadius:6,padding:'8px 8px 10px',boxShadow:'0 3px 12px rgba(31,58,95,.14), 0 0 0 1px #EEF0F3',transform:`rotate(${tilt}deg)`}}>
   <div style={{height:photoH,borderRadius:3,overflow:'hidden',background:entryTint(e)}}>
    <Photo id={e.photos?.[0]} tint={entryTint(e)} alt={entryTitle(e)} style={{width:'100%',height:photoH}}/>
   </div>
   <div style={{paddingTop:9,minHeight:34}}>
    <div style={{fontFamily:'var(--deco)',fontSize:14,lineHeight:1.2,color:'var(--navy)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{entryTitle(e)}</div>
    <div style={{fontSize:10,color:'var(--mute)',marginTop:3}}>{fmtMd(e.date)}</div>
   </div>
  </div>
 </a>)}

export default function Calendar(){
 const {S}=useStore();const n=S.child.name;const today=ymd(new Date());
 const [ym,setYm]=useState(today.slice(0,7));const [sel,setSel]=useState(null);
 const [y,m]=ym.split('-').map(Number);const first=new Date(y,m-1,1).getDay(),last=new Date(y,m,0).getDate();
 const cells=[];for(let i=0;i<first;i++)cells.push('');for(let i=1;i<=last;i++)cells.push(i);
 const monthEntries=entriesInMonth(S.diary,ym);
 const byDay={};monthEntries.forEach(e=>{(byDay[e.date]=byDay[e.date]||[]).push(e)});
 const tops=monthTopTags(S.diary,ym);
 const move=d=>{const dt=new Date(y,m-1+d,1);setYm(ymd(dt).slice(0,7));setSel(null)};
 const list=sel?entriesOnDay(S.diary,sel):monthEntries;
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="pad col gap6" style={{paddingTop:24}}><div className="small">{y}년 {m+1}월</div><div className="h-title">{S.child.name}와 모은 순간 {S.history.length}개</div></div>
 <div className="pad" style={{paddingTop:16}}><div style={{background:'var(--paper)',borderRadius:20,padding:'14px 10px 8px'}}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',fontSize:12,color:'var(--mute)',paddingBottom:8}}>{'일월화수목금토'.split('').map(x=><div key={x}>{x}</div>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',rowGap:4}}>{cells.map((v,i)=>{if(!v)return <div key={'e'+i}/>;const ds=ymd(new Date(y,m-1,v));const es=byDay[ds];const isToday=ds===today;const on=sel===ds;
   /* 기록이 있는 날은 그날 엽서를 보여주고, 없는 날은 바로 일기 쓰기로 */
   return <button type="button" key={v} className="col" onClick={()=>{if(es)setSel(on?null:ds);else if(ds<=today)go('diary?date='+ds)}} aria-pressed={on} style={{alignItems:'center',gap:3,height:56,border:'none',background:'none',padding:0,cursor:ds<=today?'pointer':'default',opacity:ds<=today?1:.45}}>
    <div style={{width:34,height:34,borderRadius:10,overflow:'hidden',border:on?'2px solid var(--primary)':'2px solid transparent',background:es?entryTint(es[0]):'transparent'}}>{es&&es.find(e=>e.photos?.length)?<Photo id={es.find(e=>e.photos?.length).photos[0]} tint={entryTint(es[0])} style={{width:34,height:34}}/>:null}</div>
    <span style={{fontSize:12,fontWeight:isToday?800:400,color:isToday?'#fff':'var(--sub)',background:isToday?'var(--primary)':'transparent',borderRadius:999,minWidth:18,height:18,lineHeight:'18px',padding:'0 2px'}}>{v}</span></button>})}</div>
 </div></div>

 <div className="pad row between" style={{paddingTop:22,paddingBottom:10,alignItems:'baseline'}}>
  <div style={{fontSize:17,fontWeight:700}}>{sel?Number(sel.slice(8))+'일의 엽서':'엽서 컬렉션'}</div>
  {sel?<div className="row gap6"><a href={'#/diary?date='+sel} className="chip" style={{height:30,fontSize:12,textDecoration:'none'}}>이 날 일기 더 쓰기</a><button type="button" className="chip" style={{height:30,fontSize:12}} onClick={()=>setSel(null)}>전체 보기</button></div>:<span className="small">날짜를 누르면 그날 일기를 써요</span>}
 </div>
 {list.length?<div className="row gap8" style={{overflowX:'auto',padding:'4px 18px 10px',scrollSnapType:'x mandatory',scrollbarWidth:'none',alignItems:'flex-start'}}>{list.map((e,i)=><Postcard key={e.id} e={e} i={i}/>)}</div>
 :<div className="pad"><a href={'#/diary'+(sel?'?date='+sel:'')} style={{display:'block',width:124,margin:'4px 0',padding:'8px 8px 10px',background:'#fff',borderRadius:6,boxShadow:'0 3px 12px rgba(31,58,95,.10), 0 0 0 1px #EEF0F3',transform:'rotate(-1.2deg)',textDecoration:'none',color:'inherit'}}><div style={{height:84,borderRadius:3,border:'1.5px dashed #C9CED6',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mute)',fontSize:22}}>+</div><div style={{paddingTop:9,fontFamily:'var(--deco)',fontSize:14,color:'var(--navy)'}}>{sel?'이 날은 비어 있어요':'첫 엽서 만들기'}</div><div style={{fontSize:10,color:'var(--mute)',marginTop:3}}>사진 한 장이면 돼요</div></a></div>}

 <a href={'#/diary'+(sel?'?date='+sel:'')} aria-label="일기 쓰기" style={{position:'fixed',right:'max(20px,calc(50% - 195px))',bottom:'calc(84px + env(safe-area-inset-bottom))',width:56,height:56,borderRadius:999,background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:31,boxShadow:'0 4px 14px rgba(48,115,204,.35)'}}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
 </a>
 <TabBar on="calendar"/>
</div>)}
