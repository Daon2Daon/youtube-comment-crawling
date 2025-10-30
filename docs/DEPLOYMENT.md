# 🚀 Synology NAS Docker 배포 가이드

## 목차
1. [사전 준비](#1-사전-준비)
2. [로컬 환경 설정](#2-로컬-환경-설정)
3. [Docker 이미지 빌드](#3-docker-이미지-빌드)
4. [Synology NAS 준비](#4-synology-nas-준비)
5. [배포 실행](#5-배포-실행)
6. [모니터링 및 관리](#6-모니터링-및-관리)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비

### 1.1 필수 요구사항
- ✅ Synology NAS (DSM 7.0 이상 권장)
- ✅ Docker 패키지 설치 (Synology Package Center에서)
- ✅ YouTube Data API v3 키
- ✅ 충분한 저장 공간 (최소 2GB)

### 1.2 선택 사항
- 🌐 도메인 네임 (외부 접속 시)
- 🔒 SSL 인증서 (HTTPS 사용 시)
- 📦 Portainer (Docker 관리 UI)

---

## 2. 로컬 환경 설정

### 2.1 환경 변수 파일 생성

프로젝트 루트에서 `.env.production` 파일을 생성하세요:

```bash
cp .env.example .env.production
```

`.env.production` 파일을 열고 실제 값으로 수정:

```env
YOUTUBE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
NODE_ENV=production
TZ=Asia/Seoul
PORT=3000
HOSTNAME=0.0.0.0
```

> ⚠️ **보안 주의**: `.env.production` 파일은 Git에 커밋하지 마세요!

### 2.2 Next.js 설정 업데이트

`next.config.ts` 파일을 다음과 같이 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone 모드 활성화 (Docker 최적화)
  output: 'standalone',
  
  // 프로덕션 최적화
  swcMinify: true,
  
  // 환경 변수 설정
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
};

export default nextConfig;
```

---

## 3. Docker 이미지 빌드

### 3.1 방법 A: Docker Compose 사용 (권장)

```bash
# 프로젝트 루트에서 실행
docker-compose build

# 빌드 확인
docker images | grep youtube-comments
```

### 3.2 방법 B: Docker 직접 빌드

```bash
# 이미지 빌드
docker build -t youtube-comments-app:latest .

# 빌드 확인
docker images | grep youtube-comments
```

### 3.3 로컬 테스트 (선택사항)

```bash
# 컨테이너 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 브라우저에서 확인
# http://localhost:3000

# 테스트 후 중지
docker-compose down
```

---

## 4. Synology NAS 준비

### 4.1 Docker 패키지 설치

1. **Package Center** 열기
2. **Docker** 검색 및 설치
3. 설치 완료 후 Docker 앱 실행

### 4.2 Portainer 설치 (선택사항, 권장)

Portainer는 Docker를 GUI로 관리할 수 있는 강력한 도구입니다.

#### SSH로 Synology 접속:

```bash
ssh admin@your-synology-ip
```

#### Portainer 컨테이너 실행:

```bash
docker run -d \
  --name=portainer \
  --restart=always \
  -p 8000:8000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

#### 접속:
- URL: `https://your-synology-ip:9443`
- 초기 관리자 계정 생성

### 4.3 디렉토리 생성

Synology File Station 또는 SSH를 통해:

```bash
# Docker 프로젝트용 디렉토리 생성
mkdir -p /volume1/docker/youtube-comments
```

---

## 5. 배포 실행

### 5.1 파일 업로드

#### 방법 A: File Station 사용 (GUI)

1. File Station 열기
2. `/volume1/docker/youtube-comments` 이동
3. 다음 파일들 업로드:
   - `docker-compose.yml`
   - `.env.production`

#### 방법 B: SCP 사용 (CLI)

```bash
# 로컬 터미널에서 실행
scp docker-compose.yml admin@your-synology-ip:/volume1/docker/youtube-comments/
scp .env.production admin@your-synology-ip:/volume1/docker/youtube-comments/
```

### 5.2 이미지 업로드

#### 방법 A: Docker Hub 사용 (권장)

로컬에서:
```bash
# Docker Hub 로그인
docker login

# 이미지 태그
docker tag youtube-comments-app:latest your-dockerhub-username/youtube-comments-app:latest

# 이미지 푸시
docker push your-dockerhub-username/youtube-comments-app:latest
```

Synology에서:
```bash
# SSH로 접속
ssh admin@your-synology-ip

# 이미지 다운로드
docker pull your-dockerhub-username/youtube-comments-app:latest
```

#### 방법 B: 이미지 파일로 전송 (Docker Hub 사용 불가 시)

로컬에서:
```bash
# 이미지를 tar 파일로 저장
docker save youtube-comments-app:latest -o youtube-comments-app.tar

# Synology로 전송
scp youtube-comments-app.tar admin@your-synology-ip:/volume1/docker/youtube-comments/
```

Synology에서:
```bash
# SSH로 접속
ssh admin@your-synology-ip

# 디렉토리 이동
cd /volume1/docker/youtube-comments

# 이미지 로드
docker load -i youtube-comments-app.tar

# tar 파일 삭제 (선택)
rm youtube-comments-app.tar
```

### 5.3 컨테이너 실행

#### Portainer 사용 시 (GUI):

1. Portainer 접속 (`https://your-synology-ip:9443`)
2. **Stacks** 메뉴 선택
3. **Add stack** 클릭
4. Stack name: `youtube-comments`
5. `docker-compose.yml` 내용 붙여넣기
6. **Environment variables** 섹션에서 `.env.production` 내용 추가
7. **Deploy the stack** 클릭

#### SSH 사용 시 (CLI):

```bash
# SSH로 접속
ssh admin@your-synology-ip

# 프로젝트 디렉토리로 이동
cd /volume1/docker/youtube-comments

# Docker Compose로 실행
docker-compose up -d

# 실행 확인
docker-compose ps
docker-compose logs -f
```

### 5.4 방화벽 설정

**Control Panel > Security > Firewall**:
- 포트 3000 허용 (또는 사용하는 포트)

---

## 6. 모니터링 및 관리

### 6.1 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 특정 컨테이너 상태
docker stats youtube-comments-app

# 로그 확인
docker logs -f youtube-comments-app

# 로그 실시간 스트리밍 (마지막 100줄)
docker logs --tail 100 -f youtube-comments-app
```

### 6.2 컨테이너 관리 명령어

```bash
# 중지
docker-compose stop

# 시작
docker-compose start

# 재시작
docker-compose restart

# 완전 삭제
docker-compose down

# 완전 삭제 + 볼륨까지
docker-compose down -v
```

### 6.3 업데이트 배포

새 버전 배포 시:

```bash
# 1. 새 이미지 빌드 (로컬)
docker-compose build

# 2. 이미지 푸시 (Docker Hub 사용 시)
docker push your-dockerhub-username/youtube-comments-app:latest

# 3. Synology에서 업데이트
ssh admin@your-synology-ip
cd /volume1/docker/youtube-comments
docker-compose pull
docker-compose up -d
```

### 6.4 자동 업데이트 (Watchtower)

컨테이너를 자동으로 업데이트하려면 `docker-compose.yml`에 추가:

```yaml
services:
  # ... 기존 서비스 ...

  watchtower:
    container_name: watchtower
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600  # 1시간마다 체크
    restart: unless-stopped
```

---

## 7. 문제 해결

### 7.1 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker logs youtube-comments-app

# 일반적인 원인:
# - 환경 변수 누락 (.env.production 확인)
# - 포트 충돌 (3000번 포트가 이미 사용 중)
# - 메모리 부족
```

### 7.2 접속 불가

1. **방화벽 확인**: Control Panel > Security > Firewall
2. **포트 확인**: `docker ps`로 포트 매핑 확인
3. **네트워크 확인**: `docker network ls`
4. **컨테이너 상태**: `docker stats`

### 7.3 성능 문제

```bash
# 리소스 사용량 확인
docker stats youtube-comments-app

# 리소스 제한 조정 (docker-compose.yml)
deploy:
  resources:
    limits:
      cpus: '2.0'      # CPU 증가
      memory: 2G       # 메모리 증가
```

### 7.4 로그 확인

```bash
# 애플리케이션 로그
docker logs youtube-comments-app

# 시스템 로그
sudo journalctl -u docker.service

# 디스크 사용량
docker system df
```

### 7.5 초기화 및 재설치

```bash
# 모든 컨테이너 중지 및 삭제
docker-compose down -v

# 미사용 이미지 정리
docker image prune -a

# 처음부터 다시 시작
docker-compose up -d
```

---

## 8. 보안 권장사항

### 8.1 환경 변수 보안
- ✅ `.env.production` 파일 권한 제한: `chmod 600 .env.production`
- ✅ API 키는 절대 코드에 하드코딩하지 않기
- ✅ Docker Secrets 사용 고려 (Docker Swarm 사용 시)

### 8.2 네트워크 보안
- ✅ 필요한 포트만 개방
- ✅ Synology 방화벽 활성화
- ✅ HTTPS 사용 (Nginx + Let's Encrypt)
- ✅ 외부 접속 시 VPN 사용 고려

### 8.3 정기 업데이트
- ✅ Docker 이미지 정기적 업데이트
- ✅ Synology DSM 업데이트
- ✅ 보안 패치 적용

---

## 9. 유용한 명령어 모음

```bash
# === 컨테이너 관리 ===
docker ps                                    # 실행 중인 컨테이너
docker ps -a                                 # 모든 컨테이너
docker logs -f youtube-comments-app          # 로그 확인
docker exec -it youtube-comments-app sh      # 컨테이너 접속

# === 이미지 관리 ===
docker images                                # 이미지 목록
docker image prune -a                        # 미사용 이미지 삭제
docker system df                             # 디스크 사용량

# === 네트워크 ===
docker network ls                            # 네트워크 목록
docker network inspect youtube-comments-network

# === 볼륨 ===
docker volume ls                             # 볼륨 목록
docker volume prune                          # 미사용 볼륨 삭제

# === 시스템 정리 ===
docker system prune                          # 미사용 리소스 정리
docker system prune -a --volumes             # 전체 정리 (주의!)
```

---

## 10. 참고 자료

- [Next.js Docker 공식 문서](https://nextjs.org/docs/deployment#docker-image)
- [Synology Docker 가이드](https://www.synology.com/en-global/dsm/packages/Docker)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Portainer 문서](https://docs.portainer.io/)

---

## 문의 및 지원

배포 중 문제가 발생하면 다음을 확인하세요:
1. 로그 확인: `docker logs youtube-comments-app`
2. 환경 변수 확인: `.env.production`
3. 포트 충돌 확인: `netstat -tulpn | grep 3000`
4. 디스크 공간 확인: `df -h`

Happy Deploying! 🚀

