export type UploadDriver = "local" | "s3";

export type StoredFile = {
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export type UploadPayload = {
  bytes: Buffer;
  filename: string;
  mimeType: string;
  directory?: string;
};

export interface StorageAdapter {
  upload(payload: UploadPayload): Promise<StoredFile>;
}
