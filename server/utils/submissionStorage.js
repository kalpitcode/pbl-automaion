const fs = require('fs');
const os = require('os');
const path = require('path');

const baseUploadDir = process.env.SUBMISSION_UPLOAD_DIR
  ? path.resolve(process.env.SUBMISSION_UPLOAD_DIR)
  : path.join(os.tmpdir(), 'pbl_v1_uploads');

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const maxFileSizeBytes = 10 * 1024 * 1024;

function sanitizeFileName(name) {
  return path.basename(name || 'weekly-report.pdf').replace(/[^\w.\-() ]+/g, '_');
}

function ensureGroupUploadDir(groupId) {
  const targetDir = path.join(baseUploadDir, groupId);
  fs.mkdirSync(targetDir, { recursive: true });
  return targetDir;
}

function getMetadataPath(groupId, weekId) {
  return path.join(ensureGroupUploadDir(groupId), `${weekId}.json`);
}

function validateSubmissionFile(file) {
  if (!file || typeof file !== 'object') {
    throw { status: 400, message: 'No file was uploaded.' };
  }

  const fileName = sanitizeFileName(file.name);
  const extension = path.extname(fileName).toLowerCase();
  const mimeType = typeof file.type === 'string' ? file.type.trim() : '';
  const base64 = typeof file.contentBase64 === 'string' ? file.contentBase64.trim() : '';

  if (!allowedExtensions.has(extension)) {
    throw { status: 400, message: 'Only PDF, DOC, and DOCX files are allowed.' };
  }

  if (mimeType && !allowedMimeTypes.has(mimeType)) {
    throw { status: 400, message: 'Unsupported file type. Please upload a PDF, DOC, or DOCX file.' };
  }

  if (!base64) {
    throw { status: 400, message: 'Uploaded file content is empty.' };
  }

  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) {
    throw { status: 400, message: 'Uploaded file content is invalid.' };
  }

  if (buffer.length > maxFileSizeBytes) {
    throw { status: 400, message: 'The file is too large. Please keep uploads under 10 MB.' };
  }

  return {
    buffer,
    fileName,
    mimeType: mimeType || 'application/octet-stream',
    extension,
    size: buffer.length,
  };
}

function saveSubmissionFile({ groupId, weekId, file }) {
  const validated = validateSubmissionFile(file);
  const uploadDir = ensureGroupUploadDir(groupId);
  const existingMeta = readSubmissionMeta(groupId, weekId);

  if (existingMeta?.storedPath) {
    removeStoredFile(existingMeta.storedPath);
  }

  const storedFileName = `${weekId}-${Date.now()}${validated.extension}`;
  const storedPath = path.join(uploadDir, storedFileName);

  fs.writeFileSync(storedPath, validated.buffer);

  const metadata = {
    storedPath,
    originalName: validated.fileName,
    mimeType: validated.mimeType,
    size: validated.size,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(getMetadataPath(groupId, weekId), JSON.stringify(metadata, null, 2), 'utf8');

  return metadata;
}

function readSubmissionMeta(groupId, weekId) {
  const metadataPath = getMetadataPath(groupId, weekId);
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    if (!parsed?.storedPath || !hasStoredFile(parsed.storedPath)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearSubmissionMeta(groupId, weekId) {
  const metadataPath = getMetadataPath(groupId, weekId);
  const existingMeta = readSubmissionMeta(groupId, weekId);

  if (existingMeta?.storedPath) {
    removeStoredFile(existingMeta.storedPath);
  }

  if (fs.existsSync(metadataPath)) {
    fs.unlinkSync(metadataPath);
  }
}

function removeStoredFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup errors so a replacement upload does not fail on delete.
  }
}

function hasStoredFile(filePath) {
  return Boolean(filePath && fs.existsSync(filePath));
}

module.exports = {
  baseUploadDir,
  clearSubmissionMeta,
  hasStoredFile,
  maxFileSizeBytes,
  readSubmissionMeta,
  removeStoredFile,
  saveSubmissionFile,
};
