function sanitizeFilename(filename: string) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function sanitizeDirectory(directory?: string) {
  if (!directory) {
    return "";
  }

  return directory.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
}

export function buildStorageObjectKey({
  filename,
  directory,
}: {
  filename: string;
  directory?: string;
}) {
  const safeFilename = sanitizeFilename(filename);
  const safeDirectory = sanitizeDirectory(directory);
  const safeName = `${Date.now()}-${safeFilename}`;

  return safeDirectory ? `${safeDirectory}/${safeName}` : safeName;
}

export function buildStorageFileUrl(key: string) {
  return `/uploads/${key}`;
}
