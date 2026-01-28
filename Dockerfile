# Playwright 공식 이미지 사용 (Node.js + Chromium 포함)
FROM mcr.microsoft.com/playwright:v1.58.0-focal

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (tsx 포함)
RUN npm ci

# 애플리케이션 코드 복사
COPY . .

# TypeScript 컴파일 (필요시)
# RUN npm run build

# 포트 노출 (Render가 자동 할당하므로 명시적으로 필요 없음)
EXPOSE 3002

# 서버 시작
CMD ["npm", "run", "start:server"]
