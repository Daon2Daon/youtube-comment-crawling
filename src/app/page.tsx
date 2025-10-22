/**
 * YouTube 댓글 수집 메인 페이지
 */

"use client";

import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { useComments } from "@/hooks/useComments";
import { Youtube } from "lucide-react";

const Page = () => {
  const { comments, isLoading, error, totalCount, fetchComments } = useComments();

  const handleSubmit = async (videoUrl: string) => {
    await fetchComments(videoUrl);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Youtube className="h-10 w-10 text-red-600" />
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              YouTube 댓글 수집기
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            YouTube 영상 URL을 입력하면 해당 영상의 모든 댓글을 가져옵니다.
          </p>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="space-y-8">
          {/* URL 입력 폼 */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CommentForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* 댓글 목록 */}
          <CommentList
            comments={comments}
            isLoading={isLoading}
            totalCount={totalCount}
          />
        </main>

        {/* 푸터 */}
        <footer className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            이 서비스는 YouTube Data API v3를 사용합니다.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Page;
