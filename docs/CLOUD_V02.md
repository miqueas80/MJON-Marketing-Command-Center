# MJON Marketing Command Center v0.2 — Cloudflare backend (opt-in)

## State

This is an isolated, fail-closed Cloudflare Workers + D1 implementation of **private backup and manual restore**. GitHub Pages remains the working **local-only** application; there is no customer data in the repository and WhatsApp stays disconnected.

Cloud backup is **not** yet a server-authoritative multiuser CRM, a message delivery service, or automatic continuous synchronization. No external AI bills or Lovable dependency.

## Security model

- Protect the Worker with **Cloudflare Access** (Cloudflare dashboard) before activating.
- The Worker requires `ctx.access`, an exact Access application audience `ACCESS_AUD` and the allowlisted `ALLOWED_EMAIL` on every request, even for static files.
- D1 snapshots are keyed by signed-in owner email; no caller-supplied owner identifier.
- Cross-origin browser requests rejected. Host the UI on this Worker (same origin) to avoid cross-site Access session/cookie problems.
- Optimistic concurrency with `If-Match: "revision"`: 409 prevents overwriting a newer cloud backup.
- 256 KiB request cap and 3,000 records per snapshot. Audit events are best-effort.
- Cloud snapshots contain JSON supplied by the browser, including historical approval records. **They are backups, not proof of human authorization for real deliveries**.
- No automatic real deliveries. Real customer workflows require server-side approvals, role control, privacy review, encrypted device handling, security tests and formal data retention policies.

## Deployment checklist (manual; do not deploy before Access is configured)

1. Create a D1 database named `mjon-marketing-private` in your own Cloudflare account.
2. Copy `backend/wrangler.example.jsonc` to `backend/wrangler.jsonc`; replace `REPLACE_WITH_D1_DATABASE_ID` with the real database ID (non-secret). Install Wrangler 4.x locally.
3. `npm run build` from project root.
4. From `backend/`, run `npx wrangler d1 migrations apply mjon-marketing-private --remote`. Verify the migration succeeded.
5. Configure **Cloudflare Access** to protect the entire Worker hostname. Restrict access to your account. Check the application audience and identity returned by Access.
6. Configure Worker runtime variables `ACCESS_AUD` and `ALLOWED_EMAIL` via Cloudflare dashboard (or secrets); never commit personal emails or credentials into Git.
7. Only after 5–6 are confirmed: `cd backend && npx wrangler deploy`. Recheck Access on asset URLs and API URLs, including unauthenticated denials.
8. Open the private Worker URL and test `/api/v1/status`, manual cloud backup, reload, manual restore and intentional conflict (409) using test data.
9. Keep the existing GitHub Pages workflow for the public local-only demo. **Do not enable automatic production deployment to an unprotected Worker.**

## API contract

- `GET /api/v1/status` — authenticated readiness.
- `GET /api/v1/snapshot` — `{ok,revision,snapshot}`.
- `PUT /api/v1/snapshot` — validated backup JSON; `If-Match: "0"` for first write, then latest revision from GET. A concurrent write returns 409.
- No third-party webhooks, outgoing messages, file uploads or AI runtime.

Next release: normalized relational business tables + server-authoritative approval and deliveries, with a supported login UX, before connecting WhatsApp Cloud API.
