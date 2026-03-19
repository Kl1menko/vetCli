# UltraVet Implementation Gap Analysis

## 1. Метод

Порівняння виконане між:

- вимогами з [chemda.md](/Users/maxberry/Dev/vet/chemda.md)
- фактичним кодом у `src/app`, `src/server`, `src/lib`, `prisma`

Статуси:

- `Implemented` — фіча реально працює на рівні даних і UI
- `Partial` — є маршрут або частина логіки, але use case не закритий повністю
- `Missing` — у коді не знайдено реалізації

## 2. Загальний висновок

Проєкт не є порожнім каркасом. Базова архітектура, auth, основні доменні сутності, booking flow, кабінет клієнта, частина адмінки і doctor flow уже реалізовані. Найбільший розрив зараз не в core-domain, а в добудові окремих адмінських розділів, формалізації permission matrix і доведенні деяких сценаріїв до production polish.

## 3. Публічний сайт

### Головна, branding, metadata

- `Implemented`

Підстава:

- кастомна home page і hero
- metadata layer
- OG/Twitter image routes
- локальний шрифт і favicon assets

### Публічні сторінки `/about`, `/services`, `/doctors`, `/prices`, `/reviews`, `/faq`, `/contacts`

- `Implemented`

Підстава:

- маршрути існують;
- публічна навігація зібрана;
- page-level metadata використовується.

### Booking entry point

- `Implemented`

Підстава:

- [src/app/(public)/booking/page.tsx](/Users/maxberry/Dev/vet/src/app/(public)/booking/page.tsx)
- route handler [src/app/api/booking/slots/route.ts](/Users/maxberry/Dev/vet/src/app/api/booking/slots/route.ts)
- availability service [src/server/services/appointments/availability.ts](/Users/maxberry/Dev/vet/src/server/services/appointments/availability.ts)

Обмеження:

- booking із публічної сторінки фактично вимагає авторизованого `CLIENT`;
- гостьовий lead capture або public pre-booking відсутні.

## 4. Auth і ролі

### Login / register / logout

- `Implemented`

Підстава:

- [src/server/actions/auth.ts](/Users/maxberry/Dev/vet/src/server/actions/auth.ts)
- [src/auth.ts](/Users/maxberry/Dev/vet/src/auth.ts)

### Route protection

- `Implemented`

Підстава:

- [src/proxy.ts](/Users/maxberry/Dev/vet/src/proxy.ts)
- [src/lib/auth/access.ts](/Users/maxberry/Dev/vet/src/lib/auth/access.ts)

### Permission matrix по ресурсах і діях

- `Partial`

Підстава:

- є role-based guards;
- є object-level filters у critical queries;
- немає централізованої таблиці типу `role -> resource -> action`.

### Superadmin-specific behavior

- `Partial`

Підстава:

- роль є в schema і guards;
- окремих screens/flows для керування ролями й глобальними параметрами фактично немає.

## 5. Кабінет клієнта

### Dashboard

- `Implemented`

Підстава:

- [src/app/cabinet/page.tsx](/Users/maxberry/Dev/vet/src/app/cabinet/page.tsx)

### Профіль клієнта

- `Partial`

Підстава:

- сторінка читання є в [src/app/cabinet/profile/page.tsx](/Users/maxberry/Dev/vet/src/app/cabinet/profile/page.tsx)
- редагування профілю клієнта в кабінеті не реалізоване.

### CRUD тварин

- `Implemented`

Підстава:

- [src/server/actions/cabinet.ts](/Users/maxberry/Dev/vet/src/server/actions/cabinet.ts)
- [src/app/cabinet/pets/page.tsx](/Users/maxberry/Dev/vet/src/app/cabinet/pets/page.tsx)
- [src/app/cabinet/pets/[id]/page.tsx](/Users/maxberry/Dev/vet/src/app/cabinet/pets/[id]/page.tsx)

### Історія візитів, призначення, аналізи, рахунки

- `Implemented`

Підстава:

- маршрути існують;
- дані підтягуються з Prisma;
- доступ обмежений власником.

### Вакцинації в кабінеті

- `Implemented`

Підстава:

- вкладка в картці тварини є;
- `Vaccination` присутня в schema і читається.

### Скасування і перенесення записів

- `Implemented`

Підстава:

- [src/server/actions/appointments.ts](/Users/maxberry/Dev/vet/src/server/actions/appointments.ts)

## 6. Booking domain

### Вибір тварини, послуги, лікаря, режиму `ANY`, дати, слота

- `Implemented`

### Перевірка графіка, блоків, тривалості, колізій

- `Implemented`

### Повторна серверна валідація перед створенням

- `Implemented`

### Джерело запису `PUBLIC_SITE`

- `Partial`

Підстава:

- enum існує;
- з поточного коду клієнтський booking записує `CLIENT_CABINET`, а не `PUBLIC_SITE`.

## 7. Адмін-панель

### Дашборд

- `Implemented`

Підстава:

- [src/app/admin/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/page.tsx)

### Календар і day-grid

- `Implemented`

Підстава:

- [src/app/admin/calendar/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/calendar/page.tsx)
- admin actions покривають create/update/status/block flows

### CRUD клієнтів

- `Implemented`

Підстава:

- [src/app/admin/clients/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/clients/page.tsx)
- `create/update/deleteClientAction`

### CRUD тварин

- `Implemented`

### CRUD лікарів

- `Implemented`

### CRUD послуг

- `Implemented`

### CRUD записів

- `Implemented`

Підстава:

- створення, оновлення, delete, status update, reschedule логіка є.

### Блокування часу

- `Implemented`

### Фільтрація по лікарю, даті, послузі

- `Implemented`

### Адмінський перегляд візитів

- `Partial`

Підстава:

- маршрут є;
- [src/app/admin/visits/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/visits/page.tsx) зараз лише description card без фактичного списку/фільтрації.

### Адмінська робота з рахунками

- `Partial`

Підстава:

- маршрут є;
- [src/app/admin/invoices/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/invoices/page.tsx) поки без реального CRUD/UI.

### Адмінські глобальні налаштування

- `Partial`

Підстава:

- [src/app/admin/settings/page.tsx](/Users/maxberry/Dev/vet/src/app/admin/settings/page.tsx) поки фактично заглушка.

## 8. Панель лікаря

### Dashboard

- `Implemented`

### Власний розклад

- `Implemented`

Підстава:

- [src/app/doctor/schedule/page.tsx](/Users/maxberry/Dev/vet/src/app/doctor/schedule/page.tsx)

### Список власних записів

- `Implemented`

### Пацієнтська картка лише для прив’язаних пацієнтів

- `Implemented`

Підстава:

- [src/app/doctor/patients/[id]/page.tsx](/Users/maxberry/Dev/vet/src/app/doctor/patients/[id]/page.tsx)
- доступ іде через `appointments.some` або `visits.some`

### Створення та ведення візиту

- `Implemented`

Підстава:

- `createVisitFromAppointmentAction`
- `updateVisitDetailsAction`

### Діагнози, призначення, аналізи, вкладення, рахунок

- `Implemented`

Підстава:

- відповідні actions існують;
- upload flow інтегрований.

## 9. База даних і schema

### Основні сутності з brief

- `Implemented`

Підстава:

- у schema є всі головні моделі, очікувані в `chemda.md`.

### Seed-дані для демо-сценаріїв

- `Implemented`

Підстава:

- [prisma/seed.ts](/Users/maxberry/Dev/vet/prisma/seed.ts)

### Формалізовані статусні переходи

- `Partial`

Підстава:

- enum-и існують;
- transition rules не зведені в окремий domain layer.

## 10. UI/UX вимоги

### Tailwind + shadcn/ui

- `Implemented`

### Сучасний публічний дизайн

- `Implemented`

### Консистентний polish усіх публічних секцій

- `Partial`

Підстава:

- home/hero вже перероблені;
- у `chemda.md` сам проєкт фіксує, що частині секцій ще потрібен polishing.

### Sidebar/header/tables/forms/dialogs/cards/tabs/badges

- `Implemented`

### Додати реальні фото в mosaic section

- `Missing`

Підстава:

- на home page досі є плейсхолдери `Фото сервісу`.

## 11. Головні розриви, які реально залишились

### 1. Адмінські `visits`, `invoices`, `settings`

Це найбільш очевидний незакритий шматок. Маршрути існують, але як робочі модулі ще не завершені.

### 2. Редагування профілю клієнта

Зараз це read-only screen.

### 3. Єдиний permission matrix

Об’єктні перевірки є, але централізованої ACL моделі ще нема.

### 4. Формалізація transition rules

Потрібно винести transition logic для `Appointment` і `Visit` у окремий domain layer.

### 5. Production hardening

Ще залишаються:

- фінальні контакти й контент;
- production `AUTH_URL`;
- фінальна metadata/domain перевірка;
- візуальне добивання публічної частини.

## 12. Підсумок

Фактичний стан репозиторію кращий, ніж може здатися з `chemda.md`: core MVP уже зібраний. Документ більше не описує "майбутній задум", а змішаний стан між brief, changelog і roadmap. Найпрактичніший наступний крок після цього аудиту: добудувати 3 незавершені адмінські модулі й вирівняти документацію під реальний стан коду.
