import { NextRequest } from 'next/server';
import { getSession, jsonResponse } from '@/core/security/session';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return jsonResponse({ authenticated: false }, 200);
  }
  return jsonResponse({ authenticated: true, user: session }, 200);
}
