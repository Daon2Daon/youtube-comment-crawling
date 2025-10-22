/**
 * YouTube 댓글 데이터 타입 정의
 */

/**
 * 표준 댓글 객체 인터페이스
 * 프론트엔드와 백엔드 간 주고받는 댓글 데이터 형식
 */
export interface Comment {
  /** 댓글 고유 ID */
  commentId: string;
  /** 작성자 이름 */
  author: string;
  /** 댓글 내용 (HTML 포맷) */
  text: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 작성일시 (ISO 8601 형식) */
  publishedAt: string;
}

/**
 * YouTube Data API v3 댓글 응답 타입
 * commentThreads.list 엔드포인트 응답 구조
 */
export interface YouTubeCommentThreadResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeCommentThread[];
}

/**
 * YouTube 댓글 스레드 아이템
 */
export interface YouTubeCommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    channelId: string;
    videoId: string;
    topLevelComment: YouTubeComment;
    canReply: boolean;
    totalReplyCount: number;
    isPublic: boolean;
  };
}

/**
 * YouTube 댓글 객체
 */
export interface YouTubeComment {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    channelId: string;
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: {
      value: string;
    };
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
  };
}

/**
 * API 에러 응답 타입
 */
export interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

/**
 * 댓글 정렬 옵션
 */
export type CommentOrderType = "relevance" | "time";

/**
 * API 요청 파라미터
 */
export interface FetchCommentsParams {
  videoId: string;
  maxResults?: number;
  order?: CommentOrderType;
  pageToken?: string;
}

/**
 * API 응답 타입 (성공)
 */
export interface FetchCommentsResponse {
  comments: Comment[];
  totalCount?: number;
}

/**
 * API 응답 타입 (에러)
 */
export interface ErrorResponse {
  error: string;
  code?: string;
}

