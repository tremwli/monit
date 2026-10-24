import {useStore} from '../store.jsx';
import {CAT_INT,TINT,IC} from '../lib/data.js';
import {toggle,go} from '../lib/utils.js';
import {Logo,BottomCta} from '../components/ui.jsx';

export default function Start(){
 const {S,set,UI,setUI}=useStore();
 const sel=UI.startSel;const cats=Object.keys(CAT_INT);
 const done=()=>{set(S=>{if(sel.length){const picked=new Set();sel.forEach(cat=>CAT_INT[cat].forEach(i=>picked.add(i)));Object.keys(S.taste).forEach(k=>S.taste[k]=picked.has(k)?.68:.34);S.c.wants=[...picked].slice(0,3)}S.onboarded=true});go('home')};
 return (
<div className="screen">
 <div className="pad" style={{paddingTop:28}}><Logo/></div>
 <div className="pad col gap8" style={{paddingTop:22}}>
  <div className="h-title">내 아이를 아는<br/>여행의 시작</div>
  <div className="help">아이를 먼저 소개해 주세요</div>
 </div>
 <div className="pad row gap8" style={{paddingTop:18}}>
  <label className="col gap6" style={{flex:1}}><span className="small">이름</span><input className="input" value={S.child.name} maxLength={10} onChange={e=>set(S=>{S.child.name=e.target.value.trim()||'아이'})}/></label>
  <label className="col gap6" style={{width:110}}><span className="small">나이</span><input className="input" inputMode="numeric" value={S.child.age} maxLength={2} onChange={e=>set(S=>{S.child.age=e.target.value.replace(/\D/g,'')||''})}/></label>
 </div>
 <div className="pad col gap10" style={{paddingTop:22}}>
  <div className="label">{S.child.name||'아이'}는 어떤 곳을 좋아하나요?</div>
  <div className="small">여러 개 골라도 돼요. 고를수록 추천이 정확해져요.</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
   {cats.map(cat=>{const k=CAT_INT[cat][0];const on=sel.includes(cat);return (
    <button type="button" key={cat} className={'radio '+(on?'on':'')} aria-pressed={on} style={{minHeight:72,padding:'10px 12px'}} onClick={()=>setUI(u=>{u.startSel=[...u.startSel];toggle(u.startSel,cat)})}>
     <div className="thumb" style={{width:44,height:44,background:TINT[k]}}><svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true" dangerouslySetInnerHTML={{__html:IC[k]}}/></div>
     <span style={{fontSize:15,fontWeight:on?700:600}}>{cat}</span></button>)})}
  </div>
 </div>
 <BottomCta><button type="button" className="btn btn-primary" onClick={done}>{sel.length?sel.length+'개 골랐어요 · ':''}시작하기</button></BottomCta>
</div>)}
