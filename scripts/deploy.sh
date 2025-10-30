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

# 1. 환경 변수 파일 확인
log_info "환경 변수 파일 확인 중..."
if [ ! -f ".env.production" ]; then
    log_warning ".env.production 파일이 없습니다."
    
    if [ -f ".env.example" ]; then
        log_info ".env.example을 복사합니다..."
        cp .env.example .env.production
        log_warning "⚠️  .env.production 파일을 열어 실제 값으로 수정해주세요!"
        log_warning "   특히 YOUTUBE_API_KEY를 반드시 설정하세요."
        exit 1
    else
        log_error ".env.example 파일이 없습니다!"
        log_info "다음 내용으로 .env.production 파일을 생성해주세요:"
        echo ""
        echo "YOUTUBE_API_KEY=your_youtube_api_key_here"
        echo "NODE_ENV=production"
        echo "TZ=Asia/Seoul"
        echo "PORT=3000"
        echo "HOSTNAME=0.0.0.0"
        exit 1
    fi
else
    log_success ".env.production 파일이 존재합니다."
fi

# 2. YOUTUBE_API_KEY 확인
if grep -q "your_youtube_api_key_here" .env.production; then
    log_error "YOUTUBE_API_KEY가 설정되지 않았습니다!"
    log_warning ".env.production 파일을 열어 실제 API 키를 입력하세요."
    exit 1
fi

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

# 6. Docker 이미지 빌드
log_info "Docker 이미지 빌드 중..."
docker-compose build

if [ $? -eq 0 ]; then
    log_success "Docker 이미지 빌드 완료!"
else
    log_error "Docker 이미지 빌드 실패!"
    exit 1
fi

# 7. 배포 방법 선택
echo ""
echo "=========================================="
echo "배포 방법을 선택하세요:"
echo "  1) 로컬 테스트 (현재 시스템에서 실행)"
echo "  2) Synology NAS에 배포 (이미지 저장 및 전송)"
echo "=========================================="
read -p "선택 (1/2): " deploy_choice

if [ "$deploy_choice" == "1" ]; then
    # 로컬 테스트
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
    # Synology NAS 배포
    log_info "Synology NAS 배포 준비 중..."
    
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
        log_info "다음 단계:"
        echo "  1. $TAR_FILE 파일을 Synology NAS로 전송하세요."
        echo "     예: scp $TAR_FILE admin@your-synology-ip:/volume1/docker/youtube-comments/"
        echo ""
        echo "  2. Synology NAS에 SSH로 접속하세요."
        echo "     예: ssh admin@your-synology-ip"
        echo ""
        echo "  3. 이미지를 로드하세요."
        echo "     cd /volume1/docker/youtube-comments"
        echo "     docker load -i $TAR_FILE"
        echo ""
        echo "  4. 컨테이너를 실행하세요."
        echo "     docker-compose up -d"
        echo ""
        log_info "자세한 내용은 docs/DEPLOYMENT.md 파일을 참고하세요."
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

