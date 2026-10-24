/* 분기 리포트 계산. 화면(Report.jsx)은 여기서 만든 객체를 그리기만 한다.
   비교 대상은 언제나 '과거의 우리 아이'뿐 — 또래 비교는 하지 않는다. */
import {PLACES} from './data.js';
import {label,migrateRef,profileOf} from './interests.js';
import {STYLE_TAGS} from './analysis.js';
import {placeById,scorePlace} from './logic.js';

export function quarterOf(date){const [y,m]=date.split('-').map(Number);return y+'-Q'+(Math.floor((m-1)/3)+1)}
export function quarterLabel(q){const [y,n]=q.split('-Q');return y+'년 '+n+'분기'}
export function currentQuarter(){const d=new Date();return d.getFullYear()+'-Q'+(Math.floor(d.getMonth()/3)+1)}

/* 기록이 있는 분기 목록 (최근 순) */
export function quartersOf(S){
 const set=new Set();
 (S.history||[]).forEach(h=>h.date&&set.add(quarterOf(h.date)));
 (S.diary||[]).forEach(d=>d.date&&set.add(quarterOf(d.date)));
 return [...set].sort().reverse();
}

/* 노는 방식 상위 태그로 유형 이름 */
const TYPE_BY_STYLE={
 hands:'직접 만져봐야 아는 탐험가',watch:'눈으로 오래 담는 관찰가',outdoor:'밖에서 더 신나는 모험가',
 indoor:'아늑한 곳에서 집중하는 탐구가',quiet:'조용히 깊게 파고드는 몰입가',lively:'북적일수록 신나는 사교가',
};
/* 가장 좋아하는 관심사로 유형 이름 (원본 8개 태그 이름을 새 이름으로 옮김). 목록에 없는 주제는 typeOf에서 만든다 */
const TYPE_BY_INT={'공룡':'공룡이라면 달려가는 꼬마 박사','물놀이':'물만 보면 뛰어드는 물개','동물':'동물 친구를 찾아다니는 탐험가','a:create':'손끝으로 세상을 그리는 화가','기차':'바퀴 달린 건 다 좋아하는 기관사','식물':'작은 잎도 들여다보는 식물 박사','a:outdoor':'온몸으로 노는 에너자이저','a:literacy':'이야기 속으로 들어가는 독서가'};
const typeOf=ref=>TYPE_BY_INT[ref]||(label(ref)+' 이야기라면 눈이 반짝이는 꼬마 탐험가');

const REACT_SCORE={like:.85,meh:.25};

export function buildReport(S,q){
 const n=S.child.name;
 const inQ=d=>d&&quarterOf(d)===q, before=d=>d&&quarterOf(d)<q;
 const hist=(S.history||[]).filter(h=>inQ(h.date));
 const diaries=(S.diary||[]).filter(d=>inQ(d.date));
 const analyzed=diaries.filter(d=>d.analysis);

 /* 이번 분기 관심사 신호: 일기 분석 + 다녀온 반응 */
 const sig={};const add=(tag,s)=>{tag=migrateRef(tag);(sig[tag]=sig[tag]||[]).push(s)};
 /* 장소가 다루는 주제·흥미 유형 */
 const refsOf=p=>{const pr=profileOf(p);return [...pr.topics,...pr.areas.map(a=>'a:'+a)]};
 analyzed.forEach(d=>(d.analysis.interests||[]).forEach(x=>add(x.tag,x.score)));
 hist.forEach(h=>{const p=placeById(h.id);if(p&&h.v)refsOf(p).forEach(t=>add(t,REACT_SCORE[h.v]))});
 const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;

 /* 이전 분기에 한 번이라도 나온 태그 */
 const seenBefore=new Set();
 (S.diary||[]).filter(d=>before(d.date)&&d.analysis).forEach(d=>(d.analysis.interests||[]).forEach(x=>seenBefore.add(migrateRef(x.tag))));
 (S.history||[]).filter(h=>before(h.date)&&h.v).forEach(h=>{const p=placeById(h.id);if(p)refsOf(p).forEach(t=>seenBefore.add(t))});
 const hadPast=seenBefore.size>0;

 /* 관심사 변화: 현재 취향 vs 직전 취향. 이번 분기 신호가 있고 전에 안 보였으면 '새로' */
 const prev=S.prevTaste||S.taste;
 const changes=[...new Set([...Object.keys(S.taste),...Object.keys(sig)])].map(tag=>{
  const after=S.taste[tag]??.5,bef=prev[tag]??after;
  const isNew=sig[tag]&&!seenBefore.has(tag)&&hadPast&&avg(sig[tag])>=.6;
  return {tag,label:label(tag),before:Math.round(bef*100),after:Math.round(after*100),delta:Math.round((after-bef)*100),isNew};
 }).filter(c=>c.isNew||Math.abs(c.delta)>=3||sig[c.tag]).sort((a,b)=>(b.isNew-a.isNew)||(Math.abs(b.delta)-Math.abs(a.delta))).slice(0,5);
 const newTags=changes.filter(c=>c.isNew);

 /* 유형 */
 const styleTop=Object.entries(S.styles||{}).sort((a,b)=>b[1]-a[1]);
 const intTop=Object.entries(S.taste).sort((a,b)=>b[1]-a[1]);
 const type=styleTop[0]?TYPE_BY_STYLE[styleTop[0][0]]:typeOf(intTop[0][0]);
 const subtitle=[styleTop[0]&&STYLE_TAGS[styleTop[0][0]]+'형',label(intTop[0][0])+' 좋아함',styleTop[1]&&STYLE_TAGS[styleTop[1][0]]+'파'].filter(Boolean).join(' · ');

 /* 장면: 다녀온 곳마다 예상 vs 실제 */
 const scenes=hist.filter(h=>h.v||h.note).map(h=>{const p=placeById(h.id);if(!p)return null;const s=scorePlace(S,p);
  const pred=Math.round(s*100);const hit=h.v?((s>=.52)===(h.v==='like')):null;
  return {id:h.id,name:p.name,date:h.date,pred,v:h.v,note:h.note,hit}}).filter(Boolean);
 const judged=scenes.filter(x=>x.hit!=null);const hits=judged.filter(x=>x.hit).length;

 /* 비교 문장 */
 const up=changes.filter(c=>!c.isNew&&c.delta>=3).sort((a,b)=>b.delta-a.delta)[0];
 const down=changes.filter(c=>c.delta<=-3).sort((a,b)=>a.delta-b.delta)[0];
 const parts=[];
 if(up)parts.push({t:up.label,h:true},{t:' 관심이 더 커졌'});
 if(newTags.length)parts.push({t:up?'고, 처음으로 ':'처음으로 '},{t:newTags.map(c=>c.label).join('·'),h:true},{t:' 태그가 나타났'});
 if(!up&&!newTags.length&&down)parts.push({t:down.label,h:true},{t:'는 조금 시들해졌'});
 const compare=parts.length?[...parts,{t:'어요.'}]:[{t:hadPast?'지난 분기와 비슷한 모습이에요.':'첫 분기라 아직 비교할 지난 기록이 없어요. 다음 분기부터 변화를 보여드려요.'}];

 /* 다음 추천: 아직 안 간 곳 중 확률 높은 2곳 */
 const next=PLACES.filter(p=>p.type==='play'&&!(S.visited||[]).includes(p.id)).map(p=>({p,s:scorePlace(S,p)})).sort((a,b)=>b.s-a.s).slice(0,2).map(({p,s})=>({id:p.id,name:p.name,prob:Math.round(s*100)}));

 return {q,label:quarterLabel(q),n,type,subtitle,
  stats:[{v:styleTop[0]?Math.round(styleTop[0][1]*100)+'%':'–',l:styleTop[0]?STYLE_TAGS[styleTop[0][0]]:'노는 방식'},{v:judged.length?hits+'/'+judged.length:'–',l:'예상 적중'},{v:(newTags.length?'+':'')+newTags.length,l:'새 관심사'}],
  compare,scenes,changes,next,
  thin:scenes.length+analyzed.length<2};
}

/* 기록이 없을 때 보여주는 예시. 화면에 '예시' 배지를 꼭 붙인다 */
export function sampleReport(n){return {
 q:'sample',label:'예시 분기',n,type:'직접 만져봐야 아는 탐험가',subtitle:'직접 해보기형 · 동물 좋아함 · 야외파',
 stats:[{v:'89%',l:'직접 해보기'},{v:'4/5',l:'예상 적중'},{v:'+1',l:'새 관심사'}],
 compare:[{t:'동물',h:true},{t:' 관심이 더 커졌고, 처음으로 '},{t:'식물',h:true},{t:' 태그가 나타났어요.'}],
 scenes:[{id:'s1',name:'공룡 박물관',date:'',pred:87,v:'like',note:'뼈 앞에서 12분. "진짜 크다"를 세 번.',hit:true},{id:'s2',name:'동물원',date:'',pred:72,v:'meh',note:'보는 건 금방 질렸어요. 먹이주기만 기억해요.',hit:false},{id:'s3',name:'숲 체험 공원',date:'',pred:64,v:'like',note:'나뭇잎 주워서 집까지 들고 왔어요.',hit:true}],
 changes:[{tag:'a:outdoor',label:'바깥 놀이',before:50,after:89,delta:39},{tag:'동물',label:'동물',before:70,after:80,delta:10},{tag:'식물',label:'식물',before:30,after:58,delta:28,isNew:true},{tag:'a:literacy',label:'책·이야기',before:30,after:15,delta:-15}],
 next:[{id:'n1',name:'공룡 화석 발굴 체험관',prob:91},{id:'n2',name:'양떼 먹이주기 농장',prob:86}],
 thin:false,sample:true};
}
