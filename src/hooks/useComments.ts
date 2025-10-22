/**
 * 댓글 데이터 fetching 및 상태 관리 커스텀 훅
 */

"use client";

import { useState } from "react";
import type { Comment, FetchCommentsResponse, ErrorResponse } from "@/types/youtube";

interface UseCommentsState {
  /** 댓글 목록 */
  comments: Comment[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 에러 코드 */
  errorCode: string | null;
  /** 전체 댓글 수 */
  totalCount: number;
}

interface UseCommentsReturn extends UseCommentsState {
  /** 댓글 가져오기 함수 */
  fetchComments: (videoUrl: string) => Promise<void>;
  /** 상태 초기화 함수 */
  reset: () => void;
}

const initialState: UseCommentsState = {
  comments: [],
  isLoading: false,
  error: null,
  errorCode: null,
  totalCount: 0,
};

/**
 * YouTube 댓글을 가져오고 상태를 관리하는 커스텀 훅
 * 
 * @returns 댓글 데이터, 로딩/에러 상태, fetch 함수
 * 
 * @example
 * const { comments, isLoading, error, fetchComments } = useComments();
 * 
 * const handleSubmit = async () => {
 *   await fetchComments('https://www.youtube.com/watch?v=...');
 * };
 */
export function useComments(): UseCommentsReturn {
  const [state, setState] = useState<UseCommentsState>(initialState);

  /**
   * API를 호출하여 댓글을 가져옵니다.
   * 
   * @param videoUrl - YouTube 영상 URL
   */
  const fetchComments = async (videoUrl: string): Promise<void> => {
    // 로딩 시작
    setState({
      ...initialState,
      isLoading: true,
    });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      // 에러 응답 처리
      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setState({
          ...initialState,
          error: errorData.error,
          errorCode: errorData.code || null,
        });
        return;
      }

      // 성공 응답 처리
      const successData = data as FetchCommentsResponse;
      setState({
        comments: successData.comments,
        totalCount: successData.totalCount || successData.comments.length,
        isLoading: false,
        error: null,
        errorCode: null,
      });
    } catch (error) {
      // 네트워크 에러 등 예상치 못한 에러 처리
      console.error("Failed to fetch comments:", error);
      setState({
        ...initialState,
        error: "댓글을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.",
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
    fetchComments,
    reset,
  };
}

