import { NextRequest, NextResponse } from 'next/server';
import { authService, UserSession } from '@/server/services/auth.service';
import { hasPermission, Permission } from '@/server/domain/rbac';

const COOKIE_NAME = 'placement_token';

/**
 * Extracts and decodes the user session from the request cookies.
 */
export function getSession(req: NextRequest): UserSession | null {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return authService.verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Helper to construct standard JSON error responses.
 */
export function jsonResponse(data: any, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers });
}

/**
 * Validates request session and role permission.
 * Returns session if authorized, otherwise throws an error response.
 */
export function checkPermission(req: NextRequest, permission?: Permission): UserSession {
  const session = getSession(req);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  if (permission && !hasPermission(session.role, permission)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

/**
 * Set session cookie helper.
 */
export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

/**
 * Clear session cookie helper.
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
}
