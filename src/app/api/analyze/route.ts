/**
 * 댓글 감정 분석 API Route
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Comment } from "@/types/youtube";
import type {
  CommentAnalysis,
  CategorizedComments,
  CategoryInsight,
} from "@/types/analysis";
import {
  classifySentiments,
  generateInsights,
  GeminiApiError,
} from "@/lib/gemini/client";

/**
 * Request Body 검증 스키마
 */
const requestSchema = z.object({
  comments: z.array(
    z.object({
      commentId: z.string(),
      author: z.string(),
      text: z.string(),
      likeCount: z.number(),
      publishedAt: z.string(),
    })
  ),
});

/**
 * POST /api/analyze
 * 댓글을 감정별로 분류하고 인사이트를 생성합니다.
 * 
 * @param request - Next.js Request 객체
 * @returns 분석 결과 또는 에러 응답
 */
export async function POST(request: NextRequest) {
  try {
    // Request Body 파싱
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message ||
        "유효하지 않은 요청입니다.";
      return NextResponse.json(
        { error: errorMessage, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { comments } = validationResult.data;

    // 댓글이 없는 경우
    if (comments.length === 0) {
      return NextResponse.json(
        { error: "분석할 댓글이 없습니다.", code: "NO_COMMENTS" },
        { status: 400 }
      );
    }

    // 1. 감정 분류
    const sentimentAnalyses = await classifySentiments(comments);

    // 2. 카테고리별로 그룹화
    const categorizedComments: CategorizedComments = {
      positive: [],
      negative: [],
      neutral: [],
    };

    comments.forEach((comment) => {
      const analysis = sentimentAnalyses.find(
        (a) => a.commentId === comment.commentId
      );
      if (analysis) {
        categorizedComments[analysis.sentiment].push(comment);
      } else {
        // 분류 결과가 없는 경우 기본값으로 중립 처리
        categorizedComments.neutral.push(comment);
      }
    });

    // 3. 인사이트 생성
    const insights = await generateInsights(categorizedComments);

    // 4. 카테고리별 통계 및 인사이트 구성
    const totalCount = comments.length;
    const categoryInsights: CategoryInsight[] = [
      {
        category: "positive",
        summary: insights.positive.summary,
        keyPoints: insights.positive.keyPoints,
        insights: insights.positive.insights,
        count: categorizedComments.positive.length,
        percentage:
          (categorizedComments.positive.length / totalCount) * 100,
      },
      {
        category: "negative",
        summary: insights.negative.summary,
        keyPoints: insights.negative.keyPoints,
        insights: insights.negative.insights,
        count: categorizedComments.negative.length,
        percentage:
          (categorizedComments.negative.length / totalCount) * 100,
      },
      {
        category: "neutral",
        summary: insights.neutral.summary,
        keyPoints: insights.neutral.keyPoints,
        insights: insights.neutral.insights,
        count: categorizedComments.neutral.length,
        percentage:
          (categorizedComments.neutral.length / totalCount) * 100,
      },
    ];

    // 5. 응답 구성
    const response: CommentAnalysis = {
      categorizedComments,
      insights: categoryInsights,
      totalCount,
      analysisDate: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Gemini API 에러 처리
    if (error instanceof GeminiApiError) {
      console.error("Gemini API 오류:", error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    // 예상치 못한 에러
    console.error("분석 중 예상치 못한 오류:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
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
  return NextResponse.json(
    {
      error: "GET 메서드는 지원하지 않습니다. POST 요청을 사용해주세요.",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}



