/**
 * YouTube URL 입력 폼 컴포넌트
 * [F-01] URL 입력 필드
 * [F-02] 데이터 요청 버튼
 * [F-03] 로딩 상태 표시
 * [F-04] 오류 메시지 표시
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle } from "lucide-react";

interface CommentFormProps {
  /** 폼 제출 핸들러 */
  onSubmit: (videoUrl: string) => Promise<void>;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * YouTube URL을 입력받아 댓글을 가져오는 폼 컴포넌트
 */
export const CommentForm = ({ onSubmit, isLoading, error }: CommentFormProps) => {
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      return;
    }

    await onSubmit(videoUrl);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
        {/* [F-01] URL 입력 필드 */}
        <Input
          type="text"
          placeholder="YouTube 영상 URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={isLoading}
          className="flex-1"
          aria-label="YouTube 영상 URL"
        />

        {/* [F-02] 데이터 요청 버튼 */}
        <Button
          type="submit"
          disabled={isLoading || !videoUrl.trim()}
          className="min-w-[120px]"
        >
          {/* [F-03] 로딩 상태 표시 */}
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              로딩 중...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              댓글 가져오기
            </>
          )}
        </Button>
      </form>

      {/* [F-04] 오류 메시지 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

