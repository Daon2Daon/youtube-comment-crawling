#!/bin/bash

# ==========================================
# YouTube 댓글 크롤링 앱 배포 스크립트
# Synology NAS Docker 배포 자동화
# ==========================================

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 배너 출력
echo "=========================================="
echo "  YouTube 댓글 크롤링 앱 배포 스크립트"
echo "=========================================="
echo ""

# 1. 환경 변수 파일 확인 (빌드용 최소 템플릿)
log_info "환경 변수 파일 확인 중..."
if [ ! -f ".env.production" ]; then
    log_warning ".env.production 파일이 없습니다. 템플릿 파일을 생성합니다..."
    
    # 최소한의 템플릿 파일 생성 (빌드용)
    cat > .env.production << 'EOF'
# 환경 변수 설정
# Docker 실행 시 실제 API 키를 설정하세요.
NODE_ENV=production
TZ=Asia/Seoul
PORT=3000
HOSTNAME=0.0.0.0

# API 키는 Docker 설정 시 입력
# YOUTUBE_API_KEY=your_youtube_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
EOF
    
    log_success ".env.production 템플릿 파일 생성 완료."
    log_warning "⚠️  주의: Docker 실행 시 .env.production 파일에 실제 API 키를 설정해야 합니다!"
else
    log_success ".env.production 파일이 존재합니다."
fi

# 2. API 키 검증은 건너뜀 (Docker 설정 시 입력 예정)
log_info "API 키 검증은 건너뜁니다. (Docker 설정 시 입력 예정)"

# 3. Docker 설치 확인
log_info "Docker 설치 확인 중..."
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되지 않았습니다!"
    log_info "Docker를 설치해주세요: https://docs.docker.com/get-docker/"
    exit 1
fi
log_success "Docker 설치 확인 완료."

# 4. Docker Compose 설치 확인
log_info "Docker Compose 설치 확인 중..."
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되지 않았습니다!"
    log_info "Docker Compose를 설치해주세요: https://docs.docker.com/compose/install/"
    exit 1
fi
log_success "Docker Compose 설치 확인 완료."

# 5. 이전 컨테이너 정리 (선택사항)
read -p "이전 컨테이너를 정리하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "이전 컨테이너 중지 및 삭제 중..."
    docker-compose down || true
    log_success "이전 컨테이너 정리 완료."
fi

# 6. 배포 방법 선택 (빌드 전에 선택)
echo ""
echo "=========================================="
echo "배포 방법을 선택하세요:"
echo "  1) 로컬 테스트 (현재 시스템에서 실행)"
echo "  2) Synology NAS에 배포 (x86_64/amd64 플랫폼)"
echo "=========================================="
read -p "선택 (1/2): " deploy_choice

# 7. 선택에 따라 Docker 이미지 빌드
if [ "$deploy_choice" == "1" ]; then
    # 로컬 테스트용 빌드 (현재 시스템 플랫폼)
    log_info "Docker 이미지 빌드 중 (로컬 플랫폼)..."
    docker-compose build
    
    if [ $? -eq 0 ]; then
        log_success "Docker 이미지 빌드 완료!"
    else
        log_error "Docker 이미지 빌드 실패!"
        exit 1
    fi
    
    # 로컬 테스트 실행
    log_info "로컬에서 컨테이너 실행 중..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        log_success "컨테이너가 성공적으로 시작되었습니다!"
        echo ""
        log_info "접속 정보:"
        echo "  - URL: http://localhost:3000"
        echo ""
        log_info "유용한 명령어:"
        echo "  - 로그 확인: docker-compose logs -f"
        echo "  - 컨테이너 중지: docker-compose stop"
        echo "  - 컨테이너 재시작: docker-compose restart"
        echo "  - 컨테이너 삭제: docker-compose down"
    else
        log_error "컨테이너 시작 실패!"
        exit 1
    fi

elif [ "$deploy_choice" == "2" ]; then
    # Synology NAS 배포용 빌드 (linux/amd64 플랫폼)
    log_info "Docker 이미지 빌드 중 (linux/amd64 플랫폼 - Synology NAS용)..."
    
    # linux/amd64 플랫폼으로 빌드
    docker build --platform linux/amd64 -t youtube-comments-app:latest .
    
    if [ $? -eq 0 ]; then
        log_success "Docker 이미지 빌드 완료! (linux/amd64)"
    else
        log_error "Docker 이미지 빌드 실패!"
        exit 1
    fi
    
    # 이미지를 tar 파일로 저장
    IMAGE_NAME="youtube-comments-app:latest"
    TAR_FILE="youtube-comments-app.tar"
    
    log_info "Docker 이미지를 tar 파일로 저장 중..."
    docker save $IMAGE_NAME -o $TAR_FILE
    
    if [ $? -eq 0 ]; then
        log_success "이미지 저장 완료: $TAR_FILE"
        
        # 파일 크기 확인
        FILE_SIZE=$(du -h $TAR_FILE | cut -f1)
        log_info "파일 크기: $FILE_SIZE"
        
        echo ""
        log_success "배포 파일이 준비되었습니다!"
        echo ""
        log_info "다음 단계: Synology NAS로 파일 전송"
        echo ""
        log_warning "⚠️  중요: Docker 이미지 외에 다음 파일들도 전송해야 합니다:"
        echo "  - $TAR_FILE (Docker 이미지)"
        echo "  - .env.production (환경 변수 - API 키 포함) ⭐"
        echo "  - docker-compose.synology.yml (Docker Compose 설정)"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📦 단계 1: Docker 이미지 전송"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "ssh -p 62435 mook@121.129.33.145 'cat > /tmp/$TAR_FILE' < $TAR_FILE"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔐 단계 2: 환경 변수 파일 전송 (필수!)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "ssh -p 62435 mook@121.129.33.145 'cat > /tmp/.env.production' < .env.production"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📄 단계 3: Docker Compose 파일 전송"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "ssh -p 62435 mook@121.129.33.145 'cat > /tmp/docker-compose.yml' < docker-compose.synology.yml"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🚀 단계 4: Synology에서 설치 및 실행"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "ssh -p 62435 mook@121.129.33.145 << 'ENDSSH'"
        echo "  # 파일 이동"
        echo "  sudo mkdir -p /volume1/docker/youtube-comments"
        echo "  sudo mv /tmp/$TAR_FILE /volume1/docker/youtube-comments/"
        echo "  sudo mv /tmp/.env.production /volume1/docker/youtube-comments/"
        echo "  sudo mv /tmp/docker-compose.yml /volume1/docker/youtube-comments/"
        echo "  sudo chown -R mook:users /volume1/docker/youtube-comments"
        echo ""
        echo "  # Docker 이미지 로드 및 실행"
        echo "  cd /volume1/docker/youtube-comments"
        echo "  docker load -i $TAR_FILE"
        echo "  docker-compose up -d"
        echo "  docker logs -f youtube-comments-app"
        echo "ENDSSH"
        echo ""
        log_info "자세한 내용은 docs/DEPLOYMENT.md 또는 DEPLOY_STEPS.md를 참고하세요."
    else
        log_error "이미지 저장 실패!"
        exit 1
    fi

else
    log_error "잘못된 선택입니다."
    exit 1
fi

echo ""
log_success "배포 스크립트 실행 완료! 🚀"

