import {useStore} from '../store.jsx';
import {HOME,PLACES,INTEREST,FAC,ICON} from '../lib/data.js';
import {scorePlace,levelOf,placeById} from '../lib/logic.js';
import {travel,travelLabel,demo} from '../lib/utils.js';
import {Thumb,MoodRow,Icon,Html,MapBox,TabBar} from '../components/ui.jsx';
import {kakaoRouteUrl} from '../lib/map.js';
import NearbyCare from '../components/NearbyCare.jsx';

function PlaceSheet({p}){
 const {S,setUI}=useStore();const lv=levelOf(scorePlace(S,p));const tr=travel(HOME,p,S.c.mode);
 const tags=[...p.ints.map(i=>['t-yellow','#'+INTEREST[i]]),...p.fac.map(f=>[f==='pediatric'?'t-red':'t-peri','#'+FAC[f].replace(/ /g,'').replace('가능','OK')]),...(p.indoor?[['t-mint','#실내']]:[]),...(p.fee===0?[['t-mint','#무료']]:[])];
 return (
 <div className="sheet pad col gap12" style={{position:'fixed',left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,bottom:'calc(64px + env(safe-area-inset-bottom))',paddingTop:10,paddingBottom:16,boxShadow:'0 -4px 20px rgba(31,58,95,.1)',zIndex:25}}>
  <div style={{width:36,height:4,borderRadius:999,background:'#D1D6DB',margin:'0 auto'}}/>
  <div className="row gap12"><Thumb p={p} size={80}/><div className="col gap6" style={{flex:1,minWidth:0}}>{p.type==='meal'?null:<MoodRow level={lv}/>}<div style={{fontSize:17,fontWeight:700}}>{p.name}</div><div className="small">{p.cat} · {travelLabel(S.c.mode)} {tr}분 · {p.fee?'1인 '+p.fee.toLocaleString('ko-KR')+'원':'무료'}</div></div>
   <button type="button" className="iconbtn" onClick={()=>setUI(u=>{u.mapSel=null})} aria-label="닫기" style={{width:32,height:32}}><Icon name="close"/></button></div>
  <div className="row gap6 wrap">{tags.slice(0,9).map(([c,t])=><span key={t} className={'tag '+c}>{t}</span>)}</div>
  <div className="row gap8"><a className="chip" href={kakaoRouteUrl(p)} target="_blank" rel="noopener" style={{flex:1,justifyContent:'center',height:40,background:'var(--paper)',border:'1.5px solid var(--primary)',color:'var(--primaryInk)',fontWeight:600,textDecoration:'none'}}><Html s={ICON.car.replace(/24/g,'18')}/>차로 {travel(HOME,p,'car')}분</a><a className="chip" href={kakaoRouteUrl(p)} target="_blank" rel="noopener" style={{flex:1,justifyContent:'center',height:40,background:'var(--paper)',border:'1.5px solid var(--line)',color:'var(--sub)',textDecoration:'none'}}><Html s={ICON.stroller.replace(/24/g,'18')}/>걸어서 {travel(HOME,p,'walk')}분</a></div>
  <a className="btn btn-primary btn-sm" href="#/c1">이 곳으로 코스 만들기</a>
  {DATA_INFO?<div style={{fontSize:10,color:'var(--sub)',textAlign:'center',marginTop:-4}}>장소 정보 · {DATA_INFO.source}</div>:null}
 </div>)}

export default function MapView(){
 const {S,UI,setUI}=useStore();
 const cats=[['fit',S.child.name+' 맞춤'],['키즈카페','키즈카페'],['박물관','박물관'],['식물원','식물원'],['물놀이','물놀이'],['동물원','동물원'],['식당','식당']];
 const sel=UI.mapSel&&placeById(UI.mapSel);
 let list=PLACES.map(p=>({p,s:scorePlace(S,p)}));
 if(UI.mapCat==='fit')list=list.filter(x=>x.p.type==='play').sort((a,b)=>b.s-a.s).slice(0,8);else if(UI.mapCat==='식당')list=list.filter(x=>x.p.type==='meal');else list=list.filter(x=>x.p.cat===UI.mapCat);
 const pts=[{...HOME,home:true},...list.map(({p,s})=>({lat:p.lat,lng:p.lng,label:p.name,level:p.type==='meal'?'B':levelOf(s),id:p.id,sel:UI.mapSel===p.id}))];
 return (
<div className="screen" style={{paddingBottom:0}}>
 <MapBox id="exploreMap" pts={pts} opts={{padTop:130,padBottom:UI.mapSel?330:110,onTap:id=>setUI(u=>{u.mapSel=id})}} style={{height:'100dvh'}}/>
 <div className="col gap10" style={{position:'absolute',top:16,left:16,right:16,zIndex:5}}>
  <div className="row gap8"><label className="row gap8" style={{flex:1,height:48,borderRadius:999,background:'var(--paper)',boxShadow:'0 2px 10px rgba(31,58,95,.1)',padding:'0 16px'}}><Icon name="search"/><input onFocus={demo} readOnly placeholder={S.child.name+'랑 갈 곳 검색'} aria-label="장소 검색" style={{flex:1,minWidth:0,border:'none',background:'none',fontSize:15,outline:'none'}}/></label>
   <a href="#/my" aria-label={S.child.name+' 취향 보기'} style={{width:48,height:48,borderRadius:999,background:'var(--yellow)',boxShadow:'0 2px 10px rgba(31,58,95,.1)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',fontSize:13,fontWeight:800,color:'var(--navy)'}}>{S.child.name.slice(0,2)}</a></div>
  <div className="row gap6" style={{overflowX:'auto',scrollbarWidth:'none'}}>{cats.map(([v,l])=><button type="button" key={v} onClick={()=>setUI(u=>{u.mapCat=v;u.mapSel=null})} style={{height:34,flexShrink:0,padding:'0 14px',borderRadius:999,border:'none',fontSize:13,...(UI.mapCat===v?{background:'var(--navy)',color:'#fff',fontWeight:700}:{background:'var(--paper)',color:'#333D4B',boxShadow:'0 1px 6px rgba(31,58,95,.08)'})}}>{l}</button>)}</div>
 </div>
 {sel?<PlaceSheet p={sel}/>:null}
 <TabBar on="map"/>
</div>)}
