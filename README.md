# 오늘 뭐 먹지 (lunchpick)

단톡방에서 점심 메뉴를 30초 만에 정하는 그룹 투표 미니앱.

> 앱인토스 바이브코딩 챌린지(2026년 6월 · 주제: 일상이 편해지는 순간) 출품작.

---

## 1. 기능

| 기능 | 설명 |
|------|------|
| 방 만들기 | 후보 메뉴 2개 이상 입력 + 마감 시간 선택 → 6자리 방 코드 생성 |
| 방 참여 | 6자리 코드 입력으로 즉시 입장 |
| 1인 1표 투표 | 후보 선택 · 변경 · 취소 자유 (마감 전) |
| 실시간 결과 | 득표 막대 그래프로 현황 표시 |
| 마감 | 방장 직접 마감 또는 설정 시간 자동 마감 |
| 결과 확정 | 마감 시 1위 메뉴 강조 · 재투표 불가 |
| 최근 방 | 접속 이력 최대 5개 홈 화면 표시 |

**현재 한계 (Phase 1):** 방 데이터는 브라우저 localStorage에만 저장됩니다. 다기기 공유(실제 단톡방 공유 후 다른 기기에서 참여)는 백엔드 연동(Phase 2) 완료 후 동작합니다.

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

## 5. 제출 전 체크리스트

- [ ] `granite.config.ts` `brand.icon` URL 입력 완료
- [ ] `npm run build` 성공 + `lunchpick.ait` 생성 확인
- [ ] 샌드박스 앱에서 `intoss://lunchpick` 진입 확인
- [ ] 방 만들기 → 코드 표시 → 투표 → 마감 → 결과 흐름 정상
- [ ] 1인 1표 변경/취소 동작 확인
- [ ] 모바일 레이아웃 (iOS + Android)
- [ ] TDS 컴포넌트 라이트 모드 확인

---

## 6. AI-assisted / Vibe Coding Workflow

이 앱은 Claude 기반 AI 어시스턴트와 함께 기획 → 프롬프트 → 코드 생성 → 검증을 반복하는 바이브코딩 방식으로 개발됐습니다.

- Phase 0: 빌드 파이프라인 확립 (스캐폴드 + granite.config + `.ait` 빌드 검증)
- Phase 1: 핵심 UI 로컬 상태 — 방 생성, 참여, 투표, 결과 화면 (localStorage 기반)
- Phase 2 (예정): 백엔드 연동 — 실제 다기기 공유, 3~5초 폴링 실시간 결과
