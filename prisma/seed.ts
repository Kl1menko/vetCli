import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("UltraVetAdmin123!", 10);
  const doctorPasswordHash = await bcrypt.hash("UltraVetDoctor123!", 10);
  const clientPasswordHash = await bcrypt.hash("UltraVetClient123!", 10);

  const [, doctorUser, clientUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@ultravet.ua" },
      update: {},
      create: {
        name: "UltraVet Admin",
        email: "admin@ultravet.ua",
        role: UserRole.ADMIN,
        passwordHash: adminPasswordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "doctor@ultravet.ua" },
      update: {},
      create: {
        name: "Dr. Marta Koval",
        email: "doctor@ultravet.ua",
        role: UserRole.DOCTOR,
        passwordHash: doctorPasswordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "owner@ultravet.ua" },
      update: {},
      create: {
        name: "Олена Бойко",
        email: "owner@ultravet.ua",
        phone: "+380670000001",
        role: UserRole.CLIENT,
        passwordHash: clientPasswordHash,
      },
    }),
  ]);

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      fullName: "Марта Коваль",
      specialization: "Терапія та ультразвукова діагностика",
      bio: "Прийом дрібних домашніх тварин, профілактика, вакцинація, УЗД.",
      isActive: true,
    },
  });

  const services = [
    ["Терапія", "therapy", 30, "consultation", "Первинний прийом, огляд і базова консультація."],
    ["Хірургія", "surgery", 90, "surgery", "Планові та ургентні хірургічні втручання."],
    ["Стоматологія", "dentistry", 45, "dentistry", "Огляд ротової порожнини, лікування і чистка."],
    ["УЗД", "ultrasound", 30, "diagnostics", "Ультразвукова діагностика внутрішніх органів."],
    ["Вакцинація", "vaccination", 20, "prevention", "Планова і сезонна вакцинація тварин."],
    ["Чіпування", "microchipping", 20, "prevention", "Встановлення мікрочипа з реєстрацією."],
    ["Стаціонар", "hospital", 1440, "care", "Добове спостереження та підтримка тварин."],
    ["Аналізи", "lab-tests", 20, "diagnostics", "Забір матеріалу та лабораторні дослідження."],
    ["Грумінг", "grooming", 60, "care", "Комплексний догляд і гігієнічні процедури."],
  ] as const;

  await Promise.all(
    services.map(([name, slug, durationMinutes, category, description], index) =>
      prisma.service.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          durationMinutes,
          category,
          description,
          price: 500 + index * 150,
          isActive: true,
          isOnlineBookable: true,
        },
      }),
    ),
  );

  const existingSchedule = await prisma.doctorSchedule.findFirst({
    where: { doctorId: doctor.id, weekday: 1 },
  });

  if (!existingSchedule) {
    await prisma.doctorSchedule.create({
      data: {
        doctorId: doctor.id,
        weekday: 1,
        startTime: "10:00",
        endTime: "18:00",
        slotDurationMinutes: 30,
      },
    });
  }

  const ownerProfile = await prisma.ownerProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      fullName: "Олена Бойко",
      email: "owner@ultravet.ua",
      phone: "+380670000001",
      address: "Львів, вул. Прикладна, 8",
    },
  });

  const [mia] = await Promise.all([
    prisma.pet.upsert({
      where: { microchipNumber: "ULTRA-MIA-001" },
      update: {},
      create: {
        ownerId: ownerProfile.id,
        name: "Мія",
        species: "Кішка",
        breed: "Британська короткошерста",
        microchipNumber: "ULTRA-MIA-001",
      },
    }),
    prisma.pet.upsert({
      where: { microchipNumber: "ULTRA-RICHI-001" },
      update: {},
      create: {
        ownerId: ownerProfile.id,
        name: "Річі",
        species: "Собака",
        breed: "Мальтіпу",
        microchipNumber: "ULTRA-RICHI-001",
      },
    }),
  ]);

  const primaryService = await prisma.service.findUnique({
    where: { slug: "therapy" },
  });

  if (primaryService) {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    appointmentDate.setHours(0, 0, 0, 0);

    const completedAppointmentDate = new Date();
    completedAppointmentDate.setDate(completedAppointmentDate.getDate() - 12);
    completedAppointmentDate.setHours(0, 0, 0, 0);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        ownerId: ownerProfile.id,
        petId: mia.id,
        doctorId: doctor.id,
        date: appointmentDate,
        startTime: "11:30",
      },
    });

    if (!existingAppointment) {
      await prisma.appointment.create({
        data: {
          ownerId: ownerProfile.id,
          petId: mia.id,
          doctorId: doctor.id,
          serviceId: primaryService.id,
          source: "CLIENT_CABINET",
          date: appointmentDate,
          startTime: "11:30",
          endTime: "12:00",
          status: "CONFIRMED",
          comment: "Профілактичний огляд і контроль вакцинації.",
          createdByUserId: clientUser.id,
        },
      });
    }

    const completedAppointment = await prisma.appointment.upsert({
      where: { id: "seed-completed-appointment" },
      update: {},
      create: {
        id: "seed-completed-appointment",
        ownerId: ownerProfile.id,
        petId: mia.id,
        doctorId: doctor.id,
        serviceId: primaryService.id,
        source: "CLIENT_CABINET",
        date: completedAppointmentDate,
        startTime: "10:30",
        endTime: "11:00",
        status: "COMPLETED",
        comment: "Контроль після курсу лікування.",
        createdByUserId: clientUser.id,
      },
    });

    const visit = await prisma.visit.upsert({
      where: { appointmentId: completedAppointment.id },
      update: {},
      create: {
        appointmentId: completedAppointment.id,
        petId: mia.id,
        doctorId: doctor.id,
        status: "COMPLETED",
        summary: "Загальний стан стабільний, температура в нормі, апетит відновився.",
        anamnesis: "Скарги на млявість після зміни корму. Реакція на попередню терапію позитивна.",
        examination: "Слизові чисті, живіт м'який, без болючості.",
        recommendations: "Продовжити дієтичний корм ще 10 днів і контроль ваги через 2 тижні.",
      },
    });

    await prisma.diagnosis.upsert({
      where: { id: "seed-diagnosis-mia" },
      update: {},
      create: {
        id: "seed-diagnosis-mia",
        visitId: visit.id,
        title: "Гострий гастроентерит у стадії одужання",
        description: "Потребує контролю харчування і повторного огляду.",
        status: "RESOLVED",
      },
    });

    await prisma.prescription.upsert({
      where: { id: "seed-prescription-mia" },
      update: {},
      create: {
        id: "seed-prescription-mia",
        visitId: visit.id,
        medicationName: "Пробіотик VetBio",
        dosage: "1 саше",
        frequency: "1 раз на день",
        duration: "10 днів",
        instructions: "Давати після їжі, запивати водою.",
        startDate: completedAppointmentDate,
        endDate: new Date(completedAppointmentDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.labResult.upsert({
      where: { id: "seed-lab-mia" },
      update: {},
      create: {
        id: "seed-lab-mia",
        visitId: visit.id,
        title: "Загальний аналіз крові",
        fileUrl: "/file.svg",
        comment: "Показники в межах референсів, запалення не підтверджено.",
      },
    });

    await prisma.fileAsset.upsert({
      where: { id: "seed-attachment-mia" },
      update: {},
      create: {
        id: "seed-attachment-mia",
        visitId: visit.id,
        uploadedByUserId: doctorUser.id,
        kind: "MEDICAL_FILE",
        originalName: "mia-follow-up.pdf",
        fileUrl: "/file.svg",
        mimeType: "application/pdf",
        sizeBytes: 182400,
        note: "Пам'ятка по харчуванню після лікування.",
      },
    });

    await prisma.invoice.upsert({
      where: { visitId: visit.id },
      update: {},
      create: {
        visitId: visit.id,
        totalAmount: 850,
        paymentStatus: "PAID",
        fileUrl: "/file.svg",
        note: "Оплачено на рецепції після прийому.",
      },
    });

    await prisma.vaccination.upsert({
      where: { id: "mia-vaccination-seed" },
      update: {},
      create: {
        id: "mia-vaccination-seed",
        petId: mia.id,
        title: "Комплексна вакцинація",
        date: new Date("2025-09-10"),
        nextDueDate: new Date("2026-09-10"),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
