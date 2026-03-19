import type { StorageAdapter, UploadPayload } from "@/lib/storage/types";

export class S3StorageAdapter implements StorageAdapter {
  async upload(payload: UploadPayload) {
    const key = payload.directory ? `${payload.directory}/${payload.filename}` : payload.filename;

    return Promise.resolve({
      fileUrl: `s3://pending/${key}`,
      originalName: payload.filename,
      mimeType: payload.mimeType,
      sizeBytes: payload.bytes.byteLength,
    });
  }
}
