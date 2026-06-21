import { NextRequest } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { firebaseAdmin } from '@/core/firebase/admin';
import { jsonResponse } from '@/core/security/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, name, role } = body;

    if (!idToken || !name) {
      return jsonResponse({ error: 'Firebase ID Token and name are required.' }, 400);
    }

    // Verify Firebase ID Token on the backend
    const firebaseUser = await firebaseAdmin.verifyIdToken(idToken);

    // Check if user already exists in PostgreSQL
    const existing = await prisma.user.findUnique({
      where: { email: firebaseUser.email },
    });

    if (existing) {
      return jsonResponse({ error: 'A user with this email address already exists.' }, 400);
    }

    // Create user in PostgreSQL with auto-generated UUID
    const user = await prisma.user.create({
      data: {
        name,
        email: firebaseUser.email,
        role: role || 'STUDENT',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
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
