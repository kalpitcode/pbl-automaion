const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const statements = [
  'PRAGMA foreign_keys = OFF;',
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL
  );`,
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
  `CREATE TABLE IF NOT EXISTS groups (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    topic TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    supervisor_id TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
  );`,
  `CREATE TABLE IF NOT EXISTS weeks (
    id TEXT NOT NULL PRIMARY KEY,
    week_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phase_title TEXT,
    deadline DATETIME
  );`,
  `CREATE TABLE IF NOT EXISTS group_weeks (
    id TEXT NOT NULL PRIMARY KEY,
    group_id TEXT NOT NULL,
    week_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    submission_comments TEXT,
    submitted_file_name TEXT,
    submitted_file_path TEXT,
    submitted_file_type TEXT,
    submitted_file_size INTEGER,
    submitted_at DATETIME,
    submitted_by_id TEXT,
    supervisor_feedback TEXT,
    reviewed_at DATETIME,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (week_id) REFERENCES weeks(id),
    FOREIGN KEY (submitted_by_id) REFERENCES users(id),
    UNIQUE (group_id, week_id)
  );`,
  `CREATE TABLE IF NOT EXISTS group_members (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    group_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS supervisor_requests (
    id TEXT NOT NULL PRIMARY KEY,
    group_id TEXT NOT NULL UNIQUE,
    supervisor_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS student_grades (
    id TEXT NOT NULL PRIMARY KEY,
    student_id TEXT NOT NULL,
    supervisor_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    cws INTEGER,
    mte INTEGER,
    ete INTEGER,
    total INTEGER,
    is_published BOOLEAN NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    UNIQUE (student_id, supervisor_id, group_id)
  );`,
  'PRAGMA foreign_keys = ON;',
];

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log('Bootstrapped local SQLite schema.');
}

main()
  .catch((error) => {
    console.error('Failed to bootstrap database schema:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
