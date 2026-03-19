import { LocalStorageAdapter } from "@/lib/storage/local";
import { S3StorageAdapter } from "@/lib/storage/s3";
import type { StorageAdapter, UploadDriver } from "@/lib/storage/types";

export function getStorageAdapter(): StorageAdapter {
  const driver = (process.env.UPLOAD_DRIVER as UploadDriver | undefined) ?? "local";

  return driver === "s3" ? new S3StorageAdapter() : new LocalStorageAdapter();
}
