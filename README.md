# 오늘 뭐 먹지 (lunchpick)

단톡방에서 점심 메뉴를 30초 만에 정하는 그룹 투표 미니앱.

> 앱인토스 바이브코딩 챌린지(2026년 6월 · 주제: 일상이 편해지는 순간) 출품작.

---

## 1. 소개

- 방 생성 후 6자리 코드를 공유하면 누구나 참여 가능
- 1인 1표 투표로 메뉴 결정
- 결과는 실시간(폴링)으로 확인
- 앱인토스 WebView 미니앱 (React 18 + Vite + TDS Mobile)

---

## 2. 개발 실행

```bash
npm install --include=dev
npm run dev
# → http://localhost:5173
```

> 앱인토스 샌드박스 앱에서 전체 브릿지 기능 테스트가 필요할 때는:
> `npm run dev:granite`

---

## 3. 빌드

```bash
npm run build
# → dist/ 에 웹 번들 생성
# → lunchpick.ait 번들 생성 (콘솔 업로드용)
```

빌드 산출물:
- `dist/` — Vite 빌드 결과 + RN 번들
- `lunchpick.ait` — 앱인토스 콘솔 제출용 번들 (git 미추적)

---

## 4. 앱인토스 콘솔 등록값

| 항목 | 값 |
|------|-----|
| appName | `lunchpick` |
| 앱 이름 (displayName) | `오늘 뭐 먹지` (중복 시: `점심픽`) |
| icon | 콘솔 업로드 후 URL → `granite.config.ts` `brand.icon` 에 입력 |
| 딥링크 | `intoss://lunchpick` |

---

## 5. 제출 전 체크리스트 (초안)

- [ ] `granite.config.ts` `brand.icon` URL 입력 완료
- [ ] `npm run build` 성공 + `lunchpick.ait` 생성 확인
- [ ] 샌드박스 앱에서 `intoss://lunchpick` 진입 확인
- [ ] 홈 화면 표시 정상 확인 (타이틀 + 버튼 2개)
- [ ] 방 만들기 / 방 참여 기능 동작 확인 (Phase 1)
- [ ] 투표 / 결과 화면 동작 확인 (Phase 1)
- [ ] 모바일 레이아웃 확인 (iOS + Android)
- [ ] TDS 컴포넌트 라이트 모드 확인
- [ ] 앱인토스 콘솔 비게임 출시 체크리스트 통과

---

## 6. AI-assisted / Vibe Coding Workflow

이 앱은 Claude 기반 AI 어시스턴트와 함께 기획 → 프롬프트 → 코드 생성 → 검증을 반복하는 바이브코딩 방식으로 개발됐습니다.

Phase 0: 빌드 파이프라인 확립 (스캐폴드 + granite.config + `.ait` 빌드 검증)  
Phase 1 (예정): 핵심 기능 — 방 생성, 참여, 투표, 결과 화면
