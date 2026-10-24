/* 일기(엽서) 데이터 도우미. S.diary 항목의 모양:
   {id, date:'YYYY-MM-DD', createdAt, kind:'diary'|'visit', title, text, placeId, reaction, photos:[photoId], ageGroup, analysis} */
import {label,tintOf,migrateRef,profileOf} from './interests.js';
import {placeById} from './logic.js';


export function newEntryId(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
export function entryTitle(e){if(e.title)return e.title;if(e.placeId){const p=placeById(e.placeId);if(p)return p.name}const t=(e.text||'').trim();return t?t.slice(0,14)+(t.length>14?'…':''):'기록'}
export function topTag(e){const ints=e.analysis?.interests||[];const best=[...ints].sort((a,b)=>b.score-a.score)[0];if(best&&best.score>=.5)return migrateRef(best.tag);if(e.placeId){const p=placeById(e.placeId);const pr=p&&profileOf(p);if(pr&&(pr.topics[0]||pr.areas[0]))return pr.topics[0]||'a:'+pr.areas[0]}return null}
export function entryTint(e){const t=topTag(e);return t?tintOf(t):'#F2F4F6'}
export function monthKey(d){return d.slice(0,7)}
export function entriesInMonth(diary,ym){return (diary||[]).filter(e=>e.date&&e.date.startsWith(ym)).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt)}
export function entriesOnDay(diary,ymd){return (diary||[]).filter(e=>e.date===ymd).sort((a,b)=>b.createdAt-a.createdAt)}
export function monthTopTags(diary,ym,n=3){
 const score={};entriesInMonth(diary,ym).forEach(e=>{(e.analysis?.interests||[]).forEach(i=>{const r=migrateRef(i.tag);if(i.score>=.55)score[r]=(score[r]||0)+i.score});if(e.reaction==='like'&&e.placeId){const p=placeById(e.placeId);if(p)profileOf(p).topics.forEach(t=>score[t]=(score[t]||0)+.7)}});
 return Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([t])=>({tag:t,label:label(t)}))}
export function fmtMd(d){const [,m,day]=d.split('-');return Number(m)+'.'+Number(day)}
