# 모닛 (MONIT)

아이(4~9세)의 취향을 기록할수록 더 잘 아는 가족 여행 플래너.
친구가 만든 단일 `index.html` MVP를 **Vite + React**로 옮긴 버전입니다. 화면·추천 로직·저장 방식은 원본과 같습니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
```

네이버 지도를 쓰려면 `.env.example`을 `.env`로 복사하고 `VITE_NAVER_MAP_KEY`에 Client ID를 넣으세요. 비워두면 그림 지도로 동작합니다.
(네이버 클라우드 콘솔의 Web 서비스 URL에는 경로 없이 호스트만: `http://localhost:5173`, 배포 주소)

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
    state.js          기본값·localStorage 저장
    map.js            네이버 지도 / 그림 지도
    svg.js, utils.js  SVG 문자열, 포맷 함수
  components/ui.jsx   Chip, Seg, Switch, TabBar, StepHead, Thumb, Face, MapBox …
  views/              화면 하나당 파일 하나
    Start Home Course(C1~C5) Result Record My Kid MapView Community Calendar
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
| 지도 | 추천 핀, 코스 경로 (네이버 지도 키 있으면 실제 지도) |
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

- 4~6세 / 7~9세 입력 분기 (그림 고르기 / 대화·일기 입력)
- 일기·대화 → Claude 분석 → 관심사 태그 (API 키는 서버리스 함수에서만)
- 좋아할 확률 % 표시, 여행 결과지(유형 카드, 예상 vs 실제)
- 실제 장소 데이터 (한국관광공사 TourAPI), 날씨 연동
