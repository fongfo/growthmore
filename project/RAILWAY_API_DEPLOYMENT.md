# Growthmore API Railway Deployment

Status: Draft
Jira: BGM-18
Scope: Deploy `apps/api` for mobile app testing. Do not deploy a Web/H5 user client.

## What You Need To Create In Railway

Create one Railway project and one backend service:

- Project name: `growthmore`
- Service name: `growthmore-api`
- Source repository: `fongfo/growthmore`
- Branch: `development`
- Root directory: leave empty or `/`
- Builder: use the repository `Dockerfile`
- Public networking: generate a public domain for API testing
- Health check path: `/api/health`

This is enough for the current Demo MVP API. You do not need to create a database yet because the API still uses mock/shared demo data.

## Why Dockerfile

The repository is an npm workspace monorepo. Railway should build from the repo root so `apps/api` can compile against `packages/shared`.

The root `Dockerfile` installs workspaces, copies only the API and shared package source, builds both packages, and starts the API with:

```bash
npm run start -w @growthmore/api
```

The API already listens on `process.env.PORT`, which Railway injects at runtime.

## Environment Variables

Minimum variables:

- `NODE_ENV=production`
- `WEB_ORIGIN=*` for demo testing, or a stricter allowed origin if required by the bank/test environment.

No secrets are required for the current Demo MVP API because it uses mock data.

## Mobile App API URL

After Railway generates a public domain for `growthmore-api`, rebuild the APK with:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="https://<railway-api-domain>"
npx eas-cli build -p android --profile preview --non-interactive
```

The app falls back to built-in demo data when the API is unavailable, but a real Railway URL lets testers verify API connectivity instead of seeing the fallback state.

## Smoke Test

After deployment, verify:

```powershell
Invoke-RestMethod https://<railway-api-domain>/api/health
Invoke-RestMethod https://<railway-api-domain>/api/app/home
```

Expected `/api/health` fields:

- `ok: true`
- `service: growthmore-api`
- `tenant: growthmore-bank`