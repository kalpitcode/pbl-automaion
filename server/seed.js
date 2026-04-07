/**
 * seed.js — Seeds the database with:
 *   1. Academic weeks (Week 1–10) with phase titles
 *   2. A demo group ("Group Alpha") with no supervisor or members yet
 *
 * Run with: node seed.js
 *
 * SAFE: Does NOT touch existing users or auth data.
 * Uses upsert logic so it can be re-run without creating duplicates.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WEEKS = [
  { week_number: 1,  name: 'Week 01', phase_title: 'Project Onboarding & Orientation' },
  { week_number: 2,  name: 'Week 02', phase_title: 'Problem Definition Phase' },
  { week_number: 3,  name: 'Week 03', phase_title: 'Literature Review Phase' },
  { week_number: 4,  name: 'Week 04', phase_title: 'Requirement Analysis Phase' },
  { week_number: 5,  name: 'Week 05', phase_title: 'System Design Phase' },
  { week_number: 6,  name: 'Week 06', phase_title: 'Initial Proposal Review' },
  { week_number: 7,  name: 'Week 07', phase_title: 'Prototype Development' },
  { week_number: 8,  name: 'Week 08', phase_title: 'Systems Architecture Phase' },
  { week_number: 9,  name: 'Week 09', phase_title: 'Integration & Testing' },
  { week_number: 10, name: 'Week 10', phase_title: 'Documentation' },
  { week_number: 11, name: 'Week 11', phase_title: 'Refinement & Polishing' },
  { week_number: 12, name: 'Week 12', phase_title: 'Final Handover' },
  { week_number: 13, name: 'Mid Term Submission', phase_title: 'Formal Evaluation' },
  { week_number: 14, name: 'End Term Submission', phase_title: 'Final Project Defense' },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  // --- Seed Weeks ---
  console.log('📅 Seeding academic weeks...');
  for (const week of WEEKS) {
    const result = await prisma.week.upsert({
      where: { week_number: week.week_number },
      update: {
        name: week.name,
        phase_title: week.phase_title,
      },
      create: {
        week_number: week.week_number,
        name: week.name,
        phase_title: week.phase_title,
      },
    });
    console.log(`  ✓ ${result.name} — ${result.phase_title}`);
  }

  // --- Seed Demo Group ---
  console.log('\n👥 Seeding demo group...');
  const demoGroup = await prisma.group.upsert({
    where: { id: (await prisma.group.findFirst({ where: { name: 'Group Delta' } }))?.id || 'new-id' },
    update: { topic: 'Comparative Analysis of Bio-Materials in Sub-Arctic Environments' },
    create: { name: 'Group Delta', topic: 'Comparative Analysis of Bio-Materials in Sub-Arctic Environments' },
  });
  console.log(`  ✓ Upserted group: "${demoGroup.name}" (id: ${demoGroup.id})`);

  console.log('\n✅ Seed complete.\n');
  console.log('👉 Next steps:');
  console.log('   1. Assign a student to a group: UPDATE users SET group_id = <group_id> WHERE email = \'...\'');
  console.log('   2. Assign a supervisor: UPDATE groups SET supervisor_id = <user_id> WHERE name = \'Group Delta\'');
  console.log('   (Or do this programmatically via the API once admin routes are built.)\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
