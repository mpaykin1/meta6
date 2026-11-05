# World Server Free Cloud

Static hub + Cloudflare Worker + the existing Supabase project. The static site contains no secret keys. The Worker uses a Supabase **publishable** key stored as a Worker secret and forwards the signed-in user's bearer token so the existing `free_cloud_world_events` RLS policies remain authoritative.

## Current scope

- Links to the existing land (`../observer-world-en-v7/`) and underwater (`../underwater-world/`) worlds.
- Email magic-link login through the Worker; access/refresh tokens are stored in this browser's local storage.
- `GET /events` and `POST /events` verify the access token with Supabase Auth and rely on RLS for row ownership.
- Event types are allow-listed (`world_visit`, `world_transition`); worlds are `hub`, `land`, `underwater`; payloads are limited to 4 KiB.
- Without a configured Worker, the app clearly reports that cloud persistence is unavailable. No fake cloud success is shown.

## Local tests

Requires Node.js 22+ (CI uses Node.js 24), no paid service:

```sh
cd free-cloud
npm test
```

The Worker tests stab upstream calls; they verify request validation, origin checks, auth, owner-derived `user_id`, history scoping, refresh, and error handling. They do **not** prove a live deployment.

## Cloudflare Worker setup (owner action)

1. Create a Worker in the existing Cloudflare account and deploy this directory's `worker.js` with `wrangler.toml` (or run `npx wrangler deploy` after installing Wrangler in your own environment).
2. Configure Worker variables/secrets:
   - `SUPABASE_URL` = existing project's HTTPS project URL.
   - `SUPABASE_PUBLISHABLE_KEY` = the project's publishable key (never a service-role/secret key).
   - `ALLOWED_ORIGIN` = `https://mpaykin1.github.io`.
   - `APP_PATH` = `/meta6/free-cloud/`.
3. In Supabase Auth URL configuration, add the exact redirect `https://mpaykin1.github.io/meta6/free-cloud/` to allowed redirect URLs. Do not broaden the allow-list to `*`.
4. Open `https://mpaykin1.github.io/meta6/free-cloud/?api=https://YOUR-WORKER.workers.dev`. The browser remembers the Worker origin locally so a magic-link return in the same browser can restore the session.
5. Check `GET /health` returns `mode: authenticated-supabase`, request a magic link, save an event, reload, and verify the history is restored. Repeat with a second account and confirm the accounts do not see each other's events.

Do not commit keys, tokens, `.dev.vars`, or real account data. Do not use a service-role key in the Worker; user-scoped JWT + RLS is the security boundary. The current CI has no deployment secrets and does not deploy anything. Oracle Always Free is optional and intentionally not required for this slice.

## Release evidence still required

A successful unit suite is not a deployment. Before sharing a permanent test URL, verify the deployed `workers.dev` URL, GitHub Pages page, real magic-link sign-in, persistence after reload, two-account isolation, and desktop/mobile browser E2E. Record measured user-visible quality; do not infer a score from code or unit tests.
