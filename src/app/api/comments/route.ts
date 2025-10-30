/**
 * YouTube 댓글 수집 API Route
 * POST /api/comments
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractVideoId } from "@/lib/youtube/extractVideoId";
import { fetchComments, YouTubeApiClientError } from "@/lib/youtube/apiClient";
import type { FetchCommentsResponse, ErrorResponse } from "@/types/youtube";

/**
 * Request Body 검증 스키마
 */
const requestSchema = z.object({
  videoUrl: z.string().min(1, "YouTube URL을 입력해주세요."),
  order: z.enum(["relevance", "time"]).optional().default("time"),
  maxResults: z.number().int().min(1).max(100).optional().default(100),
});

/**
 * POST /api/comments
 * YouTube 영상의 댓글을 가져옵니다.
 * 
 * @param request - Next.js Request 객체
 * @returns 댓글 목록 또는 에러 응답
 */
export async function POST(request: NextRequest) {
  try {
    // Request Body 파싱
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || "유효하지 않은 요청입니다.";
      return NextResponse.json<ErrorResponse>(
        { error: errorMessage, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { videoUrl, order, maxResults } = validationResult.data;

    // videoId 추출
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "유효한 YouTube URL이 아닙니다. URL을 확인해주세요.",
          code: "INVALID_URL",
        },
        { status: 400 }
      );
    }

    // YouTube API 호출하여 댓글 가져오기
    const comments = await fetchComments({
      videoId,
      order,
      maxResults,
    });

    // 성공 응답
    const response: FetchCommentsResponse = {
      comments,
      totalCount: comments.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // YouTube API 에러 처리
    if (error instanceof YouTubeApiClientError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    // 예상치 못한 에러
    console.error("Unexpected error in /api/comments:", error);

    return NextResponse.json<ErrorResponse>(
      {
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET 메서드는 지원하지 않음
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      error: "GET 메서드는 지원하지 않습니다. POST 요청을 사용해주세요.",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

