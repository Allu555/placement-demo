import { NextRequest } from 'next/server';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { profileRepository } from '@/server/repositories/profile.repository';
import { aiService } from '@/server/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    const session = checkPermission(req, 'profile:read-own');
    const profile = await profileRepository.findByUserId(session.id);
    if (!profile) {
      return jsonResponse({ error: 'Please create a profile first.' }, 404);
    }

    const review = await aiService.optimizeResume(profile.id);
    return jsonResponse(review, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
