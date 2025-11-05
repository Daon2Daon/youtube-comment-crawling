/**
 * Gemini API 클라이언트
 * 댓글 감정 분류 및 인사이트 생성
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Comment } from "@/types/youtube";
import type {
  SentimentAnalysis,
  ClassificationResponse,
  InsightResponse,
  CategoryInsightResponse,
} from "@/types/analysis";

/**
 * Gemini API 키 확인
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
}

/**
 * Gemini AI 클라이언트 초기화
 */
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * 사용할 모델 이름 (환경 변수로 설정 가능)
 * 
 * 공식 문서 참고: https://ai.google.dev/gemini-api/docs/models?hl=ko
 * 
 * 지원되는 최신 모델 (2025년 기준):
 * - gemini-2.5-flash (최신 Flash 모델, 빠름, 비용 효율적)
 * - gemini-2.5-pro (최신 Pro 모델, 더 정확)
 * - gemini-2.0-flash (2세대 Flash 모델)
 * - gemini-2.0-flash-lite (경량 Flash 모델)
 * 
 * 최신 버전 별칭:
 * - gemini-flash-latest (최신 Flash 버전)
 * - gemini-pro-latest (최신 Pro 버전)
 * 
 * 기본값: gemini-2.0-flash (안정적이고 빠른 모델)
 */
const MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash";

/**
 * 모델 초기화
 */
const model = genAI.getGenerativeModel({ 
  model: MODEL_NAME
});

/**
 * Gemini API 에러 클래스
 */
export class GeminiApiError extends Error {
  constructor(
    message: string,
    public code: string = "GEMINI_API_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "GeminiApiError";
  }
}

/**
 * 댓글을 감정별로 분류합니다.
 * 
 * @param comments - 분류할 댓글 목록
 * @returns 감정 분류 결과 배열
 */
export async function classifySentiments(
  comments: Comment[]
): Promise<SentimentAnalysis[]> {
  if (comments.length === 0) {
    return [];
  }

  // 배치 처리 (한 번에 너무 많은 댓글 처리 방지)
  const batchSize = 50;
  const results: SentimentAnalysis[] = [];

  try {
    for (let i = 0; i < comments.length; i += batchSize) {
      const batch = comments.slice(i, i + batchSize);
      const batchResults = await classifyBatch(batch);
      results.push(...batchResults);

      // API 호출 간 짧은 지연 (Rate Limit 방지)
      if (i + batchSize < comments.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  } catch (error) {
    console.error("감정 분류 중 오류:", error);
    throw new GeminiApiError(
      error instanceof Error ? error.message : "감정 분류 중 오류가 발생했습니다.",
      "CLASSIFICATION_ERROR"
    );
  }
}

/**
 * 댓글 배치를 감정별로 분류합니다.
 * 
 * @param comments - 분류할 댓글 배치
 * @returns 감정 분류 결과 배열
 */
async function classifyBatch(
  comments: Comment[]
): Promise<SentimentAnalysis[]> {
  const prompt = createClassificationPrompt(comments);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 파싱
    const classifications = parseClassificationResponse(text, comments);

    return classifications;
  } catch (error) {
    console.error("Gemini API 호출 실패:", error);
    throw new GeminiApiError(
      error instanceof Error ? error.message : "Gemini API 호출 중 오류가 발생했습니다.",
      "API_CALL_ERROR"
    );
  }
}

/**
 * 분류 프롬프트 생성
 * 
 * @param comments - 분류할 댓글 목록
 * @returns 프롬프트 문자열
 */
function createClassificationPrompt(comments: Comment[]): string {
  const commentsText = comments
    .map(
      (c, idx) =>
        `${idx + 1}. [ID: ${c.commentId}] ${c.text.replace(/\n/g, " ")}`
    )
    .join("\n");

  return `다음 YouTube 댓글들을 감정별로 분류해주세요.

각 댓글을 다음 3가지 카테고리 중 하나로 분류하세요:
- positive: 긍정적인 댓글 (칭찬, 추천, 만족, 좋아요 등)
- negative: 부정적인 댓글 (불만, 비판, 불만족, 싫어요 등)
- neutral: 중립적인 댓글 (정보 제공, 질문, 기타 등)

응답 형식 (JSON 배열):
[
  {
    "commentId": "댓글 ID",
    "sentiment": "positive | negative | neutral",
    "confidence": 0.0-1.0
  }
]

댓글 목록:
${commentsText}

JSON 형식으로만 응답해주세요. 다른 설명이나 텍스트는 포함하지 마세요.`;
}

/**
 * 분류 응답 파싱
 * 
 * @param text - Gemini API 응답 텍스트
 * @param comments - 원본 댓글 목록
 * @returns 파싱된 분류 결과 배열
 */
function parseClassificationResponse(
  text: string,
  comments: Comment[]
): SentimentAnalysis[] {
  try {
    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();

    // 마크다운 코드 블록 제거
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) ||
      jsonText.match(/```\n([\s\S]*?)\n```/) ||
      jsonText.match(/```([\s\S]*?)```/);

    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // JSON 파싱
    const parsed: ClassificationResponse[] = JSON.parse(jsonText);

    // 결과 검증 및 변환
    const results: SentimentAnalysis[] = parsed.map((item) => {
      // commentId가 일치하는지 확인
      const comment = comments.find((c) => c.commentId === item.commentId);
      if (!comment) {
        throw new Error(`댓글 ID ${item.commentId}를 찾을 수 없습니다.`);
      }

      // sentiment 타입 검증
      if (
        item.sentiment !== "positive" &&
        item.sentiment !== "negative" &&
        item.sentiment !== "neutral"
      ) {
        throw new Error(`유효하지 않은 감정 타입: ${item.sentiment}`);
      }

      return {
        commentId: item.commentId,
        sentiment: item.sentiment,
        confidence: Math.max(0, Math.min(1, item.confidence || 0.5)),
      };
    });

    return results;
  } catch (error) {
    console.error("JSON 파싱 실패:", error);
    console.error("원본 텍스트:", text);
    throw new GeminiApiError(
      "분류 결과를 파싱하는 중 오류가 발생했습니다.",
      "PARSE_ERROR"
    );
  }
}

/**
 * 카테고리별 요약 및 인사이트 생성
 * 
 * @param categorizedComments - 카테고리별로 분류된 댓글
 * @returns 카테고리별 인사이트
 */
export async function generateInsights(categorizedComments: {
  positive: Comment[];
  negative: Comment[];
  neutral: Comment[];
}): Promise<CategoryInsightResponse> {
  const prompt = createInsightPrompt(categorizedComments);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 파싱
    const insights = parseInsightResponse(text);

    return insights;
  } catch (error) {
    console.error("인사이트 생성 실패:", error);
    throw new GeminiApiError(
      error instanceof Error
        ? error.message
        : "인사이트 생성 중 오류가 발생했습니다.",
      "INSIGHT_GENERATION_ERROR"
    );
  }
}

/**
 * 인사이트 프롬프트 생성
 * 
 * @param categorizedComments - 카테고리별로 분류된 댓글
 * @returns 프롬프트 문자열
 */
function createInsightPrompt(categorizedComments: {
  positive: Comment[];
  negative: Comment[];
  neutral: Comment[];
}): string {
  const positiveText = categorizedComments.positive
    .map((c, idx) => `${idx + 1}. ${c.text.replace(/\n/g, " ")}`)
    .join("\n");
  const negativeText = categorizedComments.negative
    .map((c, idx) => `${idx + 1}. ${c.text.replace(/\n/g, " ")}`)
    .join("\n");
  const neutralText = categorizedComments.neutral
    .map((c, idx) => `${idx + 1}. ${c.text.replace(/\n/g, " ")}`)
    .join("\n");

  return `다음 YouTube 댓글들을 카테고리별로 분석해주세요.

각 카테고리별로 다음 형식으로 응답해주세요:
- summary: 주요 내용 요약 (2-3문장)
- keyPoints: 주요 포인트 3-5개 (배열)
- insights: 인사이트 및 추천사항 (2-3문장)

응답 형식 (JSON):
{
  "positive": {
    "summary": "...",
    "keyPoints": ["...", "..."],
    "insights": "..."
  },
  "negative": {
    "summary": "...",
    "keyPoints": ["...", "..."],
    "insights": "..."
  },
  "neutral": {
    "summary": "...",
    "keyPoints": ["...", "..."],
    "insights": "..."
  }
}

긍정 댓글 (${categorizedComments.positive.length}개):
${positiveText || "(없음)"}

부정 댓글 (${categorizedComments.negative.length}개):
${negativeText || "(없음)"}

중립 댓글 (${categorizedComments.neutral.length}개):
${neutralText || "(없음)"}

JSON 형식으로만 응답해주세요. 다른 설명이나 텍스트는 포함하지 마세요.`;
}

/**
 * 인사이트 응답 파싱
 * 
 * @param text - Gemini API 응답 텍스트
 * @returns 파싱된 인사이트 결과
 */
function parseInsightResponse(text: string): CategoryInsightResponse {
  try {
    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();

    // 마크다운 코드 블록 제거
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) ||
      jsonText.match(/```\n([\s\S]*?)\n```/) ||
      jsonText.match(/```([\s\S]*?)```/);

    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // JSON 파싱
    const parsed: CategoryInsightResponse = JSON.parse(jsonText);

    // 결과 검증
    const categories: Array<"positive" | "negative" | "neutral"> = [
      "positive",
      "negative",
      "neutral",
    ];

    for (const category of categories) {
      if (!parsed[category]) {
        throw new Error(`${category} 카테고리의 인사이트가 없습니다.`);
      }

      if (!parsed[category].summary) {
        parsed[category].summary = "분석할 댓글이 없습니다.";
      }

      if (!Array.isArray(parsed[category].keyPoints)) {
        parsed[category].keyPoints = [];
      }

      if (!parsed[category].insights) {
        parsed[category].insights = "인사이트를 생성할 수 없습니다.";
      }
    }

    return parsed;
  } catch (error) {
    console.error("JSON 파싱 실패:", error);
    console.error("원본 텍스트:", text);

    // 기본값 반환
    const defaultResponse: CategoryInsightResponse = {
      positive: {
        summary: "분석 중 오류가 발생했습니다.",
        keyPoints: [],
        insights: "다시 시도해주세요.",
      },
      negative: {
        summary: "분석 중 오류가 발생했습니다.",
        keyPoints: [],
        insights: "다시 시도해주세요.",
      },
      neutral: {
        summary: "분석 중 오류가 발생했습니다.",
        keyPoints: [],
        insights: "다시 시도해주세요.",
      },
    };

    return defaultResponse;
  }
}

