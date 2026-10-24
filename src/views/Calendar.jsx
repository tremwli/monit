/* 캘린더 탭: 월간 달력(사진·색 표시) + 엽서 컬렉션 + 이번 달 제일 좋아한 것 */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {ymd} from '../lib/utils.js';
import {entriesInMonth,entriesOnDay,monthTopTags,entryTitle,entryTint,fmtMd} from '../lib/journal.js';
import {TabBar,Icon} from '../components/ui.jsx';
import Photo from '../components/Photo.jsx';

function Postcard({e,size=108}){return (
 <a href={'#/entry?id='+e.id} style={{width:size,flexShrink:0,textDecoration:'none',color:'inherit',scrollSnapAlign:'start'}}>
  <div style={{position:'relative',width:size,height:size,borderRadius:14,overflow:'hidden',boxShadow:'0 2px 8px rgba(31,58,95,.10)'}}>
   <Photo id={e.photos?.[0]} tint={entryTint(e)} alt={entryTitle(e)} style={{width:size,height:size}}/>
   <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'18px 8px 7px',background:'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.45))'}}>
    <div style={{fontFamily:'var(--deco)',fontSize:13,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{entryTitle(e)}</div>
    <div style={{fontSize:10,color:'rgba(255,255,255,.85)'}}>{fmtMd(e.date)}</div>
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
 <div className="pad row between" style={{paddingTop:24,alignItems:'flex-end'}}>
  <div className="col gap6"><div className="small">{y}년 {m}월</div><div className="h-title">{n}와 모은 순간 {monthEntries.length}개</div></div>
  <div className="row gap6"><button type="button" className="iconbtn" style={{background:'#fff'}} aria-label="이전 달" onClick={()=>move(-1)}><Icon name="back"/></button><button type="button" className="iconbtn" style={{background:'#fff',transform:'scaleX(-1)'}} aria-label="다음 달" onClick={()=>move(1)}><Icon name="back"/></button></div>
 </div>
 <div className="pad" style={{paddingTop:16}}><div style={{background:'#fff',borderRadius:20,padding:'14px 10px 8px'}}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',fontSize:12,color:'var(--mute)',paddingBottom:8}}>{'일월화수목금토'.split('').map(x=><div key={x}>{x}</div>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',rowGap:4}}>{cells.map((v,i)=>{if(!v)return <div key={'e'+i}/>;const ds=ymd(new Date(y,m-1,v));const es=byDay[ds];const isToday=ds===today;const on=sel===ds;
   return <button type="button" key={v} className="col" onClick={()=>setSel(on?null:(es?ds:null))} style={{alignItems:'center',gap:3,height:56,border:'none',background:'none',padding:0,cursor:es?'pointer':'default'}}>
    <div style={{width:34,height:34,borderRadius:10,overflow:'hidden',border:on?'2px solid var(--primary)':'2px solid transparent',background:es?entryTint(es[0]):'transparent'}}>{es&&es.find(e=>e.photos?.length)?<Photo id={es.find(e=>e.photos?.length).photos[0]} tint={entryTint(es[0])} style={{width:34,height:34}}/>:null}</div>
    <span style={{fontSize:12,fontWeight:isToday?800:400,color:isToday?'#fff':'var(--sub)',background:isToday?'var(--primary)':'transparent',borderRadius:999,minWidth:18,height:18,lineHeight:'18px',padding:'0 2px'}}>{v}</span></button>})}</div>
 </div></div>

 <div className="pad row between" style={{paddingTop:22,paddingBottom:10,alignItems:'baseline'}}>
  <div style={{fontSize:17,fontWeight:700}}>{sel?Number(sel.slice(8))+'일 기록':'엽서 컬렉션'}</div>
  {sel?<button type="button" className="chip" style={{height:30,fontSize:12}} onClick={()=>setSel(null)}>전체 보기</button>:<a href="#/diary" style={{fontSize:13,color:'var(--primaryInk)',textDecoration:'none',fontWeight:600}}>+ 오늘 기록</a>}
 </div>
 {list.length?<div className="row gap10" style={{overflowX:'auto',padding:'0 20px 6px',scrollSnapType:'x mandatory',scrollbarWidth:'none'}}>{list.map(e=><Postcard key={e.id} e={e}/>)}</div>
 :<div className="pad"><a href="#/diary" className="card col gap6" style={{padding:'18px 16px',textDecoration:'none',color:'inherit',alignItems:'center',border:'1.5px dashed #B0B8C1',background:'#fff'}}><span style={{fontSize:15,fontWeight:700}}>{sel?'이 날은 기록이 없어요':'아직 엽서가 없어요'}</span><span className="small">사진 한 장과 한 줄이면 엽서가 돼요</span></a></div>}

 {tops.length?<div className="pad" style={{paddingTop:16}}><div className="card row between" style={{padding:'14px 16px',background:'#fff'}}><span style={{fontSize:14,fontWeight:600}}>이번 달 {n}가 제일 좋아한 것</span><span className="row gap6">{tops.map(t=><span key={t.tag} className="tag t-yellow" style={{fontWeight:700}}>{t.label}</span>)}</span></div></div>:null}
 <TabBar on="calendar"/>
</div>)}
