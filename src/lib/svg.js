/* 원본 MVP의 SVG 문자열 생성 함수 그대로 (지도 마커 등 innerHTML에서 쓰기 위해 문자열로 유지) */
import {IC,TINT} from './data.js';
import {esc} from './utils.js';

export function pkey(p){return p.type==='meal'?'meal':(p.ints[0]||'play')}
export function thumbHtml(p,size){const k=pkey(p);return `<div class="thumb" role="img" aria-label="${esc(p.name)} 사진 자리" style="width:${size}px;height:${size}px;background:${TINT[k]}"><svg width="${Math.round(size*.7)}" height="${Math.round(size*.7)}" viewBox="0 0 100 100" aria-hidden="true">${IC[k]}</svg></div>`}
export function faceSvg(level,size){size=size||18;const s=`width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true"`;
 if(level==='A')return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#FFE08A" stroke="#2F3657" stroke-width="1.2"/><path d="M6 8.5q1.5-2 3 0M11 8.5q1.5-2 3 0" stroke="#2F3657" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M6.5 11.5q3.5 4.5 7 0z" fill="#2F3657"/></svg>`;
 if(level==='B')return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#A9DDB4" stroke="#2F3657" stroke-width="1.2"/><circle cx="7" cy="9" r="1.1" fill="#2F3657"/><circle cx="13" cy="9" r="1.1" fill="#2F3657"/><path d="M7 12.3q3 2.6 6 0" stroke="#2F3657" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`;
 return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#8EC1F2" stroke="#2F3657" stroke-width="1.2"/><circle cx="7" cy="8.5" r="1.1" fill="#2F3657"/><circle cx="13" cy="8.5" r="1.1" fill="#2F3657"/><circle cx="10" cy="13" r="1.6" fill="#2F3657"/></svg>`}
/* 취향 예측 표시용 3단계 표정: 기쁨 / 그냥 그럼 / 싫음 (+ 만족도 조사용 '속상') */
export const MOODS=[['joy','기쁨'],['meh','그냥 그럼'],['dislike','싫음']];
export function moodSvg(mood,size){size=size||18;const s=`width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true"`;
 const eyes='<circle cx="7" cy="8.5" r="1.1" fill="#2F3657"/><circle cx="13" cy="8.5" r="1.1" fill="#2F3657"/>';
 if(mood==='joy')return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#FFE08A" stroke="#2F3657" stroke-width="1.2"/><path d="M6 8.5q1.5-2 3 0M11 8.5q1.5-2 3 0" stroke="#2F3657" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M6.5 11.5q3.5 4.5 7 0z" fill="#2F3657"/></svg>`;
 if(mood==='meh')return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#A9DDB4" stroke="#2F3657" stroke-width="1.2"/>${eyes}<path d="M7 13h6" stroke="#2F3657" stroke-width="1.3" stroke-linecap="round"/></svg>`;
 if(mood==='sad')return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#C9D3F2" stroke="#2F3657" stroke-width="1.2"/>${eyes}<path d="M6.8 14.6q3.2-3.2 6.4 0" stroke="#2F3657" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M13.6 10.4q.9 1.4 0 2.2q-.9-.8 0-2.2z" fill="#8EC1F2"/></svg>`;
 return `<svg ${s}><circle cx="10" cy="10" r="9" fill="#93A9EE" stroke="#2F3657" stroke-width="1.2"/>${eyes}<path d="M7 14q3-2.6 6 0" stroke="#2F3657" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`}
export function carSvg(w){return `<svg width="${w}" viewBox="0 0 104 64" aria-hidden="true"><path d="M2 46 V24 H22 V2 H80 V24 H100 V46 Z" fill="#7FCB98" stroke="#2F3657" stroke-width="1.5"/><rect x="29" y="8" width="21" height="14" fill="#fff"/><rect x="53" y="8" width="21" height="14" fill="#fff"/><circle cx="26" cy="49" r="11" fill="#2F3657"/><circle cx="26" cy="49" r="4.5" fill="#fff"/><circle cx="76" cy="49" r="11" fill="#2F3657"/><circle cx="76" cy="49" r="4.5" fill="#fff"/></svg>`}
export const LOGO_SVG=`<svg width="118" height="32" viewBox="0 0 118 32" role="img" aria-label="MONIT"><ellipse cx="13" cy="18" rx="12" ry="7.5" transform="rotate(-35 13 18)" fill="#A9DDB4" opacity=".9"/><ellipse cx="23" cy="14" rx="12" ry="7.5" transform="rotate(-35 23 14)" fill="#93A9EE" opacity=".85"/><text x="39" y="25" font-family="Pretendard Variable, Pretendard, sans-serif" font-size="22" font-weight="900" fill="#2F3657">MONIT</text></svg>`;
