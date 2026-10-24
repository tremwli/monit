import {useStore} from '../store.jsx';
import {placeById} from '../lib/logic.js';
import {fmtT,fmtDate,clamp,toast,go} from '../lib/utils.js';
import {savePhoto,cachedPhoto} from '../lib/photos.js';
import {newEntryId} from '../lib/journal.js';
import {ageGroupOf} from '../lib/analysis.js';
import {Icon,BottomCta} from '../components/ui.jsx';

export default function Record(){
 const {S,set,UI,setUI}=useStore();const L=S.lastCourse;const n=S.child.name;
 if(!L)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">기록할 코스가 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/c1">코스 만들기</a></div></div>;
 const ids=[];L.days.forEach(d=>d.items.forEach(it=>{if(it.kind==='place')ids.push(it)}));
 const setRec=(id,fn)=>setUI(u=>{u.rec={...u.rec};u.rec[id]={...(u.rec[id]||{})};fn(u.rec[id])});
 const saveRec=()=>{
  const rec=UI.rec,photos=UI.photos;let changed=0;const ag=ageGroupOf(S.child.age);
  set(S=>{const date=S.lastCourse.days[0].date;S.prevTaste={...S.taste};
   S.lastCourse.days.forEach(d=>d.items.forEach(it=>{if(it.kind!=='place')return;const p=placeById(it.id);const r=rec[p.id]||{};const ph=photos[p.id]||[];
    if(!S.visited.includes(p.id))S.visited.push(p.id);
    if(r.v){p.ints.forEach(i=>{S.taste[i]=clamp(S.taste[i]+(r.v==='like'?.14:-.16))});changed++}
    if(r.v||r.note)S.history.push({id:p.id,v:r.v||null,note:r.note||'',date});
    /* 반응·한 줄·사진 중 하나라도 있으면 엽서(일기)로도 남긴다 */
    if(r.v||r.note||ph.length)S.diary.push({id:newEntryId(),date,createdAt:Date.now(),kind:'visit',title:'',text:r.note||'',placeId:p.id,reaction:r.v||null,photos:ph,ageGroup:ag,analysis:null})}));
   /* 지난 코스 목록에 저장. 같은 코스를 다시 기록하면 덮어씀 */
   const done={key:S.lastCourse.createdAt,date,done:true,course:S.lastCourse,places:S.lastCourse.days.flatMap(d=>d.items.filter(it=>it.kind==='place').map(it=>({id:it.id,time:it.time,v:(rec[it.id]||{}).v||null,note:(rec[it.id]||{}).note||''})))};
   S.courses=[done,...(S.courses||[]).filter(k=>k.key!==done.key)]});
  setUI(u=>{u.rec={};u.photos={}});go('calendar');setTimeout(()=>toast(changed?n+' 취향이 업데이트됐어요 · 엽서 저장':'엽서를 저장했어요'),150)};
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="pad" style={{paddingTop:20}}><a className="iconbtn" href="#/result" aria-label="코스로 돌아가기" style={{background:'var(--paper)'}}><Icon name="back"/></a></div>
 <div className="pad col gap6" style={{paddingTop:14}}><div className="h-title">{fmtDate(L.days[0].date)}</div><div className="help">{n}랑 {ids.length}곳 다녀왔어요</div></div>
 <div className="pad col gap12" style={{paddingTop:18}}>
 {ids.map(it=>{const p=placeById(it.id);const r=UI.rec[p.id]||{};const ph=UI.photos[p.id]||[];return (
  <div key={p.id} className="col gap12" style={{background:'var(--paper)',borderRadius:20,padding:18}}>
   <div className="row between"><span style={{fontSize:17,fontWeight:700}}>{p.name}</span><span className="small">{fmtT(it.time)}</span></div>
   <div className="row gap6" style={{overflowX:'auto',scrollbarWidth:'none'}}>{ph.map((id,i)=><img key={id} src={cachedPhoto(id)||''} alt={p.name+'에서 찍은 사진 '+(i+1)} style={{width:76,height:76,borderRadius:20,objectFit:'cover',flexShrink:0}}/>)}
    <label className="row" style={{width:76,height:76,flexShrink:0,borderRadius:20,border:'1px dashed #B0B8C1',justifyContent:'center',color:'var(--sub)',cursor:'pointer'}} aria-label="사진 추가"><Icon name="plus"/><input type="file" accept="image/*" multiple style={{display:'none'}} onChange={async e=>{const files=[...(e.target.files||[])];e.target.value='';for(const f of files.slice(0,4)){try{const id=await savePhoto(f);setUI(u=>{u.photos={...u.photos,[p.id]:[...(u.photos[p.id]||[]),id]}})}catch(err){toast(err.message)}}}}/></label></div>
   {it.meal?null:<div className="seg" role="group" aria-label={n+' 반응'} style={{gridTemplateColumns:'1fr 1fr'}}><button type="button" className={r.v==='like'?'on':''} style={r.v==='like'?{color:'var(--mintInk)',background:'var(--mintT)'}:undefined} onClick={()=>setRec(p.id,x=>{x.v=x.v==='like'?null:'like'})}>{n}가 좋아했어요</button><button type="button" className={r.v==='meh'?'on':''} onClick={()=>setRec(p.id,x=>{x.v=x.v==='meh'?null:'meh'})}>시큰둥했어요</button></div>}
   <label className="col gap6"><span className="small">한 줄 기록</span><input className="input" style={{borderRadius:20,background:'var(--paper)',border:'1px solid var(--line)'}} value={r.note||''} placeholder={it.meal?'예) 아기 의자가 있어서 편했다':'예) 공룡 뼈 앞에서 한참을 안 떠났다'} onChange={e=>setRec(p.id,x=>{x.note=e.target.value})}/></label>
  </div>)})}
 </div>
 <BottomCta><button type="button" className="btn btn-primary" onClick={saveRec}>순간 모으기 · {n} 취향 업데이트</button></BottomCta>
</div>)}
