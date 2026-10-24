/* 원본 MVP 데이터·아이콘 그대로 (export만 추가) */
export const HOME = {lat:37.5340, lng:126.9940};
export const INTEREST = {dino:'공룡',water:'물놀이',animal:'동물',draw:'그리기',train:'기차',plant:'식물',play:'뛰어놀기',book:'책'};
export const FAC = {stroller:'유모차 가능',nursing:'수유실',diaper:'기저귀 교환대',parking:'주차장',elevator:'엘리베이터',babychair:'아기 의자',kidsmenu:'키즈 메뉴',pediatric:'가까운 소아과',er:'응급실 30분 이내',shade:'그늘·실내 쉼터'};
export const MEAL_FAC = ['babychair','kidsmenu','parking'];
export function P(id,name,cat,ints,fac,indoor,fee,stay,dlat,dlng,base,crowd,type){return {id,name,cat,ints,fac,indoor,fee,stay,lat:HOME.lat+dlat,lng:HOME.lng+dlng,base,crowd,type:type||'play'}}
export const PLACES = [
 P('p1','공룡 박물관','박물관',['dino'],['stroller','nursing','diaper','parking','elevator','pediatric','shade'],true,8000,65,0.012,0.010,0.86,false),
 P('p2','자연사 체험관','박물관',['dino','plant'],['stroller','nursing','parking','elevator','shade'],true,6000,50,-0.018,0.024,0.74,true),
 P('p3','실내 물놀이터','물놀이',['water','play'],['stroller','nursing','diaper','parking','pediatric','shade'],true,15000,60,0.020,-0.016,0.84,true),
 P('p4','바닥분수 공원','물놀이',['water','play'],['stroller','parking'],false,0,40,-0.009,-0.021,0.70,false),
 P('p5','실내 동물원','동물원',['animal'],['stroller','nursing','diaper','parking','elevator','shade'],true,12000,55,0.026,0.020,0.80,true),
 P('p6','어린이 농장','동물원',['animal','plant'],['stroller','parking'],false,5000,50,-0.028,-0.006,0.72,false),
 P('p7','숲속 그리기 공방','체험 공방',['draw'],['stroller','diaper','pediatric','shade'],true,15000,40,0.004,0.030,0.82,false),
 P('p8','키즈 아트 스튜디오','체험 공방',['draw','play'],['stroller','nursing','diaper','elevator','shade'],true,18000,50,0.031,-0.004,0.69,false),
 P('p9','기차 박물관','박물관',['train'],['stroller','nursing','diaper','parking','elevator','shade'],true,5000,50,-0.022,0.012,0.78,false),
 P('p10','미니 기차 공원','놀이터·공원',['train','play'],['stroller','parking'],false,3000,40,0.016,0.036,0.66,true),
 P('p11','유리 온실 식물원','식물원',['plant'],['stroller','nursing','parking','elevator','shade'],true,5000,45,-0.006,0.018,0.76,false),
 P('p12','어린이 도서관','도서관',['book','draw'],['stroller','nursing','diaper','elevator','pediatric','shade'],true,0,45,0.008,-0.012,0.71,false),
 P('p13','숲 놀이터','놀이터·공원',['play','plant'],['stroller','parking','shade'],false,0,45,-0.014,-0.030,0.74,false),
 P('p14','실내 키즈카페','키즈카페',['play'],['stroller','nursing','diaper','parking','pediatric','shade'],true,15000,70,0.022,0.004,0.79,true),
 P('m1','키즈 식당','식당',[],['babychair','kidsmenu','parking','stroller'],true,12000,40,0.010,0.022,0.8,false,'meal'),
 P('m2','브런치 카페','식당',[],['babychair','stroller'],true,14000,40,0.024,-0.010,0.7,true,'meal'),
 P('m3','한식 가정식','식당',[],['babychair','kidsmenu','parking'],true,10000,40,-0.016,0.004,0.75,false,'meal'),
 P('m4','국수집','식당',[],['babychair'],true,8000,30,-0.004,-0.018,0.65,false,'meal')
];
export const CAT_INT = {'키즈카페':['play'],'박물관':['dino','train'],'식물원':['plant'],'물놀이':['water'],'동물원':['animal'],'놀이터·공원':['play'],'체험 공방':['draw'],'도서관':['book']};

export const IC={
 dino:'<g fill="#E8B84A"><ellipse cx="44" cy="60" rx="24" ry="14"/><path d="M58 54 Q68 32 72 24 Q76 18 82 22 Q82 30 70 60 Z"/><path d="M22 60 Q10 62 6 72 Q16 70 26 67 Z"/><rect x="30" y="68" width="8" height="16" rx="2"/><rect x="50" y="68" width="8" height="16" rx="2"/></g><circle cx="78" cy="24" r="1.8" fill="#2F3657"/>',
 water:'<circle cx="70" cy="30" r="10" fill="#FFE08A"/><g fill="none" stroke="#6FA3DE" stroke-width="5" stroke-linecap="round"><path d="M12 56 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M12 70 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M12 84 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/></g>',
 animal:'<g fill="#fff" stroke="#E8B84A" stroke-width="3"><circle cx="40" cy="54" r="14"/><circle cx="56" cy="50" r="14"/><circle cx="50" cy="64" r="14"/><circle cx="62" cy="62" r="12"/></g><ellipse cx="28" cy="50" rx="9" ry="8" fill="#2F3657"/><rect x="40" y="74" width="5" height="12" fill="#2F3657"/><rect x="56" y="74" width="5" height="12" fill="#2F3657"/>',
 draw:'<path d="M50 18 C24 18 12 38 16 56 C20 74 40 84 52 78 C60 74 54 66 62 64 C76 62 88 56 86 40 C84 26 70 18 50 18 Z" fill="#fff" stroke="#7FCB98" stroke-width="4"/><circle cx="36" cy="38" r="6" fill="#FFE08A"/><circle cx="54" cy="32" r="6" fill="#8EC1F2"/><circle cx="70" cy="42" r="6" fill="#93A9EE"/><circle cx="32" cy="58" r="6" fill="#7FCB98"/>',
 train:'<rect x="16" y="34" width="62" height="34" rx="4" fill="#93A9EE"/><rect x="62" y="22" width="16" height="14" fill="#93A9EE"/><rect x="24" y="42" width="12" height="10" fill="#fff"/><rect x="42" y="42" width="12" height="10" fill="#fff"/><circle cx="30" cy="72" r="7" fill="#2F3657"/><circle cx="62" cy="72" r="7" fill="#2F3657"/>',
 plant:'<rect x="48" y="44" width="4" height="36" fill="#5FAF7A"/><path d="M50 56 Q30 56 28 38 Q46 38 50 56 Z" fill="#7FCB98"/><path d="M52 50 Q70 48 74 32 Q56 32 52 50 Z" fill="#A9DDB4"/><rect x="34" y="78" width="32" height="8" rx="2" fill="#C9A98A"/>',
 play:'<rect x="27" y="58" width="6" height="22" fill="#9C8160"/><circle cx="30" cy="48" r="18" fill="#7FCB98"/><path d="M56 82 V44 H84 V82" fill="none" stroke="#93A9EE" stroke-width="5"/><path d="M56 58 H84" stroke="#93A9EE" stroke-width="5"/>',
 book:'<path d="M14 26 Q32 18 50 28 Q68 18 86 26 V80 Q68 72 50 82 Q32 72 14 80 Z" fill="#8EC1F2"/><path d="M50 28 V82" stroke="#fff" stroke-width="4"/>',
 meal:'<path d="M16 50 h68 a34 30 0 0 1 -68 0 z" fill="#8EC1F2"/><rect x="30" y="80" width="40" height="6" rx="3" fill="#8EC1F2"/><g fill="none" stroke="#93A9EE" stroke-width="4" stroke-linecap="round"><path d="M38 40 q-6 -8 0 -16"/><path d="M52 40 q-6 -8 0 -16"/><path d="M66 40 q-6 -8 0 -16"/></g>'
};
export const TINT={dino:'#FFF5D6',water:'#E4EEF8',animal:'#FFF5D6',draw:'#E2F4E7',train:'#E8EDFC',plant:'#E2F4E7',play:'#E2F4E7',book:'#E4EEF8',meal:'#E4EEF8'};

export const FACE_TXT={A:'푹 빠질 거예요',B:'좋아할 거예요',C:'궁금해할 거예요'};
export const FACE_INK={A:'var(--yellowInk)',B:'var(--mintInk)',C:'var(--primaryInk)'};

export const ICON={
 back:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
 close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 plus:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
 home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v10h-6v-6H9v6H3z"/></svg>',
 pin:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
 map:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
 dice:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="#2F3657"/><circle cx="15" cy="15" r="1.2" fill="#2F3657"/><circle cx="15" cy="9" r="1.2" fill="#2F3657"/><circle cx="9" cy="15" r="1.2" fill="#2F3657"/></svg>',
 car:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 17V12h3V7h12v5h3v5z"/><circle cx="7.5" cy="17.5" r="1.8" fill="#2F3657"/><circle cx="16.5" cy="17.5" r="1.8" fill="#2F3657"/></svg>',
 bus:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="13" rx="2"/><path d="M5 10h14"/><circle cx="8.5" cy="18.5" r="1.8" fill="#2F3657"/><circle cx="15.5" cy="18.5" r="1.8" fill="#2F3657"/></svg>',
 stroller:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3657" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M3 5h2.5l2 9h11"/><path d="M11 4a7 7 0 0 1 7 7h-7z"/><circle cx="9.5" cy="18.5" r="1.8" fill="#2F3657"/><circle cx="16.5" cy="18.5" r="1.8" fill="#2F3657"/></svg>',
 rain:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3073CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 16a4 4 0 1 1 1-7.9A5 5 0 0 1 17.6 9 3.5 3.5 0 0 1 17 16z"/><path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2"/></svg>',
 route:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
 search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4E5968" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
};
