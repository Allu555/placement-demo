import { NextRequest } from 'next/server';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { profileRepository } from '@/server/repositories/profile.repository';
import { applicationRepository } from '@/server/repositories/application.repository';

export async function GET(req: NextRequest) {
  try {
    const session = checkPermission(req, 'application:read-own');
    const profile = await profileRepository.findByUserId(session.id);
    if (!profile) {
      return jsonResponse([], 200);
    }

    const applications = await applicationRepository.getStudentApplications(profile.id);
    return jsonResponse(applications, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized' }, 401);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
