/**
 * 날짜 포맷팅 유틸리티 함수
 */

import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * ISO 8601 날짜 문자열을 상대적 시간으로 포맷합니다.
 * 예: "3일 전", "2시간 전"
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 상대적 시간 문자열
 * 
 * @example
 * formatRelativeTime('2025-10-20T10:00:00Z')
 * // returns "2일 전"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ko,
    });
  } catch {
    return "날짜 형식 오류";
  }
}

/**
 * ISO 8601 날짜 문자열을 지정된 형식으로 포맷합니다.
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param formatString - date-fns 포맷 문자열 (기본값: 'yyyy.MM.dd HH:mm')
 * @returns 포맷된 날짜 문자열
 * 
 * @example
 * formatDate('2025-10-20T10:30:00Z')
 * // returns "2025.10.20 10:30"
 * 
 * formatDate('2025-10-20T10:30:00Z', 'yyyy년 MM월 dd일')
 * // returns "2025년 10월 20일"
 */
export function formatDate(
  dateString: string,
  formatString: string = "yyyy.MM.dd HH:mm"
): string {
  try {
    const date = new Date(dateString);
    return format(date, formatString, { locale: ko });
  } catch {
    return "날짜 형식 오류";
  }
}

/**
 * 날짜 문자열의 유효성을 검증합니다.
 * 
 * @param dateString - 검증할 날짜 문자열
 * @returns 유효한 날짜인지 여부
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

