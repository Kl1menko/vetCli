import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildStorageFileUrl, buildStorageObjectKey } from "@/lib/storage/path";
import type { StorageAdapter, UploadPayload } from "@/lib/storage/types";

export class LocalStorageAdapter implements StorageAdapter {
  async upload(payload: UploadPayload) {
    const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? "./uploads";
    const objectKey = buildStorageObjectKey({
      filename: payload.filename,
      directory: payload.directory,
    });
    const targetFile = path.resolve(uploadDir, objectKey);
    const targetDir = path.dirname(targetFile);

    await mkdir(targetDir, { recursive: true });
    await writeFile(targetFile, payload.bytes);

    return {
      fileUrl: buildStorageFileUrl(objectKey),
      originalName: payload.filename,
      mimeType: payload.mimeType,
      sizeBytes: payload.bytes.byteLength,
    };
  }
}
