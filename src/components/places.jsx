/* 장소 모음 화면(홈 '좋아할 곳', 분류별 모아보기)에서 함께 쓰는 필터 칩과 2열 카드 */
import {useStore} from '../store.jsx';
import {levelOf,hashtags} from '../lib/logic.js';
import {go} from '../lib/utils.js';
import {Thumb,MoodRow} from './ui.jsx';

export const PICKS=[['all','전체'],['indoor','실내'],['outdoor','야외'],['free','무료']];
export const PICK_FILTER={all:()=>true,indoor:p=>p.indoor,outdoor:p=>!p.indoor,free:p=>!p.fee};

/* opts: [[값,이름]...]. 선택된 칩은 남색 */
export function FilterChips({opts,cur,onPick,style}){return (
 <div className="row gap8" style={{overflowX:'auto',scrollbarWidth:'none',margin:'0 -20px',padding:'0 20px',...style}}>
  {opts.map(([v,l])=><button type="button" key={v} className={'chip dark '+(cur===v?'on':'')} aria-pressed={cur===v} style={{flexShrink:0}} onClick={()=>onPick(v)}>{l}</button>)}
 </div>)}

/* list: [{p,s}] (s = scorePlace 점수). 카드를 누르면 지도에서 그 장소를 열어 줌 */
export function PlaceGrid({list,style}){
 const {setUI}=useStore();
 const open=id=>{setUI(u=>{u.mapSel=id;u.mapCat='fit'});go('map')};
 if(!list.length)return <div className="help" style={{padding:'24px 0',textAlign:'center',...style}}>조건에 맞는 곳이 없어요</div>;
 return (
 <div className="pick-grid" style={style}>
  {list.map(({p,s})=><button type="button" key={p.id} onClick={()=>open(p.id)} className="pick press">
   <Thumb p={p} size={156} style={{width:'100%',height:'auto',aspectRatio:'1'}}/>
   {p.type==='meal'?null:<MoodRow level={levelOf(s)}/>}
   <div style={{fontSize:15,fontWeight:700}}>{p.name}</div>
   <div className="pick-tags">{hashtags(p)}</div></button>)}
 </div>)}
