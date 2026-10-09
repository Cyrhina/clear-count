# Deploying to Coolify (zero downtime)

The app ships as one container built from the repo `Dockerfile` (`serversideup/php` fpm-nginx). Coolify rolling updates keep the old container serving until the new one passes its `HEALTHCHECK` (`/up`), then switch traffic and stop the old one.

On start, the new container waits for the database, runs `migrate --force`, caches config/routes/views/events and links storage. If a migration fails, the container exits and the old one keeps serving. After that, s6 starts php-fpm, nginx, the queue worker (`queue:work`) and the scheduler (`schedule:work`).

## Coolify application settings

- Build pack: **Dockerfile**, base directory `/`, Dockerfile location `/Dockerfile`.
- Ports Exposes: `8080`.
- Ports Mappings: **leave empty**. A published host port disables rolling updates.
- Container name: keep the default. A custom or "consistent" name disables rolling updates.
- Health check: comes from the Dockerfile; the dashboard setting is ignored.
- Advanced > Operations > Stop Grace Period: `60` seconds, so in-flight requests and the current queue job can finish.
- Pre-deployment / post-deployment commands: none. Pre-deployment runs in the *old* container and post-deployment runs after traffic has switched, so migrations run in the new container's entrypoint instead.
- Database: a Coolify-managed PostgreSQL resource in the same project/environment.

## Environment variables

Runtime:

| Key | Value |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | generate once (`php artisan key:generate --show`); rotating it logs everyone out |
| `APP_URL` | `https://<your-domain>` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | from the Coolify Postgres internal URL |
| `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` | `database` |
| `SESSION_SECURE_COOKIE` | `true` |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `info` |

Build-time: `VITE_APP_NAME` only (it is baked into the JS bundle). Do not mark secrets as build variables.

## First deploy only

Run in the Coolify terminal of the app container:

1. `php artisan db:seed --class=RoleSeeder --force` (idempotent).
2. Create the super admin with `php artisan tinker` and a strong password.

Never run `UserSeeder`, `DemoSeeder` or the full `db:seed` in production, and never set `AUTORUN_LARAVEL_MIGRATION_SEED`. They create demo accounts with a shared default password.

Re-run `RoleSeeder` whenever `app/Support/Capabilities.php` changes.

## Rules for every deploy

- **Migrations must be backward compatible.** For a short time the old code runs against the new schema. Ship additive changes (new tables, nullable or defaulted columns) with the code. Drop or rename columns in a later deploy, once no deployed code uses them.
- **Scheduled tasks** must use `->onOneServer()->withoutOverlapping()`. Old and new containers both run a scheduler for a few seconds.
- **New job classes**: an old worker may pick up a job dispatched by new code during the overlap and fail it. Jobs retry (`--tries=3`), but keep this in mind for critical jobs.
- Assets: during the overlap a page from the old container can request an old hashed asset from the new one and get a 404. Inertia's asset-version check reloads stale clients on their next navigation.

## Checking a deploy

While a redeploy runs:

```bash
while true; do curl -s -o /dev/null -w "%{http_code}\n" https://<your-domain>/up; sleep 0.5; done
```

Expect only `200`. The Coolify deployment log must not say that rolling updates are disabled.
