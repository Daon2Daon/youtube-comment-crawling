# 🚀 Synology NAS 빠른 배포 가이드

> **로컬 Docker 테스트를 완료했다면, 이 가이드를 따라 Synology NAS에 바로 배포할 수 있습니다!**

---

## 📋 사전 확인사항

배포 전 다음을 확인하세요:

- ✅ Synology NAS의 IP 주소를 알고 있음
- ✅ Synology 관리자 계정 정보 보유
- ✅ Synology에 Docker 패키지 설치됨
- ✅ SSH 접속 활성화됨 (Control Panel > Terminal & SNMP > Enable SSH service)
- ✅ 로컬에서 `.env.production` 파일 설정 완료

---

## 🎯 방법 1: 자동 스크립트 사용 (가장 쉬움!)

### Step 1: 이미지를 tar 파일로 저장

로컬 터미널에서:

```bash
# 프로젝트 루트에서 스크립트 실행
./scripts/deploy.sh

# 옵션 선택 시 "2" 입력 (Synology NAS에 배포)
```

스크립트가 자동으로:
- Docker 이미지를 `youtube-comments-app.tar` 파일로 저장
- 파일 크기와 다음 단계 안내 제공

### Step 2: 파일을 Synology로 전송

```bash
# Synology로 tar 파일 전송 (IP 주소를 실제 값으로 변경)
scp youtube-comments-app.tar admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/

# docker-compose.yml과 환경 변수 파일도 함께 전송
scp docker-compose.yml admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/
scp .env.production admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/
```

> 💡 **참고**: 
> - `YOUR_SYNOLOGY_IP`를 실제 Synology IP로 변경하세요 (예: `192.168.1.100`)
> - 처음 접속 시 비밀번호 입력이 필요합니다

### Step 3: Synology에 SSH 접속

```bash
ssh admin@YOUR_SYNOLOGY_IP
```

### Step 4: Docker 이미지 로드 및 실행

Synology SSH에서:

```bash
# 프로젝트 디렉토리로 이동
cd /volume1/docker/youtube-comments

# Docker 이미지 로드
docker load -i youtube-comments-app.tar

# 컨테이너 실행
docker-compose up -d

# 실행 확인
docker ps
docker logs -f youtube-comments-app
```

### Step 5: 접속 확인

브라우저에서:
```
http://YOUR_SYNOLOGY_IP:2923
```

---

## 🎯 방법 2: Docker Hub 사용 (더 빠름!)

Docker Hub를 사용하면 tar 파일 전송 없이 바로 배포 가능합니다.

### Step 1: 로컬에서 이미지 푸시

```bash
# Docker Hub 로그인
docker login

# 이미지에 태그 추가 (YOUR_USERNAME을 실제 Docker Hub 사용자명으로 변경)
docker tag youtube-comments-app:latest YOUR_USERNAME/youtube-comments-app:latest

# Docker Hub에 푸시
docker push YOUR_USERNAME/youtube-comments-app:latest
```

### Step 2: docker-compose.yml 수정

`docker-compose.yml` 파일의 `image` 부분을 수정:

```yaml
services:
  youtube-comments-app:
    # image: youtube-comments-app:latest  # 이 줄 주석 처리
    image: YOUR_USERNAME/youtube-comments-app:latest  # 이 줄 추가
    # ... 나머지 설정은 그대로
```

### Step 3: 파일 전송 및 실행

```bash
# 로컬에서: 설정 파일만 전송
scp docker-compose.yml admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/
scp .env.production admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/

# Synology SSH 접속
ssh admin@YOUR_SYNOLOGY_IP

# 프로젝트 디렉토리로 이동
cd /volume1/docker/youtube-comments

# 이미지 다운로드 및 실행
docker-compose pull
docker-compose up -d

# 로그 확인
docker logs -f youtube-comments-app
```

---

## 🎯 방법 3: Synology Docker GUI 사용

### Step 1: 이미지 업로드

1. **File Station** 열기
2. `/docker/youtube-comments` 폴더로 이동
3. `youtube-comments-app.tar` 파일 업로드 (방법 1로 생성한 파일)

### Step 2: Docker 앱에서 이미지 로드

1. **Docker** 앱 열기
2. **이미지** 탭 선택
3. **추가** > **파일에서 추가**
4. 업로드한 `youtube-comments-app.tar` 선택
5. 이미지 로드 완료 대기

### Step 3: 컨테이너 생성

1. **컨테이너** 탭 선택
2. **생성** 클릭
3. 로드한 이미지(`youtube-comments-app:latest`) 선택
4. **컨테이너 이름**: `youtube-comments-app`
5. **고급 설정** 클릭:
   - **포트 설정**: 
     - 로컬 포트: `2923`
     - 컨테이너 포트: `3000`
   - **환경**: `.env.production` 파일 내용 추가
     ```
     YOUTUBE_API_KEY=your_actual_api_key
     NODE_ENV=production
     TZ=Asia/Seoul
     PORT=3000
     HOSTNAME=0.0.0.0
     ```
   - **자동 재시작**: `always` 선택
6. **적용** 클릭

---

## 🔍 배포 후 확인사항

### 1. 컨테이너 상태 확인

```bash
# SSH에서
docker ps

# 출력 예시:
# CONTAINER ID   IMAGE                        STATUS         PORTS
# abc123def456   youtube-comments-app:latest  Up 2 minutes   0.0.0.0:2923->3000/tcp
```

### 2. 로그 확인

```bash
docker logs youtube-comments-app

# 정상 실행 시 출력 예시:
# ▲ Next.js 15.x.x
# - Local:        http://localhost:3000
# - Network:      http://0.0.0.0:3000
# ✓ Ready in Xms
```

### 3. 헬스 체크

```bash
# API 헬스 체크
curl http://YOUR_SYNOLOGY_IP:2923/api/health

# 정상 응답:
# {"status":"healthy","timestamp":"..."}
```

### 4. 브라우저 접속

```
http://YOUR_SYNOLOGY_IP:2923
```

---

## 🛠️ 유용한 관리 명령어

### 컨테이너 관리

```bash
# 로그 실시간 확인
docker logs -f youtube-comments-app

# 컨테이너 재시작
docker restart youtube-comments-app

# 컨테이너 중지
docker stop youtube-comments-app

# 컨테이너 시작
docker start youtube-comments-app

# 리소스 사용량 확인
docker stats youtube-comments-app
```

### 업데이트 배포

새 버전을 배포할 때:

```bash
# 1. 로컬에서 새로 빌드
./scripts/deploy.sh  # 옵션 2 선택

# 2. tar 파일 전송
scp youtube-comments-app.tar admin@YOUR_SYNOLOGY_IP:/volume1/docker/youtube-comments/

# 3. Synology에서 업데이트
ssh admin@YOUR_SYNOLOGY_IP
cd /volume1/docker/youtube-comments
docker-compose down
docker load -i youtube-comments-app.tar
docker-compose up -d
```

---

## ❌ 문제 해결

### 문제 1: 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker logs youtube-comments-app

# 일반적인 원인:
# - YOUTUBE_API_KEY가 설정되지 않음
# - 포트 2923이 이미 사용 중
```

**해결책**:
```bash
# 환경 변수 확인
docker exec youtube-comments-app env | grep YOUTUBE_API_KEY

# 포트 변경이 필요하면 docker-compose.yml 수정:
# ports:
#   - "8080:3000"  # 2923 대신 8080 사용
```

### 문제 2: "connection refused" 오류

**원인**: Synology 방화벽이 포트를 차단

**해결책**:
1. Control Panel > Security > Firewall
2. Edit Rules > Create
3. Ports: Custom > 2923
4. Action: Allow

### 문제 3: SSH 접속 불가

**해결책**:
1. Control Panel > Terminal & SNMP
2. "Enable SSH service" 체크
3. Port: 22 (기본값)
4. Apply

### 문제 4: 디스크 공간 부족

```bash
# 미사용 Docker 리소스 정리
docker system prune -a

# 확인
df -h
```

---

## 🔒 보안 권장사항

### 1. SSH 보안 강화

```bash
# SSH 포트 변경 (Control Panel에서)
# 기본 22 → 다른 포트 (예: 2222)

# 비밀번호 대신 SSH 키 사용 설정
```

### 2. 방화벽 설정

- ✅ 필요한 포트만 개방 (2923, SSH 포트)
- ✅ 특정 IP만 허용 고려
- ✅ VPN 사용 권장 (외부 접속 시)

### 3. 환경 변수 보안

```bash
# Synology에서 파일 권한 제한
chmod 600 /volume1/docker/youtube-comments/.env.production
```

---

## 📊 모니터링 (선택사항)

### Portainer 설치

Docker를 GUI로 관리하는 강력한 도구:

```bash
# SSH에서 실행
docker run -d \
  --name=portainer \
  --restart=always \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# 접속: https://YOUR_SYNOLOGY_IP:9443
```

---

## 🎉 배포 완료!

이제 다음 URL에서 앱에 접속할 수 있습니다:

```
http://YOUR_SYNOLOGY_IP:2923
```

### 다음 단계:

1. ⚙️ 포트 변경이 필요하면 `docker-compose.yml`의 `ports` 수정
2. 🌐 외부 접속이 필요하면 포트 포워딩 설정
3. 🔒 HTTPS가 필요하면 Nginx 리버스 프록시 설정
4. 📈 모니터링이 필요하면 Portainer 설치

---

## 📚 추가 도움말

더 자세한 내용은 다음 문서를 참고하세요:
- 📖 [전체 배포 가이드](./DEPLOYMENT.md)
- 📖 [빠른 시작 가이드](./QUICKSTART.md)

---

**Happy Deploying! 🚀**

배포 중 문제가 있다면 언제든 문의하세요!

