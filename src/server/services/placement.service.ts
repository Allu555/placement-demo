import { prisma } from '@/core/database/prisma';
import { jobRepository } from '../repositories/job.repository';
import { profileRepository } from '../repositories/profile.repository';
import { applicationRepository } from '../repositories/application.repository';
import { ApplicationStatus, JobStatus } from '@prisma/client';

export class PlacementService {
  /**
   * Helper to trigger WebSocket notification to user and role channels.
   */
  async notify(userId: string, title: string, message: string, type = 'SYSTEM', priority = 'NORMAL') {
    // 1. Create notification in database
    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
      },
    });

    // 2. Emit via global socket server if active
    const io = (global as any).io;
    if (io) {
      // Emit to targeted user channel
      io.to(userId).emit('notification', {
        id: notif.id,
        title,
        message,
        type,
        priority,
        createdAt: notif.createdAt.toISOString(),
      });
    }

    return notif;
  }

  async createCompany(data: { name: string; email: string; website?: string; locations?: string[]; description?: string }) {
    return jobRepository.createCompany({
      name: data.name,
      email: data.email,
      website: data.website,
      locations: data.locations,
      description: data.description,
    });
  }

  async createJob(data: {
    companyId: string;
    title: string;
    description: string;
    requirements: string;
    eligibilityCgpa: number;
    eligibilityBacklogs: number;
    eligibilityBranches: string[];
    salaryPackage: number;
    location: string;
    deadline: string;
    createdById: string;
  }) {
    const job = await jobRepository.createJob({
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      eligibilityCgpa: data.eligibilityCgpa,
      eligibilityBacklogs: data.eligibilityBacklogs,
      eligibilityBranches: data.eligibilityBranches,
      salaryPackage: data.salaryPackage,
      location: data.location,
      status: 'OPEN',
      deadline: new Date(data.deadline),
      createdById: data.createdById,
    });

    // Notify all eligible students in real-time
    const eligibleStudents = await prisma.profile.findMany({
      where: {
        cgpa: { gte: data.eligibilityCgpa },
        backlogs: { lte: data.eligibilityBacklogs },
        branch: {
          code: { in: data.eligibilityBranches },
        },
      },
      include: { user: true },
    });

    for (const student of eligibleStudents) {
      await this.notify(
        student.userId,
        `New Drive: ${job.title}`,
        `A new recruitment drive from has been posted. Packages up to ${job.salaryPackage} LPA. Apply before ${new Date(job.deadline).toLocaleDateString()}`,
        'JOBS',
        'HIGH'
      );
    }

    return job;
  }

  async applyToJob(userId: string, jobId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Please complete your profile before applying.');
    }

    const job = await jobRepository.findJobById(jobId);
    if (!job) {
      throw new Error('The requested placement drive does not exist.');
    }

    // Check eligibility
    const check = await jobRepository.checkEligibility(
      {
        cgpa: profile.cgpa,
        backlogs: profile.backlogs,
        branch: { code: profile.branch.code },
      },
      job
    );

    if (!check.eligible) {
      throw new Error(`Ineligible to apply: ${check.reasons.join(', ')}`);
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { jobId, profileId: profile.id },
    });

    if (existing) {
      throw new Error('You have already applied to this placement drive.');
    }

    const app = await applicationRepository.apply({
      jobId,
      profileId: profile.id,
      resumeUrl: profile.resumeUrl || '',
    });

    // Notify Student
    await this.notify(
      userId,
      'Application Submitted',
      `Your application for ${job.title} at ${job.company.name} was successfully submitted.`,
      'JOBS'
    );

    // Notify Recruiter / HR
    const company = await prisma.company.findUnique({
      where: { id: job.companyId },
      include: { recruiters: true },
    });

    if (company && company.recruiters.length > 0) {
      for (const rec of company.recruiters) {
        await this.notify(
          rec.id,
          'New Application Received',
          `Student ${profile.user.name} applied for ${job.title}.`,
          'SYSTEM'
        );
      }
    }

    return app;
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, feedback?: string) {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      throw new Error('Application record not found.');
    }

    const updatedApp = await applicationRepository.updateStatus(applicationId, status, feedback);

    // Notify student about stage update
    await this.notify(
      app.profile.userId,
      `Application Status Update`,
      `Your application status for ${app.job.title} was updated to ${status}. ${feedback ? 'Feedback: ' + feedback : ''}`,
      'JOBS',
      status === 'OFFERED' ? 'HIGH' : 'NORMAL'
    );

    return updatedApp;
  }

  async scheduleInterview(applicationId: string, data: {
    roundName: string;
    roundIndex: number;
    scheduledAt: string;
    location?: string;
    joinUrl?: string;
    type: string;
  }) {
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      throw new Error('Application record not found.');
    }

    const interview = await applicationRepository.scheduleInterview({
      applicationId,
      roundName: data.roundName,
      roundIndex: data.roundIndex,
      scheduledAt: new Date(data.scheduledAt),
      location: data.location,
      joinUrl: data.joinUrl,
      type: data.type,
      status: 'SCHEDULED',
    });

    // Update application stage to correspond
    await this.updateApplicationStatus(applicationId, 'SCREENING', `Interview round scheduled: ${data.roundName}`);

    // Notify student
    await this.notify(
      app.profile.userId,
      'Interview Scheduled',
      `An interview round "${data.roundName}" has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}. ${data.joinUrl ? 'Link: ' + data.joinUrl : ''}`,
      'INTERVIEWS',
      'HIGH'
    );

    return interview;
  }
}

export const placementService = new PlacementService();
