/* 원본 MVP 상태 기본값·저장 그대로 */
import {nextSat} from './utils.js';

export const KEY='monit-mvp-v1';

export function defaults(){const sat=nextSat();return {
 onboarded:false, child:{name:'서아',age:5},
 taste:{dino:.62,water:.6,animal:.48,draw:.36,train:.36,plant:.5,play:.46,book:.3},
 prevTaste:null, kidPicks:[], kidQuote:'',
 c:{startDate:sat,startTime:570,endDate:sat,endTime:780,
    schedules:[{id:'s1',name:'낮잠',start:780,end:900,color:'#93A9EE'},{id:'s2',name:'간식',start:660,end:675,color:'#FFD666'}],
    place:'near',maxTravel:30,mode:'car',adults:['엄마','아빠'],stroller:'bring',
    fac:['stroller','nursing','diaper','parking','pediatric'],feeMode:'paid',feeMax:30000,rainIndoor:true,
    wants:['dino','water'],energy:'high',novelty:'one',perDay:2,meal:true,avoidCrowd:true},
 lastCourse:null, history:[], visited:[]
}}

export function load(){try{return JSON.parse(localStorage.getItem(KEY))||defaults()}catch(e){return defaults()}}
export function save(S){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
export function clear(){try{localStorage.removeItem(KEY)}catch(e){}}
