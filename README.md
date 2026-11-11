# ZothOS-Lite v1.2 (`zothos-lite`)

[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg)](LICENSE)
[![Palette: Paper Ivory & Black Ink](https://img.shields.io/badge/Design-Paper_Ivory_%23F7F7F4_%2B_Black_Ink_%23000000-F7F7F4?labelColor=000000)](https://zothos-lite.nullai.tech)
[![AI Models: 56 Across 8 Providers](https://img.shields.io/badge/AI_Models-56_Models_%E2%80%A2_8_Providers-000000)](https://zothos-lite.nullai.tech)
[![Boot Mode: toram noswap](https://img.shields.io/badge/Boot_Mode-toram_noswap_(Zero_Disk_Trace)-000000)](https://github.com/1nc0gn30/zothos-lite)

`zothos-lite` (v1.2.0) is an amnesic monotone (`#F7F7F4` Paper Ivory + `#000000` Black Ink + 2px solid borders + ordered Bayer dither + Unicode `U+2800` Braille) Debian 13 Live operating system builder, CLI/TUI suite, Zoth-CoT MCP server, and browser desktop workstation running on loopback port `127.0.0.1:8145`.

- **Web Desktop & Live Spec**: [https://zothos-lite.nullai.tech](https://zothos-lite.nullai.tech)
- **Zoth Studio v2 Dossier**: [https://zoth.nullai.tech/tools/zothos-lite](https://zoth.nullai.tech/tools/zothos-lite)
- **Standalone Loopback Daemon**: `http://127.0.0.1:8145`
- **Support Development**: [https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)

---

## Overview

ZothOS-Lite v1.2 boots into volatile system RAM (`toram noswap`) with zero automatic mounts of host internal drives, runs local or cloud AI agent models through a RAM-backed credential enclave, and enforces non-bypassable server-side hardware thermal limits (`80C` throttle / `85C` pause).

Core v1.2 subsystems:
1. **56 Curated AI Models Across 8 Providers (`bin/zoth-lite-models`)**:
   - **Ollama Local** (10 models: `qwen2.5-coder:7b`, `qwen2.5-coder:32b`, `deepseek-r1:8b`, `deepseek-r1:14b`, `hermes3:8b`, `hermes3:70b`, `llama3.3:70b`, `llama3.2:3b`, `mistral-small:24b`, `phi4:14b`) targeting `127.0.0.1:11434` or a custom LAN host.
   - **Hermes / Nous Research** (5 models: `deepseek-flash`, `hermes-4-405b`, `hermes-3-llama-3.1-405b`, `hermes-3-llama-3.1-70b`, `hermes-3-llama-3.1-8b`).
   - **DeepSeek** (4 models: `deepseek-flash`, `deepseek-chat`, `deepseek-reasoner`, `deepseek-coder`).
   - **OpenRouter** (11 curated models + live catalog lookup), **OpenAI** (7 models), **Anthropic Claude** (6 models), **Google Gemini** (6 models), and **Groq LPU** (7 models).
   - **Volatile RAM Key Enclave**: `--set-key <provider>` writes `0600` key files exclusively to `/run/user/$UID/zoth-keys.env` or `/dev/shm`, clearing automatically on power-off unless exported via `--export-keys`.
2. **First-Boot Onboarding (`bin/zoth-lite-welcome`)**: 5-chapter terminal walkthrough covering model/LAN setup, `toram noswap` RAM discharge behavior, modular package installation, ZothNet P2P messaging, and intentional external storage sync.
3. **Intentional External Persistence (`bin/zoth-lite-storage`)**: Enumerates removable USB/NVMe partitions without touching internal host disks and writes `SHA256SUMS.manifest.json` integrity manifests for external drives or `rclone` remotes.
4. **Server-Side Hardware Thermal Guardrail (`server.js`)**: Reads Linux `hwmon` package sensors (`ZOTHOS_HWMON_ROOT`) and enforces `absoluteGuard: { throttleC: 80, pauseC: 85, enforced: "server-side" }` across `/api/status`, `/api/thermals`, `/api/system-status`, `/api/vaelor/dashboard`, and `POST /api/vaelor/mine` (even when `force: true` is supplied).
5. **Browser Workstation (`public/index.html` on `:8145`)**: Monotone desktop shell bundling the 56-model agent runner, ZothNet P2P cold-signer, frame-accurate video/audio spectrum inspector, uncompressed RAM image inspector, client-side CRC-32 PKZIP packager, and Zoth-CoT thought DAG explorer.

---

## Architecture

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| Loopback Daemon | `server.js` | Zero-npm-dependency Node.js HTTP server on `127.0.0.1:8145` enforcing `80C/85C` `hwmon` thermal guardrails |
| Web Desktop UI | `public/index.html`, `app.js`, `style.css` | Paper Ivory (`#F7F7F4`) & Black Ink (`#000000`) workstation UI |
| OS CLI Suite | `bin/zothos-lite`, `zoth-lite-*` | CLI tools for model routing, welcome onboarding, removable storage, modular packages, and Braille TUI |
| Zoth-CoT MCP Server | `bin/zoth_cot_mcp.py`, `bin/zoth-cot-mcp` | JSON-RPC 2.0 `stdio` MCP server for Chain-of-Thoughts working memory |
| Debian 13 Live Builder | `build/build-zothos-lite-iso.sh` | Stages SquashFS `toram noswap` chroot and bootable hybrid ISO (`--dry-run` supported) |
| QEMU RAM VM Harness | `vm/build-vm-image.sh`, `vm/launch-vm.sh` | Builds and boots an isolated volatile QEMU guest image |
| E2E Verification Suite | `bin/verify-zothos-lite.mjs` | Live contract, mock-`hwmon` bypass refusal, CDP 3-viewport `overflowPx === 0`, CLI, and attribution/theme audit |

---

## Quickstart

Clone the repository and start the standalone workstation daemon (Node.js 20+, Python 3.10+):

```bash
git clone https://github.com/1nc0gn30/zothos-lite.git
cd zothos-lite

# Launch the ZothOS-Lite v1.2 HTTP daemon & Web Desktop on http://127.0.0.1:8145
node server.js
```

Dry-run the Debian 13 Live ISO staging pipeline or inspect the CLI suite:

```bash
./build/build-zothos-lite-iso.sh --dry-run
./bin/zothos-lite --json
./bin/zothos-lite-tui --json
```

---

## CLI & MCP Usage

### OS & Workstation CLI Binaries (`bin/`)

Every binary supports `--help` and `--json`:

```bash
# System & workstation overview
./bin/zothos-lite --help
./bin/zothos-lite --json
./bin/zothos-lite-tui --json

# 56-model / 8-provider router & volatile RAM key enclave
./bin/zoth-lite-models --providers
./bin/zoth-lite-models --list
./bin/zoth-lite-models --json

# 5-chapter first-boot operator guide
./bin/zoth-lite-welcome --all
./bin/zoth-lite-welcome --json

# Removable USB/NVMe & cloud persistence manager
./bin/zoth-lite-storage status
./bin/zoth-lite-storage --json

# On-demand modular tool installer
./bin/zoth-lite-pkg list
./bin/zoth-lite-pkg --json
```

### Zoth-CoT MCP Server (`bin/zoth_cot_mcp.py`)

Configure `zoth-cot-mcp` in Claude Desktop, Cursor, or Hermes Agent:

```json
{
  "mcpServers": {
    "zoth-cot": {
      "command": "python3",
      "args": ["/path/to/zothos-lite/bin/zoth_cot_mcp.py"]
    }
  }
}
```

Exposed MCP tools:
- `cot_status` — Return session state, pinned facts, extracted entities, and recent turns.
- `cot_add_turn` — Record a `user`, `assistant`, or `system` turn with rolling checkpoint synthesis.
- `cot_pin_fact` — Pin an invariant fact under a category (`IDENTITY`, `MISSION`, `MEMORY`, `ARSENAL`).
- `cot_add_step` — Append a structured reasoning step to the active Chain-of-Thoughts DAG.
- `cot_compile_prompt` — Compile pinned facts and rolling checkpoints into a bounded context block.
- `cot_search` — Search stored turns, steps, and pinned facts.

---

## REST API Endpoints (`127.0.0.1:8145`)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Service health and `absoluteGuard` (`80C` throttle / `85C` pause) contract |
| `GET` | `/api/thermals` | Live Linux `hwmon` package sensor reading, source path, and governor state |
| `GET` | `/api/system-status` | Host RAM (`totalMb`, `usedMb`), `loadAvg`, `thermals`, `daemons[]`, `peers[]`, and ISO status |
| `GET` | `/api/agent/providers`, `POST /api/agent/chat` | 8-provider / 56-model catalog and chat dispatch |
| `GET` | `/api/cot/state`, `POST /api/cot/pin`, `POST /api/cot/recall` | Zoth-CoT working memory inspection, fact pinning, and recall |
| `POST` | `/api/crypto/cold-sign`, `POST /api/ghostbyte/strip` | Offline payload signing and metadata/EXIF scrubbing |
| `GET` | `/api/vaelor/dashboard`, `POST /api/vaelor/mine` | Thermal-gated Proof-of-Useful-Work telemetry and block submission |
| `GET` | `/api/vm/status`, `POST /api/vm/exec`, `GET /api/vm/screen.png` | QEMU guest status, command execution, and framebuffer snapshot |

---

## ZothOS & Zoth Studio Integration

- **Zoth Studio v2**: Indexed as `zothos-lite` at [https://zoth.nullai.tech/tools/zothos-lite](https://zoth.nullai.tech/tools/zothos-lite) (`http://127.0.0.1:3000/tools/zothos-lite`).
- **ZothOS v3.4.0 CLI**: Pre-linked in `/usr/local/bin/zothos-lite` and `/usr/local/bin/zothos-lite-tui`.

---

## Testing & Verification

Run the end-to-end verification suite (`bin/verify-zothos-lite.mjs`), which validates live API contracts on `:8145`, spawns an isolated ephemeral server with mock `hwmon` sensors at `82C` and `86C` to prove `force: true` cannot bypass thermal throttling/pausing, verifies `overflowPx === 0` and `imgsMissingAlt === 0` across mobile (`375x812`), tablet (`768x1024`), and desktop (`1440x900`) in headless Chrome, tests all 6 CLI binaries + ISO `--dry-run`, and audits monotone/attribution hygiene:

```bash
npm test
gitleaks detect --source . --no-banner --redact
```

---

## License

MIT License. Copyright (c) 2026 1nc0gn30 (`@1nc0gn30`, [https://1nc0gn30.si](https://1nc0gn30.si)) & NullAI ([https://nullai.tech](https://nullai.tech)). See [LICENSE](LICENSE).
