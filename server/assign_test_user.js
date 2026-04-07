/**
 * assign_test_user.js
 * Creates dhruv@muj.manipal.edu (if not already present) and assigns
 * them to "Group Delta" as a STUDENT member.
 *
 * Run once with: node assign_test_user.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up test user...\n');

  // 1. Fetch Group Delta
  const group = await prisma.group.findFirst({ where: { name: 'Group Delta' } });
  if (!group) {
    throw new Error('Group Delta not found. Run seed.js first.');
  }
  console.log(`  ✓ Found group: "${group.name}" (${group.id})`);

  // 2. Upsert user
  const PASSWORD = 'admin2';
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: 'dhruv@muj.manipal.edu' },
    update: { group_id: group.id, password_hash: hashed },
    create: {
      name: 'Dhruv',
      email: 'dhruv@muj.manipal.edu',
      password_hash: hashed,
      role: 'STUDENT',
      group_id: group.id,
    },
  });

  console.log(`  ✓ User ready: ${user.name} <${user.email}> (id: ${user.id})`);
  console.log(`  ✓ Assigned to group: "${group.name}"`);

  console.log('\n✅ Done.\n');
  console.log('📋 Login credentials:');
  console.log('   Email   : dhruv@muj.manipal.edu');
  console.log('   Password: admin2\n');
}

main()
  .catch((err) => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
