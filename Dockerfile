# ==========================================
# Stage 1: 의존성 설치
# ==========================================
FROM node:20-alpine AS deps

# 필수 라이브러리 설치 (네이티브 의존성을 위한)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# Stage 2: 빌드 단계
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정 (빌드 시 필요한 경우)
# ENV NEXT_TELEMETRY_DISABLED=1

# Next.js 빌드 실행
RUN npm run build

# ==========================================
# Stage 3: 프로덕션 실행 이미지
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 파일 권한 설정
RUN chown -R nextjs:nodejs /app

# non-root 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "server.js"]

