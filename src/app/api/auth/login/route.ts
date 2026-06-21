import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { firebaseAdmin } from '@/core/firebase/admin';
import { jsonResponse, setSessionCookie } from '@/core/security/session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token';
const TOKEN_EXPIRY = '7d';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return jsonResponse({ error: 'Firebase ID Token is required.' }, 400);
    }

    // Verify Firebase ID Token on the backend
    const firebaseUser = await firebaseAdmin.verifyIdToken(idToken);

    // Find user in PostgreSQL by email
    const user = await prisma.user.findUnique({
      where: { email: firebaseUser.email },
      include: { recruiterCompany: true },
    });

    if (!user) {
      return jsonResponse({ error: 'User account not found in university portal. Please register first.' }, 404);
    }

    if (user.status !== 'ACTIVE') {
      return jsonResponse({ error: 'This account has been suspended or deactivated.' }, 403);
    }

    // Formulate session payload matching existing layout
    const sessionData = {
      id: user.id, // PostgreSQL UUID
      name: user.name,
      email: user.email,
      role: user.role,
      recruiterCompanyId: user.recruiterCompanyId,
    };

    // Sign session token
    const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Log login activity in Audit Logs
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.login.firebase',
        details: { email: user.email },
      },
    });

    const response = NextResponse.json({
      message: 'Login successful.',
      user: sessionData,
    }, { status: 200 });

    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Verification failed' }, 401);
  }
}
