#!/usr/bin/env node
/* 실제 장소 데이터 만들기 (한국관광공사 TourAPI → src/data/places.json)

   실행:  npm run fetch-places
          npm run fetch-places -- --lat 37.5665 --lng 126.9780 --radius 15000
          npm run fetch-places -- --maxPlay 1000 --maxMeal 150 --pages 10   (크게 받기, 호출 약 3,000번)
   다시 다듬기만(인터넷 안 씀): npm run build-places

   필요한 것: .env 에 TOUR_API_KEY=공공데이터포털 인증키(Decoding 키)
   - 한국관광공사_국문 관광정보 서비스_GW (KorService2)  ← 필수
   - 한국관광공사_무장애 여행 정보_GW (KorWithService2) ← 있으면 유모차·수유실·아기 의자 정보가 붙어요
   받은 응답은 scripts/.cache 에 저장해서, 같은 요청은 다시 보내지 않아요(하루 호출 횟수 아끼기).
   이 파일은 내 컴퓨터에서만 node로 실행해요. 키는 브라우저 코드에 들어가지 않아요. */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {transformAll, pickPlayCandidates, pickMealCandidates} from './lib/transform.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'scripts', '.cache');
const OUT = path.join(ROOT, 'src', 'data', 'places.json');

/* ---------- 설정 ---------- */
const args = parseArgs(process.argv.slice(2));
const CFG = {
  lat: Number(args.lat ?? 37.5340),      // 출발 기준점 (앱의 HOME이 이 값으로 바뀌어요)
  lng: Number(args.lng ?? 126.9940),
  radius: Math.min(20000, Number(args.radius ?? 20000)), // 미터, TourAPI 최대 20km
  maxPlay: Number(args.maxPlay ?? 120),  // 상세 정보를 받을 놀거리 수 (호출 수 = 약 3배)
  maxMeal: Number(args.maxMeal ?? 50),
  pages: Number(args.pages ?? 5),        // 목록 페이지 수 (한 페이지 100곳, 유형마다)
  minScore: Number(args.minScore ?? 0.6), // 후보 문턱 (낮출수록 많이 받음, 태그 없는 곳은 변환에서 걸러짐)
  offline: !!args.offline,               // true면 캐시만 사용
};
/* 여러 중심점으로 넓게 받기: --area sudogwon (수도권 10곳) 또는 --centers "37.5,127.0;37.3,127.1"
   TourAPI 반경 최대가 20km라 수도권 전체를 받으려면 중심점을 여러 개 돌아야 해요. 겹치는 곳은 contentid로 한 번만. */
const AREAS = {
  sudogwon: [[37.534, 126.994], [37.56, 126.80], [37.68, 127.07], [37.54, 127.17], [37.44, 127.13],
             [37.46, 126.70], [37.28, 127.03], [37.68, 126.80], [37.24, 127.18], [37.39, 126.93]],
};
CFG.centers = args.centers ? String(args.centers).split(';').map(x => x.split(',').map(Number)).filter(c => c.length === 2 && c.every(n => n))
            : AREAS[args.area] || [[CFG.lat, CFG.lng]];
const PLAY_TYPES = [12, 14, 28];          // 관광지, 문화시설, 레포츠
const MEAL_TYPE = 39;                     // 음식점

const KEY = readEnv().TOUR_API_KEY || process.env.TOUR_API_KEY || '';
if (!KEY && !CFG.offline) {
  fail(`.env 에 TOUR_API_KEY 가 없어요.
  1) https://www.data.go.kr 에서 "한국관광공사_국문 관광정보 서비스_GW" 활용신청
  2) 마이페이지 → 인증키(Decoding)를 복사
  3) .env 에 TOUR_API_KEY=복사한키  한 줄 추가 후 다시 실행`);
}

let calls = 0, cacheHits = 0, withServiceOff = false;

main().catch(e => fail(e.message));

async function main() {
  console.log(`
📍 기준점 ${CFG.lat}, ${CFG.lng} · 반경 ${CFG.radius / 1000}km · 중심점 ${CFG.centers.length}곳${CFG.offline ? ' · 캐시만 사용' : ''}
`);

  /* 1. 목록 모으기 (중심점마다) */
  const play = [], meals = [];
  for (const [lat, lng] of CFG.centers) {
    for (const t of PLAY_TYPES) play.push(...await listAll(t, CFG.pages, lat, lng));
    meals.push(...await listAll(MEAL_TYPE, CFG.pages, lat, lng));
    console.log(`  목록 · ${lat},${lng}: 놀거리 ${play.length} · 음식점 ${meals.length} (누적)`);
  }

  /* 2. 아이랑 갈 만한 곳만 추려서 상세 정보 받기 (호출 수 아끼기) */
  const playPick = pickPlayCandidates(play, CFG.minScore).slice(0, CFG.maxPlay);
  const mealPick = pickMealCandidates(meals, playPick, CFG.maxMeal);
  console.log(`\n  추린 놀거리 ${playPick.length}곳 · 식당 ${mealPick.length}곳 → 상세 정보 받는 중…`);

  const detailed = [];
  let i = 0;
  for (const it of [...playPick, ...mealPick]) {
    i++;
    if (i % 10 === 0) process.stdout.write(`  ${i}/${playPick.length + mealPick.length}\n`);
    const id = it.contentid, type = it.contenttypeid;
    const common = await detailCommon(id);
    const intro = await one('KorService2', 'detailIntro2', {contentId: id, contentTypeId: type});
    const bf = withServiceOff ? null : await barrierFree(id);
    detailed.push({list: it, common, intro, bf});
  }

  /* 3. 앱이 쓰는 모양으로 바꿔서 저장 */
  const places = transformAll(detailed);
  const out = {
    generatedAt: new Date().toISOString(),
    source: '한국관광공사 TourAPI (공공데이터포털)',
    center: {lat: CFG.lat, lng: CFG.lng},
    radius: CFG.radius,
    places,
  };
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

  const nPlay = places.filter(p => p.type === 'play').length;
  const nMeal = places.length - nPlay;
  console.log(`\n✅ 저장: src/data/places.json · 놀거리 ${nPlay}곳 · 식당 ${nMeal}곳`);
  console.log(`   API 호출 ${calls}번 · 캐시 사용 ${cacheHits}번${withServiceOff ? ' · 무장애 정보 없음(활용신청 안 됨)' : ''}`);
  console.log('   npm run dev 로 앱을 다시 켜면 실제 데이터로 바뀌어요.\n');
}

/* ---------- TourAPI 호출 ---------- */
async function listAll(contentTypeId, maxPages, lat = CFG.lat, lng = CFG.lng) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const body = await call('KorService2', 'locationBasedList2', {
      mapX: lng, mapY: lat, radius: CFG.radius, contentTypeId,
      arrange: 'E', numOfRows: 100, pageNo: page,
    });
    const items = asArray(body?.items?.item);
    out.push(...items);
    const total = Number(body?.totalCount || 0);
    if (!items.length || page * 100 >= total) break;
  }
  return out;
}

async function detailCommon(contentId) {
  // v2는 contentId만 받아요. 혹시 예전 방식만 되면 옵션을 붙여서 한 번 더 시도.
  let r = await one('KorService2', 'detailCommon2', {contentId}, true);
  if (r === undefined) r = await one('KorService2', 'detailCommon2', {contentId, defaultYN: 'Y', firstImageYN: 'Y', addrinfoYN: 'Y', mapinfoYN: 'Y', overviewYN: 'Y'}, true);
  return r || null;
}


async function barrierFree(contentId) {
  try {
    return await one('KorWithService2', 'detailWithTour2', {contentId}, true) || null;
  } catch (e) {
    return null;
  }
}


/* 결과 한 개만 필요한 상세 호출. quiet=true면 실패해도 undefined만 돌려줘요. */
async function one(service, op, params, quiet) {
  try {
    const body = await call(service, op, params);
    return asArray(body?.items?.item)[0] || null;
  } catch (e) {
    if (service === 'KorWithService2') {
      if (!withServiceOff) console.log('  ℹ️  무장애 여행 정보는 건너뛸게요 (활용신청이 안 됐거나 막혔어요). 유모차·수유실 정보 없이 진행해요.');
      withServiceOff = true;
      return null;
    }
    if (quiet) return undefined;
    throw e;
  }
}

async function call(service, op, params) {
  const q = {MobileOS: 'ETC', MobileApp: 'monit', _type: 'json', ...params};
  const sorted = Object.keys(q).sort().map(k => `${k}=${encodeURIComponent(q[k])}`).join('&');
  const file = path.join(CACHE, crypto.createHash('sha1').update(`${service}/${op}?${sorted}`).digest('hex') + '.json');
  if (fs.existsSync(file)) { cacheHits++; return JSON.parse(fs.readFileSync(file, 'utf8')); }
  if (CFG.offline) return null;

  // Decoding 키를 받는 게 기본. Encoding 키(%가 들어간 키)를 넣었으면 그대로 써요.
  const key = KEY.includes('%') ? KEY : encodeURIComponent(KEY);
  const url = `https://apis.data.go.kr/B551011/${service}/${op}?serviceKey=${key}&${sorted}`;
let res, text;

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    res = await fetch(url);
    text = await res.text();
    break;
  } catch (e) {
    console.error(`연결 시도 ${attempt + 1}/3 실패`);
    console.error("오류:", e.message);
    console.error("상세 원인:", e.cause);

    if (attempt === 2) throw e;
    await sleep(800);
  }
}
  calls++;
  await sleep(120); // 초당 호출 제한 피하기

  let json;
  try { json = JSON.parse(text); } catch {
    // 키 오류는 XML로 와요
    const msg = (text.match(/<returnAuthMsg>([^<]+)/) || text.match(/<resultMsg>([^<]+)/) || [])[1] || text.slice(0, 160);
    throw new Error(explain(msg, service));
  }
  const header = json?.response?.header;
  if (!header) throw new Error(explain(JSON.stringify(json).slice(0, 160), service));
  if (header.resultCode !== '0000') throw new Error(explain(`${header.resultCode} ${header.resultMsg}`, service));
  const body = json.response.body || {};
  fs.mkdirSync(CACHE, {recursive: true});
  fs.writeFileSync(file, JSON.stringify(body));
  return body;
}

function explain(msg, service) {
  const name = service === 'KorWithService2' ? '무장애 여행 정보' : '국문 관광정보 서비스';
  if (/SERVICE_KEY_IS_NOT_REGISTERED|등록되지 않은|^30\b/.test(msg)) return `[${name}] 인증키가 등록되지 않았대요. 활용신청 승인 후 1시간쯤 지나야 될 때가 있어요. (${msg})`;
  if (/LIMITED_NUMBER|^22\b/.test(msg)) return `[${name}] 오늘 호출 횟수를 다 썼어요. 내일 다시 실행하면 캐시 덕분에 이어서 받아요. (${msg})`;
  if (/SERVICE_ACCESS_DENIED|^20\b/.test(msg)) return `[${name}] 이 서비스에 대한 활용신청이 안 돼 있어요. (${msg})`;
  return `[${name}] ${msg}`;
}

/* ---------- 작은 도우미 ---------- */
function asArray(x) { return Array.isArray(x) ? x : x ? [x] : []; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fail(m) { console.error('\n❌ ' + m + '\n'); process.exit(1); }
function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const k = a[i].slice(2), v = a[i + 1];
    if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; }
  }
  return o;
}
function readEnv() {
  const o = {};
  for (const f of ['.env', '.env.local']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return o;
}
