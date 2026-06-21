import { NextRequest } from 'next/server';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { applicationRepository } from '@/server/repositories/application.repository';

export async function GET(req: NextRequest) {
  try {
    // Requires analytics:view permission
    const session = checkPermission(req, 'analytics:view');

    const stats = await applicationRepository.getAdminStats();
    const branchPlacements = await applicationRepository.getPlacementByBranch();
    const hiringTrends = await applicationRepository.getHiringTrendsByYear();

    return jsonResponse({
      stats,
      branchPlacements,
      hiringTrends,
    }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    if (err.message === 'FORBIDDEN') return jsonResponse({ error: 'Access denied' }, 403);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
