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

## 일기·대화 분석 (Claude API)

`#/diary` 화면에서 오늘 기록을 적으면 Claude가 관심사·노는 방식·조심할 것을 뽑아 취향 점수에 섞습니다.

- **서버**: `api/analyze.js` (Vercel 서버리스 함수). `ANTHROPIC_API_KEY`는 여기서만 읽고 브라우저로는 절대 안 나갑니다.
- **로컬 개발**: `vite.config.js`의 미들웨어가 `/api/*`를 `api/*.js`로 연결하므로 `npm run dev`만으로 동작합니다. `.env`에 `ANTHROPIC_API_KEY=`를 넣으세요.
- **키가 없으면**: 서버가 503을 주고 클라이언트가 키워드 기반 간단 분석(`localAnalyze`)으로 넘어갑니다. 데모가 멈추지 않습니다.
- **연령 분기**: 4~6세는 부모 관찰 기록(행동 신호), 7~9세는 아이가 쓴 글·대화(감정 신호)로 프롬프트가 달라집니다 (`src/lib/analysis.js`).
- **반영 규칙**: `새 점수 = 0.7 × 기존 + 0.3 × 신호`, 언급된 태그만. 원문·분석 결과는 `S.diary`에 쌓입니다.

Vercel 배포 시 프로젝트 환경변수에 `ANTHROPIC_API_KEY`와 `VITE_KAKAO_MAP_KEY`를 넣고, 카카오 콘솔 사이트 도메인에 배포 주소를 추가하세요.

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
  analyze.js          Vercel 서버리스: Claude로 일기 분석
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
- 실제 장소 데이터 (한국관광공사 TourAPI), 날씨 연동
