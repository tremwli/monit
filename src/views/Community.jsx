import {demo} from '../lib/utils.js';
import {Icon,TabBar} from '../components/ui.jsx';

const POSTS=[['#A9DDB4','5살 아이 엄마','코스 후기 · 2시간 전','공룡 박물관 → 물놀이터, 낮잠 전에 딱 끝나요','모닛 추천 코스 그대로 다녀왔어요. 엘리베이터가 있어서 유모차로 다니기 편했어요.','#공룡덕후 #유모차OK #수유실'],['#93A9EE','4살 아이 아빠','질문 · 5시간 전','유모차로 다니기 편한 실내 놀이터 있을까요?','주말에 비 소식이 있어서요. 주차가 편하면 더 좋겠어요.','#비오는날 #주차장']];

export default function Community(){return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="col gap12" style={{background:'#fff',padding:'22px 20px 14px'}}>
  <div className="row between"><div style={{fontSize:22,fontWeight:700}}>부모 커뮤니티</div><span className="demo">보기 전용</span></div>
  <div className="row gap6">{['전체','코스 후기','질문','우리 동네'].map((t,i)=><button type="button" key={t} className="chip" onClick={demo} style={{height:34,fontSize:13,...(i===0?{background:'var(--navy)',color:'#fff',fontWeight:700}:{})}}>{t}</button>)}</div>
 </div>
 <div className="pad col gap8" style={{paddingTop:14}}><div style={{fontSize:13,fontWeight:600,color:'var(--sub)'}}>요즘 부모님들이 많이 찾는</div><div className="row gap6 wrap"><span className="tag t-blue">#비오는날</span><span className="tag t-peri">#유모차OK</span><span className="tag t-yellow">#공룡덕후</span><span className="tag t-mint">#낮잠전코스</span></div></div>
 <div className="pad col gap10" style={{paddingTop:14}}>
  {POSTS.map(([c,a,m,t,b,h])=>(
  <div key={t} className="col gap10" style={{background:'#fff',borderRadius:20,padding:16}}><div className="row gap8"><span style={{width:32,height:32,borderRadius:999,background:c}}/><span className="col"><span style={{fontSize:13,fontWeight:600}}>{a}</span><span className="small">{m}</span></span></div>
   <div style={{fontSize:16,fontWeight:700}}>{t}</div><div style={{fontSize:14,lineHeight:1.5,color:'var(--sub)'}}>{b}</div><div style={{fontSize:12,color:'var(--primaryInk)'}}>{h}</div></div>))}
 </div>
 <button type="button" className="btn btn-primary" onClick={demo} style={{position:'fixed',right:'max(20px,calc(50% - 195px))',bottom:'calc(84px + env(safe-area-inset-bottom))',width:'auto',height:50,padding:'0 20px',fontSize:15,zIndex:31}}><Icon name="plus"/>글쓰기</button>
 <TabBar on="community"/>
</div>)}
