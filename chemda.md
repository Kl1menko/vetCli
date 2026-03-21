# UltraVet Technical Context

Цей файл більше не є продуктним spec.

Його призначення:

- фіксувати технічний контекст;
- зберігати доменну і архітектурну довідку;
- вести статус реалізації;
- збирати технічний backlog і робочі нотатки.

Якщо будь-що в цьому файлі конфліктує з `product-spec.md`, пріоритет має `product-spec.md`.

## 1. Роль документа

`chemda.md` не вводить нових продуктних вимог, ролей, маршрутів або бізнес-правил.

Тут допускаються:

- технічні рішення;
- структура даних;
- статус реалізації;
- UI/engineering notes;
- changelog по вже зроблених змінах.

Тут не повинно бути:

- альтернативного product scope;
- другого опису MVP;
- нових правил ACL без синхронізації з `product-spec.md`;
- user-facing інструкцій.

## 2. Поточний стек

- `Next.js App Router`
- `TypeScript`
- `Prisma`
- `PostgreSQL`
- `Auth.js`
- `Tailwind CSS`
- `shadcn/ui`

## 3. Архітектурний контекст

Цільова структура проєкту:

```text
src/
  app/
    (public)/
    (auth)/
    cabinet/
    admin/
    doctor/
    api/
  components/
    ui/
    shared/
    forms/
    layout/
    calendar/
  lib/
    auth/
    prisma/
    permissions/
    utils/
    validations/
  server/
    services/
    repositories/
    actions/
  types/
  hooks/
  constants/
prisma/
```

Технічні принципи:

- бізнес-логіка не повинна жити всередині UI-компонентів;
- перевірки доступу повинні виконуватись server-side;
- DTO, enums і validation schema мають бути явними;
- файли, сесії та доступ до даних повинні бути ізольованими по ролях;
- архітектура має залишатись простою, але придатною до розширення.

## 4. Технічна доменна довідка

Нижче перелік основних сутностей, з якими працює кодова база.
Це технічна довідка для розробки, а не окремий spec продукту.

### Core entities

#### User

- `id`
- `name`
- `email`
- `phone`
- `passwordHash` або auth provider fields
- `role`
- `status`
- `createdAt`
- `updatedAt`

#### OwnerProfile

- `id`
- `userId`
- `fullName`
- `phone`
- `email`
- `address`
- `notes`
- `createdAt`
- `updatedAt`

#### Pet

- `id`
- `ownerId`
- `name`
- `photoUrl`
- `species`
- `breed`
- `sex`
- `birthDate`
- `weight`
- `color`
- `microchipNumber`
- `isSterilized`
- `allergies`
- `chronicConditions`
- `notes`
- `createdAt`
- `updatedAt`

#### Doctor

- `id`
- `userId`
- `fullName`
- `specialization`
- `bio`
- `photoUrl`
- `isActive`
- `createdAt`
- `updatedAt`

#### Service

- `id`
- `name`
- `slug`
- `description`
- `durationMinutes`
- `price`
- `category`
- `isActive`
- `isOnlineBookable`
- `createdAt`
- `updatedAt`

### Scheduling entities

#### DoctorSchedule

- `id`
- `doctorId`
- `weekday`
- `startTime`
- `endTime`
- `slotDurationMinutes`
- `breakStart`
- `breakEnd`
- `isActive`

#### ScheduleBlock

- `id`
- `doctorId`
- `date`
- `startTime`
- `endTime`
- `reason`
- `type`
- `createdAt`

Типи блокувань:

- `vacation`
- `break`
- `manual_block`
- `emergency_reserve`

#### Appointment

- `id`
- `ownerId`
- `petId`
- `doctorId`
- `serviceId`
- `source`
- `date`
- `startTime`
- `endTime`
- `status`
- `comment`
- `adminComment`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Технічні enum values, які вже закладені в моделі:

- statuses: `new`, `pending`, `confirmed`, `rescheduled`, `cancelled_by_client`, `cancelled_by_admin`, `completed`, `no_show`
- source: `public_site`, `client_cabinet`, `admin_manual`, `phone_call`

### Medical entities

#### Visit

- `id`
- `appointmentId`
- `petId`
- `doctorId`
- `summary`
- `anamnesis`
- `examination`
- `recommendations`
- `status`
- `createdAt`
- `updatedAt`

#### Diagnosis

- `id`
- `visitId`
- `title`
- `description`
- `status`
- `createdAt`
- `updatedAt`

Технічні enum values:

- `active`
- `resolved`
- `chronic`

#### Prescription

- `id`
- `visitId`
- `medicationName`
- `dosage`
- `frequency`
- `duration`
- `instructions`
- `startDate`
- `endDate`
- `createdAt`
- `updatedAt`

#### LabResult

- `id`
- `visitId`
- `title`
- `fileUrl`
- `comment`
- `createdAt`
- `updatedAt`

#### Vaccination

- `id`
- `petId`
- `title`
- `date`
- `nextDueDate`
- `note`
- `createdAt`
- `updatedAt`

#### Invoice

- `id`
- `visitId`
- `totalAmount`
- `paymentStatus`
- `fileUrl`
- `note`
- `createdAt`
- `updatedAt`

Технічні enum values:

- `unpaid`
- `partially_paid`
- `paid`
- `cancelled`

#### Notification

- `id`
- `userId`
- `type`
- `title`
- `message`
- `isRead`
- `createdAt`

## 5. Поточний статус реалізації

Цей розділ відображає поточний стан кодової бази і може оновлюватись частіше за product spec.

### Архітектура і база

- проєкт побудований на `Next.js App Router`, `TypeScript`, `Tailwind CSS`, `shadcn/ui`, `Prisma`, `Auth.js`;
- піднята Prisma schema для основних ролей і сутностей клініки;
- є `seed`-дані для демо-сценаріїв.

### Auth і доступ

- працює credentials login;
- захищені зони `cabinet`, `admin`, `doctor`;
- є logout flow для авторизованих користувачів.

### Client flow

- реалізований CRUD тварин;
- працює картка тварини;
- доступні сторінки записів, візитів, призначень, аналізів і рахунків;
- клієнт може скасовувати і переносити власні записи;
- клієнт бачить медичну історію й документи по своїх тваринах.

### Admin flow

- є адмінський дашборд;
- реалізований календар записів;
- адмін може створювати, редагувати, переносити і фільтрувати записи;
- адмін може блокувати слоти;
- `admin calendar` переведений у `day-grid` формат.

### Doctor flow

- лікар бачить власний розклад;
- лікар відкриває картку пацієнта;
- лікар створює `Visit`;
- лікар додає `Diagnosis`, `Prescription`, `LabResult`, `Invoice`;
- `doctor schedule` теж переведений у `day-grid`.

### Uploads

- працює локальний upload flow;
- файли зберігаються через storage layer;
- у doctor flow можна завантажувати вкладення, аналізи й документи;
- клієнт бачить ці файли в кабінеті.

### Booking

- реалізований booking flow;
- доступний вибір тварини, послуги, лікаря, дати і слота;
- підтримується режим `будь-який доступний лікар`;
- є availability layer і API для слотів;
- public booking працює через `day-grid / slot picker UI`;
- є empty states, тижнева навігація і підказка до найближчого доступного дня.

### Public website

- підключений локальний шрифт `Gilroy`;
- підключене реальне лого клініки;
- налаштований базовий metadata layer;
- головна сторінка і hero перероблені під поточний бренд;
- секція послуг переведена на більш кастомний mosaic layout.

## 6. Технічний backlog

Сюди варто записувати тільки engineering tasks і polishing, а не міняти продуктний scope.

- підставити реальні фото в mosaic-секцію послуг;
- оновити production contacts, телефони, email і доменні metadata;
- перевірити production `AUTH_URL`;
- провести фінальний візуальний polishing публічних секцій;
- уточнити технічні обмеження uploads: формати, розмір, політика доступу;
- за потреби підготувати архітектурну основу під audit log.

## 7. Правило оновлення

Оновлювати `chemda.md` варто, коли змінюється:

- технічний статус реалізації;
- список вже зроблених engineering tasks;
- структура даних або codebase conventions;
- інфраструктурні або UI implementation notes.

Не варто оновлювати `chemda.md` як місце, де затверджується новий продуктний scope.
