import { type NotificationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const cabinetNotificationSections = [
  "visits",
  "prescriptions",
  "lab-results",
  "invoices",
] as const;

export type CabinetNotificationSection = (typeof cabinetNotificationSections)[number];

const cabinetNotificationTitlePrefix = "[cabinet:";

function getCabinetNotificationPrefix(section: CabinetNotificationSection) {
  return `${cabinetNotificationTitlePrefix}${section}] `;
}

export function buildCabinetNotificationTitle(
  section: CabinetNotificationSection,
  title: string,
) {
  return `${getCabinetNotificationPrefix(section)}${title}`;
}

function getCabinetNotificationSectionFromTitle(
  title: string,
): CabinetNotificationSection | null {
  for (const section of cabinetNotificationSections) {
    if (title.startsWith(getCabinetNotificationPrefix(section))) {
      return section;
    }
  }

  return null;
}

export async function createCabinetVisitNotification(args: {
  visitId: string;
  section: CabinetNotificationSection;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  const visit = await prisma.visit.findUnique({
    where: { id: args.visitId },
    select: {
      pet: {
        select: {
          owner: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const userId = visit?.pet.owner?.userId;

  if (!userId) {
    return;
  }

  await prisma.notification.create({
    data: {
      userId,
      type: args.type ?? "GENERAL",
      title: buildCabinetNotificationTitle(args.section, args.title),
      message: args.message,
    },
  });
}

export async function getUnreadCabinetNotificationCounts(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      OR: cabinetNotificationSections.map((section) => ({
        title: {
          startsWith: getCabinetNotificationPrefix(section),
        },
      })),
    },
    select: {
      id: true,
      title: true,
    },
  });

  const counts: Partial<Record<CabinetNotificationSection, number>> = {};

  for (const notification of notifications) {
    const section = getCabinetNotificationSectionFromTitle(notification.title);

    if (!section) {
      continue;
    }

    counts[section] = (counts[section] ?? 0) + 1;
  }

  return counts;
}

export async function markCabinetNotificationsAsRead(
  userId: string,
  section: CabinetNotificationSection,
) {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      title: {
        startsWith: getCabinetNotificationPrefix(section),
      },
    },
    data: {
      isRead: true,
    },
  });
}
