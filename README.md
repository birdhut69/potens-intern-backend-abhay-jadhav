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

