/* 원본 MVP 데이터·아이콘 (export만 추가)
   src/data/places.json 이 있으면(= npm run fetch-places 로 실제 데이터를 받았으면) 그걸 쓰고,
   없으면 아래 샘플 장소로 동작해요. 파일이 없어도 에러가 나지 않게 glob으로 불러와요. */
const REAL=Object.values(import.meta.glob('../data/places.json',{eager:true,import:'default'}))[0];
export const DATA_SOURCE=REAL&&Array.isArray(REAL.places)&&REAL.places.some(p=>p.type==='play')?'tourapi':'sample';
export const HOME = DATA_SOURCE==='tourapi'&&REAL.center?{lat:REAL.center.lat,lng:REAL.center.lng}:{lat:37.5340, lng:126.9940};
export const INTEREST = {dino:'공룡',water:'물놀이',animal:'동물',draw:'그리기',train:'기차',plant:'식물',play:'뛰어놀기',book:'책'};
export const FAC = {stroller:'유모차 가능',nursing:'수유실',diaper:'기저귀 교환대',parking:'주차장',elevator:'엘리베이터',babychair:'아기 의자',kidsmenu:'키즈 메뉴',pediatric:'가까운 소아과',er:'응급실 30분 이내',shade:'그늘·실내 쉼터'};
export const MEAL_FAC = ['babychair','kidsmenu','parking'];
export function P(id,name,cat,ints,fac,indoor,fee,stay,dlat,dlng,base,crowd,type){return {id,name,cat,ints,fac,indoor,fee,stay,lat:HOME.lat+dlat,lng:HOME.lng+dlng,base,crowd,type:type||'play'}}
const SAMPLE_PLACES = [
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
 /* 분류별 테마를 채우기 위한 추가 샘플 장소 */
 P('p15','어린이 과학관','박물관',['train','play'],['stroller','nursing','diaper','parking','elevator','shade'],true,4000,60,0.014,-0.026,0.80,true),
 P('p16','어린이 역사 박물관','박물관',['book'],['stroller','nursing','diaper','parking','elevator','shade'],true,0,45,-0.024,0.030,0.68,false),
 P('p17','세계 민속 박물관','박물관',['book','draw'],['stroller','nursing','elevator','shade'],true,3000,45,0.033,0.014,0.66,false),
 P('p18','전쟁기념관 어린이박물관','박물관',['train'],['stroller','nursing','diaper','parking','elevator','shade'],true,0,50,-0.004,0.006,0.72,true),
 P('p19','트램펄린 파크','키즈카페',['play'],['parking','shade'],true,18000,60,0.018,0.028,0.74,true),
 P('p20','역할놀이 키즈카페','키즈카페',['play','draw'],['stroller','nursing','diaper','parking','shade'],true,14000,70,-0.012,0.020,0.72,false),
 P('p21','아기 놀이방','키즈카페',['play'],['stroller','nursing','diaper','elevator','shade'],true,12000,60,0.006,0.016,0.70,false),
 P('p22','어린이 수목원','식물원',['plant','play'],['stroller','parking','shade'],false,3000,50,-0.030,0.022,0.73,false),
 P('p23','숲 체험원','식물원',['plant','animal'],['parking','shade'],false,0,50,-0.034,-0.020,0.70,false),
 P('p24','계곡 물놀이장','물놀이',['water','play'],['parking','shade'],false,0,60,-0.036,0.008,0.68,true),
 P('p25','아쿠아리움','동물원',['animal','water'],['stroller','nursing','diaper','parking','elevator','shade'],true,25000,70,0.028,-0.024,0.82,true),
 P('p26','곤충 생태관','동물원',['animal','plant'],['stroller','nursing','parking','shade'],true,3000,40,-0.020,-0.028,0.70,false),
 P('p27','모래 놀이터','놀이터·공원',['play'],['stroller','parking'],false,0,40,0.012,-0.008,0.69,false),
 P('p28','꼬마 요리 교실','체험 공방',['draw'],['stroller','diaper','shade'],true,20000,50,0.020,0.012,0.71,false),
 P('p29','어린이 도예 공방','체험 공방',['draw'],['diaper','parking','shade'],true,16000,50,-0.008,0.034,0.67,false),
 P('p30','꼬마 과학 실험실','체험 공방',['draw','play'],['stroller','nursing','elevator','shade'],true,15000,45,0.024,0.026,0.69,false),
 P('p31','그림책 도서관','도서관',['book'],['stroller','nursing','diaper','elevator','shade'],true,0,45,-0.016,0.026,0.72,false),
 P('p32','키즈 북카페','도서관',['book','play'],['stroller','diaper','shade'],true,8000,50,0.030,0.002,0.68,false),
 P('m1','키즈 식당','식당',[],['babychair','kidsmenu','parking','stroller'],true,12000,40,0.010,0.022,0.8,false,'meal'),
 P('m2','브런치 카페','식당',[],['babychair','stroller'],true,14000,40,0.024,-0.010,0.7,true,'meal'),
 P('m3','한식 가정식','식당',[],['babychair','kidsmenu','parking'],true,10000,40,-0.016,0.004,0.75,false,'meal'),
 P('m4','국수집','식당',[],['babychair'],true,8000,30,-0.004,-0.018,0.65,false,'meal')
];
/* 실제 데이터가 있으면 그것, 없으면 샘플 (머지 때 빠졌던 줄 복구) */
export const PLACES = DATA_SOURCE==='tourapi'?REAL.places:SAMPLE_PLACES;
export const DATA_INFO = DATA_SOURCE==='tourapi'?{source:REAL.source,generatedAt:REAL.generatedAt,count:REAL.places.length}:null;
/* 분류 안의 세부 테마 (분류별 모아보기 화면의 칩) */
export const CAT_THEMES = {'박물관':['자연사','과학','한국사','세계사','전쟁·평화','탈것'],'키즈카페':['대형 놀이형','트램펄린','역할놀이','아기 전용'],'식물원':['온실','수목원','숲 체험'],'물놀이':['실내 워터파크','바닥분수','계곡'],'동물원':['동물원','아쿠아리움','체험 농장','곤충관'],'놀이터·공원':['숲 놀이터','모래 놀이','테마 공원'],'체험 공방':['미술','요리','도예','과학 실험'],'도서관':['어린이 도서관','그림책','북카페'],'식당':['키즈 식당','카페·브런치','한식','면 요리']};
const THEME_OF = {p1:'자연사',p2:'자연사',p9:'탈것',p15:'과학',p16:'한국사',p17:'세계사',p18:'전쟁·평화',
 p14:'대형 놀이형',p19:'트램펄린',p20:'역할놀이',p21:'아기 전용',p11:'온실',p22:'수목원',p23:'숲 체험',
 p3:'실내 워터파크',p4:'바닥분수',p24:'계곡',p5:'동물원',p25:'아쿠아리움',p6:'체험 농장',p26:'곤충관',
 p13:'숲 놀이터',p27:'모래 놀이',p10:'테마 공원',p7:'미술',p8:'미술',p28:'요리',p29:'도예',p30:'과학 실험',
 p12:'어린이 도서관',p31:'그림책',p32:'북카페',m1:'키즈 식당',m2:'카페·브런치',m3:'한식',m4:'면 요리'};
PLACES.forEach(p=>{p.theme=THEME_OF[p.id]});
export const CAT_INT = {'키즈카페':['play'],'박물관':['dino','train'],'식물원':['plant'],'물놀이':['water'],'동물원':['animal'],'놀이터·공원':['play'],'체험 공방':['draw'],'도서관':['book']};

/* 장소 일러스트: 채도를 낮춘 파스텔 톤 (윤곽·바퀴만 남색) */
export const IC={
 dino:'<g fill="#F1CF84"><ellipse cx="44" cy="60" rx="24" ry="14"/><path d="M58 54 Q68 32 72 24 Q76 18 82 22 Q82 30 70 60 Z"/><path d="M22 60 Q10 62 6 72 Q16 70 26 67 Z"/><rect x="30" y="68" width="8" height="16" rx="2"/><rect x="50" y="68" width="8" height="16" rx="2"/></g><circle cx="78" cy="24" r="1.8" fill="#2F3657"/>',
 water:'<circle cx="70" cy="30" r="10" fill="#FCE5A6"/><g fill="none" stroke="#9DBFE8" stroke-width="5" stroke-linecap="round"><path d="M12 56 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M12 70 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M12 84 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0"/></g>',
 animal:'<g fill="#fff" stroke="#F1CF84" stroke-width="3"><circle cx="40" cy="54" r="14"/><circle cx="56" cy="50" r="14"/><circle cx="50" cy="64" r="14"/><circle cx="62" cy="62" r="12"/></g><ellipse cx="28" cy="50" rx="9" ry="8" fill="#2F3657"/><rect x="40" y="74" width="5" height="12" fill="#2F3657"/><rect x="56" y="74" width="5" height="12" fill="#2F3657"/>',
 draw:'<path d="M50 18 C24 18 12 38 16 56 C20 74 40 84 52 78 C60 74 54 66 62 64 C76 62 88 56 86 40 C84 26 70 18 50 18 Z" fill="#fff" stroke="#A8DBB6" stroke-width="4"/><circle cx="36" cy="38" r="6" fill="#FCE5A6"/><circle cx="54" cy="32" r="6" fill="#AFD2F4"/><circle cx="70" cy="42" r="6" fill="#B4C3F2"/><circle cx="32" cy="58" r="6" fill="#A8DBB6"/>',
 train:'<rect x="16" y="34" width="62" height="34" rx="4" fill="#B4C3F2"/><rect x="62" y="22" width="16" height="14" fill="#B4C3F2"/><rect x="24" y="42" width="12" height="10" fill="#fff"/><rect x="42" y="42" width="12" height="10" fill="#fff"/><circle cx="30" cy="72" r="7" fill="#2F3657"/><circle cx="62" cy="72" r="7" fill="#2F3657"/>',
 plant:'<rect x="48" y="44" width="4" height="36" fill="#8DC6A0"/><path d="M50 56 Q30 56 28 38 Q46 38 50 56 Z" fill="#A8DBB6"/><path d="M52 50 Q70 48 74 32 Q56 32 52 50 Z" fill="#C4E7CB"/><rect x="34" y="78" width="32" height="8" rx="2" fill="#DCC7AF"/>',
 play:'<rect x="27" y="58" width="6" height="22" fill="#BFA88A"/><circle cx="30" cy="48" r="18" fill="#A8DBB6"/><path d="M56 82 V44 H84 V82" fill="none" stroke="#B4C3F2" stroke-width="5"/><path d="M56 58 H84" stroke="#B4C3F2" stroke-width="5"/>',
 book:'<path d="M14 26 Q32 18 50 28 Q68 18 86 26 V80 Q68 72 50 82 Q32 72 14 80 Z" fill="#AFD2F4"/><path d="M50 28 V82" stroke="#fff" stroke-width="4"/>',
 meal:'<path d="M16 50 h68 a34 30 0 0 1 -68 0 z" fill="#AFD2F4"/><rect x="30" y="80" width="40" height="6" rx="3" fill="#AFD2F4"/><g fill="none" stroke="#B4C3F2" stroke-width="4" stroke-linecap="round"><path d="M38 40 q-6 -8 0 -16"/><path d="M52 40 q-6 -8 0 -16"/><path d="M66 40 q-6 -8 0 -16"/></g>'
};
/* 홈 분류 아이콘 (48×48). 윤곽선 없는 한 가지 색 실루엣.
   색은 currentColor, 속을 파낸 부분은 class="cut"(타일 배경색, app.css) */
const CI=body=>`<g fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
export const CAT_ICON={
 '키즈카페':CI('<ellipse cx="24" cy="18" rx="10" ry="12"/><path d="M21.5 32 L24 29 L26.5 32 Z"/><path d="M24 32 q-3 5 1 10" fill="none" stroke-width="2"/>'),
 '박물관':CI('<path d="M6 17 L24 7 L42 17 Z"/><rect x="10" y="20" width="6" height="13" rx="1"/><rect x="21" y="20" width="6" height="13" rx="1"/><rect x="32" y="20" width="6" height="13" rx="1"/><rect x="6" y="35" width="36" height="6" rx="2"/>'),
 '식물원':CI('<path d="M23.5 26 C15.5 26 10.5 20.5 11.5 13 C19.5 13 23.5 18.5 23.5 26 Z"/><path d="M24.5 26 C32.5 26 37.5 20.5 36.5 13 C28.5 13 24.5 18.5 24.5 26 Z"/><path d="M13 29 H35 L32.5 41 H15.5 Z"/>'),
 '물놀이':CI('<path d="M24 6 C24 6 12 20 12 28 A12 12 0 0 0 36 28 C36 20 24 6 24 6 Z"/>'),
 '동물원':CI('<circle cx="12.5" cy="14" r="6"/><circle cx="35.5" cy="14" r="6"/><circle cx="24" cy="26" r="14.5"/><circle class="cut" cx="18.5" cy="24" r="2.2"/><circle class="cut" cx="29.5" cy="24" r="2.2"/><ellipse class="cut" cx="24" cy="31" rx="3" ry="2.2"/>'),
 '놀이터·공원':CI('<path d="M9 41 L15 8 M39 41 L33 8 M11.5 8 H36.5" fill="none" stroke-width="3.2"/><path d="M19 8 V29 M29 8 V29" fill="none" stroke-width="1.8"/><rect x="15.5" y="29" width="17" height="5" rx="2.5"/>'),
 '체험 공방':CI('<path d="M24 7 C12 7 5 15 5 24 C5 33 12 41 21 41 C26 41 26 36 24 34 C21.5 31 24 27.5 28 27.5 H33 C38.5 27.5 43 24.5 43 19 C43 12 35 7 24 7 Z"/><circle class="cut" cx="15" cy="19" r="3.4"/><circle class="cut" cx="25" cy="14" r="3.4"/><circle class="cut" cx="34" cy="19" r="3.4"/>'),
 '도서관':CI('<path d="M23 13 C18.5 9.5 12 9 6 11 V37 C12 35 18.5 35.5 23 38.5 Z"/><path d="M25 13 C29.5 9.5 36 9 42 11 V37 C36 35 29.5 35.5 25 38.5 Z"/>'),
 '식당':CI('<path d="M30 18 L41 7 M34 19 L44 9" fill="none" stroke-width="2.4"/><path d="M6 22 H42 C42 32 34 39 24 39 C14 39 6 32 6 22 Z"/><rect x="17" y="39.5" width="14" height="3.5" rx="1.75"/>')
};
export const TINT={dino:'#FBF3D8',water:'#E6EDF6',animal:'#FBF3D8',draw:'#E4F0E4',train:'#EAEDF9',plant:'#E4F0E4',play:'#E4F0E4',book:'#E6EDF6',meal:'#E6EDF6'};

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
