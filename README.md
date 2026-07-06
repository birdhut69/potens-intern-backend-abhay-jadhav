# Potens Backend Q1 — Tamper-Evident Append-Only Log

This repository implements a small, auditable append-only log service used for the Potens internship take-home.

What is here now (Stage 1 & 2):
- Project scaffold (Node + Express)
- Docker Compose to bring up Postgres + app
- Knex configuration and a migration that creates the `logs` table

Quick start (development):

1. Copy `.env.example` to `.env` and fill values.
2. Bring up services:

```bash
docker compose up --build
```

3. Run migrations (inside the app container or locally):

```bash
# locally, after npm install
npm run migrate
```

Why this README is short:
I keep documentation focused and actionable; the full architecture rationale and verification notes will appear in the final README at Stage 7.

---

## Quick Reference

- App port: `3000` (configurable via `PORT`)
- Postgres: `postgres:5432` (configured via `.env`)

## Available Commands

Install dependencies (local dev):

```bash
npm install
```

Bring up Postgres + app via Docker Compose:

```bash
docker compose up --build
```

Run DB migrations (after services are available):

```bash
npm run migrate
```

Run the verification CLI (requires DB + migrations):

```bash
npm run verify-chain
```

Run tests:

```bash
npm test
```

## API Endpoints

- `POST /logs` — Append a log entry. Body: `{ actor, action, payload }`. Requires header `X-API-Key`.
- `GET /logs/:id` — Retrieve a log entry by ID and an immediate verification result for that entry.
- `GET /logs?action=verify` — Run a full linear verification across the chain. Returns `{ pass: true }` or `{ pass: false, firstBrokenId }`.
- `GET /logs` — Export entries; supports query params `actor`, `start`, `end` (ISO timestamps).

All endpoints return JSON and use structured logging. See `src/routes/logs.js` for details.

## Architectural Decisions (why)

- Database: PostgreSQL (production-grade, JSONB, and strong transactional semantics). A `docker-compose.yml` is included to boot Postgres and the app together.

- Concurrency & Race Conditions: To guarantee a single linear chain we serialize concurrent append operations using an explicit SQL lock inside a transaction: `LOCK TABLE logs IN EXCLUSIVE MODE`. This ensures the server reads a stable `prev_hash` and appends without forks. In high-throughput production, a single-writer pattern (leader election, queue, or advisory locks) or a separate append service would be preferable to avoid global table locking.

- Cryptographic Determinism: Chain hashes are computed deterministically using SHA-256 over a canonical string that includes the application-side ISO `timestamp`, `actor`, `action`, `payload` (stable-stringified using `fast-json-stable-stringify`), and `prev_hash`. Canonicalization prevents spurious verification failures due to JSON key ordering.

- Timestamp Policy: The application sets the `timestamp` used for hashing immediately before insertion to ensure the value included in the hash matches the persisted value.

- Verification: `verifyChain()` performs an ordered scan (O(N)) and returns the first broken entry, if any. This is simple and auditable for the assignment; for large logs a Merkle-tree or batched proofs would reduce verification cost.

- Structured Logging: All request and operational logs use `pino` / `pino-http` for structured, machine-readable logs. Important cryptographic checkpoints and verification failures are logged at `warn` or `error` level.

- Error Handling: Cryptographic and verification errors are surfaced with explicit messages. Missing API key or invalid key returns 401; misconfiguration returns 500 with a clear message.

## Security

- Simple API key is used (`X-API-Key`) to protect write operations. This is sufficient for the take-home but should be replaced with stronger auth (mTLS, OAuth2, signed JWTs) in production.

## Known Limitations & Future Work

- Current full verification is O(N). For very large logs, add Merkle-tree batching to allow fast proofs-of-integrity.
- Table-level exclusive locking serializes all writers, which can be a bottleneck. A scalable approach would be a single append leader or an append queue with strict ordering.
- No role-based access control or audit of who read logs — only append tracking is available.
- No persistence of archived/verifiable snapshots. Production systems often snapshot and export signed checkpoints.

## What is intentionally unfinished

- No external admin UI (not required for the brief).
- No webhook/subscription model for new matching entries (stretch goal in the brief).

## File map (important files)

- `src/cryptoEngine.js` — deterministic hash builder and SHA-256 wrapper.
- `src/services/logService.js` — append + verify + export logic. Uses explicit `LOCK TABLE` inside a transaction.
- `src/routes/logs.js` — Express routes for the API.
- `knexfile.js` & `migrations/` — DB configuration and schema.
- `docker-compose.yml` — boots Postgres + app for local testing.

## How I would operate this in production

1. Replace the simple API key with mTLS or OAuth + RBAC.
2. Add automated snapshotting and Merkle-tree batch proofs.
3. Replace table-level locking with a single-writer service (or logical partitioning).
4. Add monitoring dashboards for verification failures and unusual write rates.

## AI Use Log

This project used AI-assisted development. In the interest of honesty, below is what I used:

- ChatGPT (assistant): ~150 messages — scaffolding the project, writing and refactoring code (Express routes, Knex migrations, crypto engine), drafting tests, and compiling documentation.

No other AI tools were used.

---

If you want a shorter README or additional setup notes (e.g., sample `.env` values for Docker Compose), tell me which parts to simplify and I'll update it.


