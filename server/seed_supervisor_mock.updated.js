/**
 * seed_supervisor_mock.js
 * Creates supervisor users and assigns demo groups for local testing.
 *
 * Default password for all seeded supervisors:
 * Password: admin
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SEEDED_SUPERVISORS = [
  { name: 'John Doe', email: 'supervisor@muj.manipal.edu' },
  { name: 'Preeti Narooka', email: 'preeti.narooka@muj.manipal.edu' },
  { name: 'Stuti Pandey', email: 'stuti.pandey@muj.manipal.edu' },
  { name: 'Kanwal Preet Kaur', email: 'kanwalpreet.kaur@muj.manipal.edu' },
];

const MOCK_GROUPS = [
  {
    name: 'Group Delta',
    topic: 'Comparative Analysis of Bio-Materials in Sub-Arctic Environments',
    supervisorEmail: 'supervisor@muj.manipal.edu',
    weekNumber: 8,
    submission: {
      status: 'PENDING',
      submission_comments:
        "Our Week 8 progress focuses on the durability testing of mycelium-based composites under extreme thermal fluctuations. Initial results indicate a 15% increase in structural integrity compared to synthetic alternatives, though porosity remains a concern for moisture resistance. This week's data set includes three new stress tests and a revised methodology for surface coating.",
      submitted_at: new Date('2023-10-24T14:30:00Z'),
    },
  },
  {
    name: 'Group Alpha',
    topic: 'Quantum Cryptography in Edge Computing',
    supervisorEmail: 'preeti.narooka@muj.manipal.edu',
    weekNumber: 8,
    submission: {
      status: 'APPROVED',
      submission_comments: 'Up to date progress.',
    },
  },
  {
    name: 'Lab Sigma',
    topic: 'Autonomous Drone Swarm Navigation',
    supervisorEmail: 'stuti.pandey@muj.manipal.edu',
    weekNumber: 7,
    submission: {
      status: 'REJECTED',
      submission_comments: 'Far behind. Need to review literature again.',
      supervisor_feedback: 'You need to fix your methodology.',
    },
  },
  {
    name: 'Echo Workshop',
    topic: 'Sustainable Energy Grid Optimization',
    supervisorEmail: 'kanwalpreet.kaur@muj.manipal.edu',
    weekNumber: 8,
    submission: {
      status: 'APPROVED',
      submission_comments: 'Up to date.',
    },
  },
];

async function upsertSupervisor(supervisor, passwordHash) {
  return prisma.user.upsert({
    where: { email: supervisor.email },
    update: {
      name: supervisor.name,
      role: 'SUPERVISOR',
      password_hash: passwordHash,
    },
    create: {
      name: supervisor.name,
      email: supervisor.email,
      password_hash: passwordHash,
      role: 'SUPERVISOR',
    },
  });
}

async function upsertGroup(groupData, supervisorId) {
  const existingGroup = await prisma.group.findUnique({
    where: { name: groupData.name },
  });

  if (existingGroup) {
    return prisma.group.update({
      where: { id: existingGroup.id },
      data: {
        topic: groupData.topic,
        supervisor_id: supervisorId,
      },
    });
  }

  return prisma.group.create({
    data: {
      name: groupData.name,
      topic: groupData.topic,
      supervisor_id: supervisorId,
    },
  });
}

async function main() {
  console.log('Setting up supervisor mock data...\n');

  const password = 'admin';
  const passwordHash = await bcrypt.hash(password, 10);
  const supervisorsByEmail = new Map();

  for (const supervisor of SEEDED_SUPERVISORS) {
    const savedSupervisor = await upsertSupervisor(supervisor, passwordHash);
    supervisorsByEmail.set(supervisor.email, savedSupervisor);
    console.log(`  Ready: ${savedSupervisor.name} <${savedSupervisor.email}>`);
  }

  const neededWeekNumbers = [...new Set(MOCK_GROUPS.map((group) => group.weekNumber))];
  const weeks = await prisma.week.findMany({
    where: { week_number: { in: neededWeekNumbers } },
  });
  const weeksByNumber = new Map(weeks.map((week) => [week.week_number, week]));

  for (const weekNumber of neededWeekNumbers) {
    if (!weeksByNumber.has(weekNumber)) {
      throw new Error(`Week ${weekNumber} not found. Run seed.js first.`);
    }
  }

  for (const groupData of MOCK_GROUPS) {
    const supervisor = supervisorsByEmail.get(groupData.supervisorEmail);
    const week = weeksByNumber.get(groupData.weekNumber);

    const group = await upsertGroup(groupData, supervisor.id);
    console.log(`  Group ready: ${group.name} -> ${supervisor.name}`);

    await prisma.groupWeek.upsert({
      where: { group_id_week_id: { group_id: group.id, week_id: week.id } },
      update: {
        ...groupData.submission,
      },
      create: {
        group_id: group.id,
        week_id: week.id,
        ...groupData.submission,
      },
    });
  }

  console.log('\nSupervisor accounts ready.\n');
  console.log('Login credentials for testing:');
  for (const supervisor of SEEDED_SUPERVISORS) {
    console.log(`  ${supervisor.name}: ${supervisor.email} / ${password}`);
  }
  console.log('');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
