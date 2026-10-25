/* 지난 코스 (#/courses): 만든 코스를 최근 순으로. 다녀오기 전 코스는 다시 열거나 기록할 수 있고, 기록한 코스는 장소마다 아이 반응과 한 줄 기록 */
import {useStore} from '../store.jsx';
import {placeById} from '../lib/logic.js';
import {moodSvg} from '../lib/svg.js';
import {fmtDate,fmtShort,go} from '../lib/utils.js';
import {Icon,Html,Thumb,TabBar} from '../components/ui.jsx';

const REACT={like:['joy','좋아했어요'],meh:['dislike','시큰둥했어요']};

export default function Courses(){
 const {S,set}=useStore();const n=S.child.name;
 const openCourse=(k,to)=>{if(k.course)set(S=>{S.lastCourse=k.course});go(to)};
 const back=()=>{if(history.length>1)history.back();else go('my')};
 return (
<div className="screen">
 <div className="topbar">
  <button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>
  <div style={{fontSize:19,fontWeight:700}}>지난 코스</div>
 </div>
 {S.courses.length?<div className="pad col gap12" style={{paddingTop:20}}>
  {S.courses.map(k=><div key={k.key} className="card col gap12" style={{padding:18}}>
   <div className="row between" style={{alignItems:'baseline'}}><span className="row gap8" style={{alignItems:'baseline'}}><span style={{fontSize:17,fontWeight:700}}>{fmtDate(k.date)}</span>{k.done?<span className="tag t-mint">기록 완료</span>:<span className="tag t-yellow">다녀오기 전</span>}</span><span className="small">{k.places.length}곳</span></div>
   {k.places.map(x=>{const p=placeById(x.id);const r=REACT[x.v];return (
    <a key={x.id} href={'#/place?id='+p.id} className="row gap12" style={{textDecoration:'none',color:'inherit'}}>
     <Thumb p={p} size={52}/>
     <div className="col" style={{flex:1,minWidth:0,gap:3}}>
      <div className="row gap6"><span style={{fontSize:15,fontWeight:700}}>{p.name}</span><span className="small">{fmtShort(x.time)}</span></div>
      {x.note?<div style={{fontSize:13,color:'var(--sub)'}}>{x.note}</div>:null}
     </div>
     {r?<Html s={moodSvg(r[0],24)} role="img" aria-label={n+'가 '+r[1]} style={{display:'inline-flex'}}/>:null}
    </a>)})}
   {k.course?<div className="row gap8" style={{paddingTop:4}}><button type="button" className="btn btn-soft btn-sm" style={{flex:1}} onClick={()=>openCourse(k,'result')}>코스 보기</button>{k.done?null:<button type="button" className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>openCourse(k,'record')}>다녀와서 기록</button>}</div>:null}
  </div>)}
 </div>:<div className="pad col gap12" style={{paddingTop:48,alignItems:'center',textAlign:'center'}}>
  <div className="h-title">아직 만든 코스가 없어요</div>
  <a className="btn btn-primary" href="#/c1" style={{marginTop:12}}>코스 만들기</a>
 </div>}
 <TabBar on="my"/>
</div>)}
