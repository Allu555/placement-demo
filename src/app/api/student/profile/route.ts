import { NextRequest } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { checkPermission, jsonResponse } from '@/core/security/session';
import { profileRepository } from '@/server/repositories/profile.repository';

export async function GET(req: NextRequest) {
  try {
    const session = checkPermission(req, 'profile:read-own');
    let profile = await profileRepository.findByUserId(session.id);

    // Auto-create a stub profile if it does not exist
    if (!profile) {
      // Find or create default university
      let univ = await prisma.university.findFirst();
      if (!univ) {
        univ = await prisma.university.create({
          data: { name: 'State Tech University', code: 'STU', location: 'Metropolis' },
        });
      }

      // Find or create default department
      let dept = await prisma.department.findFirst({ where: { universityId: univ.id } });
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: 'Computer Science and Engineering', code: 'CSE', universityId: univ.id },
        });
      }

      // Find or create default branch
      let branch = await prisma.branch.findFirst({ where: { departmentId: dept.id } });
      if (!branch) {
        branch = await prisma.branch.create({
          data: { name: 'B.Tech Computer Science', code: 'CSE_BTECH', departmentId: dept.id },
        });
      }

      profile = await prisma.profile.create({
        data: {
          userId: session.id,
          rollNumber: `STU_${session.id.slice(0, 8).toUpperCase()}`,
          cgpa: 8.5,
          semester: 6,
          backlogs: 0,
          branchId: branch.id,
          bio: 'I am a passionate technology developer looking for placement drives.',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          branch: {
            include: { department: { include: { university: true } } },
          },
          education: true,
          experience: true,
          projects: true,
          skills: { include: { skill: true } },
        },
      }) as any;
    }

    return jsonResponse(profile, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = checkPermission(req, 'profile:write-own');
    const body = await req.json();
    const {
      rollNumber,
      cgpa,
      semester,
      backlogs,
      bio,
      phone,
      gender,
      birthDate,
      githubUrl,
      linkedinUrl,
      leetcodeUrl,
      portfolioUrl,
      skills, // array of strings
      education, // array
      experience, // array
      projects, // array
    } = body;

    let profile = await prisma.profile.findUnique({
      where: { userId: session.id },
    });

    if (!profile) {
      return jsonResponse({ error: 'Profile must exist to update.' }, 404);
    }

    // 1. Update primary fields
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        rollNumber: rollNumber || profile.rollNumber,
        cgpa: cgpa !== undefined ? parseFloat(cgpa) : profile.cgpa,
        semester: semester !== undefined ? parseInt(semester) : profile.semester,
        backlogs: backlogs !== undefined ? parseInt(backlogs) : profile.backlogs,
        bio: bio || profile.bio,
        phone: phone || profile.phone,
        gender: gender || profile.gender,
        birthDate: birthDate ? new Date(birthDate) : profile.birthDate,
        githubUrl: githubUrl || profile.githubUrl,
        linkedinUrl: linkedinUrl || profile.linkedinUrl,
        leetcodeUrl: leetcodeUrl || profile.leetcodeUrl,
        portfolioUrl: portfolioUrl || profile.portfolioUrl,
      },
    });

    // 2. Sync nested lists
    if (skills && Array.isArray(skills)) {
      await profileRepository.syncSkills(profile.id, skills);
    }

    if (education && Array.isArray(education)) {
      for (const edu of education) {
        await profileRepository.upsertEducation(profile.id, edu.id, {
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          cgpa: parseFloat(edu.cgpa),
        });
      }
    }

    if (experience && Array.isArray(experience)) {
      for (const exp of experience) {
        await profileRepository.upsertExperience(profile.id, exp.id, {
          companyName: exp.companyName,
          title: exp.title,
          location: exp.location,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          isCurrent: exp.isCurrent || false,
          description: exp.description,
        });
      }
    }

    if (projects && Array.isArray(projects)) {
      for (const proj of projects) {
        await profileRepository.upsertProject(profile.id, proj.id, {
          title: proj.title,
          description: proj.description,
          url: proj.url,
          githubUrl: proj.githubUrl,
          technologies: proj.technologies || [],
        });
      }
    }

    // 3. Compute completion percentage
    const completionPercentage = await profileRepository.calculateCompleteness(profile.id);
    await prisma.profile.update({
      where: { id: profile.id },
      data: { completionPercentage },
    });

    const updated = await profileRepository.findByUserId(session.id);
    return jsonResponse({ message: 'Profile updated successfully.', profile: updated }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return jsonResponse({ error: 'Unauthorized session' }, 401);
    if (err.message === 'FORBIDDEN') return jsonResponse({ error: 'Forbidden' }, 403);
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
