import { NextResponse } from 'next/server';

/**
 * 헬스체크 엔드포인트
 * Docker 컨테이너의 상태를 확인하기 위한 API
 */
export async function GET() {
  try {
    // 기본 상태 체크
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

