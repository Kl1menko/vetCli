import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { buildStorageFileUrl, buildStorageObjectKey } from "@/lib/storage/path";
import { getS3Client, getS3Config } from "@/lib/storage/s3-config";
import type { StorageAdapter, StoredFile, UploadPayload } from "@/lib/storage/types";

export class S3StorageAdapter implements StorageAdapter {
  async upload(payload: UploadPayload) {
    const objectKey = buildStorageObjectKey({
      filename: payload.filename,
      directory: payload.directory,
    });
    const { bucket } = getS3Config();

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: payload.bytes,
        ContentType: payload.mimeType,
      }),
    );

    return {
      fileUrl: buildStorageFileUrl(objectKey),
      originalName: payload.filename,
      mimeType: payload.mimeType,
      sizeBytes: payload.bytes.byteLength,
    } satisfies StoredFile;
  }
}

export async function downloadS3Object(key: string) {
  const { bucket } = getS3Config();
  const result = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!result.Body) {
    throw new Error(`S3 object "${key}" has no body.`);
  }

  const bytes = await result.Body.transformToByteArray();

  return {
    bytes,
    contentType: result.ContentType ?? "application/octet-stream",
  };
}
