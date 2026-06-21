import { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { jsonResponse } from '@/core/security/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, recruiterCompanyId } = body;

    if (!name || !email || !password) {
      return jsonResponse({ error: 'Name, email, and password are required.' }, 400);
    }

    const user = await authService.register({
      name,
      email,
      password,
      role,
      recruiterCompanyId,
    });

    return jsonResponse({
      message: 'Account successfully registered.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 201);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
