import { NextRequest } from 'next/server';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { placementService } from '@/server/services/placement.service';

export async function POST(req: NextRequest) {
  try {
    const session = checkPermission(req, 'application:apply');
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return jsonResponse({ error: 'Job ID is required to apply.' }, 400);
    }

    const app = await placementService.applyToJob(session.id, jobId);
    return jsonResponse({ message: 'Applied successfully.', application: app }, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    if (err.message === 'FORBIDDEN') return jsonResponse({ error: 'Access denied' }, 403);
    return jsonResponse({ error: err.message || 'Server error' }, 400);
  }
}
