/* 시작: 아이 이름·나이, 흥미 유형(9개, 어떻게 노는가) 고르기, 요즘 빠진 주제(선택). lib/interests.js 두 층 모델과 같다 */
import {useStore} from '../store.jsx';
import {AREAS,STARTER_REFS,isArea,label} from '../lib/interests.js';
import {toggle,go} from '../lib/utils.js';
import {Logo,BottomCta,Chip} from '../components/ui.jsx';

/* 유형별 한 줄 예시와 그림(선 아이콘, 48 viewBox) */
const HINT={
 concept:'공룡·탈것·동물 지식 파고들기',pretend:'소꿉·역할놀이·모험',create:'그림·공작·만들기',
 build:'블록·레고·조립',sport:'뛰기·공놀이·춤',outdoor:'그네·산책·모래·물',
 games:'보드게임·규칙 있는 놀이',literacy:'그림책·이야기 듣기',skill:'악기·요리·실험 배우기',
};
const ICON={
 concept:'<circle cx="21" cy="21" r="11"/><path d="M29 29 L40 40"/><path d="M16 21 h10 M21 16 v10"/>',
 pretend:'<path d="M8 36 L8 16 L17 24 L24 11 L31 24 L40 16 L40 36 Z"/><circle cx="24" cy="31" r="2.2" fill="currentColor"/>',
 create:'<path d="M31 9 L39 17 L19 37 L9 39 L11 29 Z"/><path d="M26 14 L34 22"/>',
 build:'<rect x="8" y="26" width="14" height="12" rx="2"/><rect x="26" y="26" width="14" height="12" rx="2"/><rect x="17" y="12" width="14" height="12" rx="2"/>',
 sport:'<circle cx="24" cy="24" r="15"/><path d="M9.5 20 C16 23 32 23 38.5 20 M9.5 28 C16 25 32 25 38.5 28 M24 9 C18 16 18 32 24 39"/>',
 outdoor:'<circle cx="34" cy="13" r="5"/><path d="M11 40 L11 26 M11 26 C4 26 4 15 11 14 C12 7 22 7 23 14 C30 15 30 26 23 26 Z"/><path d="M8 40 h32"/>',
 games:'<rect x="9" y="9" width="30" height="30" rx="6"/><circle cx="17" cy="17" r="2.2" fill="currentColor"/><circle cx="31" cy="31" r="2.2" fill="currentColor"/><circle cx="24" cy="24" r="2.2" fill="currentColor"/><circle cx="31" cy="17" r="2.2" fill="currentColor"/><circle cx="17" cy="31" r="2.2" fill="currentColor"/>',
 literacy:'<path d="M24 13 C19 9 12 9 7 11 V37 C12 35 19 35 24 39 C29 35 36 35 41 37 V11 C36 9 29 9 24 13 Z"/><path d="M24 13 V39"/>',
 skill:'<path d="M19 36 V12 L37 8 V32"/><circle cx="14" cy="36" r="5"/><circle cx="32" cy="32" r="5"/>',
};
const TINTS={concept:'var(--yellowT)',pretend:'var(--periT)',create:'var(--mintT)',build:'var(--blueT)',sport:'var(--yellowT)',outdoor:'var(--mintT)',games:'var(--periT)',literacy:'var(--blueT)',skill:'var(--yellowT)'};
const INKS={concept:'var(--yellowInk)',pretend:'var(--periInk)',create:'var(--mintInk)',build:'var(--primaryInk)',sport:'var(--yellowInk)',outdoor:'var(--mintInk)',games:'var(--periInk)',literacy:'var(--primaryInk)',skill:'var(--yellowInk)'};
const TOPICS=STARTER_REFS.filter(r=>!isArea(r));

export default function Start(){
 const {S,set,UI,setUI}=useStore();
 const sel=UI.startSel||[],topics=UI.startTopics||[];const n=S.child.name||'아이';
 const done=()=>{set(S=>{
  if(sel.length||topics.length){
   Object.keys(S.taste).forEach(k=>S.taste[k]=.34);
   sel.forEach(k=>{S.taste['a:'+k]=.68});
   topics.forEach(t=>{S.taste[t]=.68});
   /* 코스 '원하는 것'은 주제 먼저, 모자라면 유형 */
   S.c.wants=[...topics,...sel.map(k=>'a:'+k)].slice(0,3);
  }
  S.onboarded=true});go('home')};
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
  <div className="label">{n}는 어떻게 노는 걸 좋아하나요?</div>
  <div className="small">여러 개 골라도 돼요. 다녀온 기록이 쌓이면 알아서 바뀌어요.</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
   {Object.entries(AREAS).map(([k,name])=>{const on=sel.includes(k);return (
    <button type="button" key={k} className={'radio '+(on?'on':'')} aria-pressed={on} style={{minHeight:72,padding:'10px 12px',alignItems:'center'}} onClick={()=>setUI(u=>{u.startSel=[...(u.startSel||[])];toggle(u.startSel,k)})}>
     <div className="thumb" style={{width:44,height:44,background:TINTS[k],color:INKS[k]}}><svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{__html:ICON[k]}}/></div>
     <span className="col" style={{gap:2,minWidth:0}}><span style={{fontSize:15,fontWeight:on?700:600}}>{name}</span><span className="small" style={{fontSize:11,lineHeight:1.3}}>{HINT[k]}</span></span></button>)})}
  </div>
 </div>
 <div className="pad col gap10" style={{paddingTop:24}}>
  <div className="label">요즘 {n}가 푹 빠진 것 <span className="small" style={{fontWeight:400}}>· 선택</span></div>
  <div className="row gap6 wrap">{TOPICS.map(t=><Chip key={t} on={topics.includes(t)} onClick={()=>setUI(u=>{u.startTopics=[...(u.startTopics||[])];toggle(u.startTopics,t)})}>{label(t)}</Chip>)}</div>
  <div className="small">없는 건 나중에 일기에 적으면 저절로 생겨요</div>
 </div>
 <BottomCta><button type="button" className="btn btn-primary" onClick={done}>{sel.length+topics.length?(sel.length+topics.length)+'개 골랐어요 · ':''}시작하기</button></BottomCta>
</div>)}
