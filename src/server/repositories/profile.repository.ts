import { prisma } from '@/core/database/prisma';
import { Profile, Prisma } from '@prisma/client';

export class ProfileRepository {
  async findByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        branch: {
          include: {
            department: {
              include: {
                university: true,
              },
            },
          },
        },
        education: true,
        experience: true,
        projects: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async findByRollNumber(rollNumber: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { rollNumber },
    });
  }

  async create(data: Prisma.ProfileUncheckedCreateInput) {
    return prisma.profile.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProfileUncheckedUpdateInput) {
    return prisma.profile.update({
      where: { id },
      data,
    });
  }

  async upsertEducation(profileId: string, educationId: string | undefined, data: any) {
    if (educationId) {
      return prisma.education.update({
        where: { id: educationId },
        data,
      });
    }
    return prisma.education.create({
      data: {
        ...data,
        profileId,
      },
    });
  }

  async deleteEducation(educationId: string) {
    return prisma.education.delete({
      where: { id: educationId },
    });
  }

  async upsertExperience(profileId: string, experienceId: string | undefined, data: any) {
    if (experienceId) {
      return prisma.experience.update({
        where: { id: experienceId },
        data,
      });
    }
    return prisma.experience.create({
      data: {
        ...data,
        profileId,
      },
    });
  }

  async deleteExperience(experienceId: string) {
    return prisma.experience.delete({
      where: { id: experienceId },
    });
  }

  async upsertProject(profileId: string, projectId: string | undefined, data: any) {
    if (projectId) {
      return prisma.project.update({
        where: { id: projectId },
        data,
      });
    }
    return prisma.project.create({
      data: {
        ...data,
        profileId,
      },
    });
  }

  async deleteProject(projectId: string) {
    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  async syncSkills(profileId: string, skillNames: string[]) {
    // 1. Delete existing profile skills
    await prisma.profileSkill.deleteMany({
      where: { profileId },
    });

    // 2. Insert/Find all skills
    for (const name of skillNames) {
      const formattedName = name.trim().toLowerCase();
      if (!formattedName) continue;

      let skill = await prisma.skill.findUnique({
        where: { name: formattedName },
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            name: formattedName,
            type: 'TECHNICAL', // Default
          },
        });
      }

      await prisma.profileSkill.create({
        data: {
          profileId,
          skillId: skill.id,
        },
      });
    }
  }

  async searchProfiles(filters: {
    cgpaMin?: number;
    branchCode?: string;
    backlogsMax?: number;
    skills?: string[];
  }) {
    const whereClause: any = {
      deletedAt: null,
    };

    if (filters.cgpaMin !== undefined) {
      whereClause.cgpa = { gte: filters.cgpaMin };
    }

    if (filters.backlogsMax !== undefined) {
      whereClause.backlogs = { lte: filters.backlogsMax };
    }

    if (filters.branchCode) {
      whereClause.branch = {
        code: filters.branchCode,
      };
    }

    if (filters.skills && filters.skills.length > 0) {
      whereClause.skills = {
        some: {
          skill: {
            name: {
              in: filters.skills.map((s) => s.trim().toLowerCase()),
            },
          },
        },
      };
    }

    return prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        branch: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { cgpa: 'desc' },
    });
  }

  async calculateCompleteness(profileId: string): Promise<number> {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        education: true,
        experience: true,
        projects: true,
        skills: true,
      },
    });

    if (!profile) return 0;

    let score = 20; // Default baseline for basic profile creation

    if (profile.bio) score += 10;
    if (profile.phone) score += 10;
    if (profile.avatarUrl) score += 10;
    if (profile.resumeUrl) score += 15;
    if (profile.education.length > 0) score += 15;
    if (profile.projects.length > 0) score += 10;
    if (profile.skills.length > 0) score += 10;

    return Math.min(score, 100);
  }
}

export const profileRepository = new ProfileRepository();
