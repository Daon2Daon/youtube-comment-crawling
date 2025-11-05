/**
 * YouTube 댓글 수집 메인 페이지
 * 댓글 수집 및 Gemini AI 기반 감정 분석 기능 제공
 */

"use client";

import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { SentimentTabs } from "@/components/SentimentTabs";
import { InsightCard } from "@/components/InsightCard";
import { useComments } from "@/hooks/useComments";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Youtube, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Page = () => {
  const { comments, isLoading, error, totalCount, fetchComments } =
    useComments();
  const {
    analysis,
    isLoading: isAnalyzing,
    error: analysisError,
    analyzeComments,
    reset,
  } = useAnalysis();

  const handleSubmit = async (videoUrl: string) => {
    reset(); // 이전 분석 결과 초기화
    await fetchComments(videoUrl);
  };

  const handleAnalyze = async () => {
    if (comments.length > 0) {
      await analyzeComments(comments);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Youtube className="h-10 w-10 text-red-600" />
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              YouTube 댓글 수집기
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            YouTube 영상 URL을 입력하면 해당 영상의 모든 댓글을 가져오고
            Gemini AI로 감정 분석을 제공합니다.
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

          {/* 댓글 분석 버튼 */}
          {comments.length > 0 && !analysis && (
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    댓글 감정 분석
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Gemini AI를 사용하여 댓글을 긍정, 부정, 기타로 분류하고
                    각 카테고리별 인사이트를 제공합니다.
                  </p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || comments.length === 0}
                  className="flex items-center gap-2 shrink-0"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      댓글 분석하기
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* 분석 에러 */}
          {analysisError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          )}

          {/* 분석 결과 */}
          {analysis && (
            <div className="space-y-6">
              {/* 인사이트 카드 */}
              <div className="grid gap-4 md:grid-cols-3">
                {analysis.insights.map((insight) => (
                  <InsightCard key={insight.category} insight={insight} />
                ))}
              </div>

              {/* 감정별 탭 */}
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  감정별 댓글 분류
                </h2>
                <SentimentTabs
                  categorizedComments={analysis.categorizedComments}
                />
              </div>
            </div>
          )}

          {/* 기본 댓글 목록 (분석 전) */}
          {comments.length > 0 && !analysis && (
            <CommentList
              comments={comments}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          )}
        </main>

        {/* 푸터 */}
        <footer className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Developed by 묵 for 서양수 차장님 - 2025.10.23</p>
          <p>
            <small>Gemini AI 기반 감정 분석 기능 포함</small>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Page;
