import { LocalStorageAdapter } from "@/lib/storage/local";
import { S3StorageAdapter } from "@/lib/storage/s3";
import type { StorageAdapter, UploadDriver } from "@/lib/storage/types";

export function getStorageDriver(): UploadDriver {
  return (process.env.UPLOAD_DRIVER as UploadDriver | undefined) ?? "local";
}

export function getStorageAdapter(): StorageAdapter {
  return getStorageDriver() === "s3" ? new S3StorageAdapter() : new LocalStorageAdapter();
}
