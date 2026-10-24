import {useStore} from '../store.jsx';
import {ymd} from '../lib/utils.js';
import {TabBar} from '../components/ui.jsx';

export default function Calendar(){
 const {S}=useStore();const d=new Date();const y=d.getFullYear(),m=d.getMonth();const first=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate();
 const marked=new Set(S.history.map(h=>h.date));const cells=[];for(let i=0;i<first;i++)cells.push('');for(let i=1;i<=last;i++)cells.push(i);
 return (
<div className="screen" style={{background:'var(--bg2)'}}>
 <div className="pad col gap6" style={{paddingTop:24}}><div className="small">{y}년 {m+1}월</div><div className="h-title">{S.child.name}와 모은 순간 {S.history.length}개</div></div>
 <div className="pad" style={{paddingTop:16}}><div style={{background:'var(--paper)',borderRadius:20,padding:'14px 10px 8px'}}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',fontSize:12,color:'var(--mute)',paddingBottom:8}}>{'일월화수목금토'.split('').map(x=><div key={x}>{x}</div>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',rowGap:4}}>{cells.map((v,i)=>{if(!v)return <div key={'e'+i}/>;const ds=ymd(new Date(y,m,v));const on=marked.has(ds);return <div key={v} className="col" style={{alignItems:'center',gap:3,height:52}}><div style={{width:34,height:34,borderRadius:10,...(on?{background:'var(--yellowT)',border:'2px solid var(--primary)'}:{})}}/><span style={{fontSize:12,color:'var(--sub)'}}>{v}</span></div>})}</div>
 </div></div>
 <div className="pad small" style={{paddingTop:12}}>기록을 남긴 날이 표시돼요. 사진 앨범과 엽서 모으기는 다음 버전에서 열려요.</div>
 <TabBar on="calendar"/>
</div>)}
