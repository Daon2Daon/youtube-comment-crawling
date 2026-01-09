/**
 * 엑셀 추출 버튼 컴포넌트
 * 댓글 데이터를 Excel 파일로 다운로드
 */

"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Comment } from "@/types/youtube";
import { formatDate } from "@/lib/formatDate";

interface ExportToExcelButtonProps {
  /** 내보낼 댓글 목록 */
  comments: Comment[];
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 댓글 데이터를 Excel 파일로 내보내는 버튼 컴포넌트
 * 
 * @param comments - 내보낼 댓글 목록
 * @param disabled - 버튼 비활성화 여부
 */
export const ExportToExcelButton = ({ comments, disabled }: ExportToExcelButtonProps) => {
  /**
   * Excel 파일로 다운로드
   */
  const handleExport = () => {
    // 버튼이 이미 disabled 상태이므로 빈 배열 체크는 불필요
    // Excel 데이터 준비
    const excelData = comments.map((comment) => ({
      작성자: comment.author,
      작성일: formatDate(comment.publishedAt, "yyyy-MM-dd HH:mm:ss"),
      댓글내용: comment.text.replace(/<[^>]*>/g, ""), // HTML 태그 제거
      "좋아요 수": comment.likeCount,
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 열 너비 자동 조정
    const columnWidths = [
      { wch: 20 }, // 작성자
      { wch: 20 }, // 작성일
      { wch: 60 }, // 댓글내용
      { wch: 12 }, // 좋아요 수
    ];
    worksheet["!cols"] = columnWidths;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "댓글 목록");

    // 파일명 생성 (현재 날짜 포함)
    const now = new Date();
    const dateString = formatDate(now.toISOString(), "yyyy-MM-dd_HHmmss");
    const fileName = `youtube_comments_${dateString}.xlsx`;

    // 파일 다운로드
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || comments.length === 0}
      variant="outline"
      className="w-full sm:w-auto"
    >
      <Download className="mr-2 h-4 w-4" />
      엑셀로 추출 ({comments.length.toLocaleString()}개)
    </Button>
  );
};

