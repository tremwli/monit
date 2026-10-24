/* 원본 MVP 유틸 함수 그대로 */
export function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function fmtT(m){m=((m%1440)+1440)%1440;const h=Math.floor(m/60),mm=m%60;return (h<12?'오전 ':'오후 ')+(((h+11)%12)+1)+':'+String(mm).padStart(2,'0')}
export function fmtShort(m){const h=Math.floor(m/60),mm=m%60;return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0')}
export function fmtDate(s){const d=new Date(s+'T00:00:00');return (d.getMonth()+1)+'월 '+d.getDate()+'일 ('+'일월화수목금토'[d.getDay()]+')'}
export function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
export function nextSat(){const d=new Date();const add=(6-d.getDay()+7)%7||7;d.setDate(d.getDate()+add);return ymd(d)}
export function km(a,b){const R=6371,t=x=>x*Math.PI/180;const dl=t(b.lat-a.lat),dn=t(b.lng-a.lng);const x=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
export function travel(a,b,mode){const d=km(a,b);let m=mode==='car'?d*2.4+4:mode==='transit'?d*4+8:d*15;return Math.max(3,Math.round(m))}
export function travelLabel(mode){return mode==='car'?'차로':mode==='transit'?'대중교통으로':'걸어서'}
export function clamp(v){return Math.max(0.05,Math.min(0.98,v))}
export function toggle(arr,v){const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v)}
export function toast(t){const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2500)}
export function demo(){toast('MVP에서는 보기만 가능한 기능이에요')}
export function go(r){location.hash='#/'+r}
/* "a:b;c:d" 형태의 인라인 스타일 문자열을 React style 객체로 */
export function css(str){const o={};String(str||'').split(';').forEach(p=>{const i=p.indexOf(':');if(i<0)return;const k=p.slice(0,i).trim(),v=p.slice(i+1).trim();if(!k)return;o[k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v});return o}
