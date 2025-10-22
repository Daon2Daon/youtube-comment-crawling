/**
 * 댓글 목록 컴포넌트
 * [F-05] 댓글 리스트 출력
 */

"use client";

import { CommentItem } from "./CommentItem";
import { ExportToExcelButton } from "./ExportToExcelButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Info } from "lucide-react";
import type { Comment } from "@/types/youtube";

interface CommentListProps {
  /** 댓글 목록 */
  comments: Comment[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 전체 댓글 수 */
  totalCount?: number;
}

/**
 * 댓글 목록을 표시하는 컴포넌트
 */
export const CommentList = ({ comments, isLoading, totalCount }: CommentListProps) => {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CommentListSkeleton />
      </div>
    );
  }

  // 댓글이 없는 경우
  if (comments.length === 0) {
    return null;
  }

  const isMaxLimitReached = comments.length >= 1000;

  return (
    <div className="space-y-4">
      {/* 댓글 수 표시 및 엑셀 추출 버튼 */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            댓글 {totalCount?.toLocaleString() || comments.length.toLocaleString()}개
          </h2>
        </div>
        
        {/* 엑셀 추출 버튼 */}
        <ExportToExcelButton comments={comments} />
      </div>

      {/* 1,000개 제한 안내 */}
      {isMaxLimitReached && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            최대 1,000개의 댓글을 가져왔습니다. 성능을 위해 댓글 수를 제한하고 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* [F-05] 댓글 리스트 */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.commentId} comment={comment} />
        ))}
      </div>
    </div>
  );
};

/**
 * 로딩 스켈레톤 컴포넌트
 */
const CommentListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </>
  );
};

