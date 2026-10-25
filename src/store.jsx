/* 앱 전역 상태. 원본 MVP의 S(저장되는 상태)와 UI(화면 임시 상태)를 Context로 제공한다.
   set(fn): fn(S) 안에서 S를 직접 고치면 복사본에 적용 → localStorage 저장 → 리렌더.
   setUI(fn): 저장하지 않는 임시 상태. */
import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {flushSync} from 'react-dom';
import {load,save,defaults,clear} from './lib/state.js';

const Ctx=createContext(null);

const UI_DEFAULT={wheel:null,mapSel:null,mapCat:'fit',rec:{},photos:{},startSel:[],startTopics:[],kidSel:null,kidQuote:null,resetArm:false,rating:null};

export function StoreProvider({children}){
 const [S,setS]=useState(load);
 const [UI,setUIState]=useState(UI_DEFAULT);
 const set=useCallback(fn=>{setS(prev=>{const next=structuredClone(prev);fn(next);save(next);return next})},[]);
 const setUI=useCallback(fn=>{setUIState(prev=>{const next={...prev};fn(next);return next})},[]);
 const reset=useCallback(()=>{clear();setS(defaults());setUIState(UI_DEFAULT)},[]);
 return <Ctx.Provider value={{S,set,UI,setUI,reset}}>{children}</Ctx.Provider>;
}

export function useStore(){return useContext(Ctx)}

/* 해시 라우팅: #/home, #/c1 … 원본과 동일.
   지원 브라우저에서는 View Transitions API로 화면을 부드럽게 바꾼다(애니메이션은 app.css). */
export function useRoute(S){
 const [hash,setHash]=useState(()=>location.hash);
 useEffect(()=>{
  const f=()=>{const h=location.hash;
   /* 화면이 안 보일 때(백그라운드 탭)는 전환이 건너뛰어지며 화면이 안 바뀔 수 있어서 바로 바꾼다 */
   if(!document.startViewTransition||document.visibilityState!=='visible'||matchMedia('(prefers-reduced-motion: reduce)').matches)return setHash(h);
   const vt=document.startViewTransition(()=>flushSync(()=>setHash(h)));
   vt.updateCallbackDone.catch(()=>setHash(h));vt.finished.catch(()=>{});
   /* 화면 갱신이 멈춘 환경(숨겨진 창 등)에서 전환이 시작조차 안 되면 0.4초 뒤 그냥 바꾼다. 이미 바뀌었으면 아무 일 없음 */
   setTimeout(()=>setHash(h),400)};
  window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f)},[]);
 let r=(hash.replace('#/','')||'').split('?')[0]||(S.onboarded?'home':'start');
 if(r!=='start'&&!S.onboarded&&r!=='kid')r='start';
 return r;
}
