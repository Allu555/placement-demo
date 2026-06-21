import { prisma } from '@/core/database/prisma';
import { Job, Company, JobStatus, Prisma } from '@prisma/client';

export class JobRepository {
  async getCompanies() {
    return prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findCompanyById(id: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  async createCompany(data: Prisma.CompanyCreateInput): Promise<Company> {
    return prisma.company.create({ data });
  }

  async updateCompany(id: string, data: Prisma.CompanyUpdateInput): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  async createJob(data: Prisma.JobUncheckedCreateInput): Promise<Job> {
    return prisma.job.create({ data });
  }

  async updateJob(id: string, data: Prisma.JobUncheckedUpdateInput): Promise<Job> {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

  async findJobById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });
  }

  async getJobs(filters?: { status?: JobStatus; companyId?: string }) {
    return prisma.job.findMany({
      where: {
        deletedAt: null,
        status: filters?.status,
        companyId: filters?.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            locations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkEligibility(studentProfile: {
    cgpa: number;
    backlogs: number;
    branch: { code: string };
  }, job: Job): Promise<{ eligible: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    if (studentProfile.cgpa < job.eligibilityCgpa) {
      reasons.push(`Your CGPA (${studentProfile.cgpa}) is lower than the required CGPA (${job.eligibilityCgpa})`);
    }

    if (studentProfile.backlogs > job.eligibilityBacklogs) {
      reasons.push(`Your active backlog count (${studentProfile.backlogs}) exceeds the maximum allowed backlogs (${job.eligibilityBacklogs})`);
    }

    if (job.eligibilityBranches && job.eligibilityBranches.length > 0) {
      const isBranchEligible = job.eligibilityBranches.includes(studentProfile.branch.code);
      if (!isBranchEligible) {
        reasons.push(`Your branch (${studentProfile.branch.code}) is not listed in the eligible branches for this job`);
      }
    }

    // Check deadlines
    if (new Date() > new Date(job.deadline)) {
      reasons.push(`The application deadline has passed (${new Date(job.deadline).toLocaleDateString()})`);
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }
}

export const jobRepository = new JobRepository();
