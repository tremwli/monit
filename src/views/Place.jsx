/* 장소 상세: 사진·좋아할 확률·기본 정보·카카오맵 버튼·우리 아이 기록·다른 부모님 리뷰 */
import {useStore} from '../store.jsx';
import {FAC} from '../lib/data.js';
import {profileOf,AREAS} from '../lib/interests.js';
import {placeById,scorePlace,levelOf,hashtags,visitCount} from '../lib/logic.js';
import {kakaoMapUrl,kakaoRouteUrl} from '../lib/map.js';
import {fmtT,go} from '../lib/utils.js';
import {sampleReviews} from '../lib/reviews.js';
import {Thumb,MoodRow,Icon,Html,BottomCta} from '../components/ui.jsx';
import {moodSvg} from '../lib/svg.js';

const DAYS='일월화수목금토';
const REACT={like:['joy','좋아했어요'],meh:['dislike','시큰둥했어요']};

function Row({label,children}){return <div className="row gap12" style={{alignItems:'flex-start',fontSize:14}}><span style={{width:72,flexShrink:0,color:'var(--mute)'}}>{label}</span><span style={{flex:1,minWidth:0,color:'#333D4B',lineHeight:1.5}}>{children}</span></div>}

export default function Place(){
 const {S,setUI}=useStore();const n=S.child.name;
 const id=new URLSearchParams(location.hash.split('?')[1]||'').get('id');
 const p=id&&placeById(id);
 if(!p)return <div className="screen pad" style={{paddingTop:60}}><div className="h-title">장소를 찾을 수 없어요</div><div style={{paddingTop:20}}><a className="btn btn-primary" href="#/home">홈으로</a></div></div>;
 const s=scorePlace(S,p);const level=levelOf(s);
 const mine=S.history.filter(h=>h.id===p.id);
 const diaries=(S.diary||[]).filter(d=>d.placeId===p.id);
 const reviews=sampleReviews(p);
 const facs=(p.fac||[]).filter(f=>FAC[f]);
 const openApp=()=>{setUI(u=>{u.mapSel=p.id;u.mapCat='fit'});go('map')};
 return (
<div className="screen" style={{background:'var(--bg2)',paddingBottom:120}}>
 <div style={{position:'relative'}}>
  <Thumb p={p} size={400} square style={{width:'100%',height:260}}/>
  <button type="button" className="iconbtn white" aria-label="뒤로" onClick={()=>history.back()} style={{position:'absolute',left:16,top:16}}><Icon name="back"/></button>
 </div>

 <div className="pad col gap12" style={{paddingTop:18}}>
  <div className="col gap6">
   <div className="row gap8" style={{alignItems:'center'}}><span className="small">{p.cat}</span>{p.indoor?<span className="tag t-blue">실내</span>:<span className="tag t-mint">야외</span>}{p.fee===0&&!p.feeUnknown?<span className="tag t-yellow">무료</span>:null}</div>
   <div className="h-title" style={{fontSize:24}}>{p.name}</div>
   <div style={{fontSize:12,color:'var(--primaryInk)'}}>{hashtags(p)}</div>
  </div>
  {p.type==='meal'?null:<div className="card row between" style={{padding:'12px 16px',background:'var(--paper)'}}><span style={{fontSize:14,fontWeight:600}}>{n}가 좋아할 확률</span><span className="row gap8" style={{alignItems:'center'}}><MoodRow level={level}/><span style={{fontSize:16,fontWeight:800,color:'var(--primaryInk)'}}>{Math.round(s*100)}%</span></span></div>}

  <div className="row gap8">
   <a className="btn btn-primary" href={kakaoMapUrl(p)} target="_blank" rel="noopener" style={{flex:1}}><Icon name="pin"/>카카오맵</a>
   <a className="btn btn-soft" href={kakaoRouteUrl(p)} target="_blank" rel="noopener" style={{flex:1}}><Icon name="car"/>길찾기</a>
   <button type="button" className="btn btn-soft" onClick={openApp} style={{flex:1}}><Icon name="map"/>앱 지도</button>
  </div>

  <div className="card col gap10" style={{padding:16,background:'var(--paper)'}}>
   {p.addr?<Row label="주소">{p.addr}</Row>:null}
   {p.tel?<Row label="전화"><a href={'tel:'+p.tel} style={{color:'inherit'}}>{p.tel}</a></Row>:null}
   {p.open!=null&&p.close!=null?<Row label="시간">{fmtT(p.open)} ~ {fmtT(p.close)}{p.closedDays?.length?' · '+p.closedDays.map(d=>DAYS[d]).join('·')+'요일 휴무':''}</Row>:null}
   <Row label="머무는 시간">약 {p.stay}분</Row>
   <Row label="요금">{p.feeUnknown?'현장 확인':p.fee?p.fee.toLocaleString()+'원':'무료'}</Row>
   {facs.length?<Row label="시설"><span className="row gap6 wrap">{facs.map(f=><span key={f} className="tag" style={{background:'var(--soft)',color:'#333D4B'}}>{FAC[f]}</span>)}</span></Row>:null}
   {(()=>{const pr=profileOf(p);return pr.topics.length||pr.areas.length?<Row label="관심사"><span className="row gap6 wrap">{pr.topics.map(t=><span key={t} className="tag t-yellow">{t}</span>)}{pr.areas.map(a=><span key={a} className="tag t-peri">{AREAS[a]}</span>)}</span></Row>:null})()}
  </div>
  {p.summary?<div style={{fontSize:14,lineHeight:1.6,color:'#333D4B',padding:'0 2px'}}>{p.summary}</div>:null}
 </div>

 <div className="pad col gap10" style={{paddingTop:28}}>
  <div className="row between" style={{alignItems:'baseline'}}><div style={{fontSize:18,fontWeight:700}}>{n}의 기록</div><span className="small">{visitCount(S,p.id)?visitCount(S,p.id)+'번 다녀옴':'아직 안 가봄'}</span></div>
  {mine.length||diaries.length?<div className="col gap8">
   {diaries.slice().reverse().map(d=><a key={d.id} href={'#/entry?id='+d.id} className="card col gap6" style={{padding:'12px 14px',textDecoration:'none',color:'inherit',background:'var(--paper)'}}>
    <div className="row between"><span className="small">{d.date} · {d.kind==='visit'?'다녀온 날':'육아일기'}{d.photos?.length?' · 사진 '+d.photos.length:''}</span>{d.reaction&&REACT[d.reaction]?<Html s={moodSvg(REACT[d.reaction][0],20)} style={{display:'inline-flex'}}/>:null}</div>
    <div style={{fontSize:14,fontWeight:600}}>{d.title||d.text?.slice(0,60)||(d.reaction?n+'가 '+REACT[d.reaction][1]:'기록')}</div>
   </a>)}
   {mine.filter(h=>!diaries.some(d=>d.date===h.date)).slice().reverse().map((h,i)=><div key={i} className="card row gap10" style={{padding:'12px 14px',background:'var(--paper)',alignItems:'center'}}>
    {REACT[h.v]?<Html s={moodSvg(REACT[h.v][0],24)} style={{display:'inline-flex'}}/>:null}
    <div className="col" style={{flex:1,gap:2}}><span className="small">{h.date}</span><span style={{fontSize:14}}>{h.note||(REACT[h.v]?n+'가 '+REACT[h.v][1]:'')}</span></div>
   </div>)}
  </div>:<div className="card" style={{padding:'14px 16px',background:'var(--paper)',fontSize:14,color:'var(--sub)'}}>아직 {n}와 다녀온 기록이 없어요</div>}
 </div>

 <div className="pad col gap10" style={{paddingTop:28}}>
  <div className="row between" style={{alignItems:'baseline'}}><div style={{fontSize:18,fontWeight:700}}>다른 부모님 리뷰</div><span className="small">{reviews.length}개</span></div>
  {reviews.map((r,i)=><div key={i} className="card col gap8" style={{padding:16,background:'var(--paper)'}}>
   <div className="row between"><span className="row gap8" style={{alignItems:'center'}}><span style={{width:28,height:28,borderRadius:999,background:['#A9DDB4','#93A9EE','#FFE08A','#FF9DAE'][i%4]}}/><span style={{fontSize:13,fontWeight:600}}>{r.who}</span><span className="small">{r.when}</span></span><span className="row gap6" style={{alignItems:'center'}}><Html s={moodSvg(REACT[r.v][0],20)} style={{display:'inline-flex'}}/><span className="small">{REACT[r.v][1]}</span></span></div>
   <div style={{fontSize:14,lineHeight:1.55,color:'#333D4B'}}>{r.text}</div>
   <div style={{fontSize:12,color:'var(--primaryInk)'}}>{r.tags}</div>
  </div>)}
 </div>

 <BottomCta><a className="btn btn-primary" href={'#/diary?place='+p.id} style={{flex:1}}>여기 다녀온 이야기 적기</a></BottomCta>
</div>)}
