import { NextRequest } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { jobRepository } from '@/server/repositories/job.repository';
import { placementService } from '@/server/services/placement.service';

export async function GET(req: NextRequest) {
  try {
    const jobs = await jobRepository.getJobs({ status: 'OPEN' });
    return jsonResponse(jobs, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = checkPermission(req, 'job:create');
    const body = await req.json();
    let {
      companyId,
      title,
      description,
      requirements,
      eligibilityCgpa,
      eligibilityBacklogs,
      eligibilityBranches,
      salaryPackage,
      location,
      deadline,
    } = body;

    if (!title || !salaryPackage || !deadline) {
      return jsonResponse({ error: 'Title, salaryPackage, and deadline are required.' }, 400);
    }

    // Auto-create a mock company if missing
    if (!companyId) {
      let comp = await prisma.company.findFirst();
      if (!comp) {
        comp = await prisma.company.create({
          data: {
            name: 'Acme Corporates',
            email: 'hiring@acme.com',
            website: 'https://acme.com',
            locations: ['Remote', 'San Francisco', 'Bangalore'],
            description: 'Leading global supplier of general goods and tech products.',
          },
        });
      }
      companyId = comp.id;
    }

    const job = await placementService.createJob({
      companyId,
      title,
      description: description || 'Software Developer role.',
      requirements: requirements || 'Knowledge of React, Node, and SQL.',
      eligibilityCgpa: eligibilityCgpa !== undefined ? parseFloat(eligibilityCgpa) : 6.0,
      eligibilityBacklogs: eligibilityBacklogs !== undefined ? parseInt(eligibilityBacklogs) : 0,
      eligibilityBranches: eligibilityBranches || ['CSE_BTECH'],
      salaryPackage: parseFloat(salaryPackage),
      location: location || 'Remote',
      deadline: deadline,
      createdById: session.id,
    });

    return jsonResponse({ message: 'Placement drive posted successfully.', job }, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    if (err.message === 'FORBIDDEN') return jsonResponse({ error: 'Access denied' }, 403);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
