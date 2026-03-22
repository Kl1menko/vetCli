# Vercel staging checklist

## Current status

- `npm run build` passes locally.
- Prisma schema validates.
- The project is suitable for a first Vercel preview deployment after environment setup.
- The project can now use S3-compatible object storage for protected medical uploads.

## Required environment variables on Vercel

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `UPLOAD_DRIVER`

If you use object storage:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`

## Recommended environment split

### Preview

- Use a dedicated staging Postgres database.
- Set `AUTH_URL` to the preview-safe canonical URL you want metadata and auth redirects to use.
- Keep production secrets out of Preview.

### Production

- Use a separate production Postgres database.
- Set `AUTH_URL` to the final production domain.

## Verified blockers and caveats

### 1. Choose the right upload driver per environment

The current local adapter writes files to the local filesystem:

- `src/lib/storage/local.ts`
- `src/app/uploads/[...slug]/route.ts`

That is acceptable for local development but not for durable multi-user storage on Vercel.

The S3-compatible adapter is implemented in:

- `src/lib/storage/s3.ts`

Result:

- Public images under `public/uploads/...` are fine.
- Protected runtime uploads can be stored in S3/R2 while still being downloaded through `/uploads/...` with app-level ACL.

### 2. Prisma migrations must be applied outside `prisma migrate dev`

Production-like deploys should use:

```bash
npm run prisma:migrate:deploy
```

Do not use `prisma migrate dev` on Vercel.

### 3. Seed data is local-only bootstrap, not a deployment step

Seed accounts exist in:

- `prisma/seed.ts`

Recommended staging flow:

1. Deploy schema migrations.
2. Run `npm run db:seed` once against the staging database.
3. Share only the intended test credentials.

### 4. Auth and metadata depend on `AUTH_URL`

This project uses `AUTH_URL` as the base URL for metadata and auth redirects:

- `src/lib/metadata.ts`

If `AUTH_URL` points to localhost or the wrong deployment URL, canonical tags, OG URLs, and some auth redirects will be wrong.

## First staging deploy flow

1. Create a Vercel project from the repo.
2. Connect a hosted Postgres database.
3. Add Preview environment variables.
4. Run `npm run prisma:migrate:deploy` against the staging database.
5. Run `npm run db:seed` once for staging.
6. Deploy a preview branch.
7. Protect the preview deployment.
8. Test roles: `ADMIN`, `DOCTOR`, `CLIENT`.

## What is safe to test right now

- Public pages
- Authentication
- Booking flow
- Admin settings
- Schedule management
- Visits, invoices, and records that do not depend on new file uploads

## Recommended storage setup for Vercel

- `UPLOAD_DRIVER=s3`
- Cloudflare R2 or any S3-compatible bucket
- private bucket, not public
- app keeps ACL checks in `src/app/uploads/[...slug]/route.ts`
