/**
 * YouTube Data API v3 클라이언트
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import type {
  Comment,
  YouTubeCommentThreadResponse,
  YouTubeApiError,
  FetchCommentsParams,
} from "@/types/youtube";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * YouTube Data API v3를 사용하여 댓글을 가져옵니다.
 * 페이지네이션을 자동으로 처리하여 최대 1,000개의 댓글을 반환합니다.
 * 
 * @param params - API 요청 파라미터
 * @returns 댓글 배열 (최대 1,000개)
 * @throws {YouTubeApiClientError} API 호출 실패 시
 * 
 * @example
 * const comments = await fetchComments({
 *   videoId: 'dQw4w9WgXcQ',
 *   maxResults: 100,
 *   order: 'relevance'
 * });
 */
export async function fetchComments(
  params: FetchCommentsParams
): Promise<Comment[]> {
  const { videoId, maxResults = 100, order = "time" } = params;
  const MAX_TOTAL_COMMENTS = 1000; // 최대 1,000개까지만 가져오기

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new YouTubeApiClientError(
      "YOUTUBE_API_KEY가 설정되지 않았습니다.",
      "CONFIG_ERROR",
      500
    );
  }

  const allComments: Comment[] = [];
  let pageToken: string | undefined = undefined;

  try {
    // 페이지네이션 처리: nextPageToken이 없거나 1,000개에 도달할 때까지 반복
    let pageCount = 0;
    do {
      pageCount++;
      console.log(`[YouTube API] Fetching page ${pageCount}${pageToken ? ` (token: ${pageToken.substring(0, 10)}...)` : ''}`);
      
      const response: AxiosResponse<YouTubeCommentThreadResponse> = await axios.get<YouTubeCommentThreadResponse>(
        `${YOUTUBE_API_BASE_URL}/commentThreads`,
        {
          params: {
            key: apiKey,
            part: "snippet",
            videoId,
            maxResults,
            order,
            ...(pageToken && { pageToken }), // pageToken이 있을 때만 포함
          },
        }
      );

      // API 응답 구조 디버깅
      console.log(`[YouTube API] Response metadata:`, {
        kind: response.data.kind,
        etag: response.data.etag?.substring(0, 20) + '...',
        nextPageToken: response.data.nextPageToken ? response.data.nextPageToken.substring(0, 20) + '...' : 'NONE',
        pageInfo: response.data.pageInfo,
        itemCount: response.data.items?.length || 0,
      });

      // 댓글 데이터 변환 및 추가
      const comments = response.data.items.map(transformComment);
      allComments.push(...comments);
      console.log(`[YouTube API] Page ${pageCount}: ${comments.length} comments fetched, total: ${allComments.length}`);

      // 다음 페이지 토큰 설정
      pageToken = response.data.nextPageToken;
      console.log(`[YouTube API] nextPageToken:`, pageToken ? `${pageToken.substring(0, 20)}...` : 'undefined (마지막 페이지)');

      // 1,000개 도달 시 중단
      if (allComments.length >= MAX_TOTAL_COMMENTS) {
        console.log(`[YouTube API] Reached maximum limit of ${MAX_TOTAL_COMMENTS} comments`);
        break;
      }
    } while (pageToken);

    // 1,000개 초과 시 자르기
    const finalComments = allComments.slice(0, MAX_TOTAL_COMMENTS);
    console.log(`[YouTube API] Completed! Total comments fetched: ${finalComments.length} from ${pageCount} pages`);
    return finalComments;
  } catch (error) {
    throw handleYouTubeApiError(error);
  }
}

/**
 * YouTube API 응답 데이터를 Comment 타입으로 변환합니다.
 * 
 * @param item - YouTube 댓글 스레드 아이템
 * @returns 변환된 Comment 객체
 */
function transformComment(item: YouTubeCommentThreadResponse["items"][0]): Comment {
  const snippet = item.snippet.topLevelComment.snippet;

  return {
    commentId: item.id,
    author: snippet.authorDisplayName,
    text: snippet.textDisplay,
    likeCount: snippet.likeCount,
    publishedAt: snippet.publishedAt,
  };
}

/**
 * YouTube API 에러를 처리하고 사용자 친화적인 에러로 변환합니다.
 * 
 * @param error - 발생한 에러
 * @returns YouTubeApiClientError 인스턴스
 */
function handleYouTubeApiError(error: unknown): YouTubeApiClientError {
  if (!axios.isAxiosError(error)) {
    return new YouTubeApiClientError(
      "알 수 없는 오류가 발생했습니다.",
      "UNKNOWN_ERROR",
      500
    );
  }

  const axiosError = error as AxiosError<YouTubeApiError>;

  if (!axiosError.response) {
    return new YouTubeApiClientError(
      "네트워크 오류가 발생했습니다.",
      "NETWORK_ERROR",
      500
    );
  }

  const { status, data } = axiosError.response;
  const errorReason = data?.error?.errors?.[0]?.reason;

  // 에러 상태 코드별 처리
  switch (status) {
    case 400:
      return new YouTubeApiClientError(
        "유효하지 않은 요청입니다.",
        "INVALID_REQUEST",
        400
      );

    case 403:
      if (errorReason === "quotaExceeded") {
        return new YouTubeApiClientError(
          "API 할당량을 초과했습니다. 나중에 다시 시도해주세요.",
          "QUOTA_EXCEEDED",
          403
        );
      }
      if (errorReason === "commentsDisabled") {
        return new YouTubeApiClientError(
          "이 영상은 댓글이 비활성화되었습니다.",
          "COMMENTS_DISABLED",
          403
        );
      }
      return new YouTubeApiClientError(
        "접근 권한이 없습니다.",
        "FORBIDDEN",
        403
      );

    case 404:
      return new YouTubeApiClientError(
        "영상을 찾을 수 없습니다. videoId를 확인해주세요.",
        "VIDEO_NOT_FOUND",
        404
      );

    default:
      return new YouTubeApiClientError(
        data?.error?.message || "YouTube API 오류가 발생했습니다.",
        "API_ERROR",
        status
      );
  }
}

/**
 * YouTube API 클라이언트 에러 클래스
 */
export class YouTubeApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "YouTubeApiClientError";
  }
}

