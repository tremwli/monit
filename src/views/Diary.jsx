/* 육아일기 (블로그 글처럼: 사진 + 제목 + 글) → 분석 → 취향 반영 → 엽서로 저장.
   일기는 항상 부모가 쓴다. 연령대는 분석이 어떤 신호를 볼지에만 쓰인다. */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {INTEREST_TAGS,STYLE_TAGS,ageGroupOf,mergeTaste,mergeStyles} from '../lib/analysis.js';
import {analyzeText} from '../lib/ai.js';
import {savePhoto,cachedPhoto} from '../lib/photos.js';
import {newEntryId} from '../lib/journal.js';
import {PLACES} from '../lib/data.js';
import {ymd,toast,go} from '../lib/utils.js';
import {Icon,BottomCta,Chip} from '../components/ui.jsx';

const PROMPTS={
 '4-6':{title:n=>`오늘 ${n}는 어땠어요?`,help:'육아일기 쓰듯 편하게요. 오래 머문 것, 반복한 것, 피한 것이 힌트예요.',ph:'예) 동물원에서 토끼 먹이주기만 30분 넘게 했다. 호랑이 우리 앞에서는 무서워하며 뒤로 숨었다. 돌아오는 차에서 바로 잠들었다.'},
 '7-9':{title:n=>`오늘 ${n}는 어땠어요?`,help:'육아일기 쓰듯 편하게요. 아이가 한 말을 그대로 적어주면 더 좋아요.',ph:'예) 공룡박물관에 갔다. 티라노 뼈 앞에서 "진짜 크다"를 세 번 말했다. 또 가고 싶다고 했다. 줄 서는 건 싫어했다.'}
};
const SCORE_TXT=s=>s>=.75?'푹 빠졌어요':s>=.55?'좋아해요':s>=.4?'관심 있어요':'별로였어요';
const SCORE_CLS=s=>s>=.55?'t-mint':s>=.4?'t-blue':'t-red';

export default function Diary(){
 const {S,set}=useStore();const n=S.child.name;const ag=ageGroupOf(S.child.age);const P=PROMPTS[ag];
 const today=ymd(new Date());
 const [text,setText]=useState('');const [title,setTitle]=useState('');const [date,setDate]=useState(today);const [placeId,setPlaceId]=useState('');
 const [photos,setPhotos]=useState([]);const [uploading,setUploading]=useState(false);
 const [busy,setBusy]=useState(false);const [result,setResult]=useState(null);
 const recentPlaces=[...new Set([...(S.visited||[]),...(S.lastCourse?S.lastCourse.days.flatMap(d=>d.items.filter(i=>i.kind==='place').map(i=>i.id)):[])])].map(id=>PLACES.find(p=>p.id===id)).filter(Boolean).slice(0,6);

 const addPhotos=async files=>{if(!files||!files.length)return;setUploading(true);const ids=[];for(const f of [...files].slice(0,6-photos.length)){try{ids.push(await savePhoto(f))}catch(e){toast(e.message)}}setPhotos(p=>[...p,...ids]);setUploading(false)};
 const run=async()=>{if(text.trim().length<2){toast('두 글자 이상 적어주세요');return}setBusy(true);setResult(null);const r=await analyzeText({text,ageGroup:ag,childName:n});setBusy(false);setResult(r)};
 const save=()=>{
  const analysis=result?{interests:result.interests,styles:result.styles,avoid:result.avoid,summary:result.summary,source:result.source}:null;
  set(S=>{if(analysis){S.prevTaste={...S.taste};S.taste=mergeTaste(S.taste,analysis);S.styles=mergeStyles(S.styles,analysis);(analysis.avoid||[]).forEach(a=>{if(a.item&&!S.avoid.includes(a.item))S.avoid.push(a.item)})}
   S.diary.push({id:newEntryId(),date,createdAt:Date.now(),kind:'diary',title:title.trim(),text:text.trim(),placeId:placeId||null,reaction:null,photos,ageGroup:ag,analysis})});
  go('calendar');setTimeout(()=>toast(analysis?n+' 취향에 반영하고 엽서를 저장했어요':'엽서를 저장했어요'),150);
 };
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="pad row between" style={{paddingTop:20}}><a className="iconbtn" href="#/calendar" aria-label="캘린더로" style={{background:'#fff'}}><Icon name="back"/></a>
  <label className="pill" style={{background:'#fff'}}><span>{date===today?'오늘':date}</span><input type="date" value={date} max={today} aria-label="기록 날짜" onChange={e=>{if(e.target.value)setDate(e.target.value)}}/></label></div>
 <div className="pad col gap6" style={{paddingTop:14}}>
  <div className="row gap6"><span className="tag t-yellow" style={{fontWeight:700}}>육아일기 · {ag==='7-9'?'7~9세':'4~6세'}</span></div>
  <div className="h-title">{P.title(n)}</div><div className="help">{P.help}</div>
 </div>

 <div className="pad" style={{paddingTop:16}}>
  <div className="row gap8" style={{overflowX:'auto',scrollbarWidth:'none',paddingBottom:4}}>
   {photos.map((id,i)=><div key={id} style={{position:'relative',flexShrink:0}}><img src={cachedPhoto(id)||''} alt={'사진 '+(i+1)} style={{width:96,height:96,borderRadius:14,objectFit:'cover',display:'block'}}/><button type="button" aria-label="사진 삭제" onClick={()=>setPhotos(p=>p.filter(x=>x!==id))} style={{position:'absolute',top:-6,right:-6,width:24,height:24,borderRadius:999,border:'none',background:'#191F28',color:'#fff',fontSize:12,lineHeight:'24px',padding:0}}>✕</button></div>)}
   {photos.length<6?<label className="col" style={{width:96,height:96,flexShrink:0,borderRadius:14,border:'1.5px dashed #B0B8C1',background:'#fff',alignItems:'center',justifyContent:'center',gap:4,color:'var(--sub)',cursor:'pointer',fontSize:12}}>
    <Icon name="plus"/>{uploading?'올리는 중':'사진 추가'}<input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{addPhotos(e.target.files);e.target.value=''}}/></label>:null}
  </div>
  <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={30} placeholder="제목 (비워두면 장소나 첫 줄로)" style={{width:'100%',marginTop:12,height:48,borderRadius:14,border:'1.5px solid var(--line)',background:'#fff',padding:'0 14px',fontSize:16,fontWeight:700,outline:'none'}}/>
  <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={P.ph} rows={6} maxLength={2000} style={{width:'100%',marginTop:10,borderRadius:16,border:'1.5px solid var(--line)',background:'#fff',padding:14,fontSize:16,lineHeight:1.6,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
  <div className="row between" style={{paddingTop:6}}><span className="small">{text.length} / 2000</span></div>
  {recentPlaces.length?<div className="col gap8" style={{paddingTop:12}}><span className="small">어디 다녀왔어요? (선택)</span><div className="row gap6 wrap">{recentPlaces.map(p=><Chip key={p.id} on={placeId===p.id} onClick={()=>setPlaceId(placeId===p.id?'':p.id)}>{p.name}</Chip>)}</div></div>:null}
 </div>

 {result?(
 <div className="pad col gap12" style={{paddingTop:16}}>
  <div className="col gap10" style={{background:'#fff',borderRadius:20,padding:16}}>
   <div className="row between"><div style={{fontSize:16,fontWeight:700}}>오늘 알게 된 것</div><span className="small">{result.source==='claude'?'AI 분석':'간단 분석'}{result.cached?' · 캐시':''}</span></div>
   <div style={{fontFamily:'var(--deco)',fontSize:19,color:'var(--navy)',lineHeight:1.4}}>{result.summary}</div>
   {result.fallbackReason==='short'?<div className="small">짧은 글은 키워드로만 봐요. 조금 더 길게 적으면 AI가 읽어요.</div>:result.fallbackReason?<div className="small" style={{color:'var(--yellowInk)'}}>서버 분석을 못 써서 키워드로만 봤어요 ({result.fallbackReason==='no_key'?'API 키 없음':result.fallbackReason})</div>:null}
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
  {result?<><button type="button" className="btn btn-soft" style={{flex:1}} onClick={()=>setResult(null)}>다시 쓰기</button><button type="button" className="btn btn-primary" style={{flex:1.6}} onClick={save}>엽서로 저장 · 취향 반영</button></>
  :<><button type="button" className="btn btn-soft" style={{flex:1}} disabled={!text.trim()&&!photos.length} onClick={save}>그냥 저장</button><button type="button" className="btn btn-primary" style={{flex:1.6}} disabled={busy} onClick={run}>{busy?'읽는 중…':'분석하고 저장'}</button></>}
 </BottomCta>
</div>)}
