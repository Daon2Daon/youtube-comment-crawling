/**
 * 댓글 감정 분석 관련 타입 정의
 */

import type { Comment } from "@/types/youtube";

/**
 * 감정 타입
 */
export type Sentiment = "positive" | "negative" | "neutral";

/**
 * 감정 분석 결과
 * Gemini API로부터 받은 개별 댓글의 감정 분류 결과
 */
export interface SentimentAnalysis {
  /** 댓글 ID */
  commentId: string;
  /** 감정 분류 결과 */
  sentiment: Sentiment;
  /** 신뢰도 (0.0 ~ 1.0) */
  confidence: number;
}

/**
 * 분류 응답 형식 (Gemini API 응답)
 * classifySentiments 함수의 응답 형식
 */
export interface ClassificationResponse {
  commentId: string;
  sentiment: Sentiment;
  confidence: number;
}

/**
 * 카테고리별로 분류된 댓글
 */
export interface CategorizedComments {
  /** 긍정적인 댓글 목록 */
  positive: Comment[];
  /** 부정적인 댓글 목록 */
  negative: Comment[];
  /** 중립적인 댓글 목록 */
  neutral: Comment[];
}

/**
 * 카테고리별 인사이트 (단일 카테고리)
 * summary, keyPoints, insights를 포함하며 통계 정보(count, percentage)도 포함
 */
export interface CategoryInsight {
  /** 카테고리 타입 */
  category: Sentiment;
  /** 주요 내용 요약 (2-3문장) */
  summary: string;
  /** 주요 포인트 배열 (3-5개) */
  keyPoints: string[];
  /** 인사이트 및 추천사항 (2-3문장) */
  insights: string;
  /** 해당 카테고리의 댓글 수 */
  count: number;
  /** 해당 카테고리의 비율 (0-100) */
  percentage: number;
}

/**
 * 카테고리별 인사이트 응답 (Gemini API 응답)
 * generateInsights 함수의 응답 형식
 */
export interface CategoryInsightResponse {
  positive: {
    summary: string;
    keyPoints: string[];
    insights: string;
  };
  negative: {
    summary: string;
    keyPoints: string[];
    insights: string;
  };
  neutral: {
    summary: string;
    keyPoints: string[];
    insights: string;
  };
}

/**
 * 인사이트 응답 형식 (단일 카테고리)
 * CategoryInsightResponse의 각 카테고리 항목
 */
export interface InsightResponse {
  summary: string;
  keyPoints: string[];
  insights: string;
}

/**
 * 댓글 분석 결과 (최종 응답)
 * /api/analyze 엔드포인트의 응답 형식
 */
export interface CommentAnalysis {
  /** 카테고리별로 분류된 댓글 */
  categorizedComments: CategorizedComments;
  /** 카테고리별 인사이트 (통계 포함) */
  insights: CategoryInsight[];
  /** 전체 댓글 수 */
  totalCount: number;
  /** 분석 일시 (ISO 8601 형식) */
  analysisDate: string;
}


