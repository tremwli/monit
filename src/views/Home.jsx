import {useStore} from '../store.jsx';
import {PLACES,FACE_TXT,FACE_INK} from '../lib/data.js';
import {scorePlace,levelOf,hashtags} from '../lib/logic.js';
import {demo,go} from '../lib/utils.js';
import {Logo,Thumb,Face,Icon,TabBar} from '../components/ui.jsx';

export default function Home(){
 const {S,setUI}=useStore();const n=S.child.name;
 const ranked=PLACES.filter(p=>p.type==='play').map(p=>({p,s:scorePlace(S,p)})).sort((a,b)=>b.s-a.s);
 const top=ranked.slice(0,6);const rainy=ranked.filter(x=>x.p.indoor).slice(0,3);
 const openPlace=id=>{setUI(u=>{u.mapSel=id;u.mapCat='fit'});go('map')};
 return (
<div className="screen">
 <div className="hero" style={{height:360}}>
  <div className="row between" style={{position:'absolute',top:18,left:22,right:18}}>
   <Logo/>
   <button type="button" className="iconbtn white" onClick={demo} aria-label="알림"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
  </div>
  <div className="col gap8" style={{position:'absolute',top:76,left:24}}>
   <div style={{fontSize:26,fontWeight:700,lineHeight:1.38}}>오늘은 {n}랑<br/>어디 갈까요?</div>
   <a href="#/my" style={{alignSelf:'flex-start',marginTop:4,height:32,padding:'0 12px',borderRadius:999,background:'rgba(255,255,255,.85)',color:'#333D4B',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center'}}>{n}가 직접 고른 취향 보기 ›</a>
  </div>
  <svg viewBox="0 0 390 170" style={{position:'absolute',left:0,right:0,bottom:20,width:'100%',height:'auto'}} aria-hidden="true">
   <defs><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".95"/><stop offset="1" stopColor="#fff" stopOpacity=".35"/></linearGradient><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".25"/><stop offset="1" stopColor="#fff"/></linearGradient></defs>
   <ellipse cx="318" cy="28" rx="24" ry="9" fill="url(#cf)"/><ellipse cx="340" cy="18" rx="18" ry="8" fill="url(#cf)"/>
   <path d="M-10 134 C 80 114, 310 114, 400 134 L 400 170 L -10 170 Z" fill="url(#gf)"/>
   <path d="M254 118 V96 H274 V72 H332 V96 H352 V118 Z" fill="#7FCB98" stroke="#2F3657" strokeWidth="1.5"/><rect x="281" y="78" width="21" height="14" fill="#fff"/><rect x="305" y="78" width="21" height="14" fill="#fff"/>
   <circle cx="278" cy="119" r="11" fill="#2F3657"/><circle cx="278" cy="119" r="4.5" fill="#fff"/><circle cx="328" cy="119" r="11" fill="#2F3657"/><circle cx="328" cy="119" r="4.5" fill="#fff"/>
   <circle cx="256" cy="84" r="3.5" fill="#fff" stroke="#2F3657" strokeWidth="1.1"/><ellipse cx="240" cy="74" rx="6.5" ry="5" fill="#fff" stroke="#2F3657" strokeWidth="1.1"/>
   <ellipse cx="178" cy="52" rx="50" ry="29" fill="#fff" stroke="#2F3657" strokeWidth="1.2"/><text x="178" y="61" textAnchor="middle" fontFamily="OkDanDan, Pretendard Variable, sans-serif" fontSize="25" fill="#2F3657">떠나요</text>
  </svg>
 </div>
 <div className="sheet pad" style={{marginTop:-20,paddingTop:22}}>
  <div className="card col gap12" style={{padding:18}}>
   <div className="row between" style={{alignItems:'baseline'}}><div style={{fontSize:18,fontWeight:700}}>{n} 맞춤 코스 만들기</div><div className="small">5단계 · 1분이면 끝나요</div></div>
   <div className="row gap6 wrap">{['1 일정','2 장소','3 함께·이동','4 원하는 곳','5 '+n+' 맞춤'].map(t=><span key={t} style={{fontSize:12,fontWeight:600,color:'#333D4B',background:'#fff',borderRadius:999,padding:'5px 10px'}}>{t}</span>)}</div>
   {S.lastCourse?<a href="#/result" style={{fontSize:13,color:'var(--sub)',textDecoration:'none'}}>최근 만든 코스 다시 보기 ›</a>:null}
   <a className="btn btn-primary" href="#/c1" style={{height:50,fontSize:16}}><Icon name="route"/>코스 만들기 시작</a>
  </div>
 </div>
 <div className="pad row between" style={{paddingTop:28,paddingBottom:12,alignItems:'baseline'}}><div style={{fontSize:19,fontWeight:700}}>{n}가 좋아할 곳</div><a href="#/map" style={{fontSize:13,color:'var(--sub)',textDecoration:'none'}}>지도로 보기</a></div>
 <div className="row gap12" style={{overflowX:'auto',padding:'0 20px 4px',scrollSnapType:'x mandatory',scrollbarWidth:'none'}}>
  {top.map(({p,s})=>{const lv=levelOf(s);return (
   <button type="button" key={p.id} onClick={()=>openPlace(p.id)} style={{width:156,flexShrink:0,border:'none',background:'none',padding:0,textAlign:'left',display:'flex',flexDirection:'column',gap:8,scrollSnapAlign:'start'}}>
    <Thumb p={p} size={156} square/>
    <div className="row gap6" style={{fontSize:12,fontWeight:600,color:FACE_INK[lv]}}><Face level={lv}/>{FACE_TXT[lv]}</div>
    <div style={{fontSize:15,fontWeight:700}}>{p.name}</div>
    <div style={{fontSize:12,lineHeight:1.5,color:'var(--sub)'}}>{hashtags(p)}</div></button>)})}
 </div>
 <div className="pad row between" style={{paddingTop:28,paddingBottom:4,alignItems:'baseline'}}><div style={{fontSize:19,fontWeight:700}}>비 오는 날엔 실내로</div></div>
 <div className="pad col">{rainy.map(({p,s})=>{const lv=levelOf(s);return (
  <button type="button" key={p.id} onClick={()=>openPlace(p.id)} className="row gap12" style={{border:'none',background:'none',padding:'12px 0',borderBottom:'1px solid var(--soft)',textAlign:'left',width:'100%'}}><Thumb p={p} size={76}/><div className="col gap6" style={{minWidth:0}}><div className="row gap6" style={{fontSize:12,fontWeight:600,color:FACE_INK[lv]}}><Face level={lv} size={16}/>{FACE_TXT[lv]}</div><div style={{fontSize:15,fontWeight:700}}>{p.name}</div><div style={{fontSize:12,color:'var(--sub)'}}>{hashtags(p)}</div></div></button>)})}</div>
 <div className="pad row between" style={{paddingTop:26,paddingBottom:12,alignItems:'baseline'}}><div style={{fontSize:19,fontWeight:700}}>다른 부모님들의 이야기</div><a href="#/community" style={{fontSize:13,color:'var(--sub)',textDecoration:'none'}}>커뮤니티</a></div>
 <div className="pad col gap10">
  <a href="#/community" className="card col gap6" style={{padding:'14px 16px',textDecoration:'none',color:'inherit'}}><span className="small">코스 후기 · 5살 아이 엄마</span><span style={{fontSize:15,fontWeight:600}}>공룡 박물관 → 물놀이터, 낮잠 전에 딱 끝나요</span></a>
  <a href="#/community" className="card col gap6" style={{padding:'14px 16px',textDecoration:'none',color:'inherit'}}><span className="small">질문 · 4살 아이 아빠</span><span style={{fontSize:15,fontWeight:600}}>유모차로 다니기 편한 실내 놀이터 있을까요?</span></a>
 </div>
 <div className="notice">MVP 시연용 샘플 장소예요. 실제 서비스에서는 공공 관광 데이터와 부모 후기로 채워요.</div>
 <TabBar on="home"/>
</div>)}
