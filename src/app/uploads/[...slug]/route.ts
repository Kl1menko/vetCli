import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const mimeTypeByExtension: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? "./uploads";
  const relativePath = slug.join("/");
  const normalizedPath = path.normalize(relativePath);

  if (normalizedPath.startsWith("..") || path.isAbsolute(normalizedPath)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const filePath = path.resolve(uploadDir, normalizedPath);

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "Content-Type": mimeTypeByExtension[extension] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
