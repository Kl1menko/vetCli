const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const maxBytes = 10 * 1024 * 1024;

export function validateUpload(file: File) {
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Підтримуються тільки PDF, JPG, PNG і WEBP.");
  }

  if (file.size > maxBytes) {
    throw new Error("Файл перевищує ліміт 10MB.");
  }
}
