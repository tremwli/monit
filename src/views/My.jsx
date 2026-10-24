import {useStore} from '../store.jsx';
import {INTEREST,FAC} from '../lib/data.js';
import {STYLE_TAGS} from '../lib/analysis.js';
import {placeById} from '../lib/logic.js';
import {go} from '../lib/utils.js';
import {TabBar} from '../components/ui.jsx';

export default function My(){
 const {S,UI,setUI,reset}=useStore();const n=S.child.name;const t=S.taste,pt=S.prevTaste||{};const ks=Object.keys(t).sort((a,b)=>t[b]-t[a]);
 const lab=v=>v>=.75?'푹 빠졌어요':v>=.55?'좋아해요':v>=.4?'관심 있어요':'아직 시큰둥';
 const colr={dino:'#FFE08A',water:'#8EC1F2',animal:'#A9DDB4',draw:'#C4CFF0',train:'#93A9EE',plant:'#A9DDB4',play:'#8EC1F2',book:'#FFE08A'};
 const liked=S.history.filter(h=>h.v==='like').slice(-1)[0];const meh=S.history.filter(h=>h.v==='meh').slice(-1)[0];
 const onReset=()=>{if(!UI.resetArm){setUI(u=>{u.resetArm=true});setTimeout(()=>setUI(u=>{u.resetArm=false}),4000);return}reset();go('start')};
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="hero row gap12" style={{padding:'22px 20px 40px'}}>
  <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#FFE08A" stroke="#2F3657" strokeWidth="1.4"/><path d="M12 26 Q14 8 32 8 Q50 8 52 26 Q44 18 32 20 Q20 18 12 26 Z" fill="#2F3657"/><circle cx="24" cy="34" r="2.6" fill="#2F3657"/><circle cx="40" cy="34" r="2.6" fill="#2F3657"/><path d="M26 43 q6 5 12 0" stroke="#2F3657" strokeWidth="2" fill="none" strokeLinecap="round"/><ellipse cx="18" cy="41" rx="4" ry="2.5" fill="#FF9DAE"/><ellipse cx="46" cy="41" rx="4" ry="2.5" fill="#FF9DAE"/></svg>
  <div className="col gap6" style={{flex:1}}><div className="row gap6" style={{alignItems:'baseline'}}><span style={{fontSize:22,fontWeight:700}}>{n}</span><span style={{fontSize:14,color:'#333D4B'}}>{S.child.age}살</span></div><div style={{fontSize:13,color:'#333D4B'}}>모은 순간 {S.history.length}개 · 다녀온 곳 {S.visited.length}곳</div></div>
 </div>
 <div className="pad col gap10" style={{marginTop:-20,position:'relative'}}>
  <div className="col gap12" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div className="row between"><div style={{fontSize:16,fontWeight:700}}>{n}가 직접 고른 것</div></div>
   {S.kidPicks.length?<div className="row gap6 wrap">{S.kidPicks.map(k=><span key={k} className="tag t-yellow" style={{fontSize:13,fontWeight:600,padding:'6px 14px'}}>{INTEREST[k]}</span>)}</div>:<div className="small">아직 {n}가 직접 고른 게 없어요</div>}
   {S.kidQuote?<div className="row gap8" style={{background:'#FFF9EA',borderRadius:14,padding:'12px 14px'}}><span style={{fontFamily:'var(--deco)',fontSize:17,color:'var(--navy)'}}>"{S.kidQuote}"</span></div>:null}
   <a className="btn btn-soft btn-sm" href="#/kid">{n}랑 {S.kidPicks.length?'다시 ':''}고르기</a>
  </div>
  <div className="col gap12" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div className="col" style={{gap:2}}><div style={{fontSize:16,fontWeight:700}}>기록으로 알게 된 {n}</div><div className="small">다녀온 곳의 반응을 모아 계속 업데이트돼요</div></div>
   {ks.map(k=>{const v=t[k],d=pt[k]!=null?v-pt[k]:0;const trend=d>.04?'요즘 쑥쑥 올라요':d<-.04?'요즘 시들해요':lab(v);return (
    <div key={k} style={{display:'grid',gridTemplateColumns:'58px minmax(0,1fr) 96px',alignItems:'center',gap:8}}><span style={{fontSize:13,fontWeight:600}}>{INTEREST[k]}</span><div style={{height:10,borderRadius:999,background:'var(--soft)'}}><div style={{width:Math.round(v*100)+'%',height:10,borderRadius:999,background:colr[k],transition:'width .6s'}}/></div><span style={{fontSize:12,textAlign:'right',...(d>.04?{fontWeight:700,color:'var(--primaryInk)'}:d<-.04?{fontWeight:700,color:'var(--redInk)'}:{color:'var(--sub)'})}}>{trend}</span></div>)})}
   {(liked||meh)?<div className="col gap6" style={{borderTop:'1px solid var(--soft)',paddingTop:12}}>{liked?<div style={{fontSize:13,color:'#333D4B'}}>· 최근에 좋아한 곳: {placeById(liked.id).name}</div>:null}{meh?<div style={{fontSize:13,color:'#333D4B'}}>· 시큰둥했던 곳: {placeById(meh.id).name}</div>:null}</div>:null}
  </div>
  <div className="col gap12" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div className="row between"><div style={{fontSize:16,fontWeight:700}}>{n}의 이야기</div><span className="small">{S.diary.length}편</span></div>
   {S.diary.length?[...S.diary].slice(-3).reverse().map((d,i)=>(
    <div key={i} className="col gap6" style={{borderTop:i?'1px solid var(--soft)':'none',paddingTop:i?10:0}}>
     <div className="small">{d.date} · {d.ageGroup==='7-9'?'아이가 직접':'부모님 관찰'}</div>
     <div style={{fontSize:14,fontWeight:600}}>{d.analysis.summary}</div>
     <div className="row gap6 wrap">{d.analysis.interests.map((x,k)=><span key={k} className="tag t-yellow">{INTEREST[x.tag]}</span>)}{d.analysis.styles.map((x,k)=><span key={'s'+k} className="tag t-peri">{STYLE_TAGS[x.tag]}</span>)}</div>
    </div>)):<div className="small">아직 적은 이야기가 없어요</div>}
   {Object.keys(S.styles||{}).length?<div className="small" style={{borderTop:'1px solid var(--soft)',paddingTop:10}}>노는 방식: {Object.entries(S.styles).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>STYLE_TAGS[k]+' '+Math.round(v*100)+'%').join(' · ')}</div>:null}
   {S.avoid.length?<div className="small" style={{color:'var(--redInk)'}}>조심할 것: {S.avoid.join(', ')}</div>:null}
   <a className="btn btn-soft btn-sm" href="#/diary">오늘 이야기 적기</a>
  </div>
  <div style={{background:'#fff',borderRadius:20,padding:'4px 16px'}}>
   <a href="#/c4" className="row between" style={{padding:'14px 0',borderBottom:'1px solid var(--soft)',textDecoration:'none',color:'inherit'}}><span style={{fontSize:15}}>부모님 기본 조건</span><span className="small">{S.c.fac.slice(0,3).map(f=>FAC[f]).join(' · ')} ›</span></a>
   <a href="#/c1" className="row between" style={{padding:'14px 0',textDecoration:'none',color:'inherit'}}><span style={{fontSize:15}}>{n}의 일정</span><span className="small">{S.c.schedules.map(s=>s.name).join(' · ')||'없음'} ›</span></a>
  </div>
  <button type="button" className="chip" onClick={onReset} style={{justifyContent:'center',background:'transparent',fontSize:13,...(UI.resetArm?{color:'var(--redInk)'}:{})}}>{UI.resetArm?'한 번 더 누르면 처음으로 되돌려요':'시연 데이터 처음으로 되돌리기'}</button>
 </div>
 <TabBar on="my"/>
</div>)}
