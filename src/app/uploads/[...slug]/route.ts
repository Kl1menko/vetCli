import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";
import { downloadS3Object } from "@/lib/storage/s3";
import { canAccessProtectedUploadByReference } from "@/lib/uploads";

const mimeTypeByExtension: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function canAccessProtectedUpload(fileUrl: string) {
  const session = await auth();
  const [labResult, invoice, attachment] = await Promise.all([
    prisma.labResult.findFirst({
      where: { fileUrl },
      select: {
        visit: {
          select: {
            doctor: { select: { userId: true } },
            pet: { select: { owner: { select: { userId: true } } } },
          },
        },
      },
    }),
    prisma.invoice.findFirst({
      where: { fileUrl },
      select: {
        visit: {
          select: {
            doctor: { select: { userId: true } },
            pet: { select: { owner: { select: { userId: true } } } },
          },
        },
      },
    }),
    prisma.fileAsset.findFirst({
      where: { fileUrl },
      select: {
        visit: {
          select: {
            doctor: { select: { userId: true } },
            pet: { select: { owner: { select: { userId: true } } } },
          },
        },
      },
    }),
  ]);

  return canAccessProtectedUploadByReference(
    {
      userId: session?.user?.id,
      role: session?.user?.role,
    },
    {
      doctorUserIds: [
        labResult?.visit?.doctor.userId,
        invoice?.visit?.doctor.userId,
        attachment?.visit?.doctor.userId,
      ].filter((value): value is string => Boolean(value)),
      ownerUserIds: [
        labResult?.visit?.pet.owner.userId,
        invoice?.visit?.pet.owner.userId,
        attachment?.visit?.pet.owner.userId,
      ].filter((value): value is string => Boolean(value)),
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const driver = getStorageDriver();
  const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? "./uploads";
  const relativePath = slug.join("/");
  const normalizedPath = path.normalize(relativePath);

  if (normalizedPath.startsWith("..") || path.isAbsolute(normalizedPath)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const filePath = path.resolve(uploadDir, normalizedPath);
  const fileUrl = `/uploads/${relativePath}`;

  const [labResultRef, invoiceRef, attachmentRef] = await Promise.all([
    prisma.labResult.findFirst({
      where: { fileUrl },
      select: { id: true },
    }),
    prisma.invoice.findFirst({
      where: { fileUrl },
      select: { id: true },
    }),
    prisma.fileAsset.findFirst({
      where: { fileUrl },
      select: { id: true },
    }),
  ]);

  const isProtectedUpload = Boolean(labResultRef || invoiceRef || attachmentRef);

  if (isProtectedUpload) {
    const allowed = await canAccessProtectedUpload(fileUrl);

    if (!allowed) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    if (driver === "s3") {
      const file = await downloadS3Object(normalizedPath);

      return new NextResponse(Buffer.from(file.bytes), {
        headers: {
          "Content-Type": file.contentType,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "Content-Type": mimeTypeByExtension[extension] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (
      driver === "s3" &&
      error &&
      typeof error === "object" &&
      ("name" in error || "$metadata" in error)
    ) {
      const knownError = error as { name?: string; $metadata?: { httpStatusCode?: number } };

      if (knownError.name === "NoSuchKey" || knownError.$metadata?.httpStatusCode === 404) {
        return new NextResponse("Not found", { status: 404 });
      }

      return new NextResponse("Storage error", { status: 500 });
    }

    return new NextResponse("Not found", { status: 404 });
  }
}
