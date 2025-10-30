# 🚀 빠른 시작 가이드

## Synology NAS Docker 배포 - 5분 완성

이 가이드는 가장 빠르게 Synology NAS에 애플리케이션을 배포하는 방법을 안내합니다.

---

## 📋 사전 준비 체크리스트

- [ ] Synology NAS (DSM 7.0 이상)
- [ ] Docker 패키지 설치됨
- [ ] YouTube Data API v3 키 보유
- [ ] SSH 접속 가능

---

## ⚡ 3단계 배포

### 1️⃣ 로컬에서 준비

```bash
# 1. 환경 변수 설정
cp .env.example .env.production

# 2. .env.production 파일 열어서 API 키 입력
# YOUTUBE_API_KEY=실제_API_키_입력

# 3. 배포 스크립트 실행
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 2️⃣ Synology NAS로 전송

```bash
# 파일 전송 (your-synology-ip를 실제 IP로 변경)
scp youtube_comments_app.tar mook@172.30.1.18:62435/volume1/docker/
scp docker-compose.yml admin@your-synology-ip:/volume1/docker/
scp .env.production admin@your-synology-ip:/volume1/docker/
```

### 3️⃣ Synology NAS에서 실행

```bash
# SSH 접속
ssh admin@your-synology-ip

# 디렉토리 이동
cd /volume1/docker

# 이미지 로드
docker load -i youtube-comments-app.tar

# 컨테이너 실행
docker-compose up -d

# 실행 확인
docker ps
```

---

## 🌐 접속

```
http://your-synology-ip:3000
```

---

## 🔍 상태 확인

```bash
# 컨테이너 상태
docker ps

# 로그 확인
docker logs -f youtube-comments-app

# 헬스체크
curl http://localhost:3000/api/health
```

---

## ⚙️ 관리 명령어

```bash
# 중지
docker-compose stop

# 시작
docker-compose start

# 재시작
docker-compose restart

# 삭제
docker-compose down
```

---

## 🆘 문제 해결

### 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker logs youtube-comments-app

# 일반적인 원인:
# 1. .env.production에 API 키 누락
# 2. 3000번 포트가 이미 사용 중
# 3. 메모리 부족
```

### 접속 불가

1. Synology 방화벽에서 포트 3000 허용
2. Control Panel > Security > Firewall
3. 규칙 추가: 포트 3000 허용

---

## 📚 더 자세한 가이드

전체 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md) 파일을 참고하세요.

---

## 🎉 완료!

이제 YouTube 댓글 크롤링 서비스를 사용할 수 있습니다!

**다음 단계:**
- [ ] HTTPS 설정 (선택사항)
- [ ] 도메인 연결 (선택사항)
- [ ] Portainer 설치 (관리 UI)

Happy Coding! 🚀

