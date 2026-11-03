-- Backups per Cloudflare Access identity. No real customer data or secrets seeded.
CREATE TABLE IF NOT EXISTS cloud_snapshots (
  owner_email TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision >= 1),
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sync_events (
  id TEXT PRIMARY KEY NOT NULL,
  owner_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('created','updated')),
  revision INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sync_events_owner ON sync_events(owner_email, created_at);
