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
| 실시간 결과 | 4초 폴링으로 다기기 투표 현황 동기화 |
| 마감 | 방장 직접 마감 또는 설정 시간 자동 마감 |
| 결과 확정 | 마감 시 1위 메뉴 강조 · 재투표 불가 |
| 최근 방 | 접속 이력 최대 5개 홈 화면 표시 |

---

## 2. 로컬 개발 (프론트 + 백엔드 함께 실행)

### 방법 A — 동시 실행 (권장)

```bash
# 루트에서 한 번에 실행
npm install --include=dev
npm run dev:all
# 프론트: http://localhost:5173
# 백엔드: http://localhost:8787
```

### 방법 B — 터미널 두 개로 분리

**터미널 1 (백엔드):**
```bash
cd server
npm install
node index.js
# → http://0.0.0.0:8787
```

**터미널 2 (프론트):**
```bash
# 루트 디렉토리에서
npm install --include=dev
npm run dev
# → http://localhost:5173
```

### 환경 변수

`.env.example`을 복사해서 `.env`로 사용:
```bash
cp .env.example .env
```

기본값 (`VITE_API_BASE=http://localhost:8787`)은 로컬 개발에 그대로 사용 가능합니다.

---

## 3. 같은 LAN의 다른 기기에서 다기기 테스트

1. PC에서 백엔드를 `node server/index.js`로 기동 (0.0.0.0:8787 바인딩).
2. PC의 로컬 네트워크 IP 확인 (`ip addr` 또는 `ifconfig`).
3. 프론트를 `VITE_API_BASE=http://<PC-LAN-IP>:8787 npm run dev`로 실행.
4. 다른 기기(스마트폰 등) 브라우저에서 `http://<PC-LAN-IP>:5173` 접속.
5. 방 코드를 공유하면 두 기기 모두 동일한 투표 현황이 4초 이내에 동기화됩니다.

> `<PC-LAN-IP>`는 실제 PC의 로컬 네트워크 IP로 교체하세요 (`ipconfig`/`ifconfig`로 확인되는 PC의 사설 IP).

---

## 4. 빌드

### 로컬 빌드 (개발 확인용)

```bash
npm run build
# → dist/ 에 웹 번들 생성
# → lunchpick.ait 번들 생성 (콘솔 업로드용)
```

빌드 산출물:

- `dist/` — Vite 빌드 결과 + RN 번들
- `lunchpick.ait` — 앱인토스 콘솔 제출용 번들 (git 미추적)

### 운영 빌드 (.ait 콘솔 제출용)

공개 HTTPS API 가 준비된 상태에서 `VITE_API_BASE` 를 지정해 빌드합니다.

```bash
# 공개 HTTPS API URL 을 환경변수로 주입해 빌드
VITE_API_BASE=https://<your-public-api-host> npm run build
# → dist/ + lunchpick.ait 생성 (운영 API URL baked-in)
```

또는 `.env.production` 파일을 생성(git 미추적)해 사용할 수도 있습니다:

```bash
echo "VITE_API_BASE=https://<your-public-api-host>" > .env.production
npm run build
```

**제출 전 체크리스트** (운영 빌드 → 실폰 검증 → 콘솔 업로드):

- [ ] 로컬 개발 (`npm run dev:all`) 에서 기본 흐름 정상 확인
- [ ] 공개 HTTPS API 동작 확인 (POST/GET `/api/rooms` 정상 응답)
- [ ] `VITE_API_BASE=https://<your-public-api-host> npm run build` 성공 → `lunchpick.ait` 생성
- [ ] 앱인토스 콘솔에 `.ait` 업로드
- [ ] "테스트하기" QR 로 실폰 진입
- [ ] 실폰에서 방 생성 → 코드 공유 → 참여 → 투표 → 마감 → 결과 확인
- [ ] 다기기 동기화 (4초 폴링) 정상 확인
- [ ] 검토 요청 제출

---

## 5. 앱인토스 콘솔 등록값

| 항목 | 값 |
|------|-----|
| appName | `lunchpick` |
| 앱 이름 (displayName) | `오늘 뭐 먹지` (중복 시: `점심픽`) |
| icon | 콘솔 업로드 후 URL → `granite.config.ts` `brand.icon` 에 입력 |
| 딥링크 | `intoss://lunchpick` |

---

## 6. 제출 전 체크리스트

- [ ] `granite.config.ts` `brand.icon` URL 입력 완료
- [ ] 로컬 테스트 (`npm run dev:all`) 에서 기본 흐름 정상 확인
- [ ] 공개 HTTPS API 준비 완료 (POST/GET `/api/rooms` 응답 확인)
- [ ] `VITE_API_BASE=https://<your-public-api-host> npm run build` → `lunchpick.ait` 생성
- [ ] 앱인토스 콘솔에 `.ait` 업로드
- [ ] "테스트하기" QR 로 실폰 진입 확인 (`intoss://lunchpick`)
- [ ] 실폰에서 방 생성 → 코드 공유 → 참여 → 투표 → 마감 → 결과 흐름 정상
- [ ] 1인 1표 변경/취소 동작 확인
- [ ] 다기기 동기화 테스트 (단톡방 코드 공유 → 다른 기기에서 참여 → 투표 동기화)
- [ ] 모바일 레이아웃 (iOS + Android)
- [ ] TDS 컴포넌트 라이트 모드 확인
- [ ] 검토 요청 제출

---

## 7. AI-assisted / Vibe Coding Workflow

이 앱은 Claude 기반 AI 어시스턴트와 함께 기획 → 프롬프트 → 코드 생성 → 검증을 반복하는 바이브코딩 방식으로 개발됐습니다.

- Phase 0: 빌드 파이프라인 확립 (스캐폴드 + granite.config + `.ait` 빌드 검증)
- Phase 1: 핵심 UI 로컬 상태 — 방 생성, 참여, 투표, 결과 화면 (localStorage 기반)
- Phase 2: 최소 백엔드 + 폴링 — Node.js/Express in-memory API, 4초 폴링 다기기 동기화
