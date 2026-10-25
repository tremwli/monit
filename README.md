# 모닛 (MONIT)

아이(4~9세)의 취향을 기록할수록 더 잘 아는 가족 여행 플래너.
친구가 만든 단일 `index.html` MVP를 **Vite + React**로 옮긴 버전입니다. 화면·추천 로직·저장 방식은 원본과 같습니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
```

카카오 지도를 쓰려면 `.env.example`을 `.env`로 복사하고 `VITE_KAKAO_MAP_KEY`에 **JavaScript 키**를 넣으세요. 비워두면 그림 지도로 동작합니다.
(developers.kakao.com → 플랫폼 → Web → 사이트 도메인에 `http://localhost:5173`과 배포 주소를 등록해야 지도가 뜹니다. `.env`는 깃에 올라가지 않으니 팀원에게 키를 따로 전달하세요.)

## 실제 장소 데이터 (한국관광공사 TourAPI)

`src/data/places.json`이 있으면 앱이 자동으로 실제 장소를 쓰고, 없으면 샘플 18곳으로 동작합니다.

1. [공공데이터포털](https://www.data.go.kr)에서 활용신청
   - **한국관광공사_국문 관광정보 서비스_GW** (필수)
   - **한국관광공사_무장애 여행 정보_GW** (선택: 유모차·수유실·아기 의자 정보)
2. `.env`에 `TOUR_API_KEY=인증키(Decoding)` 추가. `VITE_`를 붙이지 않아서 브라우저로 나가지 않습니다.
3. 실행
   ```bash
   npm run fetch-places                                  # 기준점(HOME) 반경 20km
   npm run fetch-places -- --lat 37.5665 --lng 126.9780 --radius 15000
   npm run build-places                                  # 인터넷 없이 캐시로 다시 다듬기만
   ```
4. `npm run dev`를 다시 켜면 실제 데이터로 바뀝니다. 기준점이 앱의 집(HOME)이 됩니다.

- 응답은 `scripts/.cache`에 저장돼서 다시 실행해도 같은 요청은 보내지 않습니다(하루 호출 수 절약, 깃에는 안 올라감).
- 상세 정보는 아이와 갈 만한 곳만 추려서 받습니다(기본 놀거리 120곳 + 근처 식당 50곳, 약 500번 호출).
- 태그·카테고리·실내 판단 규칙은 `scripts/lib/transform.mjs` 맨 위 키워드 표에서 고칩니다.
- `places.json`을 깃에 올릴지는 팀에서 정하세요. 올리면 팀원 모두 키 없이 같은 데이터로 시연할 수 있습니다.

**추천 로직에 더한 것** (`src/lib/logic.js`)
- 운영시간·휴무일: 쉬는 날이면 빼고, 문 열기 40분 전까지는 기다렸다 들어가요.
- 편의시설: 데이터에 **없다고 적힌** 곳만 빼고, **정보가 없는** 곳은 남기되 점수를 조금 낮춰요.
- 근처 소아과·약국: 장소 시트에서 카카오 장소 검색(같은 JavaScript 키, `libraries=services`)으로 찾아요.
- 저장 공간: 샘플(`monit-mvp-v1`)과 실제 데이터(`monit-real-v1`)를 나눠서 예전 코스가 없는 장소를 가리키지 않아요.

장소 정보 출처: 한국관광공사 TourAPI. 화면 장소 시트 아래에 출처를 표시합니다.

## 일기·대화 분석 (Gemini API)

`#/diary` 화면에서 오늘 기록을 적으면 Gemini(Flash-Lite)가 관심사·노는 방식·조심할 것을 뽑아 취향 점수에 섞습니다.

- **서버**: `api/analyze.js` (Vercel 서버리스 함수). `GEMINI_API_KEY`는 여기서만 읽고 브라우저로는 절대 안 나갑니다.
- **로컬 개발**: `vite.config.js`의 미들웨어가 `/api/*`를 `api/*.js`로 연결하므로 `npm run dev`만으로 동작합니다. `.env`에 `GEMINI_API_KEY=`를 넣으세요.
- **키가 없으면**: 서버가 503을 주고 클라이언트가 키워드 기반 간단 분석(`localAnalyze`)으로 넘어갑니다. 데모가 멈추지 않습니다.
- **연령 분기**: 4~6세는 부모 관찰 기록(행동 신호), 7~9세는 아이가 쓴 글·대화(감정 신호)로 프롬프트가 달라집니다 (`src/lib/analysis.js`).
- **반영 규칙**: `새 점수 = 0.7 × 기존(없으면 0.5) + 0.3 × 신호`, 언급된 항목만. 원문·분석 결과는 `S.diary`에 쌓입니다.

## 배포 (Vercel)

정적 화면(Vite)과 `api/analyze.js`(Node 서버리스)가 한 프로젝트로 올라갑니다. `vercel.json`이 서울 리전(icn1)을 지정합니다.

1. https://vercel.com → **Add New… → Project** → GitHub에서 `tremwli/monit` Import (Framework: Vite 자동 인식)
2. **Environment Variables**에 세 개 입력 후 Deploy
   - `GEMINI_API_KEY` — 일기 분석 (없으면 키워드 간단 분석으로 동작)
   - `VITE_KAKAO_MAP_KEY` — 카카오 지도
   - `GEMINI_MODEL` — 선택
3. 배포 주소(예: `https://monit-xxx.vercel.app`)를 카카오 개발자 콘솔 → 플랫폼 → Web → 사이트 도메인에 추가 (안 하면 지도가 그림 지도로 뜸)
4. 이후 `main`에 푸시할 때마다 자동 배포. PR은 미리보기 주소가 따로 생김

CLI로 하려면: `npx vercel login` → `npx vercel --prod`

## 관심사 모델 (`src/lib/interests.js`)

취향은 두 층으로 나눕니다.

| 층 | 무엇 | 목록 | 근거 |
|---|---|---|---|
| 흥미 유형 | 어떻게 노는가: 알아가기·역할·상상 놀이·그리기·만들기·블록·조립·운동·춤·바깥 놀이·규칙 있는 놀이·책·이야기·배우고 익히기 | 고정 9개 (`a:키`) | Alexander, Johnson, Leibham & Kelley (2008), *Cognitive Development* 23의 아동 흥미 영역 (TV·라디오, 함께 놀기 제외) |
| 관심 주제 | 무엇에 빠졌는가: 공룡·소방차·우주·개미 … | 열린 목록 (낱말 그대로) | 일기 분석이 원문에서 뽑음. `SEED_TOPICS`는 같은 뜻을 묶는 사전일 뿐 |

- 장소마다 이름·분류·테마·소개글에서 유형과 주제를 뽑아(`profileOf`) 아이 점수와 맞춰 봅니다(`fitOf`). 사전에 없는 주제도 장소 글에 그 말이 나오면 맞는 것으로 봅니다.
- 일기에서 나온 노는 방식(실내·야외, 조용·북적, 직접 해보기·구경)과 조심할 것도 점수에 반영합니다(`scorePlace`).
- 예전 8개 태그(dino, draw …)로 저장된 데이터는 앱을 열 때 자동으로 옮겨집니다(`state.js`).

## 구조

```
src/
  main.jsx            진입점
  App.jsx             해시 라우팅 (#/home, #/c1 …) → 화면 선택
  store.jsx           전역 상태 Context: S(저장됨) / UI(임시) / set / setUI / reset
  app.css             원본 CSS 그대로
  lib/
    data.js           샘플 장소·관심사·편의시설·아이콘 (원본 그대로)
    logic.js          추천 점수·코스 생성 (원본 그대로, S를 인자로 받음)
    analysis.js       분석 프롬프트·스키마·키워드 폴백·취향 병합 (서버와 공유)
    ai.js             /api/analyze 호출 + 폴백
    state.js          기본값·localStorage 저장
    map.js            카카오 지도 / 그림 지도 폴백
    svg.js, utils.js  SVG 문자열, 포맷 함수
  components/ui.jsx   Chip, Seg, Switch, TabBar, StepHead, Thumb, Face, MapBox …
  views/              화면 하나당 파일 하나
    Start Home Course(C1~C5) Result Record My Kid MapView Community Calendar Diary
api/
  analyze.js          Vercel 서버리스: Gemini로 일기 분석
```

### 상태 다루는 법

```jsx
const {S, set, UI, setUI} = useStore();
set(S => { S.c.perDay = 3 });        // 저장되는 상태: 복사본을 고치면 저장 + 리렌더
setUI(u => { u.mapSel = 'p1' });     // 저장 안 되는 화면 상태
```

## 동작하는 기능 (원본과 동일)

| 기능 | 내용 |
|---|---|
| 시작 · 취향 고르기 | 이름·나이, 좋아하는 장소 유형 → 첫 취향 점수 |
| 코스 만들기 5단계 | 일정(시간 휠, 아이 일정), 장소, 함께·이동, 원하는 곳, 아이 맞춤 |
| 코스 결과 | 조건 필터 + 취향 점수로 시간표 계산. 낮잠 피하기, 점심, 며칠 여행(최대 3일) |
| 지도 | 추천 핀, 코스 경로 (카카오 지도 키 있으면 실제 지도) |
| 하루 기록 | 장소별 좋아했어요/시큰둥, 한 줄 기록, 사진 첨부 |
| 우리 아이 | 기록하면 취향 막대가 바뀌고 추천이 달라짐 |
| 아이 전용 | 아이가 고른 것과 직접 쓴 말이 취향에 반영 |

보기만 되는 화면: 커뮤니티, 알림, 검색, 말로 하기·그림 그리기, 아이 추가, 출발 위치 변경.

## 시연 순서 (1분)

1. 홈 → `코스 만들기 시작` → 5단계 그대로 `다음`
2. 결과: 지도 경로와 시간표, 낮잠 전 여유 시간
3. `다녀와서 기록하기` → 첫 장소를 **시큰둥했어요** → `순간 모으기`
4. 우리 아이: 해당 취향 막대가 내려가고 "요즘 시들해요"
5. 다시 코스 만들기 → 추천이 바뀜 → **"기록할수록 아이를 알아가는 여행"**

## 다음에 만들 것

- 4~6세 그림 2장 고르기, 7~9세 음성 녹음(대화) 입력
- 좋아할 확률 % 표시, 여행 결과지(유형 카드, 예상 vs 실제)
- 날씨 연동 (비 오면 실외 장소 점수 낮추기)
