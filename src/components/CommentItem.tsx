/**
 * 개별 댓글 카드 컴포넌트
 * 작성자, 내용, 좋아요 수, 작성일 표시
 */

import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/formatDate";
import type { Comment } from "@/types/youtube";

interface CommentItemProps {
  /** 댓글 데이터 */
  comment: Comment;
}

/**
 * 개별 댓글을 표시하는 카드 컴포넌트
 * Server Component로 사용 가능
 */
export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {/* 작성자 정보 */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {comment.author}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatRelativeTime(comment.publishedAt)}
            </p>
          </div>
        </div>

        {/* 댓글 내용 */}
        <div
          className="mb-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />

        {/* 좋아요 수 */}
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <ThumbsUp className="h-3 w-3" />
          <span>{comment.likeCount.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

