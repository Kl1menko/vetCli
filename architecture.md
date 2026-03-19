# UltraVet Architecture

## 1. Архітектурний стиль

Проєкт побудований як `Next.js App Router` застосунок із чітким поділом на:

- route/UI layer у `src/app`;
- shared components у `src/components`;
- infrastructure/helpers у `src/lib`;
- domain-oriented server actions і services у `src/server`;
- persistence layer через `Prisma` у `prisma/schema.prisma`.

Поточна архітектура ближча до pragmatic modular monolith, ніж до жорсткої clean architecture. Це нормально для MVP, якщо зберігати дисципліну по межах модулів.

## 2. Поточний стек

- `Next.js 16.1.7`
- `React 19.2.3`
- `TypeScript`
- `Tailwind CSS 4`
- `shadcn/ui`
- `Prisma 6`
- `PostgreSQL`
- `Auth.js / next-auth@5 beta`
- `zod`

## 3. Директорії і відповідальність

### `src/app`

Route layer.

- `(public)` для маркетингових сторінок;
- `(auth)` для логіну і реєстрації;
- `cabinet`, `admin`, `doctor` для захищених зон;
- `api` для route handlers;
- `uploads` для проксі доступу до локальних файлів.

### `src/components`

UI і композиція.

- `ui` для базових building blocks;
- `shared` для повторно використовуваних domain-oriented blocks;
- `forms` для конкретних форм і form-driven widgets;
- `layout` і `sections` для оболонок і великих секцій.

### `src/lib`

Інфраструктурний шар.

- `auth` для доступу;
- `prisma` для singleton client;
- `permissions` для role helpers;
- `storage` для file abstraction;
- `validations` для `zod` schema;
- `metadata`, `utils`, `constants`.

### `src/server`

Серверна прикладна логіка.

- `actions` для user-triggered mutations;
- `services/appointments/availability.ts` для розрахунку слотів.

Поточний стан:
- окремого `repositories/` або `server/services/*` для всіх доменів поки немає;
- багато business logic усе ще сидить прямо в actions.

## 4. Route map

### Public

- `/`
- `/about`
- `/services`
- `/doctors`
- `/prices`
- `/reviews`
- `/faq`
- `/contacts`
- `/booking`

### Auth

- `/login`
- `/register`

### Client

- `/cabinet`
- `/cabinet/profile`
- `/cabinet/pets`
- `/cabinet/pets/[id]`
- `/cabinet/visits`
- `/cabinet/appointments`
- `/cabinet/prescriptions`
- `/cabinet/lab-results`
- `/cabinet/invoices`

### Admin

- `/admin`
- `/admin/calendar`
- `/admin/appointments`
- `/admin/clients`
- `/admin/pets`
- `/admin/doctors`
- `/admin/services`
- `/admin/visits`
- `/admin/invoices`
- `/admin/settings`

### Doctor

- `/doctor`
- `/doctor/schedule`
- `/doctor/appointments`
- `/doctor/patients/[id]`
- `/doctor/visits/[id]`

## 5. Auth та доступ

### Реалізація

- Auth layer зібраний у [src/auth.ts](/Users/maxberry/Dev/vet/src/auth.ts)
- route protection через [src/proxy.ts](/Users/maxberry/Dev/vet/src/proxy.ts)
- role checks через [src/lib/permissions.ts](/Users/maxberry/Dev/vet/src/lib/permissions.ts)
- page-level guards через [src/lib/auth/access.ts](/Users/maxberry/Dev/vet/src/lib/auth/access.ts)

### Поточна модель

- provider: `Credentials`
- session strategy: `jwt`
- route-level authorization у callback `authorized`
- додаткові server-side guards на сторінках і в actions

### Важливе уточнення

У brief зазначено `session-based auth`, але фактична реалізація зараз `JWT session strategy`, а не database-backed session. Це треба вважати джерелом правди доти, доки не буде окремого рішення про міграцію.

## 6. Дані та persistence

Джерело істини для даних:

- [prisma/schema.prisma](/Users/maxberry/Dev/vet/prisma/schema.prisma)

У системі вже описані:

- користувачі та auth entities;
- профілі власників і лікарів;
- тварини;
- послуги;
- графіки і блокування;
- записи;
- візити;
- діагнози;
- призначення;
- аналізи;
- вакцинації;
- рахунки;
- нотифікації;
- файлові вкладення.

## 7. Основні runtime-потоки

### Registration flow

1. Форма на `/register`
2. `registerOwnerAction`
3. Створення `User`
4. Створення `OwnerProfile`
5. Автовхід
6. Redirect у `/cabinet`

### Client booking flow

1. Клієнт відкриває `/booking`
2. `BookingForm` запитує доступні слоти через `/api/booking/slots`
3. Route handler викликає `availability service`
4. При submit викликається `createAppointmentAction`
5. Слот перевіряється повторно на сервері
6. Створюється `Appointment`

### Admin scheduling flow

1. Адмін працює з `/admin/calendar`
2. Створює/редагує запис через `admin` actions
3. Створює `ScheduleBlock`
4. Дані перевалідовуються щодо графіка, перерв, блоків і колізій

### Doctor visit flow

1. Лікар відкриває `/doctor/schedule` або `/doctor/appointments`
2. Створює `Visit` із `Appointment`
3. Оновлює деталі візиту
4. Додає пов’язані сутності
5. `Visit.status` і `Appointment.status` синхронізуються

## 8. Файлове сховище

Storage abstraction:

- [src/lib/storage/index.ts](/Users/maxberry/Dev/vet/src/lib/storage/index.ts)
- [src/lib/storage/local.ts](/Users/maxberry/Dev/vet/src/lib/storage/local.ts)
- [src/lib/storage/s3.ts](/Users/maxberry/Dev/vet/src/lib/storage/s3.ts)
- [src/lib/storage/upload.ts](/Users/maxberry/Dev/vet/src/lib/storage/upload.ts)

Поточний режим:

- робочий локальний upload flow;
- schema вже підтримує `FileAsset`;
- лікар може додавати `LabResult` і вкладення;
- клієнт читає ці файли в кабінеті.

## 9. SEO та брендинг

- metadata layer у [src/lib/metadata.ts](/Users/maxberry/Dev/vet/src/lib/metadata.ts)
- root metadata в [src/app/layout.tsx](/Users/maxberry/Dev/vet/src/app/layout.tsx)
- локальний шрифт через `next/font/local`
- OG/Twitter image routes реалізовані

## 10. Межі модулів, які варто зберігати

### Що нормально зараз

- Prisma викликається напряму на route/page рівні для read-heavy screens;
- mutation logic винесений у server actions;
- booking availability уже виділений окремим сервісом.

### Що варто робити далі

- винести read queries для великих сторінок у `server/services`;
- винести правила переходів статусів у окремі domain helpers;
- зібрати ACL у формальний permission matrix;
- уникати дублювання enum literals у формах, actions і UI.

## 11. Архітектурні ризики

### 1. Business logic розмита між page і actions

Наслідок:
- важче тестувати;
- важче перевикористовувати правила.

### 2. Час зберігається як `date + startTime/endTime`

Наслідок:
- більше ручної логіки;
- складніше працювати з timezone, перетинами і analytics.

### 3. Ролі перевіряються на рівні route і окремих action helpers, але нема формального ACL

Наслідок:
- при рості системи буде ризик розсинхрону між UI доступом і data access.

### 4. Частина адмінських модулів ще є тільки маршрутом або description card

Наслідок:
- route існує, але use case ще не закритий.

## 12. Рекомендований наступний технічний крок

1. Зафіксувати domain model і інваріанти.
2. Звести всі enum-и в єдине джерело істини.
3. Добудувати `admin visits`, `admin invoices`, `admin settings`.
4. Винести booking/scheduling rules у більш формальний domain service layer.
