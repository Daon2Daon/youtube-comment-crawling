/**
 * YouTube URL에서 videoId를 추출하는 유틸리티 함수
 */

/**
 * YouTube URL에서 videoId를 추출합니다.
 * 다양한 YouTube URL 형식을 지원합니다:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * 
 * @param url - YouTube 영상 URL
 * @returns 추출된 videoId 또는 null
 * 
 * @example
 * extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // returns 'dQw4w9WgXcQ'
 * 
 * extractVideoId('https://youtu.be/dQw4w9WgXcQ')
 * // returns 'dQw4w9WgXcQ'
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // URL 공백 제거
  const trimmedUrl = url.trim();

  try {
    // URL 객체로 파싱 시도
    const urlObj = new URL(trimmedUrl);
    const hostname = urlObj.hostname.replace('www.', '');

    // youtube.com 도메인
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // /watch?v=VIDEO_ID 형식
      const videoId = urlObj.searchParams.get('v');
      if (videoId && isValidVideoId(videoId)) {
        return videoId;
      }

      // /embed/VIDEO_ID 형식
      const embedMatch = urlObj.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})$/);
      if (embedMatch && embedMatch[1]) {
        return embedMatch[1];
      }

      // /v/VIDEO_ID 형식
      const vMatch = urlObj.pathname.match(/^\/v\/([a-zA-Z0-9_-]{11})$/);
      if (vMatch && vMatch[1]) {
        return vMatch[1];
      }
    }

    // youtu.be 도메인 (짧은 URL)
    if (hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1); // '/' 제거
      if (isValidVideoId(videoId)) {
        return videoId;
      }
    }
  } catch {
    // URL 파싱 실패 시 정규식으로 재시도
    const regexMatch = trimmedUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (regexMatch && regexMatch[1]) {
      return regexMatch[1];
    }
  }

  return null;
}

/**
 * videoId의 유효성을 검증합니다.
 * YouTube videoId는 11자리 영숫자, 하이픈, 언더스코어로 구성됩니다.
 * 
 * @param videoId - 검증할 videoId
 * @returns 유효한 videoId인지 여부
 */
export function isValidVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * YouTube URL의 유효성을 검증합니다.
 * 
 * @param url - 검증할 URL
 * @returns 유효한 YouTube URL인지 여부
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

