/**
 * 댓글 분석 Hook
 * Gemini API를 사용하여 댓글을 감정별로 분류하고 인사이트를 생성합니다.
 */

"use client";

import { useState } from "react";
import type { CommentAnalysis } from "@/types/analysis";
import type { Comment } from "@/types/youtube";

interface UseAnalysisState {
  /** 분석 결과 */
  analysis: CommentAnalysis | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 에러 코드 */
  errorCode: string | null;
}

interface UseAnalysisReturn extends UseAnalysisState {
  /** 댓글 분석 함수 */
  analyzeComments: (comments: Comment[]) => Promise<void>;
  /** 상태 초기화 함수 */
  reset: () => void;
}

const initialState: UseAnalysisState = {
  analysis: null,
  isLoading: false,
  error: null,
  errorCode: null,
};

/**
 * 댓글 분석 Hook
 * 
 * @returns 분석 상태, 분석 함수, 초기화 함수
 * 
 * @example
 * const { analysis, isLoading, error, analyzeComments, reset } = useAnalysis();
 * 
 * const handleAnalyze = async () => {
 *   await analyzeComments(comments);
 * };
 */
export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>(initialState);

  /**
   * API를 호출하여 댓글을 분석합니다.
   * 
   * @param comments - 분석할 댓글 목록
   */
  const analyzeComments = async (comments: Comment[]): Promise<void> => {
    // 로딩 시작
    setState({
      ...initialState,
      isLoading: true,
    });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments }),
      });

      const data = await response.json();

      // 에러 응답 처리
      if (!response.ok) {
        setState({
          ...initialState,
          error: data.error || "분석 중 오류가 발생했습니다.",
          errorCode: data.code || null,
        });
        return;
      }

      // 성공 응답 처리
      const analysisData = data as CommentAnalysis;
      setState({
        analysis: analysisData,
        isLoading: false,
        error: null,
        errorCode: null,
      });
    } catch (error) {
      // 네트워크 에러 등 예상치 못한 에러 처리
      console.error("분석 중 오류:", error);
      setState({
        ...initialState,
        error:
          error instanceof Error
            ? error.message
            : "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        errorCode: "FETCH_ERROR",
      });
    }
  };

  /**
   * 상태를 초기화합니다.
   */
  const reset = (): void => {
    setState(initialState);
  };

  return {
    ...state,
    analyzeComments,
    reset,
  };
}







