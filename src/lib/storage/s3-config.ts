import { S3Client } from "@aws-sdk/client-s3";

type S3Config = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

const globalForS3 = globalThis as unknown as {
  s3Client?: S3Client;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required S3 environment variable: ${name}`);
  }

  return value;
}

export function getS3Config(): S3Config {
  return {
    endpoint: getRequiredEnv("S3_ENDPOINT"),
    region: getRequiredEnv("S3_REGION"),
    bucket: getRequiredEnv("S3_BUCKET"),
    accessKeyId: getRequiredEnv("S3_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("S3_SECRET_ACCESS_KEY"),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

export function getS3Client() {
  if (!globalForS3.s3Client) {
    const config = getS3Config();

    globalForS3.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return globalForS3.s3Client;
}
