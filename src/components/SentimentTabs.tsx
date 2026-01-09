/**
 * 감정별 탭 컴포넌트
 * 긍정/부정/중립 댓글을 탭으로 구분하여 표시
 */

"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Smile, Frown, Minus } from "lucide-react";
import type { CategorizedComments } from "@/types/analysis";
import { SimpleCommentList } from "./SimpleCommentList";

interface SentimentTabsProps {
  /** 카테고리별로 분류된 댓글 */
  categorizedComments: CategorizedComments;
}

/**
 * 감정별 탭 컴포넌트
 * 긍정, 부정, 중립 댓글을 탭으로 구분하여 표시합니다.
 */
export const SentimentTabs = ({ categorizedComments }: SentimentTabsProps) => {
  return (
    <Tabs defaultValue="positive" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="positive"
          className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-950 dark:data-[state=active]:text-green-300"
        >
          <Smile className="h-4 w-4" />
          긍정 ({categorizedComments.positive.length})
        </TabsTrigger>
        <TabsTrigger
          value="negative"
          className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-950 dark:data-[state=active]:text-red-300"
        >
          <Frown className="h-4 w-4" />
          부정 ({categorizedComments.negative.length})
        </TabsTrigger>
        <TabsTrigger
          value="neutral"
          className="flex items-center gap-2 data-[state=active]:bg-zinc-50 data-[state=active]:text-zinc-700 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-300"
        >
          <Minus className="h-4 w-4" />
          기타 ({categorizedComments.neutral.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="positive" className="mt-4">
        <SimpleCommentList comments={categorizedComments.positive} />
      </TabsContent>

      <TabsContent value="negative" className="mt-4">
        <SimpleCommentList comments={categorizedComments.negative} />
      </TabsContent>

      <TabsContent value="neutral" className="mt-4">
        <SimpleCommentList comments={categorizedComments.neutral} />
      </TabsContent>
    </Tabs>
  );
};



