const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkPassword() {
  const user = await prisma.user.findFirst({ where: { email: 'dhruv@muj.manipal.edu' } });
  if (!user) {
    console.log("no user found");
    return;
  }
  const isMatch1 = await bcrypt.compare('admin', user.password_hash);
  const isMatch2 = await bcrypt.compare('admin2', user.password_hash);
  console.log('dhruv@muj.manipal.edu hash check:');
  console.log('admin matches:', isMatch1);
  console.log('admin2 matches:', isMatch2);
  
  const superUser = await prisma.user.findFirst({ where: { email: 'supervisor@muj.manipal.edu' } });
  if (superUser) {
    const isSuperMatch = await bcrypt.compare('admin', superUser.password_hash);
    console.log('supervisor admin matches:', isSuperMatch);
  }
}

checkPassword().then(() => process.exit(0)).catch(e => {console.error(e); process.exit(1);});
