const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding placement database...');

  // 1. Clear existing items
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.profileSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.university.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Role Permissions
  const permissionsList = [
    { role: 'SUPER_ADMIN', permission: 'user:manage' },
    { role: 'SUPER_ADMIN', permission: 'profile:read-all' },
    { role: 'SUPER_ADMIN', permission: 'profile:write-own' },
    { role: 'SUPER_ADMIN', permission: 'job:create' },
    { role: 'PLACEMENT_OFFICER', permission: 'profile:read-all' },
    { role: 'PLACEMENT_OFFICER', permission: 'profile:verify' },
    { role: 'PLACEMENT_OFFICER', permission: 'job:create' },
    { role: 'PLACEMENT_OFFICER', permission: 'job:read' },
    { role: 'PLACEMENT_OFFICER', permission: 'application:read-all' },
    { role: 'PLACEMENT_OFFICER', permission: 'analytics:view' },
    { role: 'STUDENT', permission: 'profile:read-own' },
    { role: 'STUDENT', permission: 'profile:write-own' },
    { role: 'STUDENT', permission: 'job:read' },
    { role: 'STUDENT', permission: 'application:apply' },
    { role: 'STUDENT', permission: 'application:read-own' },
    { role: 'RECRUITER', permission: 'profile:read-all' },
    { role: 'RECRUITER', permission: 'job:create' },
    { role: 'RECRUITER', permission: 'job:read' },
    { role: 'RECRUITER', permission: 'application:read-all' },
    { role: 'RECRUITER', permission: 'application:update-status' },
    { role: 'RECRUITER', permission: 'interview:schedule' },
    { role: 'RECRUITER', permission: 'offer:create' },
  ];

  for (const perm of permissionsList) {
    await prisma.rolePermission.create({
      data: perm,
    });
  }

  // 3. Seed Academics (University -> Department -> Branch)
  const univ = await prisma.university.create({
    data: {
      name: 'State Tech University',
      code: 'STU',
      location: 'Metropolis',
    },
  });

  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      universityId: univ.id,
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      universityId: univ.id,
    },
  });

  const cseBranch = await prisma.branch.create({
    data: {
      name: 'B.Tech Computer Science',
      code: 'CSE_BTECH',
      departmentId: cseDept.id,
    },
  });

  const eceBranch = await prisma.branch.create({
    data: {
      name: 'B.Tech Electronics',
      code: 'ECE_BTECH',
      departmentId: eceDept.id,
    },
  });

  // 4. Seed Companies
  const acme = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      email: 'hiring@acme.com',
      website: 'https://acme.com',
      locations: ['Remote', 'San Francisco', 'New York'],
      description: 'Acme Corp is a globally recognized manufacturing and tech supplier.',
    },
  });

  const globex = await prisma.company.create({
    data: {
      name: 'Globex Inc',
      email: 'recruiting@globex.com',
      website: 'https://globex.com',
      locations: ['London', 'Tokyo', 'Bangalore'],
      description: 'Globex Inc specializes in international cybersecurity and defense systems.',
    },
  });

  // 5. Seed Users (TPO, Student, Recruiter)
  const passwordHash = await bcrypt.hash('password123', 10);

  // TPO User
  const tpo = await prisma.user.create({
    data: {
      name: 'TPO Placement Director',
      email: 'tpo@university.edu',
      passwordHash,
      role: 'PLACEMENT_OFFICER',
      isEmailVerified: true,
    },
  });

  // Student User
  const student = await prisma.user.create({
    data: {
      name: 'John Student Doe',
      email: 'student@university.edu',
      passwordHash,
      role: 'STUDENT',
      isEmailVerified: true,
    },
  });

  // Student Profile
  const studentProfile = await prisma.profile.create({
    data: {
      userId: student.id,
      rollNumber: 'STU_2026_01',
      cgpa: 8.9,
      semester: 6,
      backlogs: 0,
      branchId: cseBranch.id,
      bio: 'Enthusiastic full-stack engineer specialized in Node, React, and postgres databases.',
      completionPercentage: 80,
    },
  });

  // Skills
  const nodeSkill = await prisma.skill.create({ data: { name: 'node.js', type: 'TECHNICAL' } });
  const reactSkill = await prisma.skill.create({ data: { name: 'react', type: 'TECHNICAL' } });
  await prisma.profileSkill.create({ data: { profileId: studentProfile.id, skillId: nodeSkill.id } });
  await prisma.profileSkill.create({ data: { profileId: studentProfile.id, skillId: reactSkill.id } });

  // Recruiter User
  const recruiter = await prisma.user.create({
    data: {
      name: 'Sarah HR Manager',
      email: 'recruiter@company.com',
      passwordHash,
      role: 'RECRUITER',
      recruiterCompanyId: acme.id,
      isEmailVerified: true,
    },
  });

  // 6. Seed Job Drives
  const dateDeadline = new Date();
  dateDeadline.setDate(dateDeadline.getDate() + 30); // 30 days from now

  await prisma.job.create({
    data: {
      companyId: acme.id,
      title: 'Full Stack Web Developer',
      description: 'Looking for a junior web developer to join our core SaaS interfaces team.',
      requirements: 'Experience in React, Node.js, and SQL schema designs.',
      eligibilityCgpa: 7.0,
      eligibilityBacklogs: 0,
      eligibilityBranches: ['CSE_BTECH'],
      salaryPackage: 12.5, // 12.5 LPA
      location: 'Remote',
      status: 'OPEN',
      deadline: dateDeadline,
      createdById: recruiter.id,
    },
  });

  await prisma.job.create({
    data: {
      companyId: globex.id,
      title: 'Embedded Systems Engineer',
      description: 'Looking for firmware and board designers for secure routers.',
      requirements: 'Knowledge of C, assembly, microcontrollers, and circuit designs.',
      eligibilityCgpa: 6.5,
      eligibilityBacklogs: 1,
      eligibilityBranches: ['ECE_BTECH'],
      salaryPackage: 9.8,
      location: 'Bangalore',
      status: 'OPEN',
      deadline: dateDeadline,
      createdById: tpo.id, // Posted directly by TPO
    },
  });

  console.log('Database seeding successfully finished.');
  console.log('========================================');
  console.log('Login credentials:');
  console.log('1. TPO:         tpo@university.edu / password123');
  console.log('2. Student:     student@university.edu / password123');
  console.log('3. Recruiter:   recruiter@company.com / password123');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
