/* 코스 목록 두 화면. 같은 카드를 쓰고 상태로만 나눈다 (lib/logic.js statusOf).
   지난 코스 (#/courses): 출발한 코스(진행 중)와 기록까지 끝난 코스. 장소마다 아이 반응과 한 줄 기록, 코스 만족도.
   저장한 코스 (#/saved): 만들어 두고 아직 안 간 코스. 다시 보거나 바로 시작할 수 있다. */
import {useStore} from '../store.jsx';
import {placeById,statusOf,upsertCourse} from '../lib/logic.js';
import {faceSvg,moodSvg} from '../lib/svg.js';
import {fmtDate,fmtShort,toast,go} from '../lib/utils.js';
import {Icon,Html,Thumb,TabBar} from '../components/ui.jsx';

const REACT={like:['joy','좋아했어요'],meh:['dislike','시큰둥했어요']};
const RATING={5:[faceSvg('A',22),'최고였어요'],4:[faceSvg('B',22),'좋았어요'],3:[moodSvg('meh',22),'보통이에요'],2:[moodSvg('dislike',22),'아쉬웠어요'],1:[moodSvg('sad',22),'별로였어요']};

function CourseList({mode}){
 const {S,set}=useStore();const n=S.child.name;
 const list=(S.courses||[]).filter(k=>mode==='saved'?statusOf(k)==='saved':statusOf(k)!=='saved');
 const open=(k,to)=>{if(k.course)set(S=>{S.lastCourse=k.course});go(to)};
 const start=k=>{set(S=>{S.lastCourse=k.course;upsertCourse(S,k.course,{status:'ongoing',startedAt:Date.now()})});go('result')};
 const remove=k=>{set(S=>{S.courses=S.courses.filter(x=>x.key!==k.key)});toast('저장한 코스를 지웠어요')};
 const back=()=>{if(history.length>1)history.back();else go('my')};
 return (
<div className="screen">
 <div className="topbar">
  {/* 저장한 코스는 하단 탭이라 뒤로가기 없이 제목만 */}
  {mode==='saved'?<span style={{width:8}}/>:<button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>}
  <div style={{fontSize:19,fontWeight:700}}>{mode==='saved'?'저장한 코스':'지난 코스'}</div>
 </div>
 {list.length?<div className="pad col gap12" style={{paddingTop:20}}>
  {list.map(k=>{const st=statusOf(k);const rt=RATING[k.rating];return <div key={k.key} className="card col gap12" style={{padding:18}}>
   <div className="row between" style={{alignItems:'center'}}>
    <span className="row gap8" style={{alignItems:'baseline'}}><span style={{fontSize:17,fontWeight:700}}>{fmtDate(k.date)}</span>
     {st==='ongoing'?<span className="tag t-blue">진행 중</span>:st==='done'?<span className="tag t-mint">기록 완료</span>:null}</span>
    {rt?<span className="row gap6 small" role="img" aria-label={'코스 만족도 '+rt[1]}><Html s={rt[0]} style={{display:'inline-flex'}}/>{rt[1]}</span>:<span className="small">{k.places.length}곳</span>}
   </div>
   {k.places.map(x=>{const p=placeById(x.id);if(!p)return null;const r=REACT[x.v];return (
    <a key={x.id} href={'#/place?id='+p.id} className="row gap12" style={{textDecoration:'none',color:'inherit'}}>
     <Thumb p={p} size={52}/>
     <div className="col" style={{flex:1,minWidth:0,gap:3}}>
      <div className="row gap6"><span style={{fontSize:15,fontWeight:700}}>{p.name}</span><span className="small">{fmtShort(x.time)}</span></div>
      {x.note?<div style={{fontSize:13,color:'var(--sub)'}}>{x.note}</div>:null}
     </div>
     {r?<Html s={moodSvg(r[0],24)} role="img" aria-label={n+'가 '+r[1]} style={{display:'inline-flex'}}/>:null}
    </a>)})}
   {k.course?<div className="row gap8" style={{paddingTop:4}}>
    <button type="button" className="btn btn-soft btn-sm" style={{flex:1}} onClick={()=>open(k,'result')}>코스 보기</button>
    {st==='saved'?<button type="button" className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>start(k)}>시작하기</button>
     :st==='ongoing'?<button type="button" className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>open(k,'record')}>만족도 남기기</button>:null}
   </div>:null}
   {st==='saved'?<button type="button" className="chip" style={{alignSelf:'center',background:'transparent',fontSize:13,color:'var(--mute)'}} onClick={()=>remove(k)}>지우기</button>:null}
  </div>})}
 </div>:<div className="pad col gap12" style={{paddingTop:48,alignItems:'center',textAlign:'center'}}>
  <div className="h-title">{mode==='saved'?'저장한 코스가 없어요':'아직 다녀온 코스가 없어요'}</div>
  <a className="btn btn-primary" href="#/c1" style={{marginTop:12}}>코스 만들기</a>
 </div>}
 <TabBar on={mode==='saved'?'saved':'my'}/>
</div>)}

export default function Courses(){return <CourseList mode="past"/>}
export function SavedCourses(){return <CourseList mode="saved"/>}
