const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl.startsWith('file:')) {
  console.log('DATABASE_URL is not a SQLite file path. Skipping reset.');
  process.exit(0);
}

const dbPath = databaseUrl.slice('file:'.length);
const fileName = path.basename(dbPath);
const isManagedLocalDb = fileName === 'pbl_v1_app.db';

if (!isManagedLocalDb) {
  console.log(`Skipping reset for custom database path: ${dbPath}`);
  process.exit(0);
}

for (const suffix of ['', '-journal', '-wal', '-shm']) {
  const target = `${dbPath}${suffix}`;
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log(`Removed ${target}`);
  }
}
