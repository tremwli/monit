/* 육아일기 작성. 네이버 블로그 글쓰기처럼 제목 + 본문이고, 사진은 글 사이에 끼워 넣는다.
   본문은 블록 배열: {type:'text', text} | {type:'photo', id}. 저장할 때 text(합친 글)와 photos(순서대로)도 같이 넣어
   분석·엽서·예전 화면이 그대로 동작하게 한다. */
import {useEffect,useRef,useState} from 'react';
import {useStore} from '../store.jsx';
import {INTEREST_TAGS,STYLE_TAGS,ageGroupOf,mergeTaste,mergeStyles} from '../lib/analysis.js';
import {analyzeText} from '../lib/ai.js';
import {savePhoto,cachedPhoto} from '../lib/photos.js';
import {newEntryId} from '../lib/journal.js';
import {PLACES} from '../lib/data.js';
import {ymd,toast,go} from '../lib/utils.js';
import {Icon,BottomCta,Chip} from '../components/ui.jsx';

const SCORE_TXT=s=>s>=.75?'푹 빠졌어요':s>=.55?'좋아해요':s>=.4?'관심 있어요':'별로였어요';
const SCORE_CLS=s=>s>=.55?'t-mint':s>=.4?'t-blue':'t-red';
let seq=0;const bid=()=>'b'+(++seq)+Date.now().toString(36);

/* 자라는 textarea (테두리 없음, 블로그 본문 느낌) */
function TextBlock({value,placeholder,autoFocus,onChange,onFocus,onBackspaceEmpty}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;el.style.height='auto';el.style.height=el.scrollHeight+'px'},[value]);
 useEffect(()=>{if(autoFocus&&ref.current)ref.current.focus()},[]); // eslint-disable-line
 return <textarea ref={ref} value={value} placeholder={placeholder} rows={1} onFocus={onFocus} onChange={e=>onChange(e.target.value)}
  onKeyDown={e=>{if(e.key==='Backspace'&&!value&&onBackspaceEmpty){e.preventDefault();onBackspaceEmpty()}}}
  style={{width:'100%',border:'none',background:'transparent',padding:'6px 0',fontSize:16,lineHeight:1.75,outline:'none',resize:'none',fontFamily:'inherit',color:'var(--ink2)',overflow:'hidden'}}/>;
}

export default function Diary(){
 const {S,set}=useStore();const n=S.child.name;const ag=ageGroupOf(S.child.age);
 const today=ymd(new Date());
 const qd=new URLSearchParams(location.hash.split('?')[1]||'').get('date');
 const [date,setDate]=useState(qd&&/^\d{4}-\d{2}-\d{2}$/.test(qd)&&qd<=today?qd:today);
 const [title,setTitle]=useState('');const [placeId,setPlaceId]=useState('');
 const [blocks,setBlocks]=useState(()=>[{id:bid(),type:'text',text:''}]);
 const [focus,setFocus]=useState(0);const [uploading,setUploading]=useState(false);
 const [busy,setBusy]=useState(false);const [result,setResult]=useState(null);
 const fileRef=useRef(null);
 const recentPlaces=[...new Set([...(S.visited||[]),...(S.lastCourse?S.lastCourse.days.flatMap(d=>d.items.filter(i=>i.kind==='place').map(i=>i.id)):[])])].map(id=>PLACES.find(p=>p.id===id)).filter(Boolean).slice(0,6);

 const text=blocks.filter(b=>b.type==='text').map(b=>b.text.trim()).filter(Boolean).join('\n\n');
 const photoIds=blocks.filter(b=>b.type==='photo').map(b=>b.id);
 const photoCount=photoIds.length;

 const updateText=(i,v)=>setBlocks(bs=>bs.map((b,k)=>k===i?{...b,text:v}:b));
 const removeBlock=i=>setBlocks(bs=>{if(bs.length<=1)return bs;const next=bs.filter((_,k)=>k!==i);setFocus(Math.max(0,i-1));return next});
 const removeTextIfEmpty=i=>{if(i===0)return;removeBlock(i)};
 /* 사진은 커서가 있던 문단 바로 뒤에 들어가고, 이어서 쓸 수 있게 빈 문단을 뒤에 붙인다 */
 const addPhotos=async files=>{if(!files||!files.length)return;setUploading(true);const ids=[];
  for(const f of [...files].slice(0,10-photoCount)){try{ids.push(await savePhoto(f))}catch(e){toast(e.message)}}
  setUploading(false);if(!ids.length)return;
  setBlocks(bs=>{const at=Math.min(focus,bs.length-1)+1;const ins=ids.map(id=>({id,type:'photo'}));const after=bs[at];
   const tail=after&&after.type==='text'?[]:[{id:bid(),type:'text',text:''}];
   const next=[...bs.slice(0,at),...ins,...tail,...bs.slice(at)];setFocus(at+ins.length);return next})};

 const run=async()=>{if(text.length<2){toast('두 글자 이상 적어주세요');return}setBusy(true);setResult(null);const r=await analyzeText({text,ageGroup:ag,childName:n});setBusy(false);setResult(r)};
 const save=()=>{
  const analysis=result?{interests:result.interests,styles:result.styles,avoid:result.avoid,summary:result.summary,source:result.source}:null;
  const cleanBlocks=blocks.filter(b=>b.type==='photo'||b.text.trim()).map(b=>b.type==='text'?{type:'text',text:b.text.trim()}:{type:'photo',id:b.id});
  set(S=>{if(analysis){S.prevTaste={...S.taste};S.taste=mergeTaste(S.taste,analysis);S.styles=mergeStyles(S.styles,analysis);(analysis.avoid||[]).forEach(a=>{if(a.item&&!S.avoid.includes(a.item))S.avoid.push(a.item)})}
   S.diary.push({id:newEntryId(),date,createdAt:Date.now(),kind:'diary',title:title.trim(),text,blocks:cleanBlocks,placeId:placeId||null,reaction:null,photos:photoIds,ageGroup:ag,analysis})});
  go('calendar');setTimeout(()=>toast(analysis?n+' 취향에 반영했어요':'저장했어요'),150);
 };
 const canSave=!!(text||photoCount);
 return (
<div className="screen" style={{background:'#fff',paddingBottom:'calc(170px + env(safe-area-inset-bottom))'}}>
 <div className="pad row between" style={{paddingTop:16}}>
  <a className="iconbtn" href="#/calendar" aria-label="캘린더로"><Icon name="back"/></a>
  <label className="pill"><span>{date===today?'오늘':date}</span><input type="date" value={date} max={today} aria-label="기록 날짜" onChange={e=>{if(e.target.value)setDate(e.target.value)}}/></label>
 </div>

 <div className="pad" style={{paddingTop:18}}>
  <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={30} placeholder="제목" style={{width:'100%',border:'none',background:'transparent',padding:'4px 0 10px',fontSize:24,fontWeight:700,outline:'none',fontFamily:'inherit',borderBottom:'1px solid var(--soft)'}}/>
  {recentPlaces.length?<div className="row gap6 wrap" style={{paddingTop:12}}>{recentPlaces.map(p=><Chip key={p.id} on={placeId===p.id} onClick={()=>setPlaceId(placeId===p.id?'':p.id)} style={{height:30,fontSize:13}}>{p.name}</Chip>)}</div>:null}
  <div style={{paddingTop:10}}>
   {blocks.map((b,i)=>b.type==='text'
    ?<TextBlock key={b.id} value={b.text} placeholder={i===0?'오늘 '+n+'는…':''} autoFocus={i===0&&!qd} onFocus={()=>setFocus(i)} onChange={v=>updateText(i,v)} onBackspaceEmpty={()=>removeTextIfEmpty(i)}/>
    :<div key={b.id} style={{position:'relative',margin:'6px 0 8px'}} onClick={()=>setFocus(i)}>
      <img src={cachedPhoto(b.id)||''} alt={'사진 '+(photoIds.indexOf(b.id)+1)} style={{width:'100%',borderRadius:14,display:'block'}}/>
      <button type="button" aria-label="사진 삭제" onClick={e=>{e.stopPropagation();removeBlock(i)}} style={{position:'absolute',top:8,right:8,width:28,height:28,borderRadius:999,border:'none',background:'rgba(25,31,40,.7)',color:'#fff',fontSize:13,padding:0}}>✕</button>
     </div>)}
  </div>
 </div>

 {result?(
 <div className="pad col gap12" style={{paddingTop:16}}>
  <div className="col gap10" style={{background:'var(--bg2)',borderRadius:20,padding:16}}>
   <div className="row between"><div style={{fontSize:16,fontWeight:700}}>오늘 알게 된 것</div><span className="small">{result.source==='claude'?'AI 분석':'간단 분석'}{result.cached?' · 캐시':''}</span></div>
   <div style={{fontFamily:'var(--deco)',fontSize:19,color:'var(--navy)',lineHeight:1.4}}>{result.summary}</div>
   {result.fallbackReason&&result.fallbackReason!=='short'?<div className="small" style={{color:'var(--yellowInk)'}}>간단 분석으로 봤어요 ({result.fallbackReason==='no_key'?'API 키 없음':result.fallbackReason})</div>:null}
  </div>
  {result.interests.length?<div className="col gap10" style={{background:'var(--bg2)',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>관심사</div>
   {result.interests.map((i,k)=><div key={k} className="col gap6"><div className="row gap8"><span className={'tag '+SCORE_CLS(i.score)} style={{fontWeight:700,fontSize:13,padding:'5px 12px'}}>{INTEREST_TAGS[i.tag]}</span><span className="small">{SCORE_TXT(i.score)} · {Math.round(i.score*100)}%</span></div><div style={{fontSize:13,color:'var(--sub)',paddingLeft:4}}>“{i.quote}”</div></div>)}
  </div>:null}
  {result.styles.length?<div className="col gap10" style={{background:'var(--bg2)',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>노는 방식</div>
   <div className="row gap6 wrap">{result.styles.map((s,k)=><span key={k} className={'tag '+SCORE_CLS(s.score)} style={{fontSize:13,padding:'5px 12px'}}>{STYLE_TAGS[s.tag]} {Math.round(s.score*100)}%</span>)}</div>
  </div>:null}
  {result.avoid.length?<div className="col gap8" style={{background:'var(--bg2)',borderRadius:20,padding:16}}>
   <div style={{fontSize:15,fontWeight:700}}>조심할 것</div>
   {result.avoid.map((a,k)=><div key={k} style={{fontSize:14}}><span className="tag t-red" style={{marginRight:6}}>{a.item}</span><span className="small">“{a.quote}”</span></div>)}
  </div>:null}
 </div>):null}

 <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{addPhotos(e.target.files);e.target.value=''}}/>
 <div style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(78px + env(safe-area-inset-bottom))',width:'100%',maxWidth:430,padding:'8px 20px',background:'#fff',borderTop:'1px solid var(--soft)',display:'flex',gap:8,zIndex:21}}>
  <button type="button" className="chip" onClick={()=>fileRef.current&&fileRef.current.click()} disabled={uploading||photoCount>=10} style={{height:38}}>
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>{uploading?'올리는 중':'사진'}{photoCount?' '+photoCount:''}</button>
  <span className="small" style={{marginLeft:'auto',alignSelf:'center'}}>{text.length}자</span>
 </div>
 <BottomCta>
  {result?<><button type="button" className="btn btn-soft" style={{flex:1}} onClick={()=>setResult(null)}>다시 쓰기</button><button type="button" className="btn btn-primary" style={{flex:1.6}} onClick={save}>저장 · 취향 반영</button></>
  :<><button type="button" className="btn btn-soft" style={{flex:1}} disabled={!canSave} onClick={save}>그냥 저장</button><button type="button" className="btn btn-primary" style={{flex:1.6}} disabled={busy||text.length<2} onClick={run}>{busy?'읽는 중…':'분석하고 저장'}</button></>}
 </BottomCta>
</div>)}
