/**
 * 댓글 목록 컴포넌트
 * [F-05] 댓글 리스트 출력
 */

"use client";

import { CommentItem } from "./CommentItem";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
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

  return (
    <div className="space-y-4">
      {/* 댓글 수 표시 */}
      <div className="flex items-center gap-2 border-b pb-3">
        <MessageSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          댓글 {totalCount?.toLocaleString() || comments.length.toLocaleString()}개
        </h2>
      </div>

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

