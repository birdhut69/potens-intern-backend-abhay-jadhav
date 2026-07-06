# AI Use Log

This file records the AI tools used while building this project and a short note about what they were used for.

- ChatGPT (assistant): ~150 messages — used interactively to scaffold the project, design the API, implement cryptographic functions, write migrations, implement Express routes and middleware, draft tests, produce README content, and refine Docker compose and entrypoint scripts.
No other AI tools were used.

Recent edits assisted by the AI helper (summary):
- Added a lightweight benchmarking script (`scripts/benchmark.js`) to measure append throughput and verification time.
- Added a GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs migrations, tests, and a small verification run.
- Expanded `README.md` with TL;DR demo commands, an auditor-friendly `verify` example response, and instructions to reproduce benchmark results.

I reviewed and adjusted generated code before committing; the AI was used as an assistant and not an authoritative autopilot.
