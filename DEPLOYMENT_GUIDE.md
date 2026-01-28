# 🚀 N-AutoPost 배포 가이드

## 📋 목차
1. [개요](#개요)
2. [백엔드 배포 (Render.com)](#백엔드-배포-rendercom)
3. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 확인](#배포-확인)

---

## 개요

N-AutoPost는 **프론트엔드**와 **백엔드**를 분리하여 배포합니다:

- **프론트엔드** (Vite + React): **Vercel**에 배포
- **백엔드** (Express + Playwright): **Render.com**에 배포

---

## 백엔드 배포 (Render.com)

### Step 1: Render 계정 생성
1. [Render.com](https://render.com)에 가입
2. GitHub 계정으로 로그인

### Step 2: 새 Web Service 생성
1. Dashboard에서 **"New +"** → **"Web Service"** 클릭
2. GitHub 저장소 연결: `m3n89t-max/blogauto` 선택
3. 설정 입력:
   ```
   Name: n-autopost-backend
   Region: Singapore
   Branch: main
   Runtime: Node
   Build Command: npm install && npx playwright install chromium
   Start Command: npm run start:server
   Plan: Free
   ```

### Step 3: 환경 변수 설정
"Environment" 섹션에서 다음 변수 추가:
```
NODE_ENV=production
PORT=3002
```

### Step 4: 배포 시작
- **"Create Web Service"** 클릭
- 배포 완료까지 5-10분 소요
- 배포 완료 후 URL 복사 (예: `https://n-autopost-backend.onrender.com`)

### ⚠️ 주의사항
- **Free Plan 제약**:
  - 15분 미사용 시 자동 sleep
  - 첫 요청 시 30초 정도 wake-up 시간 소요
  - 월 750시간 무료 (약 1달 운영 가능)

---

## 프론트엔드 배포 (Vercel)

### Step 1: Vercel 계정 생성
1. [Vercel.com](https://vercel.com)에 가입
2. GitHub 계정으로 로그인

### Step 2: 프로젝트 Import
1. **"Add New..." → "Project"** 클릭
2. GitHub 저장소 선택: `m3n89t-max/blogauto`
3. 설정 확인:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### Step 3: 환경 변수 설정
"Environment Variables" 섹션에서 다음 변수 추가:

```bash
# Gemini API Key
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here

# Backend API URL (Render에서 복사한 URL)
VITE_API_BASE_URL=https://n-autopost-backend.onrender.com
```

### Step 4: 배포
- **"Deploy"** 클릭
- 배포 완료 후 URL 확인 (예: `https://n-autopost.vercel.app`)

---

## 환경 변수 설정

### 로컬 개발 환경 (.env.local)
```bash
# .env.local (프로젝트 루트)
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:3002
```

### 프로덕션 환경

#### Vercel (프론트엔드)
```bash
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_API_BASE_URL=https://n-autopost-backend.onrender.com
```

#### Render (백엔드)
```bash
NODE_ENV=production
PORT=3002
```

---

## 배포 확인

### 1. 백엔드 Health Check
브라우저에서 접속:
```
https://your-backend-url.onrender.com/api/health
```

응답 예시:
```json
{
  "status": "ok",
  "message": "N-AutoPost Backend Server is running",
  "timestamp": "2026-01-28T12:00:00.000Z"
}
```

### 2. 프론트엔드 접속
```
https://n-autopost.vercel.app
```

### 3. 통합 테스트
1. 프론트엔드에서 "NEWS AUTO ENGINE" 진입
2. 네이버 계정 정보 입력
3. 인기 뉴스 불러오기
4. 미리보기 생성
5. 자동 포스팅 시작

---

## 🔧 트러블슈팅

### 문제 1: CORS 에러
**증상**: 
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**해결**:
1. `server/index.ts` 파일의 `allowedOrigins` 배열에 Vercel URL 추가
2. GitHub에 push
3. Render에서 자동 재배포 확인

### 문제 2: Playwright 실행 실패
**증상**:
```
browserType.launch: Executable doesn't exist
```

**해결**:
Render의 Build Command 확인:
```bash
npm install && npx playwright install chromium
```

### 문제 3: 백엔드 Sleep (Free Plan)
**증상**: 
첫 요청 시 30초 이상 소요

**해결**:
- 무료 플랜의 정상적인 동작입니다
- 유료 플랜($7/월)으로 업그레이드하면 즉시 응답

### 문제 4: 환경 변수 미적용
**증상**:
```
Gemini API 키가 설정되지 않았습니다
```

**해결**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. `VITE_GEMINI_API_KEY` 추가
3. Redeploy (Deployments → ... → Redeploy)

---

## 📊 배포 현황 체크리스트

- [ ] **백엔드 (Render)**
  - [ ] Web Service 생성 완료
  - [ ] `NODE_ENV=production` 설정
  - [ ] Playwright 설치 확인
  - [ ] Health check 응답 확인
  - [ ] CORS 설정에 Vercel URL 추가

- [ ] **프론트엔드 (Vercel)**
  - [ ] 프로젝트 Import 완료
  - [ ] `VITE_GEMINI_API_KEY` 설정
  - [ ] `VITE_API_BASE_URL` 설정 (Render URL)
  - [ ] 빌드 성공 확인
  - [ ] 웹사이트 접속 확인

- [ ] **통합 테스트**
  - [ ] 인기 뉴스 불러오기 동작
  - [ ] AI 블로그 포스트 생성 동작
  - [ ] 네이버 자동 발행 동작

---

## 💡 추가 팁

### 1. 비용 절감
- Render Free Plan: 월 750시간 (1개 서비스 24/7 운영 가능)
- Vercel Free Plan: 무제한 배포, 100GB 대역폭

### 2. 성능 최적화
- Render의 Region을 Singapore로 설정 (한국과 가장 가까움)
- Playwright headless 모드 사용 (프로덕션)

### 3. 모니터링
- Render Dashboard: 로그, 메트릭 확인
- Vercel Analytics: 트래픽, 성능 분석

---

## 🆘 추가 지원

문제 발생 시 GitHub Issues에 문의:
https://github.com/m3n89t-max/blogauto/issues

---

**N-AutoPost v3.0** - Premium AI Suite © 2026
