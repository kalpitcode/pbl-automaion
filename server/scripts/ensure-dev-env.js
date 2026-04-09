const fs = require('fs');
const os = require('os');
const path = require('path');

const serverRoot = path.resolve(__dirname, '..');
const envPath = path.join(serverRoot, '.env');
const safeDbPath = path.join(os.tmpdir(), 'pbl_v1_app.db');
const safeUploadDir = path.join(os.tmpdir(), 'pbl_v1_uploads');
const safeDbUrl = `file:${safeDbPath.replace(/\\/g, '/')}`;

const defaults = {
  DATABASE_URL: safeDbUrl,
  SUBMISSION_UPLOAD_DIR: safeUploadDir,
  JWT_SECRET: 'change-me-in-production',
  JWT_EXPIRES_IN: '1h',
  TEACHER_INVITE_CODE: 'teacher123',
  PORT: '5001',
};

function parseEnv(content) {
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function quote(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function hasUnsafeSqlitePath(databaseUrl) {
  if (!databaseUrl) {
    return true;
  }

  const normalized = databaseUrl.replace(/\\/g, '/');
  return normalized.startsWith('file:./') || normalized.includes('OneDrive/');
}

const existing = fs.existsSync(envPath)
  ? parseEnv(fs.readFileSync(envPath, 'utf8'))
  : {};

const nextValues = { ...existing };
for (const [key, value] of Object.entries(defaults)) {
  if (!nextValues[key]) {
    nextValues[key] = value;
  }
}

if (hasUnsafeSqlitePath(nextValues.DATABASE_URL)) {
  nextValues.DATABASE_URL = safeDbUrl;
}

const preferredKeys = [
  'DATABASE_URL',
  'SUBMISSION_UPLOAD_DIR',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'TEACHER_INVITE_CODE',
  'PORT',
];
const orderedKeys = [
  ...preferredKeys,
  ...Object.keys(nextValues).filter((key) => !preferredKeys.includes(key)),
];

const fileBody = [
  '# Local development environment',
  '# SQLite is kept outside OneDrive because synced folders can cause disk I/O errors.',
  '# Regenerate this file at any time with `npm run env`.',
  '',
  ...orderedKeys.map((key) => `${key}=${quote(nextValues[key])}`),
  '',
].join('\n');

fs.mkdirSync(path.dirname(envPath), { recursive: true });
fs.writeFileSync(envPath, fileBody, 'utf8');

console.log(`Prepared ${envPath}`);
console.log(`Using SQLite database at ${safeDbPath}`);
console.log(`Using submission uploads at ${safeUploadDir}`);
