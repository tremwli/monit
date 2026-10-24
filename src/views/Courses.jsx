/* 지난 코스 (#/courses): 기록을 남긴 코스를 최근 순으로. 장소마다 그날 아이 반응과 한 줄 기록 */
import {useStore} from '../store.jsx';
import {placeById} from '../lib/logic.js';
import {moodSvg} from '../lib/svg.js';
import {fmtDate,fmtShort,go} from '../lib/utils.js';
import {Icon,Html,Thumb,TabBar} from '../components/ui.jsx';

const REACT={like:['joy','좋아했어요'],meh:['dislike','시큰둥했어요']};

export default function Courses(){
 const {S}=useStore();const n=S.child.name;
 const back=()=>{if(history.length>1)history.back();else go('my')};
 return (
<div className="screen">
 <div className="topbar">
  <button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>
  <div style={{fontSize:19,fontWeight:700}}>지난 코스</div>
 </div>
 {S.courses.length?<div className="pad col gap12" style={{paddingTop:20}}>
  {S.courses.map(k=><div key={k.key} className="card col gap12" style={{padding:18}}>
   <div className="row between" style={{alignItems:'baseline'}}><span style={{fontSize:17,fontWeight:700}}>{fmtDate(k.date)}</span><span className="small">{k.places.length}곳</span></div>
   {k.places.map(x=>{const p=placeById(x.id);const r=REACT[x.v];return (
    <div key={x.id} className="row gap12">
     <Thumb p={p} size={52}/>
     <div className="col" style={{flex:1,minWidth:0,gap:3}}>
      <div className="row gap6"><span style={{fontSize:15,fontWeight:700}}>{p.name}</span><span className="small">{fmtShort(x.time)}</span></div>
      {x.note?<div style={{fontSize:13,color:'var(--sub)'}}>{x.note}</div>:null}
     </div>
     {r?<Html s={moodSvg(r[0],24)} role="img" aria-label={n+'가 '+r[1]} style={{display:'inline-flex'}}/>:null}
    </div>)})}
  </div>)}
 </div>:<div className="pad col gap12" style={{paddingTop:48,alignItems:'center',textAlign:'center'}}>
  <div className="h-title">아직 다녀온 코스가 없어요</div>
  <div className="help">코스를 다녀와서 기록하면 여기에 모여요</div>
  <a className="btn btn-primary" href={S.lastCourse?'#/record':'#/c1'} style={{marginTop:12}}>{S.lastCourse?'최근 코스 기록하기':'코스 만들기'}</a>
 </div>}
 <TabBar on="my"/>
</div>)}
