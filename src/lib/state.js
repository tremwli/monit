/* 원본 MVP 상태 기본값·저장 그대로 */
import {nextSat} from './utils.js';
import {DATA_SOURCE} from './data.js';

/* 샘플 데이터와 실제 데이터는 장소 id가 달라서 저장 공간을 나눠요 (예전 코스가 없는 장소를 가리키지 않게) */
export const KEY=DATA_SOURCE==='tourapi'?'monit-real-v1':'monit-mvp-v1';

export function defaults(){const sat=nextSat();return {
 onboarded:false, child:{name:'서아',age:5},
 taste:{dino:.62,water:.6,animal:.48,draw:.36,train:.36,plant:.5,play:.46,book:.3},
 prevTaste:null, kidPicks:[], kidQuote:'',
 c:{startDate:sat,startTime:570,endDate:sat,endTime:780,
    schedules:[{id:'s1',name:'낮잠',start:780,end:900,color:'#93A9EE'},{id:'s2',name:'간식',start:660,end:675,color:'#FFD666'}],
    place:'near',maxTravel:30,mode:'car',adults:['엄마','아빠'],stroller:'bring',
    fac:['stroller','nursing','diaper','parking','pediatric'],feeMode:'paid',feeMax:30000,rainIndoor:true,
    wants:['dino','water'],energy:'high',novelty:'one',perDay:2,meal:true,avoidCrowd:true},
 lastCourse:null, history:[], visited:[], courses:[]
}}

export function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(!s)return defaults();if(!s.courses)s.courses=[];return s}catch(e){return defaults()}}
export function save(S){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
export function clear(){try{localStorage.removeItem(KEY)}catch(e){}}
