# 🚀 Synology NAS 배포 - 실행 가이드

## 현재 위치 확인
프로젝트 루트 디렉토리: `/Users/mukymook/cursor-workspace/youtube-comment-crawling`

---

## 1️⃣ 단계 1: Docker 이미지 tar 파일 생성

### 명령어:
```bash
cd /Users/mukymook/cursor-workspace/youtube-comment-crawling
./scripts/deploy.sh
```

### 실행 중 선택사항:
1. **"이전 컨테이너를 정리하시겠습니까? (y/N):"** 
   → `n` 입력 (로컬 테스트 환경 유지)

2. **"배포 방법을 선택하세요: 선택 (1/2):"**
   → `2` 입력 (Synology NAS에 배포)

### 예상 출력:
```
[INFO] Docker 이미지를 tar 파일로 저장 중...
[SUCCESS] 이미지 저장 완료: youtube-comments-app.tar
[INFO] 파일 크기: XXX MB

[SUCCESS] 배포 파일이 준비되었습니다!
```

### 확인:
```bash
ls -lh youtube-comments-app.tar
```

✅ `youtube-comments-app.tar` 파일이 생성되었으면 성공!

---

## 2️⃣ 단계 2: Synology NAS 접속 및 디렉토리 생성

### ⚠️ 중요: 아래 명령어에서 YOUR_SYNOLOGY_IP를 실제 IP로 변경하세요!

### 명령어:
```bash
# YOUR_SYNOLOGY_IP를 실제 IP로 변경 (예: 192.168.1.100)
export SYNOLOGY_IP="121.129.33.145 -p 62435"

# SSH로 접속해서 디렉토리 생성
ssh mook@121.129.33.145 -p 62435 "mkdir -p /volume1/docker/youtube-comments"
```

### 예상 출력:
- 처음 접속 시: 비밀번호 입력 요구
- 성공 시: 아무 출력 없음 (정상)

### 확인:
```bash
ssh mook@121.129.33.145 -p 62435 "ls -la /volume1/docker/youtube-comments"
```

✅ 디렉토리가 생성되었으면 성공!

---

## 3️⃣ 단계 3: 파일 전송 (로컬 → Synology)

### 명령어:
```bash
cd /Users/mukymook/cursor-workspace/youtube-comment-crawling

# 1. Docker 이미지 tar 파일 전송 (시간이 걸릴 수 있음)
echo "📦 Docker 이미지 전송 중... (파일 크기에 따라 5-10분 소요)"
scp youtube-comments-app.tar mook@121.129.33.145 -p 62435:/volume1/docker/youtube-comments/

# 2. Docker Compose 설정 파일 전송
echo "📄 Docker Compose 설정 전송 중..."
scp docker-compose.synology.yml mook@121.129.33.145 -p 62435:/volume1/docker/youtube-comments/docker-compose.yml

# 3. 환경 변수 파일 전송
echo "🔐 환경 변수 파일 전송 중..."
scp .env.production mook@121.129.33.145 -p 62435:/volume1/docker/youtube-comments/

echo "✅ 모든 파일 전송 완료!"
```

### 예상 출력:
```
youtube-comments-app.tar    100%  XXX MB   X.X MB/s   XX:XX
docker-compose.yml          100%  XXX bytes
.env.production            100%  XXX bytes
```

### 확인:
```bash
ssh mook@121.129.33.145 -p 62435 "ls -lh /volume1/docker/youtube-comments/"
```

예상 파일 목록:
- `youtube-comments-app.tar`
- `docker-compose.yml`
- `.env.production`

✅ 3개 파일이 모두 있으면 성공!

---

## 4️⃣ 단계 4: Synology에서 Docker 이미지 로드

### 명령어:
```bash
# Synology SSH 접속
ssh mook@121.129.33.145 -p 62435

# 프로젝트 디렉토리로 이동
cd /volume1/docker/youtube-comments

# Docker 이미지 로드 (시간이 걸릴 수 있음)
echo "📥 Docker 이미지 로드 중... (1-3분 소요)"
docker load -i youtube-comments-app.tar

# 이미지 로드 확인
docker images | grep youtube-comments
```

### 예상 출력:
```
Loaded image: youtube-comments-app:latest

REPOSITORY              TAG       IMAGE ID       CREATED        SIZE
youtube-comments-app    latest    xxxxxxxxxxxx   X hours ago    XXX MB
```

✅ `youtube-comments-app:latest` 이미지가 보이면 성공!

---

## 5️⃣ 단계 5: Docker 컨테이너 실행

### 명령어 (계속 SSH 세션에서):
```bash
# 아직 /volume1/docker/youtube-comments 디렉토리에 있어야 함

# 컨테이너 실행
echo "🚀 컨테이너 시작 중..."
docker-compose up -d

# 실행 확인
docker ps

# 로그 확인 (Ctrl+C로 종료 가능)
docker logs -f youtube-comments-app
```

### 예상 출력:
```
Creating youtube-comments-app ... done

CONTAINER ID   IMAGE                        STATUS         PORTS
xxxxxxxxxxxx   youtube-comments-app:latest  Up X seconds   0.0.0.0:2923->3000/tcp

▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000
✓ Ready in 3s
```

✅ "Ready in Xs" 메시지가 보이면 성공!

### 로그 확인 후:
- `Ctrl + C`를 눌러 로그 스트리밍 종료
- `exit`를 입력해서 SSH 세션 종료

---

## 6️⃣ 단계 6: 브라우저에서 접속 확인

### 접속 URL:
```
http://YOUR_SYNOLOGY_IP:2923
```

### 헬스 체크 API:
```bash
# 로컬 터미널에서 (YOUR_SYNOLOGY_IP를 실제 IP로 변경)
curl http://YOUR_SYNOLOGY_IP:2923/api/health
```

예상 응답:
```json
{"status":"healthy","timestamp":"2025-10-30T..."}
```

✅ 브라우저에서 앱이 정상적으로 표시되면 배포 완료! 🎉

---

## 🛠️ 자주 사용하는 관리 명령어

### 로그 확인:
```bash
ssh mook@121.129.33.145 -p 62435
docker logs -f youtube-comments-app
```

### 컨테이너 재시작:
```bash
ssh mook@121.129.33.145 -p 62435
cd /volume1/docker/youtube-comments
docker-compose restart
```

### 컨테이너 중지:
```bash
ssh mook@121.129.33.145 -p 62435
cd /volume1/docker/youtube-comments
docker-compose down
```

### 컨테이너 다시 시작:
```bash
ssh mook@121.129.33.145 -p 62435
cd /volume1/docker/youtube-comments
docker-compose up -d
```

### 리소스 사용량 확인:
```bash
ssh mook@121.129.33.145 -p 62435
docker stats youtube-comments-app
```

---

## ❌ 문제 해결

### 문제 1: "Permission denied" 오류
**원인**: SSH 접속 권한 문제

**해결책**:
1. Synology Control Panel > Terminal & SNMP
2. "Enable SSH service" 체크
3. 관리자 계정으로 로그인 확인

### 문제 2: "port is already allocated" 오류
**원인**: 포트 2923이 이미 사용 중

**해결책**:
```bash
ssh mook@121.129.33.145 -p 62435
cd /volume1/docker/youtube-comments
vi docker-compose.yml  # 또는 nano

# ports 부분을 다른 포트로 변경:
ports:
  - "8080:3000"  # 2923 → 8080으로 변경

docker-compose down
docker-compose up -d
```

### 문제 3: 컨테이너가 시작되지 않음
**확인**:
```bash
ssh mook@121.129.33.145 -p 62435
docker logs youtube-comments-app
```

**일반적인 원인**:
- YOUTUBE_API_KEY가 설정되지 않음
- 메모리 부족
- 환경 변수 파일 문제

### 문제 4: 접속이 안됨
**확인 사항**:
1. 방화벽: Control Panel > Security > Firewall (포트 2923 허용)
2. 컨테이너 상태: `docker ps` (STATUS가 "Up"인지 확인)
3. 네트워크: 같은 네트워크에 있는지 확인

---

## 🔄 업데이트 배포

새 버전을 배포할 때:

```bash
# 1. 로컬에서 새로 빌드
cd /Users/mukymook/cursor-workspace/youtube-comment-crawling
./scripts/deploy.sh  # 옵션 2 선택

# 2. Synology로 새 이미지 전송
scp youtube-comments-app.tar mook@121.129.33.145 -p 62435:/volume1/docker/youtube-comments/

# 3. Synology에서 업데이트
ssh mook@121.129.33.145 -p 62435 << 'ENDSSH'
cd /volume1/docker/youtube-comments
docker-compose down
docker load -i youtube-comments-app.tar
docker-compose up -d
ENDSSH
```

---

## 📚 참고 문서

- [Synology 빠른 시작 가이드](./docs/SYNOLOGY-QUICKSTART.md)
- [전체 배포 가이드](./docs/DEPLOYMENT.md)

---

**Happy Deploying! 🚀**

