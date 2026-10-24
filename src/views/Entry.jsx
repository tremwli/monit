/* 엽서 한 장 = 블로그 글. 사진 크게, 날짜, 제목, 글, 태그 */
import {useStore} from '../store.jsx';
import {INTEREST_TAGS,STYLE_TAGS} from '../lib/analysis.js';
import {placeById} from '../lib/logic.js';
import {entryTitle,entryTint} from '../lib/journal.js';
import {deletePhotos} from '../lib/photos.js';
import {fmtDate,toast,go} from '../lib/utils.js';
import {Icon,Face} from '../components/ui.jsx';
import Photo from '../components/Photo.jsx';

export default function Entry(){
 const {S,set}=useStore();const n=S.child.name;
 const id=new URLSearchParams(location.hash.split('?')[1]||'').get('id');
 const e=(S.diary||[]).find(x=>x.id===id);
 if(!e)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">엽서를 찾을 수 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/calendar">캘린더로</a></div></div>;
 const place=e.placeId?placeById(e.placeId):null;const a=e.analysis;
 const del=()=>{if(!confirm('이 엽서를 지울까요?'))return;const ph=e.photos||[];set(S=>{S.diary=S.diary.filter(x=>x.id!==e.id)});deletePhotos(ph).catch(()=>{});go('calendar');setTimeout(()=>toast('엽서를 지웠어요'),150)};
 const photos=e.photos||[];const blocks=e.blocks&&e.blocks.length?e.blocks:null;
 return (
<div className="screen" style={{background:'#fff'}}>
 {blocks
  ?<div className="pad row between" style={{paddingTop:16}}><a className="iconbtn" href="#/calendar" aria-label="뒤로"><Icon name="back"/></a><button type="button" className="iconbtn" aria-label="삭제" onClick={del}><Icon name="close"/></button></div>
  :<div style={{position:'relative'}}>
   {photos.length?<Photo id={photos[0]} tint={entryTint(e)} alt={entryTitle(e)} style={{width:'100%',height:300}}/>:<div style={{width:'100%',height:160,background:entryTint(e)}}/>}
   <div className="row between" style={{position:'absolute',top:16,left:16,right:16}}><a className="iconbtn white" href="#/calendar" aria-label="뒤로"><Icon name="back"/></a><button type="button" className="iconbtn white" aria-label="삭제" onClick={del}><Icon name="close"/></button></div>
  </div>}
 {!blocks&&photos.length>1?<div className="row gap8" style={{overflowX:'auto',padding:'10px 20px 0',scrollbarWidth:'none'}}>{photos.slice(1).map(p=><Photo key={p} id={p} tint={entryTint(e)} alt="" style={{width:84,height:84,borderRadius:12,flexShrink:0}}/>)}</div>:null}
 <div className="pad col gap10" style={{paddingTop:18}}>
  <div className="row gap8" style={{alignItems:'center'}}><span className="small">{fmtDate(e.date)}</span>{place?<span className="tag t-peri">{place.name}</span>:null}{e.reaction?<span className="row gap6" style={{fontSize:12,color:'var(--sub)'}}><Face level={e.reaction==='like'?'A':'C'} size={16}/>{e.reaction==='like'?n+'가 좋아했어요':'시큰둥했어요'}</span>:null}</div>
  <div style={{fontFamily:'var(--deco)',fontSize:28,lineHeight:1.25,color:'var(--navy)'}}>{entryTitle(e)}</div>
  {blocks
   ?blocks.map((b,i)=>b.type==='photo'
     ?<Photo key={b.id+i} id={b.id} tint={entryTint(e)} alt="" style={{width:'100%',borderRadius:14,margin:'4px 0'}}/>
     :<div key={i} style={{fontSize:16,lineHeight:1.75,whiteSpace:'pre-wrap',color:'var(--ink2)'}}>{b.text}</div>)
   :e.text?<div style={{fontSize:16,lineHeight:1.75,whiteSpace:'pre-wrap',color:'var(--ink2)'}}>{e.text}</div>:null}
  {a?<div className="card col gap10" style={{padding:16,marginTop:6}}>
   <div className="small">이 일기에서 알게 된 것</div>
   {a.summary?<div style={{fontSize:15,fontWeight:600}}>{a.summary}</div>:null}
   <div className="row gap6 wrap">{(a.interests||[]).map((x,k)=><span key={k} className="tag t-yellow">{INTEREST_TAGS[x.tag]} {Math.round(x.score*100)}%</span>)}{(a.styles||[]).map((x,k)=><span key={'s'+k} className="tag t-peri">{STYLE_TAGS[x.tag]}</span>)}{(a.avoid||[]).map((x,k)=><span key={'a'+k} className="tag t-red">{x.item}</span>)}</div>
  </div>:null}
 </div>
</div>)}
