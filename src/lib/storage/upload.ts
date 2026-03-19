import { getStorageAdapter } from "@/lib/storage";
import { validateUpload } from "@/lib/storage/validation";
import type { StoredFile } from "@/lib/storage/types";

type StoreUploadedFileOptions = {
  directory?: string;
};

export async function storeUploadedFile(
  file: File,
  options: StoreUploadedFileOptions = {},
): Promise<StoredFile> {
  validateUpload(file);

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);

  return getStorageAdapter().upload({
    bytes,
    filename: file.name,
    mimeType: file.type,
    directory: options.directory,
  });
}
