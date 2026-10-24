/* 오늘 기록 → 분석 → 취향 반영. 이 서비스의 핵심 차별점 화면.
   4~6세: 부모가 아이의 하루를 관찰해서 씀. 7~9세: 아이가 직접 쓰거나 부모와의 대화를 적음. */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {INTEREST_TAGS,STYLE_TAGS,ageGroupOf,mergeTaste,mergeStyles} from '../lib/analysis.js';
import {analyzeText} from '../lib/ai.js';
import {ymd,toast,go} from '../lib/utils.js';
import {Icon,BottomCta} from '../components/ui.jsx';

const PROMPTS={
 '4-6':{title:n=>`오늘 ${n}는 뭐 하고 놀았어요?`,help:'부모님이 본 대로 적어주세요. 오래 머문 것, 반복한 것, 피한 것이 힌트예요.',ph:'예) 동물원에서 토끼 먹이주기만 30분 넘게 했다. 호랑이 우리 앞에서는 무서워하며 뒤로 숨었다.'},
 '7-9':{title:n=>`${n}가 오늘을 적어볼까?`,help:'아이가 직접 써도 되고, 부모님과 나눈 대화를 그대로 적어도 돼요. 맞춤법은 상관없어요.',ph:'예) 오늘 공뇽박물관 갔는데 뼈가 진짜 컸다. 또 가고 싶다. 줄 서는 건 싫었다.'}
};
const SCORE_TXT=s=>s>=.75?'푹 빠졌어요':s>=.55?'좋아해요':s>=.4?'관심 있어요':'별로였어요';
const SCORE_CLS=s=>s>=.55?'t-mint':s>=.4?'t-blue':'t-red';

export default function Diary(){
 const {S,set}=useStore();const n=S.child.name;const ag=ageGroupOf(S.child.age);const P=PROMPTS[ag];
 const [text,setText]=useState('');const [busy,setBusy]=useState(false);const [result,setResult]=useState(null);
 const run=async()=>{if(text.trim().length<2){toast('두 글자 이상 적어주세요');return}setBusy(true);setResult(null);const r=await analyzeText({text,ageGroup:ag,childName:n});setBusy(false);setResult(r)};
 const apply=()=>{
  if(!result)return;
  set(S=>{S.prevTaste={...S.taste};S.taste=mergeTaste(S.taste,result);S.styles=mergeStyles(S.styles,result);
   (result.avoid||[]).forEach(a=>{if(a.item&&!S.avoid.includes(a.item))S.avoid.push(a.item)});
   S.diary.push({date:ymd(new Date()),ageGroup:ag,text,analysis:{interests:result.interests,styles:result.styles,avoid:result.avoid,summary:result.summary,source:result.source},createdAt:Date.now()})});
  go('my');setTimeout(()=>toast(n+' 취향에 반영했어요'),150);
 };
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="pad" style={{paddingTop:20}}><a className="iconbtn" href="#/home" aria-label="홈으로" style={{background:'#fff'}}><Icon name="back"/></a></div>
 <div className="pad col gap6" style={{paddingTop:14}}>
  <div className="row gap6"><span className="tag t-yellow" style={{fontWeight:700}}>{ag==='7-9'?'7~9세 · 아이가 직접':'4~6세 · 부모님 관찰'}</span></div>
  <div className="h-title">{P.title(n)}</div><div className="help">{P.help}</div>
 </div>
 <div className="pad" style={{paddingTop:16}}>
  <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={P.ph} rows={6} maxLength={2000} style={{width:'100%',borderRadius:16,border:'1.5px solid var(--line)',background:'#fff',padding:14,fontSize:16,lineHeight:1.6,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
  <div className="row between" style={{paddingTop:8}}><span className="small">{text.length} / 2000</span>{ag==='7-9'?<span className="small">말로 하기는 다음 버전에서</span>:null}</div>
 </div>

 {result?(
 <div className="pad col gap12" style={{paddingTop:12}}>
  <div className="col gap10" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div className="row between"><div style={{fontSize:16,fontWeight:700}}>오늘 알게 된 것</div><span className="small">{result.source==='claude'?'AI 분석':'간단 분석'}</span></div>
   <div style={{fontFamily:'var(--deco)',fontSize:19,color:'var(--navy)',lineHeight:1.4}}>{result.summary}</div>
   {result.fallbackReason?<div className="small" style={{color:'var(--yellowInk)'}}>서버 분석을 못 써서 키워드로만 봤어요 ({result.fallbackReason==='no_key'?'API 키 없음':result.fallbackReason})</div>:null}
  </div>
  {result.interests.length?<div className="col gap10" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>관심사</div>
   {result.interests.map((i,k)=><div key={k} className="col gap6"><div className="row gap8"><span className={'tag '+SCORE_CLS(i.score)} style={{fontWeight:700,fontSize:13,padding:'5px 12px'}}>{INTEREST_TAGS[i.tag]}</span><span className="small">{SCORE_TXT(i.score)} · {Math.round(i.score*100)}%</span></div><div style={{fontSize:13,color:'var(--sub)',paddingLeft:4}}>“{i.quote}”</div></div>)}
  </div>:null}
  {result.styles.length?<div className="col gap10" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>노는 방식</div>
   <div className="row gap6 wrap">{result.styles.map((s,k)=><span key={k} className={'tag '+SCORE_CLS(s.score)} style={{fontSize:13,padding:'5px 12px'}}>{STYLE_TAGS[s.tag]} {Math.round(s.score*100)}%</span>)}</div>
  </div>:null}
  {result.avoid.length?<div className="col gap8" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>조심할 것</div>
   {result.avoid.map((a,k)=><div key={k} style={{fontSize:14}}><span className="tag t-red" style={{marginRight:6}}>{a.item}</span><span className="small">“{a.quote}”</span></div>)}
  </div>:null}
  {!result.interests.length&&!result.styles.length?<div className="small" style={{padding:'0 4px'}}>관심사를 찾을 만한 내용이 아직 없어요. 뭘 했는지, 어땠는지 조금만 더 적어보세요.</div>:null}
 </div>):null}

 <BottomCta>
  {result?<><button type="button" className="btn btn-soft" style={{flex:1}} onClick={()=>setResult(null)}>다시 쓰기</button><button type="button" className="btn btn-primary" style={{flex:1.6}} onClick={apply}>{n} 취향에 반영</button></>
  :<button type="button" className="btn btn-primary" disabled={busy} onClick={run} style={busy?{opacity:.7}:undefined}>{busy?'읽는 중…':'분석하기'}</button>}
 </BottomCta>
</div>)}
