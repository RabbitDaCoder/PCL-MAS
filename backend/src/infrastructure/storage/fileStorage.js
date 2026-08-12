// Upload/delete helpers for class materials — the bucket's public dev URL means files are
// served directly by key, no presigned GET URLs needed.
const crypto = require("crypto");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("./r2Client");
const env = require("../../config/env");

function buildKey(folder, id, originalName) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "";
  const uniqueId = crypto.randomUUID();
  return `${folder}/${id}/${uniqueId}${ext ? `.${ext}` : ""}`;
}

async function uploadMaterialFile({ classId, buffer, originalName, mimeType }) {
  const key = buildKey("materials", classId, originalName);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );
  return { key, url: `${env.r2.publicUrl}/${key}` };
}

async function uploadSubmissionFile({
  assignmentId,
  buffer,
  originalName,
  mimeType,
}) {
  const key = buildKey("submissions", assignmentId, originalName);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );
  return { key, url: `${env.r2.publicUrl}/${key}` };
}

async function deleteMaterialFile(key) {
  if (!key) return;
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: env.r2.bucketName, Key: key }),
  );
}

// Derives the storage key back out of a public URL — so deletion works from stored fileUrl
// without needing a separate fileKey column.
function keyFromUrl(url) {
  if (!url || !url.startsWith(env.r2.publicUrl)) return null;
  return url.slice(env.r2.publicUrl.length + 1);
}

module.exports = {
  uploadMaterialFile,
  uploadSubmissionFile,
  deleteMaterialFile,
  keyFromUrl,
};
