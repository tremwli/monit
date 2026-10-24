/* 지도 그리기. 카카오 지도 JS 키가 있으면 실제 지도, 없으면 그림 지도.
   원본 MVP의 drawMap 구조를 유지하고 네이버 SDK 부분만 카카오 SDK로 교체. */
import {HOME} from './data.js';
import {esc} from './utils.js';
import {faceSvg} from './svg.js';

/* ============ 설정: 카카오 지도 키 ============
   developers.kakao.com → 앱 키 → JavaScript 키를 .env의 VITE_KAKAO_MAP_KEY에 넣으세요.
   플랫폼 → Web → 사이트 도메인에 http://localhost:5173 (배포 주소도) 등록해야 지도가 뜹니다.
   비워두면 그림 지도로 대신 보여줘요. */
export const KAKAO_MAP_KEY=import.meta.env.VITE_KAKAO_MAP_KEY||'';

let kakaoReady=false,kakaoFailed=!KAKAO_MAP_KEY;
const listeners=new Set();
function notify(){listeners.forEach(f=>f())}
export function onMapSdkChange(f){listeners.add(f);return()=>listeners.delete(f)}

if(typeof window!=='undefined'&&KAKAO_MAP_KEY&&!window.__kakaoLoading){
 window.__kakaoLoading=true;
 const sc=document.createElement('script');
 sc.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey='+encodeURIComponent(KAKAO_MAP_KEY)+'&autoload=false';
 sc.onload=()=>{try{window.kakao.maps.load(()=>{kakaoReady=true;notify()})}catch(e){kakaoFailed=true;notify()}};
 sc.onerror=()=>{kakaoFailed=true;notify()};
 document.head.appendChild(sc);
}
export function useKakao(){return kakaoReady&&!kakaoFailed&&window.kakao&&window.kakao.maps}

function markerHtml(p){
 if(p.home)return `<div class="num" style="background:#2F3657;color:#fff">집</div>`;
 if(p.num)return `<div class="num" style="background:${p.color}">${p.num}</div>`;
 return `<div class="nmk ${p.sel?'sel':''}">${faceSvg(p.level,20)}${esc(p.label)}</div>`;
}

export function drawMap(el,pts,opts){
 // pts: [{lat,lng,label,num,color,id,level,sel,home}]
 if(!el)return;
 if(useKakao()){
  const kakao=window.kakao;
  el.innerHTML='';
  const map=new kakao.maps.Map(el,{center:new kakao.maps.LatLng(HOME.lat,HOME.lng),level:5});
  const bounds=new kakao.maps.LatLngBounds();
  pts.forEach(p=>{
   const pos=new kakao.maps.LatLng(p.lat,p.lng);bounds.extend(pos);
   const wrap=document.createElement('div');wrap.innerHTML=markerHtml(p);
   const node=wrap.firstChild;
   /* 원본 마커 CSS는 translate로 자기 위치를 잡으므로 카카오 앵커는 0,0에 둔다 */
   if(p.id&&opts.onTap){node.style.cursor='pointer';node.addEventListener('click',()=>opts.onTap(p.id))}
   new kakao.maps.CustomOverlay({map,position:pos,content:node,xAnchor:0,yAnchor:0,zIndex:p.sel?3:p.home?2:1});
  });
  if(opts.route)new kakao.maps.Polyline({map,path:opts.route.map(p=>new kakao.maps.LatLng(p.lat,p.lng)),strokeWeight:4,strokeColor:'#3073CC',strokeOpacity:.9,strokeStyle:'shortdash'});
  if(pts.length>1)map.setBounds(bounds,opts.padTop||90,40,opts.padBottom||60,40);
  return;
 }
 // 그림 지도 (키가 없거나 SDK를 못 불러왔을 때)
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
 el.innerHTML=svg+pts.map(p=>{const x=X(p.lng),y=Y(p.lat);return `<button ${p.id?`data-v="${p.id}"`:''} aria-label="${esc(p.label||'집')}" style="position:absolute;left:${x}px;top:${y}px;border:none;background:none;padding:0;width:0;height:0;overflow:visible">${markerHtml(p)}</button>`}).join('')+(KAKAO_MAP_KEY?(kakaoFailed?`<div style="position:absolute;right:10px;bottom:${(opts.padBottom||50)-36}px;font-size:10px;color:#A33A3A;background:rgba(255,255,255,.85);padding:2px 8px;border-radius:999px">카카오 지도를 못 불러왔어요 · 사이트 도메인 등록을 확인하세요</div>`:''):`<div style="position:absolute;right:10px;bottom:${(opts.padBottom||50)-36}px;font-size:10px;color:#6B7684;background:rgba(255,255,255,.8);padding:2px 8px;border-radius:999px">카카오 지도 키를 넣으면 실제 지도로 바뀌어요</div>`);
}

/* 카카오맵 앱·웹 길찾기 링크 (현재 위치 → 목적지) */
export function kakaoRouteUrl(p){return 'https://map.kakao.com/link/to/'+encodeURIComponent(p.name)+','+p.lat+','+p.lng}
