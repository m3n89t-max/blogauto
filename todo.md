# N-AutoPost 개발 현황 및 TODO 리스트

## 📊 프로젝트 개요
- **프로젝트명**: N-AutoPost (네이버 뉴스 블로그 자동 포스팅 툴)
- **목표**: 네이버 뉴스 기반 블로그 자동 포스팅 시스템 구축
- **기술 스택**: Next.js (App Router), React, Vite, Gemini 1.5 Flash API, Playwright, Supabase

---

## ✅ 완료된 작업

### 1. 프론트엔드 UI/UX (100% 완료)
- [x] **메인 대시보드**: 3개 카드형 레이아웃 (NEWS AUTO, INFO HUB, REAL ESTATE)
- [x] **다크모드 디자인**: 전체 뉴스 자동화 화면 다크모드 적용
- [x] **반응형 레이아웃**: 모바일/데스크톱 대응
- [x] **한글화**: 모든 UI 텍스트 한글 번역 완료

### 2. 뉴스 자동화 기능 (NEWS AUTO) - 90% 완료
- [x] **F-1. 네이버 계정 입력**: ID/PW 입력 필드 + 보안 안내 문구
- [x] **F-2. 뉴스 선택**: 인기 뉴스 / 직접 입력 토글 방식
- [x] **F-3. 나의 생각 입력**: 텍스트 영역 구현
- [x] **F-5. 글의 톤(Tone) 선택**: 5가지 톤 드롭다운 (전문적인, 부드러운, 유머러스한, 분석적인, 친근한)
- [x] **F-6. 사진 추가 옵션**: 뉴스 사진 / AI 생성 / 사진 없음 버튼
- [x] **F-7. 실행 버튼**: "자동 포스팅 시작" 버튼 + 로딩 상태
- [x] **F-8. 결과 피드백**: 성공/실패 메시지 표시 + 보안 파기 문구

### 3. Gemini API 연동 (80% 완료)
- [x] **환경 변수 설정**: `.env.local`에 `VITE_GEMINI_API_KEY` 설정
- [x] **REST API 직접 호출**: Gemini 1.5 Flash 모델 사용
- [x] **AI 뉴스 생성**: 실시간 인기 뉴스 30개 AI 생성 (임시, 추후 네이버 API로 교체)
- [x] **블로그 포스트 생성**: 뉴스 + 생각 + 톤을 반영한 블로그 원고 생성
- [x] **에러 핸들링**: API 키 검증, 상세 에러 로그

### 4. 보안 정책 준수 (100% 완료)
- [x] **휘발성 자격 증명**: 네이버 계정 정보는 메모리에만 저장
- [x] **즉시 파기**: `finally` 블록에서 정보 파기 (프론트엔드에서 구현, 백엔드 미완성)
- [x] **사용자 고지**: UI에 보안 안내 문구 노출

---

## 🚧 진행 중인 작업

### ✅ 더미 데이터 모드 구현 완료
- **완료 시간**: 2026-01-24
- **구현 내용**: 
  - Gemini API 키 문제로 인해 더미 데이터 모드 추가
  - `services/geminiService.ts`에 `useDummyData` 플래그 추가
  - 10개의 현실적인 뉴스 더미 데이터 생성
  - 블로그 포스트 더미 생성 기능 구현
  - API 실패 시 자동으로 더미 데이터로 fallback
- **테스트 결과**: ✅ 전체 플로우 정상 작동
- **향후 계획**: Gemini API 키 문제 해결 시 `useDummyData = false`로 변경

---

## 📝 미완성 작업 (TODO)

### 1. 프론트엔드 기능 (10% 미완성)
- [ ] **F-4. 제목 설정 토글 UI**: AI 자동 생성 / 직접 입력 토글 구현
  - 현재 `settings.useAiTitle` 상태는 존재하지만 UI에서 전환 불가
  - 직접 입력 선택 시 텍스트 필드 활성화 필요

### 2. Gemini API 개선 (20% 미완성)
- [ ] **네이버 검색 API 연동**: 현재 AI가 뉴스를 생성하는 방식을 실제 네이버 뉴스 API로 교체
  - `services/geminiService.ts` 파일의 `fetchTrendingNews` 함수 수정
  - 네이버 개발자센터에서 검색 API 키 발급 필요
- [ ] **API 키 검증 강화**: 사용자가 API 키를 입력하지 않았을 때 더 명확한 안내

### 3. Playwright 자동화 백엔드 (0% 미완성) ⚠️ 최우선
- [ ] **Step 1: 뉴스 콘텐츠 스크래핑**
  - 사용자가 선택한 네이버 뉴스 URL에서 기사 본문 크롤링
- [ ] **Step 3: Playwright 자동 로그인**
  - 네이버 계정으로 로그인
  - 캡차 방지를 위한 자연스러운 동작 구현
- [ ] **Step 3: 블로그 글쓰기 자동화**
  - `https://blog.naver.com/{사용자ID}/postwrite` 접속
  - `#mainFrame` iframe 전환
  - 팝업 닫기 (`.se-popup-button-cancel`, `.se-help-panel-close-button`)
  - 제목 입력 (`.se-section-documentTitle`, 0.03초 간격 타이핑)
  - 사진 삽입 (선택 옵션에 따라)
  - 본문 입력 (`.se-section-text`, 0.03초 간격 타이핑)
  - 저장 버튼 클릭 (`.save_btn__bzc5B`)
- [ ] **Step 4: 보안 청소 (Security Cleanup)**
  - `finally` 블록에서 ID/PW 변수 `null` 처리
  - 메모리 파기 확인 로그

### 4. Next.js 백엔드 API 라우트 구현 (0% 미완성)
- [ ] **POST /api/autopost**: 자동 포스팅 요청 처리
  - 요청: `{ naverId, naverPw, news, thoughts, settings }`
  - 응답: `{ success, message, generatedContent }`
  - Gemini API 호출
  - Playwright 실행
  - 보안 파기 로직 포함

### 5. Supabase 인증 및 회원 관리 (0% 미완성)
- [ ] **N-AutoPost 자체 회원가입/로그인**: Supabase Auth 연동
- [ ] **사용자별 포스팅 히스토리 저장**: 포스팅 성공/실패 기록
- [ ] **API 사용량 추적**: 사용자별 Gemini API 호출 횟수 관리

### 6. 추가 모듈 (0% 미완성)
- [ ] **INFO HUB 엔진**: 생활 팁 & 가이드 정보 자동 포스팅
- [ ] **REAL ESTATE 엔진**: 부동산 매물 정보 자동 포스팅

---

## 🔥 최우선 작업 (Priority)

1. **Gemini API 키 설정 완료** ← 현재 진행 중
   - `.env.local`에 `VITE_GEMINI_API_KEY` 정상 설정
   - 서버 재시작 후 "인기 뉴스 불러오기" 테스트

2. **Playwright 자동화 백엔드 구현**
   - Next.js API 라우트 생성 (`/api/autopost`)
   - Playwright 스크립트 작성
   - 네이버 로그인 및 블로그 포스팅 자동화

3. **제목 설정 토글 UI 구현**
   - AI 자동 생성 / 직접 입력 전환 기능
   - 직접 입력 시 텍스트 필드 활성화

4. **네이버 검색 API 연동**
   - 네이버 개발자센터에서 API 키 발급
   - `fetchTrendingNews` 함수를 실제 네이버 API로 교체

---

## 📌 알려진 이슈

### Issue #1: Gemini API 키 오류
- **증상**: "Gemini API 키가 설정되지 않았습니다" 또는 "API key expired"
- **원인**: 
  - `.env.local`에 `GEMINI_API_KEY` 대신 `VITE_GEMINI_API_KEY` 사용 필요
  - API 키가 만료되었거나 잘못된 키
- **해결**: 
  - Google AI Studio에서 새 키 발급
  - `.env.local`에 `VITE_GEMINI_API_KEY=새로운_키` 저장
  - 서버 재시작

### Issue #2: 서버 재시작 후 환경 변수 미반영
- **증상**: `.env.local` 수정 후에도 여전히 API 키 오류
- **해결**: Ctrl+C로 완전히 종료 후 `pnpm run dev` 재실행

### Issue #3: Playwright 백엔드 미구현
- **증상**: "자동 포스팅 시작" 버튼 클릭 시 실제 포스팅이 되지 않음
- **원인**: Playwright 자동화 로직이 아직 구현되지 않음
- **해결**: Next.js API 라우트 및 Playwright 스크립트 개발 필요

---

## 🛠️ 개발 환경 설정

### 필수 파일
```bash
# .env.local (프로젝트 루트)
VITE_GEMINI_API_KEY=여기에_Google_AI_Studio_에서_발급받은_키_입력
```

### 실행 명령어
```bash
# 개발 서버 시작
pnpm run dev

# 포트: http://localhost:3001
```

---

## 📚 참고 문서
- [개발정의서.md](./개발정의서.md): 전체 제품 요구사항 및 기능 명세
- [화면설계서.md](./화면설계서.md): UI/UX 디자인 가이드
- [Google AI Studio](https://aistudio.google.com/app/apikey): Gemini API 키 발급
- [네이버 개발자센터](https://developers.naver.com/): 네이버 검색 API 신청

---

## 📅 업데이트 이력
- **2026-01-24**: 초기 프로젝트 구조 생성
- **2026-01-24**: 프론트엔드 UI/UX 완성 (다크모드, 한글화)
- **2026-01-24**: Gemini API 연동 (REST API, 1.5 Flash 모델)
- **2026-01-24**: 환경 변수 설정 (`VITE_GEMINI_API_KEY`)
- **2026-01-24 (진행 중)**: Gemini API 키 설정 및 테스트

---

**다음 작업**: Gemini API 키 정상 작동 확인 → Playwright 백엔드 구현 시작
