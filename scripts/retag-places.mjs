#!/usr/bin/env node
/* 이미 받아둔 src/data/places.json 에 새 관심사 모델(areas·topics)을 다시 매긴다. 인터넷 안 씀.
   실행: npm run retag-places
   TourAPI를 다시 긁을 수 없을 때(키·캐시 없음) 쓰는 용도. 제대로 하려면 npm run fetch-places 가 전체 소개글과 분류코드로 매긴다. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {tagPlace} from './lib/transform.mjs';
import {LEGACY, isArea} from '../src/lib/interests.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src', 'data', 'places.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

let changed = 0;
const areaCount = {}, topicCount = {};
for (const p of data.places) {
  if (p.type !== 'play') { p.areas = []; p.topics = []; continue; }
  const t = tagPlace(p.name, p.cat3 || '', `${p.cat || ''} ${p.theme || ''} ${p.summary || ''}`);
  /* 글에서 아무것도 못 찾았을 때만 예전 8개 태그(ints)를 옮겨 담는다 (항공→기차 같은 옛 묶음이 섞이지 않게). 뛰어놀기는 실내면 운동, 밖이면 바깥 놀이 */
  for (const i of (t.areas.length || t.topics.length) ? [] : (p.ints || [])) {
    const r = LEGACY[i]; if (!r) continue;
    if (isArea(r)) { const a = r === 'a:outdoor' && p.indoor ? 'sport' : r.slice(2); if (!t.areas.includes(a)) t.areas.push(a); }
    else if (!t.topics.includes(r)) t.topics.push(r);
  }
  if (JSON.stringify(p.areas) !== JSON.stringify(t.areas) || JSON.stringify(p.topics) !== JSON.stringify(t.topics)) changed++;
  p.areas = t.areas; p.topics = t.topics;
  t.areas.forEach(a => areaCount[a] = (areaCount[a] || 0) + 1);
  t.topics.forEach(x => topicCount[x] = (topicCount[x] || 0) + 1);
}
data.retaggedAt = new Date().toISOString();
fs.writeFileSync(FILE, JSON.stringify(data, null, 1));
const play = data.places.filter(p => p.type === 'play');
console.log(`✅ ${FILE}`);
console.log(`   놀거리 ${play.length}곳 중 ${changed}곳 태그 갱신 · 유형 없음 ${play.filter(p => !p.areas.length).length}곳 · 주제 없음 ${play.filter(p => !p.topics.length).length}곳`);
console.log('   유형:', Object.entries(areaCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log('   주제:', Object.entries(topicCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
