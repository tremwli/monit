/* 원본 MVP 지도 그리기 그대로. 네이버 키가 있으면 실제 지도, 없으면 그림 지도. */
import {HOME} from './data.js';
import {esc} from './utils.js';
import {faceSvg} from './svg.js';

/* ============ 설정: 네이버 지도 키 ============
   네이버 클라우드 플랫폼에서 발급받은 Maps 'Client ID'를 .env의 VITE_NAVER_MAP_KEY에 넣으세요.
   비워두면 그림 지도로 대신 보여줘요. */
export const NAVER_MAP_KEY=import.meta.env.VITE_NAVER_MAP_KEY||'';

let naverReady=false,naverFailed=!NAVER_MAP_KEY;
const listeners=new Set();
function notify(){listeners.forEach(f=>f())}
export function onNaverChange(f){listeners.add(f);return()=>listeners.delete(f)}
export function naverFailedNow(){return naverFailed}

if(typeof window!=='undefined'&&NAVER_MAP_KEY&&!window.__naverLoading){
 window.__naverLoading=true;
 window.navermap_authFailure=function(){naverFailed=true;notify()};
 window.__naverReady=function(){naverReady=true;notify()};
 const sc=document.createElement('script');sc.src='https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId='+encodeURIComponent(NAVER_MAP_KEY)+'&callback=__naverReady';sc.onerror=()=>{naverFailed=true;notify()};document.head.appendChild(sc);
}
export function useNaver(){return naverReady&&!naverFailed&&window.naver&&window.naver.maps}

export function drawMap(el,pts,opts){
 // pts: [{lat,lng,label,num,color,id,level,sel,home}]
 if(!el)return;
 if(useNaver()){
  const naver=window.naver;
  el.innerHTML='';
  const map=new naver.maps.Map(el,{center:new naver.maps.LatLng(HOME.lat,HOME.lng),zoom:14,logoControl:true,mapDataControl:false,scaleControl:false,zoomControl:false});
  const b=new naver.maps.LatLngBounds();
  pts.forEach(p=>{const ll=new naver.maps.LatLng(p.lat,p.lng);b.extend(ll);
   const html=p.home?`<div class="num" style="background:#2F3657;color:#fff">집</div>`:p.num?`<div class="num" style="background:${p.color}">${p.num}</div>`:`<div class="nmk ${p.sel?'sel':''}">${faceSvg(p.level,20)}${esc(p.label)}</div>`;
   const mk=new naver.maps.Marker({position:ll,map,icon:{content:html,anchor:new naver.maps.Point(0,0)}});
   if(p.id&&opts.onTap)naver.maps.Event.addListener(mk,'click',()=>opts.onTap(p.id));});
  if(opts.route)new naver.maps.Polyline({map,path:opts.route.map(p=>new naver.maps.LatLng(p.lat,p.lng)),strokeColor:'#3073CC',strokeWeight:4,strokeOpacity:.9,strokeStyle:'shortdash',strokeLineCap:'round'});
  if(pts.length>1)map.fitBounds(b,{top:opts.padTop||90,right:40,bottom:opts.padBottom||60,left:40});
  return;
 }
 // 그림 지도 (키가 없을 때)
 const W=el.clientWidth||390,H=el.clientHeight||330;const pad={t:opts.padTop||90,b:opts.padBottom||50,l:40,r:40};
 const lats=pts.map(p=>p.lat),lngs=pts.map(p=>p.lng);let a=Math.min(...lats),z=Math.max(...lats),c=Math.min(...lngs),d=Math.max(...lngs);
 if(z-a<.01){a-=.005;z+=.005}if(d-c<.01){c-=.006;d+=.006}
 const X=lng=>pad.l+(lng-c)/(d-c)*(W-pad.l-pad.r),Y=lat=>pad.t+(z-lat)/(z-a)*(H-pad.t-pad.b);
 let svg=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="추천 장소 그림 지도" style="display:block">
  <rect width="${W}" height="${H}" fill="#EEF4F0"/>
  <path d="M-10 ${H*.62} C ${W*.3} ${H*.5}, ${W*.6} ${H*.78}, ${W+10} ${H*.6}" stroke="#fff" stroke-width="16" fill="none"/>
  <path d="M${W*.38} -10 C ${W*.45} ${H*.4}, ${W*.3} ${H*.6}, ${W*.42} ${H+10}" stroke="#fff" stroke-width="12" fill="none"/>
  <ellipse cx="${W*.18}" cy="${H*.32}" rx="${W*.12}" ry="${H*.08}" fill="#D4E6F8"/>
  <rect x="${W*.68}" y="${H*.22}" width="${W*.14}" height="${H*.12}" rx="6" fill="#E2F4E7"/>
  <rect x="${W*.08}" y="${H*.7}" width="${W*.16}" height="${H*.1}" rx="6" fill="#FFF5D6"/>`;
 if(opts.route)svg+=`<polyline points="${opts.route.map(p=>X(p.lng).toFixed(1)+','+Y(p.lat).toFixed(1)).join(' ')}" fill="none" stroke="#3073CC" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 8"/>`;
 svg+='</svg>';
 el.innerHTML=svg+pts.map(p=>{const x=X(p.lng),y=Y(p.lat);const inner=p.home?`<div class="num" style="background:#2F3657;color:#fff">집</div>`:p.num?`<div class="num" style="background:${p.color}">${p.num}</div>`:`<div class="nmk ${p.sel?'sel':''}">${faceSvg(p.level,20)}${esc(p.label)}</div>`;return `<button ${p.id?`data-v="${p.id}"`:''} aria-label="${esc(p.label||'집')}" style="position:absolute;left:${x}px;top:${y}px;border:none;background:none;padding:0;width:0;height:0;overflow:visible">${inner}</button>`}).join('')+(NAVER_MAP_KEY?'':`<div style="position:absolute;right:10px;bottom:${(opts.padBottom||50)-36}px;font-size:10px;color:#6B7684;background:rgba(255,255,255,.8);padding:2px 8px;border-radius:999px">네이버 지도 키를 넣으면 실제 지도로 바뀌어요</div>`);
}
