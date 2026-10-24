/* 장소 주변 소아과·약국 (카카오 장소 검색).
   카카오 지도 키가 없거나 지도를 못 불러오면 안내 한 줄만 보여줘요. */
import {useEffect,useState} from 'react';
import {searchNearby,onMapSdkChange,useKakao as kakaoOk} from '../lib/map.js';

const cache=new Map();

async function findCare(p){
 const key=p.id;
 if(cache.has(key))return cache.get(key);
 // '소아청소년과'가 정식 이름이라 먼저 찾고, 없으면 '소아과'로 한 번 더
 let ped=await searchNearby(p,'소아청소년과',{radius:3000,category:'HP8'});
 if(ped&&!ped.length)ped=await searchNearby(p,'소아과',{radius:3000,category:'HP8'});
 const ph=await searchNearby(p,'약국',{radius:1500,category:'PM9'});
 if(ped===null)return null;
 const r={ped:(ped||[]).slice(0,2),ph:(ph||[])[0]||null};
 cache.set(key,r);
 return r;
}

function dist(m){return m<1000?m+'m':(m/1000).toFixed(1)+'km'}

export default function NearbyCare({p}){
 const [r,setR]=useState(cache.get(p.id)||undefined);
 const [ready,setReady]=useState(!!kakaoOk());
 useEffect(()=>onMapSdkChange(()=>setReady(!!kakaoOk())),[]);
 useEffect(()=>{let on=true;if(!ready)return;findCare(p).then(x=>{if(on)setR(x)});return()=>{on=false}},[p.id,ready]); // eslint-disable-line
 const box={fontSize:13,color:'#333D4B',background:'#FFF5F5',borderRadius:12,padding:'10px 12px',lineHeight:1.5};
 if(!ready)return <div style={{...box,background:'#F2F4F6',color:'var(--sub)'}}>카카오 지도가 켜지면 가까운 소아과를 찾아드려요</div>;
 if(r===undefined)return <div style={{...box,color:'var(--sub)'}}>가까운 소아과 찾는 중…</div>;
 if(r===null)return null;
 if(!r.ped.length)return <div style={box}>3km 안에 소아과가 없어요{r.ph?<> · 가까운 약국 <a href={r.ph.url} target="_blank" rel="noopener" style={{color:'inherit'}}>{r.ph.name}</a> {dist(r.ph.dist)}</>:null}</div>;
 return (
  <div style={box}>
   <div style={{fontWeight:700,color:'#A33A3A',marginBottom:2}}>가까운 소아과</div>
   {r.ped.map(x=><div key={x.url}><a href={x.url} target="_blank" rel="noopener" style={{color:'inherit'}}>{x.name}</a> · {dist(x.dist)}{x.phone?<> · <a href={'tel:'+x.phone} style={{color:'inherit'}}>{x.phone}</a></>:null}</div>)}
   {r.ph?<div style={{color:'var(--sub)'}}>약국 · <a href={r.ph.url} target="_blank" rel="noopener" style={{color:'inherit'}}>{r.ph.name}</a> {dist(r.ph.dist)}</div>:null}
  </div>);
}
