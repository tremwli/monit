/* 공통 조각 컴포넌트. 원본 MVP의 chip/seg/sw/tabbar/stepHead/thumb/face 등을 React로 옮김. */
import {useEffect,useRef} from 'react';
import {IC,TINT,ICON} from '../lib/data.js';
import {pkey,faceSvg,carSvg,LOGO_SVG} from '../lib/svg.js';
import {drawMap,onMapSdkChange} from '../lib/map.js';
import {css} from '../lib/utils.js';

/* SVG 문자열을 그대로 삽입 */
export function Html({s,tag:Tag='span',...rest}){return <Tag {...rest} dangerouslySetInnerHTML={{__html:s}}/>}
export function Icon({name,style,...rest}){return <Html s={ICON[name]} style={{display:'inline-flex',...style}} {...rest}/>}
export function Logo(){return <Html s={LOGO_SVG} style={{display:'inline-flex'}}/>}
export function Face({level,size=18}){return <Html s={faceSvg(level,size)} style={{display:'inline-flex'}}/>}
export function CarSvg({w}){return <Html s={carSvg(w)} style={{display:'inline-flex'}}/>}

export function Thumb({p,size,square}){const k=pkey(p);return (
 <div className="thumb" role="img" aria-label={p.name+' 사진 자리'} style={{width:size,height:size,background:TINT[k],...(square?{borderRadius:0}:{})}}>
  <svg width={Math.round(size*.7)} height={Math.round(size*.7)} viewBox="0 0 100 100" aria-hidden="true" dangerouslySetInnerHTML={{__html:IC[k]}}/>
 </div>)}

export function Chip({on,onClick,children,style,className=''}){return <button type="button" className={'chip '+(on?'on':'')+' '+className} aria-pressed={!!on} onClick={onClick} style={style}>{children}</button>}

export function Seg({opts,cur,onPick}){return (
 <div className="seg" role="group" style={{gridTemplateColumns:`repeat(${opts.length},minmax(0,1fr))`}}>
  {opts.map(([v,l])=><button type="button" key={v} className={String(cur)===String(v)?'on':''} aria-pressed={String(cur)===String(v)} onClick={()=>onPick(v)}>{l}</button>)}
 </div>)}

export function Switch({on,label,onToggle}){return <button type="button" className={'switch '+(on?'on':'')} role="switch" aria-checked={!!on} aria-label={label} onClick={onToggle}/>}

export function TabBar({on}){
 const it=[['home','홈','<path d="M3 11l9-7 9 7v10h-6v-6H9v6H3z"/>'],['map','지도','<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'],['community','커뮤니티','<path d="M4 5h16v11H9l-5 4z"/>'],['calendar','기록','<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'],['my','우리 아이','<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>']];
 return (<nav className="tabbar" aria-label="하단 메뉴">
  {it.map(([k,l,p])=><a key={k} href={'#/'+k} className={on===k?'on':''} aria-current={on===k?'page':undefined}>
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={on===k?'#191F28':'#8B95A1'} strokeWidth={on===k?2:1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{__html:p}}/>{l}</a>)}
 </nav>)}

export function StepHead({n,back,eyebrow,title,help}){return (<>
 <div className="pad row gap12" style={{paddingTop:20}}>
  <a className="iconbtn" href={'#/'+back} aria-label={n===1?'닫기':'이전 단계'}><Icon name={n===1?'close':'back'}/></a>
  <div className="progress"><i style={{width:n*20+'%','--from':(n-1)*20+'%'}}/></div><span className="small">{n} / 5</span>
 </div>
 <div className="pad col gap6" style={{paddingTop:22}}>
  <div className="eyebrow">코스 만들기 · {eyebrow}</div>
  <div className="h-title">{title}</div>
  {help?<div className="help">{help}</div>:null}
 </div></>)}

export function BottomCta({children,style}){return <div className="bottom-cta" style={style}>{children}</div>}

/* 지도 박스: 원본 drawMap을 useEffect로 감쌈. 그림 지도의 핀 클릭은 data-v로 위임. */
export function MapBox({id,pts,opts,style,className='mapbox'}){
 const ref=useRef(null);
 const key=JSON.stringify({pts,route:opts.route,padTop:opts.padTop,padBottom:opts.padBottom});
 useEffect(()=>{drawMap(ref.current,pts,opts);return onMapSdkChange(()=>drawMap(ref.current,pts,opts))},[key]); // eslint-disable-line
 useEffect(()=>{const f=()=>drawMap(ref.current,pts,opts);window.addEventListener('resize',f);return()=>window.removeEventListener('resize',f)},[key]); // eslint-disable-line
 return <div id={id} ref={ref} className={className} style={style} onClick={e=>{const b=e.target.closest('[data-v]');if(b&&opts.onTap){e.preventDefault();opts.onTap(b.dataset.v)}}}/>;
}

export {css};
