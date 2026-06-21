import { NextRequest } from 'next/server';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { aiService } from '@/server/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    checkPermission(req, 'profile:read-own');
    const body = await req.json();
    const { topic } = body;

    if (!topic) {
      return jsonResponse({ error: 'Topic is required.' }, 400);
    }

    const roadmap = await aiService.getCareerRoadmap(topic);
    return jsonResponse({ roadmap }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
