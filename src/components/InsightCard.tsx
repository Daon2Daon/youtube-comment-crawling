/**
 * 인사이트 카드 컴포넌트
 * 카테고리별 요약, 주요 포인트, 인사이트를 표시
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smile, Frown, Minus, TrendingUp, Lightbulb, FileText } from "lucide-react";
import type { CategoryInsight } from "@/types/analysis";

interface InsightCardProps {
  /** 카테고리별 인사이트 데이터 */
  insight: CategoryInsight;
}

/**
 * 아이콘 및 색상 매핑
 */
const iconMap = {
  positive: Smile,
  negative: Frown,
  neutral: Minus,
};

const colorMap = {
  positive:
    "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50",
  negative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  neutral: "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50",
};

const borderColorMap = {
  positive: "border-green-200 dark:border-green-800",
  negative: "border-red-200 dark:border-red-800",
  neutral: "border-zinc-200 dark:border-zinc-700",
};

const labelMap = {
  positive: "긍정",
  negative: "부정",
  neutral: "기타",
};

/**
 * 인사이트 카드 컴포넌트
 * 카테고리별 요약, 주요 포인트, 인사이트를 표시합니다.
 */
export const InsightCard = ({ insight }: InsightCardProps) => {
  const Icon = iconMap[insight.category];
  const colorClass = colorMap[insight.category];
  const borderClass = borderColorMap[insight.category];

  return (
    <Card
      className={`w-full ${borderClass} transition-shadow hover:shadow-md`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">
              {labelMap[insight.category]} 댓글
            </div>
            <div className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              {insight.count}개 ({insight.percentage.toFixed(1)}%)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 요약 */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            요약
          </div>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {insight.summary}
          </p>
        </div>

        {/* 주요 포인트 */}
        {insight.keyPoints.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              주요 포인트
            </div>
            <ul className="space-y-1.5">
              {insight.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <span className="flex-1 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 인사이트 */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Lightbulb className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            인사이트
          </div>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {insight.insights}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};







