/* 분류별 모아보기 (#/cat?c=박물관): 그 분류의 장소 모음 + 분류 안 세부 테마별 모음 */
import {useState} from 'react';
import {useStore} from '../store.jsx';
import {PLACES,CAT_THEMES} from '../lib/data.js';
import {scorePlace} from '../lib/logic.js';
import {go} from '../lib/utils.js';
import {Icon,TabBar} from '../components/ui.jsx';
import {PICKS,PICK_FILTER,FilterChips,PlaceGrid} from '../components/places.jsx';

export default function Category(){
 const {S}=useStore();
 const cat=new URLSearchParams(location.hash.split('?')[1]||'').get('c')||'키즈카페';
 const ranked=PLACES.map(p=>({p,s:scorePlace(S,p)})).sort((a,b)=>b.s-a.s);
 const inCat=ranked.filter(({p})=>p.cat===cat);
 /* 전체와 결과가 같거나 비는 칩은 빼서, 실제로 걸러지는 칩만 보여 줌 */
 const opts=PICKS.filter(([v])=>{if(v==='all')return true;const k=inCat.filter(({p})=>PICK_FILTER[v](p)).length;return k>0&&k<inCat.length});
 const [pick,setPick]=useState('all');
 const themes=(CAT_THEMES[cat]||[]).map(t=>[t,t]);
 const [theme,setTheme]=useState(themes[0]?.[0]);
 const back=()=>{if(history.length>1)history.back();else go('home')};
 return (
<div className="screen">
 <div className="topbar">
  <button type="button" className="iconbtn" style={{background:'transparent'}} aria-label="뒤로" onClick={back}><Icon name="back"/></button>
  <div style={{fontSize:19,fontWeight:700}}>{cat}</div>
 </div>
 <div className="pad" style={{paddingTop:24}}>
  <div style={{fontSize:21,fontWeight:700}}>인기 {cat} BEST</div>
  {opts.length>1?<FilterChips opts={opts} cur={pick} onPick={setPick} style={{marginTop:16}}/>:null}
  <PlaceGrid list={inCat.filter(({p})=>PICK_FILTER[pick](p))} style={{marginTop:18}}/>
 </div>
 <div className="pad" style={{paddingTop:40}}>
  <div style={{fontSize:21,fontWeight:700}}>테마 별 모아보기</div>
  <FilterChips opts={themes} cur={theme} onPick={setTheme} style={{marginTop:16}}/>
  <PlaceGrid list={inCat.filter(({p})=>p.theme===theme)} style={{marginTop:18}}/>
 </div>
 <TabBar on="home"/>
</div>)}
