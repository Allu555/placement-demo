import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { jsonResponse, setSessionCookie } from '@/core/security/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required.' }, 400);
    }

    const { token, user } = await authService.login(email, password);

    const response = NextResponse.json({
      message: 'Login successful.',
      user,
    }, { status: 200 });

    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Invalid credentials' }, 401);
  }
}
