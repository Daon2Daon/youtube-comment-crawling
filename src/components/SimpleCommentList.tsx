/**
 * 간단한 댓글 목록 컴포넌트
 * 감정별 탭 등에서 사용되는 경량 버전
 */

"use client";

import { CommentItem } from "./CommentItem";
import type { Comment } from "@/types/youtube";

interface SimpleCommentListProps {
  /** 댓글 목록 */
  comments: Comment[];
  /** 빈 상태 메시지 */
  emptyMessage?: string;
}

/**
 * 댓글 목록을 간단하게 표시하는 컴포넌트
 */
export const SimpleCommentList = ({
  comments,
  emptyMessage = "해당 카테고리의 댓글이 없습니다.",
}: SimpleCommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.commentId} comment={comment} />
      ))}
    </div>
  );
};
