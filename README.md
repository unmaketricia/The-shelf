# the-shelf

Migrated from the latest ChatGPT Site source. Next.js on Vercel with server-side Supabase PostgreSQL storage.

## Deploy

1. Import this repository into Vercel as a Next.js project.
2. Set `DATABASE_URL` in Vercel's server-side environment variables to the Supabase transaction pooler URI (including the database password). Never use a `NEXT_PUBLIC_` prefix.
3. Deploy. The database uses the `the_shelf` schema; migration SQL is in `database/schema.sql`. Existing saved data is transferred separately and is never committed to GitHub.

## Local development

Copy `.env.example` to `.env.local`, configure `DATABASE_URL`, then run `npm ci` and `npm run dev`.

## Access

Public viewing and editing, with no login, as requested.

## Validation

`npm run typecheck`, `npm run test:db`, and `npm run build`.
