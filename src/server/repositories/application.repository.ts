import { prisma } from '@/core/database/prisma';
import { Application, ApplicationStatus, Interview, Offer, Prisma } from '@prisma/client';

export class ApplicationRepository {
  async apply(data: { jobId: string; profileId: string; resumeUrl: string }) {
    return prisma.application.create({
      data: {
        jobId: data.jobId,
        profileId: data.profileId,
        resumeUrl: data.resumeUrl,
        status: 'APPLIED',
      },
    });
  }

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        profile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            branch: true,
          },
        },
        interviews: true,
        offers: true,
      },
    });
  }

  async getStudentApplications(profileId: string) {
    return prisma.application.findMany({
      where: { profileId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
        offers: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getJobApplications(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        profile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            branch: true,
          },
        },
        interviews: true,
        offers: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus, feedback?: string) {
    return prisma.application.update({
      where: { id },
      data: {
        status,
        feedback,
      },
    });
  }

  async scheduleInterview(data: Prisma.InterviewUncheckedCreateInput): Promise<Interview> {
    return prisma.interview.create({ data });
  }

  async updateInterview(id: string, data: Prisma.InterviewUpdateInput): Promise<Interview> {
    return prisma.interview.update({
      where: { id },
      data,
    });
  }

  async createOffer(data: Prisma.OfferUncheckedCreateInput): Promise<Offer> {
    return prisma.offer.create({ data });
  }

  async updateOffer(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
    return prisma.offer.update({
      where: { id },
      data,
    });
  }

  // Dashboard Aggregates
  async getAdminStats() {
    const totalStudents = await prisma.profile.count();
    const totalCompanies = await prisma.company.count();
    const totalJobs = await prisma.job.count({ where: { status: 'OPEN' } });
    const totalApplications = await prisma.application.count();

    // Placed vs Total Ratio
    const totalPlaced = await prisma.application.count({
      where: { status: 'OFFERED' },
    });

    // Package stats
    const offers = await prisma.offer.findMany({
      where: { status: 'ACCEPTED' },
      select: { packageAmount: true },
    });

    const packages = offers.map(o => o.packageAmount);
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
    const averagePackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;

    return {
      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalPlaced,
      highestPackage: parseFloat(highestPackage.toFixed(2)),
      averagePackage: parseFloat(averagePackage.toFixed(2)),
    };
  }

  async getPlacementByBranch() {
    const branches = await prisma.branch.findMany({
      include: {
        profiles: {
          include: {
            applications: {
              where: { status: 'OFFERED' },
            },
          },
        },
      },
    });

    return branches.map((b) => {
      const totalStudents = b.profiles.length;
      const placedStudents = b.profiles.filter(p => p.applications.length > 0).length;
      return {
        name: b.name,
        code: b.code,
        total: totalStudents,
        placed: placedStudents,
        ratio: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
      };
    });
  }

  async getHiringTrendsByYear() {
    // Aggregated package counts or monthly placements
    const placements = await prisma.application.findMany({
      where: { status: 'OFFERED' },
      select: { appliedAt: true, job: { select: { salaryPackage: true } } },
      orderBy: { appliedAt: 'asc' },
    });

    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap: Record<string, { placements: number; avgPackage: number; totalLpa: number }> = {};

    placements.forEach((p) => {
      const date = new Date(p.appliedAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!trendMap[key]) {
        trendMap[key] = { placements: 0, avgPackage: 0, totalLpa: 0 };
      }
      trendMap[key].placements += 1;
      trendMap[key].totalLpa += p.job.salaryPackage;
    });

    return Object.entries(trendMap).map(([name, data]) => ({
      name,
      placements: data.placements,
      avgPackage: parseFloat((data.totalLpa / (data.placements || 1)).toFixed(2)),
    }));
  }
}

export const applicationRepository = new ApplicationRepository();
