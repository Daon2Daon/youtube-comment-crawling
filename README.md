#요구사항명세서

---

## YouTube 댓글 수집 웹 서비스 기능 명세서

### 1. 개요

사용자가 입력한 YouTube 영상 URL에서 `videoId`를 추출한 뒤, **YouTube Data API v3**를 호출하여 해당 영상의 댓글 데이터를 수집하고, 웹 화면에 리스트 형태로 출력하는 Next.js 기반 웹 애플리케이션을 개발합니다.

---

### 2. 핵심 기능 명세

### 2.1. 프론트엔드 (Client-Side)

- **컴포넌트: 메인 페이지 (`/`)**
    - **[F-01] URL 입력 필드:**
        - 사용자가 YouTube 영상의 전체 URL (예: `https://www.youtube.com/watch?v=...`)을 입력할 수 있는 `<input>` 필드를 제공합니다.
    - **[F-02] 데이터 요청 버튼:**
        - '댓글 가져오기' 또는 '확인' 기능을 수행하는 `<button>`을 제공합니다.
    - **[F-03] 로딩 상태 표시:**
        - 데이터 요청 버튼 클릭 시, 백엔드 API로부터 응답을 받기 전까지 스피너(Spinner) 또는 "로딩 중..." 텍스트를 표시합니다.
    - **[F-04] 오류 메시지 표시:**
        - 유효하지 않은 URL, API 오류, 댓글이 없는 경우 등 예외 상황 발생 시, 사용자에게 명확한 오류 메시지(예: "유효한 YouTube URL이 아닙니다.", "댓글을 가져오는 데 실패했습니다.")를 표시합니다.
    - **[F-05] 댓글 리스트 출력:**
        - API로부터 성공적으로 데이터를 수신하면, 댓글 목록을 아래 **[3. 데이터 모델]** 형식에 맞춰 화면에 렌더링합니다.
        - 각 댓글 항목은 작성자, 내용, 작성일, 좋아요 수를 포함해야 합니다.

### 2.2. 백엔드 (Server-Side: Next.js API Route)

- **API 엔드포인트: `/api/comments`**
    - `Method`: `POST`
    - `Request Body`: `{ "videoUrl": "..." }`
    - `Response (Success)`: `{ "comments": [...] }` (댓글 객체 배열)
    - `Response (Error)`: `{ "error": "..." }` (오류 메시지)
- **[B-01] API 키 관리:**
    - YouTube Data API v3 인증을 위한 API 키는 `.env.local` 파일 (`YOUTUBE_API_KEY`)에 저장하며, **절대 클라이언트에 노출되지 않도록** 서버 사이드에서만 사용합니다.
- **[B-02] `videoId` 파싱:**
    - Request Body로 받은 `videoUrl`에서 정규식(Regex) 또는 URL 파싱 라이브러리를 사용하여 `videoId` (예: `dQw4w9WgXcQ`)를 정확하게 추출합니다.
    - `videoId` 추출 실패 시, 400 Bad Request (혹은 적절한 오류)를 반환합니다.
- **[B-03] YouTube Data API 연동 (`commentThreads.list`):**
    - 추출한 `videoId`를 사용하여 Google API 클라이언트 라이브러리(`googleapis`) 또는 `fetch`/`axios`로 `commentThreads.list` 엔드포인트를 호출합니다.
    - **필수 파라미터:**
        - `key`: [B-01]의 API 키
        - `part`: `snippet` (댓글 기본 정보)
        - `videoId`: [B-02]의 `videoId`
        - `maxResults`: `100` (페이지당 최대치)
        - `order`: `relevance` (관련성순) 또는 `time` (최신순) - (기획에 따라 선택)
- **[B-04] 페이지네이션 처리 (Pagination):**
    - API 최초 응답 시 `nextPageToken`이 포함되어 있다면, 해당 토큰을 사용하여 다음 페이지의 댓글을 재귀적(recursive) 또는 반복(loop)적으로 모두 조회합니다.
    - 모든 페이지의 댓글 데이터를 취합하여 하나의 배열로 만듭니다.
- **[B-05] 데이터 정제:**
    - API 응답(JSON)에서 필요한 데이터만 추출하여 **[3. 데이터 모델]** 형식으로 가공합니다.
- **[B-06] 예외 처리:**
    - `commentsDisabled`: 영상의 댓글이 비활성화된 경우, "이 영상은 댓글이 비활성화되었습니다." 메시지를 반환합니다.
    - `quotaExceeded`: API 할당량(Quota) 초과 시, "API 할당량을 초과했습니다." 메시지를 반환합니다.
    - `videoNotFound`: 유효하지 않은 `videoId`일 경우, "영상을 찾을 수 없습니다." 메시지를 반환합니다.

### 3. 데이터 모델 (Comment Object)

API가 프론트엔드로 반환해야 할 댓글 객체(JSON)의 표준 형식입니다.

{
"commentId": "Ugy...w", // 댓글 고유 ID ([item.id](http://item.id/))
"author": "사용자이름", // item.snippet.topLevelComment.snippet.authorDisplayName
"text": "댓글 내용입니다...", // item.snippet.topLevelComment.snippet.textDisplay
"likeCount": 123, // item.snippet.topLevelComment.snippet.likeCount
"publishedAt": "2025-10-22T..." // item.snippet.topLevelComment.snippet.publishedAt (ISO 8601 형식)
}

---

## 개발 구현 계획

### 📊 현재 구현 상태 분석

#### ✅ 완료된 작업
1. **Next.js 기본 앱 설치** (v16.0.0)
   - TypeScript 설정 완료 (strict mode)
   - Tailwind CSS 설정 완료
   - ESLint 설정 완료
   - App Router 구조 (`src/app/`)
   - 절대 경로 import alias (`@/*`)

#### ❌ 미구현 상태
- YouTube 댓글 크롤링 기능 전체
- API 라우트
- 프론트엔드 UI 컴포넌트
- 환경 변수 설정
- 필요한 외부 라이브러리

---

### 🎯 구현 단계별 계획

#### **Phase 1: 프로젝트 초기 설정 및 환경 구성** 🔧

##### 1-1. 필수 패키지 설치
- `zod`: 스키마 검증
- `next-safe-action`: Server Actions 래핑
- `axios` 또는 기본 `fetch` 사용: YouTube API 호출
- `date-fns` 또는 `dayjs`: 날짜 포맷팅

##### 1-2. 환경 변수 설정
- `.env.local` 파일 생성
- `YOUTUBE_API_KEY` 추가 (서버 사이드 전용)
- `.env.example` 파일 생성 (템플릿)

##### 1-3. 타입 정의
- `src/types/youtube.ts`: Comment, API Response 인터페이스 정의

---

#### **Phase 2: 백엔드 API 구현** ⚙️

##### 2-1. YouTube API 유틸리티 함수 작성
- `src/lib/youtube/extractVideoId.ts`: URL에서 videoId 파싱 함수
- `src/lib/youtube/apiClient.ts`: YouTube Data API v3 클라이언트

##### 2-2. API Route 구현 (`src/app/api/comments/route.ts`)
- `POST /api/comments` 엔드포인트 생성
- Request Body 검증 (Zod 스키마)
- videoId 추출 및 검증
- YouTube API 호출 (`commentThreads.list`)
- 페이지네이션 처리 (`nextPageToken`)
- 데이터 정제 및 포맷팅
- 에러 핸들링:
  - 400: 잘못된 URL
  - 403: API 할당량 초과
  - 404: 영상 없음
  - 403: 댓글 비활성화

##### 2-3. Server Action 구현 (선택사항)
- `src/app/actions/fetchComments.ts`: next-safe-action 래핑
- Zod 스키마로 입력 검증

---

#### **Phase 3: 프론트엔드 UI 구현** 🎨

##### 3-1. Shadcn UI 초기 설정
- `npx shadcn@latest init`: Shadcn UI 설치 및 구성
- 필요한 컴포넌트 설치:
  - `Button`
  - `Input`
  - `Card`
  - `Spinner` 또는 `Skeleton`
  - `Alert` (에러 표시용)

##### 3-2. 유틸리티 함수 작성
- `src/lib/utils.ts`: cn() 함수 (Tailwind 클래스 병합)
- `src/lib/formatDate.ts`: 날짜 포맷팅 헬퍼

##### 3-3. 커스텀 훅 작성
- `src/hooks/useComments.ts`: 댓글 fetch 로직 및 상태 관리

##### 3-4. 컴포넌트 구현

**Client Components:**
- `src/components/CommentForm.tsx`: URL 입력 폼 (`'use client'`)
  - [F-01] URL 입력 필드
  - [F-02] 댓글 가져오기 버튼
  - [F-03] 로딩 상태 (Spinner)
  - [F-04] 에러 메시지 (Alert)

- `src/components/CommentList.tsx`: 댓글 목록 (`'use client'`)
  - [F-05] 댓글 리스트 렌더링
  
- `src/components/CommentItem.tsx`: 개별 댓글 카드 (Server Component 가능)
  - 작성자, 내용, 좋아요 수, 작성일 표시

##### 3-5. 메인 페이지 리팩토링
- `src/app/page.tsx`: 전체 레이아웃 구성
- CommentForm과 CommentList 통합

##### 3-6. 레이아웃 및 메타데이터 업데이트
- `src/app/layout.tsx`: 메타데이터 수정
- 한글 언어 설정 (`lang="ko"`)

---

#### **Phase 4: 상태 관리 및 사용자 경험 개선** ✨

##### 4-1. 로딩 상태 개선
- Suspense 경계 추가
- Skeleton UI 구현

##### 4-2. 에러 핸들링 개선
- `src/app/error.tsx`: Error Boundary
- 사용자 친화적 에러 메시지

##### 4-3. 반응형 디자인
- Mobile-first Tailwind 유틸리티 적용
- 다양한 화면 크기 대응

##### 4-4. 접근성 (a11y)
- ARIA 레이블 추가
- 키보드 네비게이션 테스트
- 시맨틱 HTML 적용

---

#### **Phase 5: 추가 기능 및 최적화** 🚀

##### 5-1. 기능 향상
- 댓글 정렬 옵션 (최신순/관련성순)
- 댓글 검색/필터링
- 대댓글 표시 (replies)
- CSV/JSON 내보내기

##### 5-2. 성능 최적화
- React Server Components 활용 극대화
- 댓글 목록 가상화 (react-window)
- 이미지 최적화 (next/image)

##### 5-3. 캐싱 전략
- Next.js 캐싱 활용
- SWR 또는 React Query 도입 (선택사항)

---

#### **Phase 6: 테스트 및 배포** 🧪

##### 6-1. 테스트 작성
- Vitest: 유틸리티 함수 단위 테스트
- React Testing Library: 컴포넌트 테스트
- E2E 테스트 (선택사항)

##### 6-2. 문서화
- README.md 업데이트
- API 문서 작성
- 환경 변수 가이드

##### 6-3. 배포 준비
- Vercel 배포 설정
- 환경 변수 설정
- 에러 모니터링 (Sentry 등)

---

### 📝 구현 우선순위

#### **1단계 (필수)**: Phase 1 + Phase 2 + Phase 3.1~3.4
→ 기본적인 댓글 크롤링 기능 완성

#### **2단계 (권장)**: Phase 3.5~3.6 + Phase 4
→ 완성도 높은 사용자 경험 제공

#### **3단계 (선택)**: Phase 5 + Phase 6
→ 프로덕션 레벨 품질 달성
