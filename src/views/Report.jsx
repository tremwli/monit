/* 분기 리포트 (#/report): 유형, 숫자 3개, 지난 분기와 비교, 이번 분기의 장면, 관심사 변화, 다음 추천, 공유 */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {buildReport,sampleReport,quartersOf,currentQuarter} from '../lib/report.js';
import {toast,go} from '../lib/utils.js';
import {Icon,Html,TabBar} from '../components/ui.jsx';
import {moodSvg} from '../lib/svg.js';

const REACT={like:['joy','좋았어요'],meh:['meh','그냥'],};
const BAR={play:'#3FB58A',animal:'#3FB58A',dino:'#3FB58A',water:'#3FB58A',draw:'#3FB58A',train:'#3FB58A',plant:'#3FB58A',book:'#3FB58A'};

function Section({title,children,style}){return <div className="pad col gap10" style={{paddingTop:26,...style}}><div style={{fontSize:14,fontWeight:600,color:'var(--sub)'}}>{title}</div>{children}</div>}

export default function Report(){
 const {S}=useStore();const n=S.child.name;
 const qs=quartersOf(S);const [q,setQ]=useState(qs[0]||currentQuarter());
 const [showSample,setShowSample]=useState(false);
 const real=buildReport(S,q);
 const R=showSample?sampleReport(n):real;
 const back=()=>{if(history.length>1)history.back();else go('my')};
 const share=async()=>{
  const text=`${R.label} · ${n}의 성장 리포트\n${n}의 유형: ${R.type}\n${R.compare.map(x=>x.t).join('')}\n다음엔: ${R.next.map(x=>x.name+' '+x.prob+'%').join(', ')}\n— 모닛`;
  try{if(navigator.share){await navigator.share({title:n+'의 성장 리포트',text});return}
   await navigator.clipboard.writeText(text);toast('리포트를 복사했어요')}catch(e){}
 };
 return (
<div className="screen" style={{background:'var(--bg2)',paddingBottom:100}}>
 <div className="topbar">
  <button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>
  <div style={{fontSize:19,fontWeight:700}}>{n}의 성장 리포트</div>
 </div>

 {qs.length>1?<div className="pad row gap6" style={{paddingTop:12,overflowX:'auto',scrollbarWidth:'none'}}>{qs.map(x=><button type="button" key={x} className={'chip dark '+(x===q&&!showSample?'on':'')} style={{flexShrink:0}} onClick={()=>{setQ(x);setShowSample(false)}}>{x.replace('-Q','년 ')+'분기'}</button>)}</div>:null}

 <div className="pad col gap6" style={{paddingTop:14}}>
  <div className="row between"><div className="small">{R.label} · {n}의 분기 결과지</div>{R.sample?<span className="demo">예시</span>:null}</div>
  <div className="col gap6" style={{background:'var(--mintT)',borderRadius:20,padding:'18px 20px',marginTop:6}}>
   <div style={{fontSize:13,color:'var(--mintInk)'}}>{n}의 유형</div>
   <div style={{fontFamily:'var(--deco)',fontSize:26,lineHeight:1.25,color:'var(--navy)'}}>{R.type}</div>
   <div style={{fontSize:14,color:'var(--mintInk)',fontWeight:600}}>{R.subtitle}</div>
  </div>
 </div>

 <div className="pad" style={{paddingTop:12}}><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
  {R.stats.map((s,i)=><div key={i} className="col" style={{background:'var(--paper)',borderRadius:18,padding:'16px 8px',alignItems:'center',gap:4}}><div style={{fontSize:26,fontWeight:800,color:'var(--navy)'}}>{s.v}</div><div className="small">{s.l}</div></div>)}
 </div></div>

 {real.thin&&!showSample?<div className="pad" style={{paddingTop:12}}><div className="card row between" style={{padding:'12px 14px',background:'var(--yellowT)'}}><span style={{fontSize:13,color:'var(--yellowInk)'}}>이번 분기 기록이 아직 적어요</span><button type="button" className="chip" style={{height:30,fontSize:12}} onClick={()=>setShowSample(true)}>예시 리포트 보기</button></div></div>:null}
 {showSample?<div className="pad" style={{paddingTop:12}}><button type="button" className="chip" style={{height:30,fontSize:12}} onClick={()=>setShowSample(false)}>내 리포트로 돌아가기</button></div>:null}

 <Section title="지난 분기와 비교하면">
  <div style={{fontSize:17,lineHeight:1.55,fontWeight:500}}>{R.compare.map((x,i)=>x.h?<span key={i} style={{color:'var(--mintInk)',fontWeight:700}}>{x.t}</span>:<span key={i}>{x.t}</span>)}</div>
 </Section>

 <Section title="이번 분기의 장면">
  {R.scenes.length?<div className="card col" style={{background:'var(--paper)',padding:'4px 16px'}}>
   {R.scenes.map((s,i)=>{const r=REACT[s.v];return <a key={s.id+i} href={s.id.startsWith('s')?undefined:'#/place?id='+s.id} className="col gap6" style={{padding:'14px 0',borderTop:i?'1px solid var(--soft)':'none',textDecoration:'none',color:'inherit'}}>
    <div className="row between"><span style={{fontSize:16,fontWeight:700}}>{s.name}</span><span className="row gap6" style={{alignItems:'center',fontSize:13,color:'var(--sub)'}}>예상 {s.pred}% →{r?<><Html s={moodSvg(r[0],18)} style={{display:'inline-flex'}}/><span style={{color:s.v==='like'?'var(--mintInk)':'var(--sub)',fontWeight:600}}>{r[1]}</span></>:<span>기록만</span>}</span></div>
    {s.note?<div style={{fontSize:14,color:'#333D4B',lineHeight:1.5}}>{s.note}</div>:null}
   </a>})}
  </div>:<div className="card" style={{padding:'14px 16px',background:'var(--paper)',fontSize:14,color:'var(--sub)'}}>이번 분기에 다녀와서 기록한 곳이 아직 없어요</div>}
 </Section>

 <Section title="관심사 변화">
  {R.changes.length?<div className="col gap10" style={{background:'var(--paper)',borderRadius:20,padding:16}}>
   {R.changes.map(c=><div key={c.tag} style={{display:'grid',gridTemplateColumns:'56px minmax(0,1fr) 72px',alignItems:'center',gap:10}}>
    <span style={{fontSize:14,fontWeight:600}}>{c.label}</span>
    <div style={{height:10,borderRadius:999,background:'var(--soft)',position:'relative'}}><div style={{position:'absolute',left:0,top:0,height:10,borderRadius:999,width:Math.min(100,c.before)+'%',background:c.delta>=0?'rgba(63,181,138,.35)':'#C9CED6'}}/><div style={{position:'absolute',left:0,top:0,height:10,borderRadius:999,width:Math.min(100,c.after)+'%',background:c.delta>=0?'#3FB58A':'rgba(201,206,214,.9)',transition:'width .6s'}}/></div>
    <span style={{fontSize:13,textAlign:'right',color:c.isNew?'var(--mintInk)':'var(--sub)',fontWeight:c.isNew?700:500}}>{c.isNew?'새로 +'+c.after:c.before+' → '+c.after}</span>
   </div>)}
  </div>:<div className="card" style={{padding:'14px 16px',background:'var(--paper)',fontSize:14,color:'var(--sub)'}}>일기를 분석하면 관심사 변화가 쌓여요</div>}
 </Section>

 <Section title="다음엔 여기 어때요">
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
   {R.next.map(x=><a key={x.id} href={x.id.startsWith('n')?undefined:'#/place?id='+x.id} className="col gap6" style={{background:'var(--paper)',borderRadius:18,padding:16,textDecoration:'none',color:'inherit',minHeight:84}}><span style={{fontSize:15,fontWeight:700,lineHeight:1.3}}>{x.name}</span><span style={{fontSize:13,color:'var(--mintInk)',fontWeight:700}}>좋아할 확률 {x.prob}%</span></a>)}
  </div>
 </Section>

 <div className="pad" style={{paddingTop:22}}><button type="button" className="btn btn-soft" onClick={share} style={{width:'100%'}}><Icon name="route"/>결과 카드 공유</button></div>
 <TabBar on="my"/>
</div>)}
