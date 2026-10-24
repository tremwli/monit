import {useStore} from '../store.jsx';
import {INTEREST,IC} from '../lib/data.js';
import {clamp,toggle,toast,demo,go} from '../lib/utils.js';
import {Icon,CarSvg,BottomCta} from '../components/ui.jsx';

export default function Kid(){
 const {S,set,UI,setUI}=useStore();const n=S.child.name;
 const sel=UI.kidSel||S.kidPicks;const quote=UI.kidQuote!=null?UI.kidQuote:S.kidQuote;
 const ks=['dino','water','draw','train','animal','plant'];
 const done=()=>{set(S=>{S.prevTaste={...S.taste};sel.forEach(k=>{if(!S.kidPicks.includes(k))S.taste[k]=clamp(S.taste[k]+.1)});S.kidPicks=[...sel];if(UI.kidQuote!=null)S.kidQuote=UI.kidQuote});setUI(u=>{u.kidSel=null;u.kidQuote=null});go('my');setTimeout(()=>toast(n+'가 고른 취향을 반영했어요'),150)};
 return (
<div className="screen" style={{background:'#FFF9EA'}}>
 <div className="pad row between" style={{paddingTop:20}}><span style={{height:32,padding:'0 12px',borderRadius:999,background:'var(--paper)',display:'flex',alignItems:'center',fontSize:13,fontWeight:600,color:'var(--yellowInk)'}}>아이 모드 · 부모님과 함께 해요</span><a className="iconbtn" href="#/my" aria-label="아이 모드 끝내기" style={{background:'var(--paper)'}}><Icon name="close"/></a></div>
 <div className="pad row between" style={{paddingTop:22,alignItems:'flex-end'}}><div style={{fontFamily:'var(--deco)',fontSize:34,lineHeight:1.2,color:'var(--navy)'}}>{n}야,<br/>뭐가 제일 좋아?</div><CarSvg w={84}/></div>
 <div className="pad" style={{paddingTop:8,fontSize:15,color:'#6B5A2A'}}>좋아하는 걸 콕 눌러 줘</div>
 <div className="pad" style={{paddingTop:18,display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>
  {ks.map(k=>{const on=sel.includes(k);return (
   <button type="button" key={k} aria-pressed={on} onClick={()=>setUI(u=>{u.kidSel=[...(u.kidSel||S.kidPicks)];toggle(u.kidSel,k)})} style={{height:124,borderRadius:20,border:on?'2.5px solid var(--navy)':'2px solid #F0E3C0',background:'var(--paper)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,position:'relative'}}>
    <svg width="64" height="56" viewBox="0 0 100 90" aria-hidden="true" dangerouslySetInnerHTML={{__html:IC[k]}}/><span style={{fontFamily:'var(--deco)',fontSize:18,color:'var(--navy)'}}>{INTEREST[k]}</span>
    {on?<svg width="26" height="26" viewBox="0 0 24 24" style={{position:'absolute',top:-8,right:-6}} aria-hidden="true"><path d="M12 21 C4 15 2 11 2 8 a5 5 0 0 1 10 -2 a5 5 0 0 1 10 2 c0 3 -2 7 -10 13 z" fill="#FF9DAE" stroke="#2F3657" strokeWidth="1.3"/></svg>:null}</button>)})}
 </div>
 <div className="pad" style={{paddingTop:20}}><div className="col gap12" style={{background:'var(--paper)',borderRadius:20,padding:16}}>
  <label className="col gap8"><span style={{fontFamily:'var(--deco)',fontSize:18,color:'var(--navy)'}}>{n}가 직접 적어 볼까?</span><input value={quote} placeholder="예) 티라노 뼈 또 보고 싶어" style={{height:52,borderRadius:20,border:'2px dashed #F0D68A',background:'#FFFDF6',padding:'0 16px',fontSize:18,fontWeight:600,outline:'none'}} onChange={e=>setUI(u=>{u.kidQuote=e.target.value})}/></label>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><button type="button" className="chip" onClick={demo} style={{justifyContent:'center',height:46,background:'var(--yellowT)',color:'var(--yellowInk)',fontWeight:700}}>말로 하기</button><button type="button" className="chip" onClick={demo} style={{justifyContent:'center',height:46,background:'var(--periT)',color:'var(--periInk)',fontWeight:700}}>그림으로 그리기</button></div>
 </div></div>
 <BottomCta style={{background:'linear-gradient(rgba(255,249,234,0),#FFF9EA 30%)'}}><button type="button" className="btn" onClick={done} style={{background:'var(--navy)',color:'#fff',fontFamily:'var(--deco)',fontSize:22,fontWeight:400}}>다 했어요!</button></BottomCta>
</div>)}
