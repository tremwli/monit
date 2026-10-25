/* 코스 진행 중 (#/trip): 출발한 코스의 시간표를 간단히 보여주고, 다녀오면 만족도 조사(#/record)로 */
import {useStore} from '../store.jsx';
import {placeById,courseEntry,courseEndAt} from '../lib/logic.js';
import {kakaoMapUrl} from '../lib/map.js';
import {fmtDate,fmtShort,go} from '../lib/utils.js';
import {Icon,Thumb,BottomCta} from '../components/ui.jsx';

export default function Trip(){
 const {S,set}=useStore();const L=S.lastCourse;const n=S.child.name;
 const entry=L&&courseEntry(S,L.createdAt);
 if(!L||!entry)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">진행 중인 코스가 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/home">홈으로</a></div></div>;
 const ended=Date.now()>courseEndAt(L);
 const back=()=>{if(history.length>1)history.back();else go('home')};
 return (
<div className="screen">
 <div className="topbar">
  <button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>
  <div style={{fontSize:19,fontWeight:700}}>{n}랑 떠나는 중</div>
 </div>
 <div className="pad col gap6" style={{paddingTop:20}}>
  <span className="tag t-blue" style={{alignSelf:'flex-start',fontWeight:700}}>{ended?'코스가 끝났어요':'진행 중'}</span>
  <div style={{fontSize:21,fontWeight:700}}>{fmtDate(L.days[0].date)}{L.days.length>1?' – '+fmtDate(L.days[L.days.length-1].date):''}</div>
 </div>
 <div className="pad col gap10" style={{paddingTop:18}}>
  {L.days.flatMap(d=>d.items.filter(it=>it.kind==='place')).map(it=>{const p=placeById(it.id);return (
   <div key={it.id} className="card row gap12" style={{padding:12}}>
    <Thumb p={p} size={56}/>
    <a href={'#/place?id='+p.id} className="col" style={{flex:1,minWidth:0,gap:3,textDecoration:'none',color:'inherit'}}><span className="small">{fmtShort(it.time)} 도착 · {it.stay}분</span><span style={{fontSize:16,fontWeight:700}}>{p.name}</span></a>
    <a className="chip" href={kakaoMapUrl(p)} target="_blank" rel="noopener" style={{height:34,fontSize:13,textDecoration:'none',flexShrink:0}}>지도</a>
   </div>)})}
  <a href="#/result" style={{fontSize:13,color:'var(--sub)',textDecoration:'none',textAlign:'center',padding:'6px 0'}}>코스 자세히 보기 ›</a>
 </div>
 <BottomCta><button type="button" className="btn btn-primary" onClick={()=>{set(S=>{S.lastCourse=entry.course});go('record')}}>다녀왔어요 · 만족도 남기기</button></BottomCta>
</div>)}
