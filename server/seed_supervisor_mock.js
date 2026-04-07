/**
 * seed_supervisor_mock.js
 * Creates mock groups from the design and assigns them to a supervisor user.
 *
 * Supervisor credentials:
 * Email: supervisor@muj.manipal.edu
 * Password: admin
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up supervisor mock data...\n');

  // 1. Ensure Supervisor User exists
  const PASSWORD = 'admin';
  const hashed = await bcrypt.hash(PASSWORD, 10);
  
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@muj.manipal.edu' },
    update: { role: 'SUPERVISOR', name: 'Dr. John Doe' },
    create: {
      name: 'Dr. John Doe',
      email: 'supervisor@muj.manipal.edu',
      password_hash: hashed,
      role: 'SUPERVISOR',
    },
  });
  console.log(`  ✓ Supervisor ready: ${supervisor.name} <${supervisor.email}>`);

  // 2. Ensure Week 8 exists so we can map submissions
  const week8 = await prisma.week.findUnique({ where: { week_number: 8 } });
  if (!week8) throw new Error('Week 8 not found. Run seed.js first.');
  const week7 = await prisma.week.findUnique({ where: { week_number: 7 } });

  // 3. Upsert Groups
  const mockGroups = [
    { name: 'Group Delta', topic: 'Comparative Analysis of Bio-Materials in Sub-Arctic Environments' },
    { name: 'Group Alpha', topic: 'Quantum Cryptography in Edge Computing' },
    { name: 'Lab Sigma', topic: 'Autonomous Drone Swarm Navigation' },
    { name: 'Echo Workshop', topic: 'Sustainable Energy Grid Optimization' },
  ];

  for (const groupData of mockGroups) {
    const group = await prisma.group.upsert({
       where: { id: (await prisma.group.findFirst({ where: { name: groupData.name } }))?.id || 'new-id' },
       update: { topic: groupData.topic, supervisor_id: supervisor.id },
       create: { name: groupData.name, topic: groupData.topic, supervisor_id: supervisor.id }
    });
    console.log(`  ✓ Upserted group: ${group.name}`);

    // Create realistic submissions for each group to mimic the design status
    if (group.name === 'Group Delta') {
        await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: group.id, week_id: week8.id } },
            update: { status: 'PENDING', submission_comments: "Our Week 8 progress focuses on the durability testing of mycelium-based composites under extreme thermal fluctuations. Initial results indicate a 15% increase in structural integrity compared to synthetic alternatives, though porosity remains a concern for moisture resistance. This week's data set includes three new stress tests and a revised methodology for surface coating.", submitted_at: new Date('2023-10-24T14:30:00Z') },
            create: { group_id: group.id, week_id: week8.id, status: 'PENDING', submission_comments: "Our Week 8 progress focuses on the durability testing of mycelium-based composites under extreme thermal fluctuations. Initial results indicate a 15% increase in structural integrity compared to synthetic alternatives, though porosity remains a concern for moisture resistance. This week's data set includes three new stress tests and a revised methodology for surface coating.", submitted_at: new Date('2023-10-24T14:30:00Z') }
        });
    } else if (group.name === 'Group Alpha') {
        await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: group.id, week_id: week8.id } },
            update: { status: 'APPROVED', submission_comments: "Up to date progress." },
            create: { group_id: group.id, week_id: week8.id, status: 'APPROVED', submission_comments: "Up to date progress." }
        });
    } else if (group.name === 'Lab Sigma') {
        await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: group.id, week_id: week7.id } },
            update: { status: 'REJECTED', submission_comments: "Far behind. Need to review literature again.", supervisor_feedback: "You need to fix your methodology." },
            create: { group_id: group.id, week_id: week7.id, status: 'REJECTED', submission_comments: "Far behind. Need to review literature again.", supervisor_feedback: "You need to fix your methodology." }
        });
    } else if (group.name === 'Echo Workshop') {
        await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: group.id, week_id: week8.id } },
            update: { status: 'APPROVED', submission_comments: "Up to date." },
            create: { group_id: group.id, week_id: week8.id, status: 'APPROVED', submission_comments: "Up to date." }
        });
    }
  }

  console.log('\n✅ Mock data setup complete.\n');
  console.log('📋 Login credentials for testing:');
  console.log('   Email   : supervisor@muj.manipal.edu');
  console.log('   Password: admin\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
