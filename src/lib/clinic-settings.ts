import { Prisma } from "@prisma/client";

import { clinicProfile, type ClinicProfile } from "@/constants/site";
import { prisma } from "@/lib/prisma";

type ClinicSettingsRow = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  closedDay: string;
};

export async function getClinicProfile(): Promise<ClinicProfile> {
  if (!process.env.DATABASE_URL) {
    return clinicProfile;
  }

  let settings: ClinicSettingsRow | undefined;

  try {
    [settings] = await prisma.$queryRaw<ClinicSettingsRow[]>(Prisma.sql`
      SELECT "id", "name", "city", "address", "phone", "phoneHref", "email", "hours", "closedDay"
      FROM "ClinicSettings"
      WHERE "id" = 'default'
      LIMIT 1
    `);
  } catch {
    return clinicProfile;
  }

  if (!settings) {
    try {
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "ClinicSettings" ("id", "name", "city", "address", "phone", "phoneHref", "email", "hours", "closedDay", "createdAt", "updatedAt")
        VALUES (
          'default',
          ${clinicProfile.name},
          ${clinicProfile.city},
          ${clinicProfile.address},
          ${clinicProfile.phone},
          ${clinicProfile.phoneHref},
          ${clinicProfile.email},
          ${clinicProfile.hours},
          ${clinicProfile.closedDay},
          NOW(),
          NOW()
        )
        ON CONFLICT ("id") DO NOTHING
      `);
    } catch {
      return clinicProfile;
    }

    return clinicProfile;
  }

  return {
    name: settings.name,
    city: settings.city,
    address: settings.address,
    phone: settings.phone,
    phoneHref: settings.phoneHref,
    email: settings.email,
    hours: settings.hours,
    closedDay: settings.closedDay,
  };
}
