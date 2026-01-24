# N-AutoPost

> 네이버 뉴스 블로그 자동 포스팅 툴

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📖 프로젝트 개요

**N-AutoPost**는 반복적인 네이버 블로그 포스팅 작업을 자동화하여, 콘텐츠 크리에이터가 글감 발굴과 핵심 아이디어 구상에만 집중할 수 있도록 돕는 생산성 툴입니다.

### 핵심 기능

- 🤖 **AI 기반 콘텐츠 생성**: Google Gemini API를 활용한 블로그 포스트 자동 생성
- 📰 **실시간 인기 뉴스**: 더미 데이터 모드로 뉴스 목록 제공 (추후 네이버 뉴스 API 연동 예정)
- 🎨 **다양한 작성 스타일**: 전문적인 / 부드러운 / 유머러스한 / 분석적인 / 친근한 톤 선택
- 🖼️ **사진 옵션**: 뉴스 사진 / AI 생성 이미지 / 사진 없음
- 🔒 **보안 우선**: 계정 정보는 메모리에 일시적으로만 저장되며 작업 완료 즉시 파기
- 📱 **반응형 UI**: 모던하고 직관적인 다크 모드 인터페이스

## 🚀 시작하기

### 요구 사항

- Node.js 18.0 이상
- pnpm (권장) 또는 npm

### 설치

```bash
# 저장소 클론
git clone https://github.com/m3n89t-max/blogauto.git
cd blogauto

# 의존성 설치
pnpm install
# 또는
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

> **참고**: Google AI Studio (https://aistudio.google.com/apikey)에서 무료 API 키를 발급받을 수 있습니다.

### 개발 서버 실행

```bash
pnpm run dev
# 또는
npm run dev
```

브라우저에서 http://localhost:3001을 열어 앱을 확인하세요.

## 📁 프로젝트 구조

```
n-autopost/
├── src/
│   ├── services/
│   │   ├── geminiService.ts          # Gemini API 통신
│   │   ├── mcpBlogAutomation.ts      # MCP 브라우저 자동화
│   │   └── naverBlogAutomationComplete.ts  # 완전 자동화 로직
│   ├── types.ts                       # TypeScript 타입 정의
│   ├── App.tsx                        # 메인 앱 컴포넌트
│   └── main.tsx                       # 앱 엔트리 포인트
├── public/
├── 개발정의서.md                       # 제품 요구사항 정의서 (PRD)
├── 화면설계서.md                       # UI/UX 설계 문서
├── todo.md                            # 작업 진행 상황
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 기술 스택

### Frontend
- **React 18.3** - UI 라이브러리
- **TypeScript 5.5** - 정적 타입 검사
- **Vite 5.4** - 빌드 도구 및 개발 서버
- **Tailwind CSS 3.4** - 유틸리티 기반 CSS 프레임워크

### AI & Automation
- **Google Gemini 2.5 Pro API** - AI 언어 모델
- **Playwright** - 브라우저 자동화 (MCP 연동)

### Backend (예정)
- **Next.js API Routes** - 서버리스 함수
- **Supabase** - 데이터베이스 및 인증

## 🔒 보안 정책

본 프로젝트의 가장 중요한 원칙은 **사용자의 네이버 계정 정보 보호**입니다.

1. **휘발성 자격 증명**: 사용자가 입력한 네이버 ID와 비밀번호는 서버 데이터베이스에 절대 저장되지 않습니다.
2. **즉시 파기 원칙**: 블로그 발행 프로세스가 성공하든 실패하든, 작업이 종료되는 즉시 메모리에서 완전히 파기됩니다.
3. **사용자 고지**: UI 상에서 계정 정보가 저장되지 않음을 명확히 안내합니다.

## 📝 개발 상태

### ✅ 완료된 기능
- [x] 메인 대시보드 UI
- [x] 뉴스 자동화 페이지 (다크 모드)
- [x] 네이버 계정 입력 폼
- [x] 인기 뉴스 불러오기 (더미 데이터)
- [x] AI 블로그 포스트 생성 (Gemini API)
- [x] 작성 옵션 (톤, 사진 옵션)
- [x] 콘텐츠 미리보기
- [x] 자동 스크롤 및 UX 개선

### 🚧 진행 중
- [ ] Playwright 자동화 완성 (0.03초 간격 타이핑)
- [ ] 실제 네이버 뉴스 API 연동
- [ ] Next.js API 라우트 구현

### 📋 예정
- [ ] Supabase 인증 시스템
- [ ] INFO HUB 엔진 개발
- [ ] REAL ESTATE 엔진 개발
- [ ] 프로덕션 배포

## 🤝 기여하기

프로젝트 개선을 위한 Pull Request를 환영합니다!

1. 이 저장소를 포크합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📧 문의

프로젝트 관련 문의사항은 GitHub Issues를 통해 남겨주세요.

---

**N-AutoPost v3.0** - Premium AI Suite © 2026
