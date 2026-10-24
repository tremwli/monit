/* 아이 관심사 모델. 두 층으로 나눈다.
   1) 흥미 유형(AREAS, 고정): "어떻게 노는가". 근거는 Alexander, Johnson, Leibham & Kelley (2008),
      Cognitive Development 23의 11개 흥미 영역(Renninger & Wozniak 1985, Smilansky 1968 등에서 유래).
      외출 추천과 상관없는 TV·라디오, 그리고 '함께 놀기'(노는 방식 STYLE_TAGS 쪽)는 뺐다.
   2) 관심 주제(topic, 열린 목록): "무엇에 빠졌는가". 공룡·소방차·우주처럼 아이마다 다르다.
      정해진 목록이 아니라 일기·기록에서 나온 말을 그대로 쓰고, 아래 SEED_TOPICS는 같은 뜻의 말을 묶고
      장소 글에서 찾기 위한 사전일 뿐이다.
   취향 점수 S.taste는 이 둘을 한 맵에 담는다: 흥미 유형은 'a:키', 주제는 한글 낱말 그대로.
   의존성 없음 — 서버(api/analyze.js)와 Node 스크립트에서도 import한다. */

export const AREAS={
 concept:'알아가기',      /* 개념형: 한 분야를 깊이 파고들기 (공룡·탈것·동물 지식) */
 pretend:'역할·상상 놀이', /* 역할놀이·모험 놀이 */
 create:'그리기·만들기',   /* 창작 예술 */
 build:'블록·조립',        /* 구성 놀이 */
 sport:'운동·춤',
 outdoor:'바깥 놀이',      /* 그네·산책·자전거 같은 몸 놀이 */
 games:'규칙 있는 놀이',   /* 보드게임·방탈출 */
 literacy:'책·이야기',
 skill:'배우고 익히기',    /* 악기·요리 교실처럼 연습해서 느는 것 */
};
export const AREA_KEYS=Object.keys(AREAS);
export const isArea=ref=>typeof ref==='string'&&ref.startsWith('a:');
export const areaRef=k=>'a:'+k;

/* 장소 글에서 흥미 유형을 알아보는 단어 */
const AREA_WORDS={
 concept:['박물관','과학관','기념관','전시','아쿠아리움','수족관','동물원','식물원','생태','자연사','천문','체험관','역사관'],
 pretend:['역할','키즈카페','소꿉','인형극','직업체험','상상','모험'],
 create:['미술','그리기','공방','만들기','아트','도예','공예'],
 build:['블록','레고','조립','건축','목공'],
 sport:['트램펄린','스포츠','수영','클라이밍','썰매','자전거','운동','볼링','스케이트'],
 outdoor:['공원','놀이터','숲','계곡','분수','캠핑','산책','모래','수목원','농장','목장','둘레길','해변'],
 games:['보드게임','방탈출','퀴즈','미로'],
 literacy:['도서관','그림책','동화','북카페','책방'],
 skill:['교실','클래스','쿠킹','요리','악기','실험실','코딩'],
};

/* 같은 뜻의 말 묶음. 키가 대표 이름. 일기 분석 결과를 합치고, 장소 글에서 주제를 찾을 때 쓴다.
   한 글자 말(책·양·궁)은 '산책'·'다양'·'궁금'처럼 엉뚱한 글에 걸려서 넣지 않는다 */
export const SEED_TOPICS={
 '공룡':['공룡','티라노','화석','쥬라기','쥐라기','고생물','자연사'],
 '기차':['기차','열차','철도','지하철','KTX','레일','미니 기차'],
 '자동차':['자동차','버스','트럭','소방차','경찰차','포크레인','중장비','굴착기'],
 '비행기':['비행기','항공','공항','헬리콥터'],
 '우주':['우주','천문','행성','로켓','별자리','은하'],
 '동물':['동물','동물원','농장','목장','먹이주기','토끼','양떼'],
 '바다생물':['아쿠아리움','수족관','물고기','상어','해양','펭귄'],
 '곤충':['곤충','나비','벌레','개미','장수풍뎅이','사슴벌레','잠자리'],
 '식물':['식물','꽃','나무','수목원','온실','정원','허브'],
 '숲':['숲','산림','둘레길','자연휴양림'],
 '물놀이':['물놀이','수영','분수','계곡','워터','물썰매','바닥분수'],
 '모래놀이':['모래','갯벌','흙놀이'],
 '과학':['과학','실험','로봇','발명','코딩'],
 '역사':['역사','민속','유적','궁궐','전통','옛날'],
 '전쟁·평화':['전쟁','군사','호국'],
 '세계 문화':['세계 민속','세계문화','다문화','세계 여러'],
 '음악':['음악','악기','노래','공연','피아노','오케스트라'],
 '요리':['요리','쿠킹','베이킹','빵'],
 '미술':['미술','그림','그리기','색칠','아트','도예','공예'],
 '책':['그림책','동화','도서관','북카페','책방'],
 '트램펄린':['트램펄린','방방'],
};

/* 원본 MVP의 8개 태그 → 새 모델. 예전 저장 데이터·일기 분석·장소(ints)를 옮길 때 쓴다 */
export const LEGACY={dino:'공룡',water:'물놀이',animal:'동물',train:'기차',plant:'식물',draw:'a:create',play:'a:outdoor',book:'a:literacy'};
export function migrateRef(ref){return LEGACY[ref]||ref}

/* 아무 말이나 → 대표 주제. 사전에 있으면 대표 이름, 없으면 그 말 그대로 (열린 목록) */
export function normalizeTopic(word){
 const w=String(word||'').replace(/[\s"'“”‘’.,!?]+/g,' ').trim();
 if(!w)return '';
 for(const [name,al] of Object.entries(SEED_TOPICS))if(name===w||al.some(a=>a.trim()===w))return name;
 for(const [name,al] of Object.entries(SEED_TOPICS))if(al.some(a=>a.trim().length>=2&&w.includes(a.trim())))return name;
 return w.slice(0,12);
}

export function label(ref){if(isArea(ref))return AREAS[ref.slice(2)]||ref;return LEGACY[ref]?label(LEGACY[ref]):ref}

/* 장소 그림(data.js IC) 키. 화면에서 주제·유형을 그림으로 보여줄 때 */
const ICON_OF={'공룡':'dino','물놀이':'water','바다생물':'water','동물':'animal','곤충':'animal','기차':'train','자동차':'train','비행기':'train','식물':'plant','숲':'plant','책':'book','a:create':'draw','a:outdoor':'play','a:sport':'play','a:literacy':'book','a:concept':'dino','미술':'draw'};
export function iconOf(ref){return ICON_OF[migrateRef(ref)]||'play'}
const TINT_OF={dino:'#FBF3D8',water:'#E6EDF6',animal:'#FBF3D8',draw:'#E4F0E4',train:'#EAEDF9',plant:'#E4F0E4',play:'#E4F0E4',book:'#E6EDF6'};
export function tintOf(ref){return TINT_OF[iconOf(ref)]||'#F2F4F6'}

const hasAny=(s,ws)=>ws.some(w=>s.includes(w));

/* 장소 하나의 관심사 프로필: {areas:[키], topics:[이름], text}. 이름·분류·테마·소개글에서 뽑는다.
   샘플 장소는 소개글이 없어서 원본 태그(ints)도 함께 옮긴다 */
const cache=new Map();
export function profileOf(p){
 if(cache.has(p))return cache.get(p);
 const text=[p.name,p.cat,p.theme,p.summary].filter(Boolean).join(' ');
 const areas=new Set(),topics=new Set();
 if(p.type!=='meal'){
  for(const [k,ws] of Object.entries(AREA_WORDS))if(hasAny(text,ws))areas.add(k);
  for(const [name,al] of Object.entries(SEED_TOPICS))if(hasAny(text,al))topics.add(name);
  (p.ints||[]).forEach(i=>{const r=LEGACY[i];if(!r)return;if(isArea(r)){/* 뛰어놀기는 실내면 운동, 밖이면 바깥 놀이 */areas.add(r==='a:outdoor'&&p.indoor?'sport':r.slice(2))}else topics.add(r)});
 }
 const pr={areas:[...areas],topics:[...topics],text};
 cache.set(p,pr);
 return pr;
}

/* 이 장소가 이 주제를 다루는지: 프로필 주제에 있거나, 장소 글에 그 말(또는 같은 뜻의 말)이 나오면 */
export function mentions(p,topic){
 const pr=profileOf(p);
 if(pr.topics.includes(topic))return true;
 if(topic.length>=2&&pr.text.includes(topic))return true;
 const al=SEED_TOPICS[topic];return !!al&&hasAny(pr.text,al);
}
/* 이 장소가 ref(유형 또는 주제)에 해당하는지 */
export function matchesRef(p,ref){ref=migrateRef(ref);return isArea(ref)?profileOf(p).areas.includes(ref.slice(2)):mentions(p,ref)}

/* 시작 화면·아이 모드·코스 '원하는 곳'에서 고를 수 있는 기본 선택지 */
export const STARTER_REFS=['공룡','물놀이','동물','기차','식물','곤충','우주','과학','역사','바다생물','a:create','a:build','a:pretend','a:sport','a:outdoor','a:literacy','a:skill','a:games'];
/* 시작 화면 장소 유형 → 처음 취향 */
export const CAT_REFS={'키즈카페':['a:pretend','a:sport'],'박물관':['a:concept','공룡'],'식물원':['식물','a:outdoor'],'물놀이':['물놀이'],'동물원':['동물'],'놀이터·공원':['a:outdoor'],'체험 공방':['a:create'],'도서관':['a:literacy']};
