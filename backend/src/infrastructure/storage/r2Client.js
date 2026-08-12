// Cloudflare R2 client — R2 is S3-compatible, so the AWS SDK v3 S3 client talks to it directly
// by pointing at the account's R2 endpoint.
const { S3Client } = require("@aws-sdk/client-s3");
const env = require("../../config/env");

const r2Client = new S3Client({
  region: env.r2.region,
  endpoint: env.r2.endpoint,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});

module.exports = r2Client;
