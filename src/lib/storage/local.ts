import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StorageAdapter, UploadPayload } from "@/lib/storage/types";

export class LocalStorageAdapter implements StorageAdapter {
  async upload(payload: UploadPayload) {
    const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? "./uploads";
    const safeFilename = payload.filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    const safeDirectory = payload.directory
      ? payload.directory.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/\/+/g, "/")
      : "";
    const safeName = `${Date.now()}-${safeFilename}`;
    const targetDir = path.resolve(uploadDir, safeDirectory);
    const targetFile = path.join(targetDir, safeName);
    const publicPath = safeDirectory ? `${safeDirectory}/${safeName}` : safeName;

    await mkdir(targetDir, { recursive: true });
    await writeFile(targetFile, payload.bytes);

    return {
      fileUrl: `/uploads/${publicPath}`,
      originalName: payload.filename,
      mimeType: payload.mimeType,
      sizeBytes: payload.bytes.byteLength,
    };
  }
}
