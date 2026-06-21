import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/core/security/session';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    message: 'Logged out successfully.',
  }, { status: 200 });

  clearSessionCookie(response);
  return response;
}
