/* 일기(엽서) 데이터 도우미. S.diary 항목의 모양:
   {id, date:'YYYY-MM-DD', createdAt, kind:'diary'|'visit', title, text, placeId, reaction, photos:[photoId], ageGroup, analysis} */
import {INTEREST} from './data.js';
import {placeById} from './logic.js';

export const TAG_TINT={dino:'#FFF5D6',water:'#E4EEF8',animal:'#FFF5D6',draw:'#E2F4E7',train:'#E8EDFC',plant:'#E2F4E7',play:'#E2F4E7',book:'#E4EEF8'};

export function newEntryId(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
export function entryTitle(e){if(e.title)return e.title;if(e.placeId){const p=placeById(e.placeId);if(p)return p.name}const t=(e.text||'').trim();return t?t.slice(0,14)+(t.length>14?'…':''):'기록'}
export function topTag(e){const ints=e.analysis?.interests||[];const best=[...ints].sort((a,b)=>b.score-a.score)[0];if(best&&best.score>=.5)return best.tag;if(e.placeId){const p=placeById(e.placeId);if(p&&p.ints[0])return p.ints[0]}return null}
export function entryTint(e){const t=topTag(e);return t?TAG_TINT[t]:'#F2F4F6'}
export function monthKey(d){return d.slice(0,7)}
export function entriesInMonth(diary,ym){return (diary||[]).filter(e=>e.date&&e.date.startsWith(ym)).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt)}
export function entriesOnDay(diary,ymd){return (diary||[]).filter(e=>e.date===ymd).sort((a,b)=>b.createdAt-a.createdAt)}
export function monthTopTags(diary,ym,n=3){
 const score={};entriesInMonth(diary,ym).forEach(e=>{(e.analysis?.interests||[]).forEach(i=>{if(i.score>=.55)score[i.tag]=(score[i.tag]||0)+i.score});if(e.reaction==='like'&&e.placeId){const p=placeById(e.placeId);(p?.ints||[]).forEach(t=>score[t]=(score[t]||0)+.7)}});
 return Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([t])=>({tag:t,label:INTEREST[t]}))}
export function fmtMd(d){const [,m,day]=d.split('-');return Number(m)+'.'+Number(day)}
