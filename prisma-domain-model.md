# UltraVet Prisma / Domain Model

## 1. Джерело істини

Фактична реалізація вже існує в [prisma/schema.prisma](/Users/maxberry/Dev/vet/prisma/schema.prisma). Цей документ нормалізує її як domain model, описує зв’язки та інваріанти і фіксує рекомендовані уточнення.

Правило пріоритету:

- `product-spec.md` є джерелом істини для product scope, ACL, lifecycle rules і меж MVP;
- `prisma-domain-model.md` синхронізує ці правила з доменною моделлю і schema;
- якщо schema тимчасово відстає від spec, цей документ фіксує цільову доменну модель, а не випадкову поведінку поточної реалізації.

## 2. Bounded contexts

### Identity & Access

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Authenticator`

### Client CRM

- `OwnerProfile`
- `Pet`
- `Notification`

### Clinic Directory

- `Doctor`
- `Service`
- `DoctorSchedule`
- `ScheduleBlock`

### Booking

- `Appointment`

### Medical Record

- `Visit`
- `Diagnosis`
- `Prescription`
- `LabResult`
- `Vaccination`
- `FileAsset`
- `Invoice`

## 3. Агрегати і зв’язки

### User aggregate

`User` є коренем для auth і ролі.

Має:

- zero-or-one `OwnerProfile`
- zero-or-one `Doctor`
- many `Notification`
- many created `Appointment`
- many uploaded `FileAsset`

Інваріанти:

- `email` унікальний, якщо заданий;
- `phone` унікальний, якщо заданий;
- persisted roles: `CLIENT | ADMIN | DOCTOR | SUPERADMIN`;
- прикладна роль `guest` не зберігається в БД.
- `UserStatus.INVITED` може існувати технічно в schema, але invite/reset flow не є обов’язковою частиною MVP product scope.

### Owner aggregate

`OwnerProfile` є доменною сутністю власника тварин, а не auth-користувача.

Має:

- exactly-one `User`
- many `Pet`
- many `Appointment`

Інваріанти:

- один `User` -> один `OwnerProfile`;
- клієнт бачить лише записи і тварин свого `OwnerProfile`.

### Doctor aggregate

`Doctor` є професійним профілем користувача-лікаря.

Має:

- exactly-one `User`
- many `DoctorSchedule`
- many `ScheduleBlock`
- many `Appointment`
- many `Visit`

Інваріанти:

- один `User` -> один `Doctor`;
- лікар повинен мати роль `DOCTOR` або `SUPERADMIN` на рівні прикладного доступу;
- пацієнти лікаря виводяться лише через його `Appointment` або `Visit`.

### Pet aggregate

`Pet` належить одному власнику.

Має:

- many `Appointment`
- many `Visit`
- many `Vaccination`

Інваріанти:

- тварина належить одному `OwnerProfile`;
- клієнт не може редагувати медичні записи тварини;
- `microchipNumber` унікальний, якщо заданий.
- клієнт має read-only доступ до `Vaccination` своєї тварини;
- `Vaccination` у MVP не є окремим admin CRUD-модулем, а частиною медичної історії пацієнта.

### Booking aggregate

`Appointment` є коренем запису.

Пов’язаний із:

- `OwnerProfile`
- `Pet`
- `Doctor`
- `Service`
- optional `createdByUser`
- optional one-to-one `Visit`

Інваріанти:

- слот має бути валідним відносно графіка, блоків і існуючих записів;
- запис не може створюватись у минулому;
- один `Appointment` має не більше одного `Visit`.
- booking-обчислення повинні бути timezone-aware; дефолтна timezone клініки для MVP: `Europe/Kyiv`;
- для online booking діє мінімальний lead time: `2 години` до початку слота;
- один `Appointment` відповідає одній послузі і одному часовому слоту.

### Medical aggregate

`Visit` є коренем медичного візиту.

Має:

- exactly-one `Appointment`
- one `Pet`
- one `Doctor`
- many `Diagnosis`
- many `Prescription`
- many `LabResult`
- many `FileAsset`
- optional one `Invoice`

Інваріанти:

- `Visit` не існує без `Appointment`;
- `Visit.petId` і `Appointment.petId` мають логічно збігатися;
- `Visit.doctorId` і `Appointment.doctorId` мають логічно збігатися;
- лише лікар клініки має write-access до медичних даних.
- завершення `Visit` є єдиною нормативною підставою переведення пов’язаного `Appointment` у `COMPLETED`.

### File access aggregate notes

`FileAsset`, `LabResult` attachment і invoice files не є самостійним бізнес-модулем.

Інваріанти:

- файл повинен бути прив’язаний до конкретної доменної сутності;
- клієнт має лише read-only доступ до файлів своїх тварин і рахунків;
- адміністратор має read-only доступ до медичних файлів;
- клієнтські uploads не входять у MVP;
- допустимі формати для MVP: `PDF | JPG | PNG | WEBP`;
- максимальний розмір одного файлу в MVP: `10 MB`.

## 4. Enums

### UserRole

- `CLIENT`
- `ADMIN`
- `DOCTOR`
- `SUPERADMIN`

### UserStatus

- `ACTIVE`
- `INVITED`
- `DISABLED`

### PetSex

- `MALE`
- `FEMALE`
- `UNKNOWN`

### ScheduleBlockType

- `VACATION`
- `BREAK`
- `MANUAL_BLOCK`
- `EMERGENCY_RESERVE`

### AppointmentStatus

- `NEW`
- `PENDING`
- `CONFIRMED`
- `RESCHEDULED`
- `CANCELLED_BY_CLIENT`
- `CANCELLED_BY_ADMIN`
- `COMPLETED`
- `NO_SHOW`

### AppointmentSource

- `PUBLIC_SITE`
- `CLIENT_CABINET`
- `ADMIN_MANUAL`
- `PHONE_CALL`

### VisitStatus

- `DRAFT`
- `IN_PROGRESS`
- `COMPLETED`

### DiagnosisStatus

- `ACTIVE`
- `RESOLVED`
- `CHRONIC`

### InvoicePaymentStatus

- `UNPAID`
- `PARTIALLY_PAID`
- `PAID`
- `CANCELLED`

### NotificationType

- `GENERAL`
- `APPOINTMENT_REMINDER`
- `LAB_RESULT_READY`
- `INVOICE_ISSUED`

### FileKind

- `LAB_RESULT`
- `DOCUMENT`
- `VISIT_ATTACHMENT`
- `INVOICE`
- `MEDICAL_FILE`

## 5. Поточна Prisma модель у нормалізованому вигляді

### `User`

Призначення:
- auth identity, роль, базові контактні дані.

Ключові поля:
- `id`
- `name`
- `email`
- `phone`
- `passwordHash`
- `role`
- `status`
- `emailVerified`

### `OwnerProfile`

Призначення:
- прикладний профіль власника тварин.

Ключові поля:
- `userId`
- `fullName`
- `phone`
- `email`
- `address`
- `notes`

### `Pet`

Призначення:
- пацієнт клініки.

Ключові поля:
- `ownerId`
- `name`
- `species`
- `breed`
- `sex`
- `birthDate`
- `weight`
- `microchipNumber`
- `allergies`
- `chronicConditions`

### `Doctor`

Призначення:
- професійний профіль лікаря.

Ключові поля:
- `userId`
- `fullName`
- `specialization`
- `bio`
- `photoUrl`
- `isActive`

### `Service`

Призначення:
- довідник клінічних послуг.

Ключові поля:
- `name`
- `slug`
- `description`
- `durationMinutes`
- `price`
- `category`
- `isActive`
- `isOnlineBookable`

### `DoctorSchedule`

Призначення:
- регулярний шаблон графіка по днях тижня.

Ключові поля:
- `doctorId`
- `weekday`
- `startTime`
- `endTime`
- `slotDurationMinutes`
- `breakStart`
- `breakEnd`
- `isActive`

### `ScheduleBlock`

Призначення:
- разове блокування часу.

Ключові поля:
- `doctorId`
- `date`
- `startTime`
- `endTime`
- `type`
- `reason`

### `Appointment`

Призначення:
- запис на прийом.

Ключові поля:
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

### `Visit`

Призначення:
- медичний факт прийому.

Ключові поля:
- `appointmentId`
- `petId`
- `doctorId`
- `summary`
- `anamnesis`
- `examination`
- `recommendations`
- `status`

### `Diagnosis`, `Prescription`, `LabResult`, `Vaccination`, `Invoice`, `FileAsset`

Призначення:
- деталізація медичного та фінансового контуру.

Уточнення для MVP:
- `Vaccination` ведеться лікарем у картці пацієнта;
- `Invoice` може створюватись лікарем у межах `Visit`, а адміністратор працює з фінансовим статусом і переглядом;
- `FileAsset` та пов’язані файли не створюються клієнтом напряму.

## 6. Статусні переходи

### Appointment lifecycle

Нормативна допустима модель, синхронізована з `product-spec.md`:

- `NEW -> PENDING`
- `PENDING -> CONFIRMED`
- `PENDING -> CANCELLED_BY_CLIENT`
- `PENDING -> CANCELLED_BY_ADMIN`
- `CONFIRMED -> RESCHEDULED`
- `CONFIRMED -> COMPLETED`
- `CONFIRMED -> NO_SHOW`
- `RESCHEDULED -> CONFIRMED`
- `RESCHEDULED -> CANCELLED_BY_CLIENT`
- `RESCHEDULED -> CANCELLED_BY_ADMIN`

Примітка:
- запис, створений клієнтом через online booking, за замовчуванням має стартувати як `PENDING`;
- запис, створений адміністратором вручну, може стартувати як `CONFIRMED`;
- `COMPLETED` не повинен виставлятись окремою довільною адмінською дією без завершення `Visit`;
- після `CANCELLED_BY_CLIENT`, `CANCELLED_BY_ADMIN`, `COMPLETED` або `NO_SHOW` запис є термінальним.

### Visit lifecycle

- `DRAFT -> IN_PROGRESS`
- `IN_PROGRESS -> COMPLETED`

Примітка:

- `Visit` створюється лікарем на основі конкретного `Appointment`;
- `Visit` не є самостійною сутністю “поза прийомом”.

## 7. ACL-наслідки для моделі

Це не замінює application-level ACL, але фіксує очікувані доменні обмеження.

- `Client` має write-access лише до власного `OwnerProfile`, власних `Pet` і власних `Appointment`.
- `Client` має read-only доступ до власних `Visit`, `Diagnosis`, `Prescription`, `LabResult`, `Vaccination`, `Invoice`, `FileAsset`.
- `Doctor` має write-access до `Visit`, `Diagnosis`, `Prescription`, `LabResult`, `Vaccination`, `Invoice`, `FileAsset` лише в межах своїх прийомів.
- `Admin` має full operational access до directory/booking сутностей, але read-only до медичного змісту `Visit`.
- `Superadmin` розширює `Admin`, але не скасовує доменні інваріанти медичного контуру.

## 8. Ключові індекси та обмеження

У schema вже є:

- `User.email @unique`
- `User.phone @unique`
- `OwnerProfile.userId @unique`
- `Doctor.userId @unique`
- `Service.slug @unique`
- `Pet.microchipNumber @unique`
- `Visit.appointmentId @unique`
- `Invoice.visitId @unique`
- індекси на `Appointment(date, doctorId)` та `Appointment(ownerId, date)`

## 9. Рекомендовані уточнення моделі

### 1. Формалізувати weekday

Замість `Int weekday` краще мати enum `Weekday`.

Причина:
- менше магічних чисел;
- менше помилок між JS `0-6` і бізнес-логікою `1-7`.

### 2. Розглянути `startAt/endAt`

Для `Appointment` і `ScheduleBlock` можна перейти від `date + time strings` до:

- `startAt DateTime`
- `endAt DateTime`

Причина:
- простіша логіка колізій;
- менше ручного перерахунку;
- краща сумісність із timezone-aware сценаріями.

### 3. Винести `Service.category` в enum або reference table

Причина:
- зараз це вільний рядок;
- важко гарантувати консистентність фільтрів і аналітики.

### 4. Додати audit/logging сутності після MVP

Кандидати:

- `AppointmentStatusHistory`
- `AuditLog`
- `NotificationDelivery`

### 5. Посилити інваріанти Visit

Бажано прикладно гарантувати:

- `Visit.petId === Appointment.petId`
- `Visit.doctorId === Appointment.doctorId`

Зараз це дотримується кодом, але не виражене окремим механізмом консистентності.

## 10. Цільова позиція

Поточна schema вже є життєздатною для MVP. Її не треба переписувати з нуля.

Правильна стратегія:

1. використати наявну schema як baseline;
2. тримати її синхронізованою з `product-spec.md` по lifecycle, ACL і межах MVP;
3. добудовувати відсутні use cases поверх цієї моделі;
4. only then робити structural migration типу `startAt/endAt`, якщо вона реально потрібна.
