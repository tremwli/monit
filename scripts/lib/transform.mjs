/* TourAPI 응답 → 모닛 추천 로직이 쓰는 장소 모양으로 바꾸기.
   규칙은 전부 여기 있어요. 태그가 이상하면 아래 키워드 표만 고치면 돼요. */

/* ---------- 취향 태그 키워드 ---------- */
export const TAG_WORDS = {
  dino:   ['공룡', '화석', '자연사', '쥬라기', '쥐라기', '고생물'],
  water:  ['물놀이', '수영장', '워터', '분수', '계곡', '해수욕', '물썰매', '래프팅', '물빛'],
  animal: ['동물', '아쿠아리움', '수족관', '농장', '목장', '곤충', '나비', '파충류', '새공원', '양떼', '말 체험', '승마'],
  draw:   ['미술', '아트', '그리기', '공방', '만들기', '도예', '공예', '갤러리', '창작'],
  train:  ['기차', '철도', '레일', '열차', '지하철', '자동차', '교통', '항공', '비행기', '우주'],
  plant:  ['식물', '수목원', '정원', '숲', '꽃', '온실', '생태', '습지', '허브'],
  play:   ['놀이', '키즈', '어린이', '트램펄린', '테마파크', '체험관', '모험', '짚라인', '썰매', '눈썰매', '과학관', '놀이터'],
  book:   ['도서관', '책', '그림책', '동화', '이야기'],
};
/* 아이와 상관있다는 신호 (제목에 있으면 점수 ↑) */
const KID_WORDS = ['어린이', '키즈', '아이', '유아', '가족', '체험', '놀이', '동물', '공룡', '과학관', '수족관', '아쿠아리움', '농장', '숲', '공원', '박물관', '도서관', '식물원', '수목원'];
/* 아이와 가기 어려운 곳 */
const EXCLUDE_WORDS = ['사찰', '암자', '왕릉', '묘역', '묘소', '성당', '교회', '골프', '카지노', '클럽', '나이트', '주점', '호프', '포차', '와인바', '바(Bar)', '이자카야', '모텔', '사우나', '찜질', '스파', '전망대 바', '납골', '추모', '형무소', '감옥', '서바이벌', '사격', '경마'];
const MEAL_EXCLUDE = ['주점', '호프', '포차', '이자카야', '와인', '바(Bar)', '칵테일', '맥주', '술집', '노래', 'BAR', 'Bar', 'Pub', 'pub'];

/* 화면의 카테고리 (MapView 칩, CAT_INT와 같은 이름) */
const CAT_RULES = [
  ['키즈카페', ['키즈카페', '키즈 카페', '실내놀이', '실내 놀이', '트램펄린', '키즈파크', '키즈랜드']],
  ['동물원', ['동물원', '아쿠아리움', '수족관', '농장', '목장', '곤충', '동물']],
  ['물놀이', ['물놀이', '수영장', '워터', '분수', '계곡', '해수욕', '물썰매']],
  ['식물원', ['식물원', '수목원', '온실', '정원', '허브']],
  ['도서관', ['도서관']],
  ['체험 공방', ['공방', '도예', '공예', '만들기', '미술', '아트']],
  ['박물관', ['박물관', '과학관', '전시관', '기념관', '미술관', '체험관', '홍보관', '역사관']],
  ['놀이터·공원', ['공원', '놀이터', '숲', '테마파크', '랜드', '한강']],
];
const INDOOR_WORDS = ['실내', '박물관', '과학관', '전시관', '미술관', '기념관', '아쿠아리움', '수족관', '키즈카페', '도서관', '체험관', '공방', '온실', '센터', '홍보관', '역사관', '극장', '공연장'];
const OUTDOOR_WORDS = ['공원', '숲', '계곡', '해수욕', '캠핑', '농장', '목장', '수목원', '정원', '둘레길', '산', '섬', '해변', '유원지', '동물원', '테마파크', '한강', '호수', '저수지', '놀이터', '분수'];
const CROWD_WORDS = ['롯데월드', '에버랜드', '서울랜드', '코엑스', '대공원', '어린이대공원', '아쿠아리움', '스타필드', '현대백화점', '타임스퀘어'];
const DEFAULT_STAY = {'키즈카페': 90, '동물원': 90, '물놀이': 80, '식물원': 60, '도서관': 45, '체험 공방': 60, '박물관': 70, '놀이터·공원': 60};

/* ---------- 상세 받기 전에 후보 추리기 ---------- */
export function pickPlayCandidates(items) {
  const seen = new Set();
  return items
    .filter(it => {
      if (seen.has(it.contentid)) return false;
      seen.add(it.contentid);
      return it.mapx && it.mapy && !hasAny(it.title, EXCLUDE_WORDS);
    })
    .map(it => {
      const t = it.title || '';
      const tags = Object.values(TAG_WORDS).filter(ws => hasAny(t, ws)).length;
      const kid = hasAny(t, KID_WORDS) ? 2 : 0;
      const img = it.firstimage ? 0.5 : 0;
      const dist = Number(it.dist || 0) / 1000; // km, arrange=E 일 때 거리(m)가 와요
      return {it, s: kid + tags + img + (String(it.contenttypeid) === '14' ? 0.5 : 0) - dist * 0.05};
    })
    .filter(x => x.s > 0.6)
    .sort((a, b) => b.s - a.s)
    .map(x => x.it);
}

/* 식당은 고른 놀거리마다 가까운 곳을 1~2곳씩 */
export function pickMealCandidates(meals, playPick, max) {
  const ok = meals.filter(m => m.mapx && m.mapy && !hasAny(m.title, MEAL_EXCLUDE));
  const chosen = new Map();
  for (let round = 0; round < 2 && chosen.size < max; round++) {
    for (const p of playPick) {
      if (chosen.size >= max) break;
      const near = ok
        .filter(m => !chosen.has(m.contentid))
        .map(m => ({m, d: km(pt(p), pt(m))}))
        .filter(x => x.d < 1.5)
        .sort((a, b) => a.d - b.d)[0];
      if (near) chosen.set(near.m.contentid, near.m);
    }
  }
  return [...chosen.values()];
}

/* ---------- 상세까지 받은 것 → 앱 장소 ---------- */
export function transformAll(detailed) {
  const out = [];
  for (const d of detailed) {
    const p = transformOne(d);
    if (p) out.push(p);
  }
  return out;
}

export function transformOne({list, common, intro, bf}) {
  const c = {...list, ...(common || {})};
  const type = String(c.contenttypeid || list.contenttypeid) === '39' ? 'meal' : 'play';
  const lat = Number(c.mapy), lng = Number(c.mapx);
  if (!lat || !lng) return null;
  const name = clean(c.title);
  const overview = clean(c.overview);
  const I = intro || {};
  const introText = clean(Object.values(I).filter(v => typeof v === 'string').join(' '));
  const text = `${name} ${overview} ${introText}`;

  /* 취향 태그: 제목에 나오면 2점, 소개글에 나오면 1점 */
  const ints = [];
  if (type === 'play') {
    const scored = Object.entries(TAG_WORDS)
      .map(([k, ws]) => [k, countAny(name, ws) * 2 + Math.min(2, countAny(overview, ws))])
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1]);
    scored.slice(0, 3).forEach(([k]) => ints.push(k));
    if (!ints.length) return null; // 아이 취향과 이어지는 게 없으면 빼요
    if (hasAny(name, EXCLUDE_WORDS)) return null;
  }

  const cat = type === 'meal' ? '식당' : (CAT_RULES.find(([, ws]) => hasAny(name, ws)) || CAT_RULES.find(([, ws]) => hasAny(text, ws)) || ['놀이터·공원'])[0];
  const indoor = type === 'meal' ? true : guessIndoor(name, overview, String(c.contenttypeid));

  /* 편의시설: 아는 것(facKnown)과 있는 것(fac)을 따로 저장.
     모르는 시설은 필터에서 떨어뜨리지 않아요. */
  const fac = new Set(), known = new Set();
  const stroller = pick(I, ['chkbabycarriage', 'chkbabycarriageculture', 'chkbabycarriageleports', 'chkbabycarriageshopping']);
  if (stroller) { known.add('stroller'); if (yes(stroller)) fac.add('stroller'); }
  const parking = pick(I, ['parking', 'parkingculture', 'parkingleports', 'parkingfood', 'parkingshopping', 'parkinglodging']);
  if (parking) { known.add('parking'); if (yes(parking)) fac.add('parking'); }
  if (bf) {
    const B = lowerKeys(bf);
    /* 빈 칸은 '없음'이 아니라 '정보 없음'으로 봐요. 글이 있을 때만 아는 것으로 쳐요. */
    const said = k => clean(B[k]).length > 0;
    const has = k => said(k) && !/없음|불가|미운영|미설치/.test(B[k]);
    const set = (f, k) => { if (said(k)) { known.add(f); if (has(k)) fac.add(f); } };
    set('stroller', 'stroller');
    set('nursing', 'lactationroom');
    set('babychair', 'babysparechair');
    set('elevator', 'elevator');
    if (/기저귀/.test(B.infantsfamilyetc || '') || /기저귀/.test(B.restroom || '')) { known.add('diaper'); fac.add('diaper'); }
  }
  if (indoor && type === 'play') { fac.add('shade'); known.add('shade'); }

  /* 요금 */
  let fee = 0, feeUnknown = false;
  if (type === 'meal') {
    fee = parseMenuPrice(`${pick(I, ['firstmenu'])} ${pick(I, ['treatmenu'])}`) || 12000;
  } else {
    const f = parseFee(pick(I, ['usefee', 'usefeeleports', 'usefeeculture']) + ' ' + pick(I, ['usetimefestival']));
    if (f == null) feeUnknown = true; else fee = f;
  }

  /* 시간 */
  const hours = parseHours(pick(I, type === 'meal' ? ['opentimefood'] : ['usetime', 'usetimeculture', 'usetimeleports']));
  const closedDays = parseClosed(pick(I, type === 'meal' ? ['restdatefood'] : ['restdate', 'restdateculture', 'restdateleports']));
  const stay = type === 'meal' ? 40 : (parseStay(pick(I, ['spendtime', 'spendtimeculture'])) || DEFAULT_STAY[cat] || 60);

  /* 기본 점수: 별점 데이터가 없어서 정보가 얼마나 풍부한지 + 아이 친화 신호로 정해요 */
  let base = 0.62;
  if (c.firstimage) base += 0.06;
  if (hasAny(name, ['어린이', '키즈', '유아', '아이'])) base += 0.1;
  if (fac.has('nursing') || fac.has('stroller')) base += 0.04;
  if (overview.length > 200) base += 0.03;
  if (type === 'meal') base = 0.7;

  return {
    id: 't' + c.contentid,
    name, cat, ints,
    fac: [...fac], facKnown: [...known],
    indoor, fee, ...(feeUnknown ? {feeUnknown: true} : {}),
    stay, lat: round6(lat), lng: round6(lng),
    base: Math.min(0.9, Math.round(base * 100) / 100),
    crowd: hasAny(name, CROWD_WORDS),
    type,
    ...(hours ? {open: hours[0], close: hours[1]} : {}),
    ...(closedDays.length ? {closedDays} : {}),
    image: httpsImg(c.firstimage || c.firstimage2 || ''),
    addr: clean(c.addr1 || ''),
    tel: clean(c.tel || pick(I, ['infocenter', 'infocenterculture', 'infocenterleports', 'infocenterfood'])).slice(0, 40),
    summary: overview.slice(0, 120),
    contentId: String(c.contentid),
  };
}

/* ---------- 글 → 숫자 ---------- */
export function parseHours(s) {
  s = clean(s);
  const m = s.match(/(\d{1,2})\s*(?::|시)\s*(\d{2})?\s*분?\s*[~\-–∼]\s*(\d{1,2})\s*(?::|시)\s*(\d{2})?/);
  if (!m) return null;
  const a = Number(m[1]) * 60 + Number(m[2] || 0);
  let b = Number(m[3]) * 60 + Number(m[4] || 0);
  if (b === 0) b = 24 * 60;
  if (b <= a || a < 5 * 60) return null;
  return [a, b];
}
export function parseClosed(s) {
  s = clean(s);
  if (!s || /연중\s*무휴|휴무\s*없음|없음/.test(s) && !/요일/.test(s)) return [];
  const map = {'일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6};
  const out = new Set();
  // "매월 둘째 넷째 월요일"처럼 격주는 매주 휴무로 보지 않아요
  const re = /(매주\s*)?(?:\(?([일월화수목금토])\s*[,·/]?\s*)?([일월화수목금토])요일/g;
  let m;
  while ((m = re.exec(s))) {
    const before = s.slice(Math.max(0, m.index - 8), m.index);
    if (/째|격주|경우|다음\s*날|익일/.test(before)) continue;
    if (m[2]) out.add(map[m[2]]);
    out.add(map[m[3]]);
  }
  return [...out].sort();
}
export function parseFee(s) {
  s = clean(s);
  if (!s) return null;
  const nums = [...s.matchAll(/([\d,]{3,})\s*원/g)].map(m => Number(m[1].replace(/,/g, ''))).filter(n => n > 0 && n < 200000);
  if (/무료/.test(s) && !nums.length) return 0;
  // 아이 요금을 먼저 찾아요 (어린이 → 유아 → 청소년 순)
  for (const w of ['어린이|소인|아동|소아', '유아', '청소년']) {
    const kid = s.match(new RegExp(`(${w})[^0-9]{0,15}([\\d,]{3,})\\s*원`));
    if (kid) return Number(kid[2].replace(/,/g, ''));
  }
  if (nums.length) return Math.min(...nums);
  if (/무료/.test(s)) return 0;
  return null;
}
export function parseMenuPrice(s) {
  const nums = [...clean(s).matchAll(/([\d,]{4,})\s*원/g)].map(m => Number(m[1].replace(/,/g, ''))).filter(n => n >= 3000 && n < 100000);
  return nums.length ? Math.min(...nums) : 0;
}
export function parseStay(s) {
  s = clean(s);
  if (!s) return 0;
  let m = s.match(/(\d+(?:\.\d+)?)\s*(?:~\s*(\d+(?:\.\d+)?))?\s*시간/);
  if (m) return clampStay(Math.round(((Number(m[1]) + Number(m[2] || m[1])) / 2) * 60));
  m = s.match(/(\d+)\s*(?:~\s*(\d+))?\s*분/);
  if (m) return clampStay(Math.round((Number(m[1]) + Number(m[2] || m[1])) / 2));
  return 0;
}

/* ---------- 작은 도우미 ---------- */
function clampStay(n) { return Math.max(30, Math.min(150, n)); }
function guessIndoor(name, overview, typeId) {
  if (hasAny(name, INDOOR_WORDS)) return true;
  if (hasAny(name, OUTDOOR_WORDS)) return false;
  if (typeId === '14') return true; // 문화시설은 대부분 실내
  return hasAny(overview, INDOOR_WORDS) && !hasAny(overview, OUTDOOR_WORDS);
}
function yes(s) { s = clean(s); return !!s && !/불가|없음|안\s*됨|불가능|^x$/i.test(s) && /가능|있음|대여|무료|유료|주차|O|운영|\d/.test(s); }
function pick(o, keys) { for (const k of keys) { if (o && typeof o[k] === 'string' && clean(o[k])) return o[k]; } return ''; }
function lowerKeys(o) { const r = {}; Object.keys(o || {}).forEach(k => r[k.toLowerCase()] = typeof o[k] === 'string' ? o[k] : String(o[k] ?? '')); return r; }
export function clean(s) {
  return String(s ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function hasAny(s, words) { s = String(s || ''); return words.some(w => s.includes(w)); }
function countAny(s, words) { s = String(s || ''); return words.reduce((a, w) => a + (s.includes(w) ? 1 : 0), 0); }
function httpsImg(u) { return u ? u.replace(/^http:\/\//, 'https://') : ''; }
function round6(n) { return Math.round(n * 1e6) / 1e6; }
function pt(it) { return {lat: Number(it.mapy), lng: Number(it.mapx)}; }
function km(a, b) { const R = 6371, t = x => x * Math.PI / 180; const dl = t(b.lat - a.lat), dn = t(b.lng - a.lng); const x = Math.sin(dl / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
