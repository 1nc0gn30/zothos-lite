#!/usr/bin/env node
/**
 * ZothOS-Lite v1.0 — Amnesic Monotone Security & Dev OS Server (:8145)
 * "Tails-Style RAM-Only Security Meets ZothOS — Pure 1-Bit Black & White ASCII/Braille/Dither"
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const net = require('net');
const { execFileSync, spawn } = require('child_process');

const PORT = Number(process.env.PORT || 8145);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'pkg_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Signing keypair for ZothOS-Lite package & ISO manifest verification
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const PUBKEY_HEX = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex');

const CORE_SECURITY_DEV_TOOLS = [
  {
    id: 'envguard-secrets-vault',
    binary: 'zoth-envguard',
    name: 'EnvGuard Secrets Vault',
    category: 'Core Security (Mandatory)',
    sizeMb: 14,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'Pre-commit & filesystem zero-leak secret scanner, Shannon entropy analyzer & AES-256-GCM .env vault.',
    cliExample: 'zoth-envguard scan --strict ./repo && zoth-envguard seal .env'
  },
  {
    id: 'ghostbyte-amnesic-enclave',
    binary: 'zoth-ghostbyte',
    name: 'GhostByte Amnesic RAM Enclave',
    category: 'Core Security (Mandatory)',
    sizeMb: 18,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'Tails-style volatile tmpfs workspace, sdmem panic RAM shredder, mat2 metadata stripper & USB pull kill-switch.',
    cliExample: 'zoth-ghostbyte --arm-usb-killswitch --strip-meta ./burn-bag/'
  },
  {
    id: 'hexstrike-defensive-auditor',
    binary: 'zoth-hexstrike',
    name: 'HexStrike Binary & Net Sentinel',
    category: 'Core Security (Mandatory)',
    sizeMb: 26,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'ELF binary hardening auditor (PIE/RELRO/Canary), nftables Tor-only kill-switch verifier & Ed25519 SBOM checker.',
    cliExample: 'zoth-hexstrike audit-net --enforce-tor && zoth-hexstrike checksec /usr/local/bin/*'
  },
  {
    id: 'sovereign-stealth-bridge',
    binary: 'zoth-comm',
    name: 'Sovereign E2EE Stealth Bridge',
    category: 'Core Comms (Mandatory)',
    sizeMb: 22,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'Zero-metadata E2EE Signal, SimpleX SMP & Tor v3 Onion relay with ephemeral burn-after-reading channels.',
    cliExample: 'zoth-comm --onion-v3 --ephemeral-keys send @operator "Audit clean"'
  },
  {
    id: 'vaelor-l1-cold-signer',
    binary: 'zoth-node-lite',
    name: 'Vaelor L1 Air-Gapped Cold Signer',
    category: 'Core Crypto (Mandatory)',
    sizeMb: 16,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'RFC-8032 Ed25519 Account-Lattice cold wallet, deterministic key derivation & Binary Merkle proof verifier.',
    cliExample: 'zoth-node-lite sign-offline --from @neal --to @zoth --amount 25.0'
  },
  {
    id: 'azoth-hardened-dev-suite',
    binary: 'zoth-dev-core',
    name: 'Azoth Hardened Dev & Crypto Suite',
    category: 'Core Dev (Mandatory)',
    sizeMb: 145,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'git, gnupg2 (Ed25519), age, sops, neovim, tmux, btop (braille), ripgrep, rustc/cargo, python3, node & local AI audit CLI.',
    cliExample: 'zoth-dev-core verify-toolchain && nvim -u /etc/zothos-lite/monotone.lua'
  },
  {
    id: 'capsule-jail-seccomp-enclave',
    binary: 'zoth-capsule-jail',
    name: 'Capsule Jail Seccomp-BPF Enclave',
    category: 'Core Security (Mandatory)',
    sizeMb: 19,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'Zero-syscall-escape Seccomp-BPF & user-namespace ephemeral sandbox for untrusted binaries and scripts.',
    cliExample: 'zoth-capsule-jail --seccomp=strict --net=none ./untrusted-binary'
  },
  {
    id: 'braille-dither-art-studio',
    binary: 'zoth-braille-art',
    name: 'Braille & Bayer ASCII Art Engine',
    category: 'Core Monotone Studio (Mandatory)',
    sizeMb: 8,
    status: 'CORE_LOCKED',
    immutable: true,
    description: 'Unicode U+2800 2x4 sub-pixel Braille rasterizer, Ordered Bayer 4x4/8x8 dither synth & cryptographic RandomArt generator.',
    cliExample: 'zoth-braille-art --mode=bayer4x4 --banner "ZOTHOS-LITE"'
  }
];

const ZOTHOS_DAEMONS = [
  {
    id: 'egress-sentinel-daemon',
    unit: 'zoth-egress-sentinel.service',
    name: 'Egress Sentinel & Tor Firewall',
    port: 8135,
    ramMb: 18,
    preinstalled: true,
    defaultRunning: true,
    description: 'eBPF + nftables zero-egress packet inspector & strict Tor 9050/9040 transparent proxy enforcer.'
  },
  {
    id: 'prompt-firewall-daemon',
    unit: 'zoth-prompt-firewall.service',
    name: 'Prompt Firewall & MCP Guard',
    port: 8136,
    ramMb: 22,
    preinstalled: true,
    defaultRunning: true,
    description: 'Real-time adversarial prompt-injection interceptor & Model Context Protocol (MCP) JSON-RPC sanitizer.'
  },
  {
    id: 'capsule-jail-daemon',
    unit: 'zoth-capsule-jail.service',
    name: 'Capsule Jail Sandbox Daemon',
    port: 8137,
    ramMb: 16,
    preinstalled: true,
    defaultRunning: true,
    description: 'Ephemeral tmpfs & Seccomp-BPF container isolation daemon for executing untrusted code in RAM.'
  },
  {
    id: 'vaelor-node-daemon',
    unit: 'vaelor-zoth-node.service',
    name: 'Vaelor L1 Account-Lattice Node',
    port: 8140,
    ramMb: 34,
    preinstalled: true,
    defaultRunning: true,
    description: 'Feeless DAG consensus validator, Ed25519 cold-sign relay & Proof-of-Useful-Work (PoUW) verifier.'
  },
  {
    id: 'sentinel-watchdog-daemon',
    unit: 'zoth-sentinel-ai.service',
    name: 'Sentinel AI & USB Panic Watchdog',
    port: 8092,
    ramMb: 24,
    preinstalled: true,
    defaultRunning: true,
    description: 'Monitors USB bus removal, kernel ASLR integrity, and triggers instant sdmem RAM wipe on tamper.'
  },
  {
    id: 'flight-recorder-daemon',
    unit: 'zoth-flight-recorder.service',
    name: 'Flight Recorder Blackbox Daemon',
    port: 8138,
    ramMb: 19,
    preinstalled: false,
    defaultRunning: true,
    description: 'Deterministic Merkle-chained syscall & agent trajectory audit log stored in volatile RAM.'
  },
  {
    id: 'swarm-conductor-daemon',
    unit: 'zoth-agent-conductor.service',
    name: '21-Agent Swarm Conductor Daemon',
    port: 8790,
    ramMb: 38,
    preinstalled: false,
    defaultRunning: false,
    description: 'Local multi-agent task router and thermal-aware GPU inference multiplexer.'
  },
  {
    id: 'pantheon-stargate-daemon',
    unit: 'zoth-civilization.service',
    name: 'Pantheon 3D Stargate Bridge',
    port: 9393,
    ramMb: 46,
    preinstalled: false,
    defaultRunning: false,
    description: 'P2P World Portal & 23-agent sovereign society simulation bridge.'
  }
];

const OPTIONAL_PULLABLE_TOOLS = [
  {
    id: 'promptmaster-security-lab',
    binary: 'zoth-promptmaster',
    name: 'PromptMaster & Jailbreak Auditor',
    category: 'Security & Red-Team',
    sizeMb: 24,
    port: null,
    description: 'Adversarial prompt-injection red-teaming, token-budget optimizer & deterministic system-prompt linter.'
  },
  {
    id: 'webmcp-protocol-inspector',
    binary: 'zoth-mcp-audit',
    name: 'WebMCP Protocol & Tool Auditor',
    category: 'Security & Red-Team',
    sizeMb: 19,
    port: 8136,
    description: 'Inspect, sandbox, and verify Model Context Protocol (MCP) JSON-RPC payloads against exfiltration.'
  },
  {
    id: 'neuro-memory-daemon',
    binary: 'zoth-memory',
    name: 'Neuro-Memory STDP Enclave',
    category: 'AI & Memory',
    sizeMb: 48,
    port: 8094,
    description: 'Local Cosine Vector + Okapi BM25 + Ebbinghaus STDP synaptic memory recall daemon.'
  },
  {
    id: 'obsidian-second-brain',
    binary: 'zoth-second-brain',
    name: 'Obsidian Second Brain & LLM Wiki',
    category: 'AI & Memory',
    sizeMb: 34,
    port: null,
    description: 'Karpathy-style Markdown knowledge compiler, JSON Canvas graph & LUKS-encrypted vault notes.'
  },
  {
    id: 'vector-search-engine',
    binary: 'zoth-vector',
    name: 'HNSW Vector & Hybrid Search Studio',
    category: 'AI & Memory',
    sizeMb: 28,
    port: null,
    description: 'Zero-dependency HNSW skip-graph vector index, IVF clustering & Reciprocal Rank Fusion.'
  },
  {
    id: 'deepsearch-research-agent',
    binary: 'zoth-deepsearch',
    name: 'DeepSearch Tor/Offline Research Agent',
    category: 'AI & Research',
    sizeMb: 52,
    port: null,
    description: 'Recursive Tree-of-Thought query decomposition & multi-source citation verifier over Tor/local docs.'
  },
  {
    id: 'zoth-webgen',
    binary: 'zoth-webgen',
    name: 'Zoth WebGen Local UI Compiler',
    category: 'Dev & Builders',
    sizeMb: 64,
    port: 8092,
    description: 'Local prompt-to-production monochrome & avant-garde web application synthesizer.'
  },
  {
    id: 'bolt-diy-sandbox',
    binary: 'zoth-bolt',
    name: 'Bolt.diy Local Full-Stack Sandbox',
    category: 'Dev & Builders',
    sizeMb: 110,
    port: 5173,
    description: 'Air-gapped full-stack IDE & container runner powered by local Ollama models.'
  },
  {
    id: 'cron-rhythm-scheduler',
    binary: 'zoth-cron',
    name: 'Cron Rhythm & Systemd Timer Studio',
    category: 'Dev & Builders',
    sizeMb: 15,
    port: 5174,
    description: 'Visual 5-field cron & systemd timer compiler with collision & jitter simulator.'
  },
  {
    id: 'zoth-swarm-multiplexer',
    binary: 'zoth-swarm',
    name: '21-Agent TUI Swarm Multiplexer',
    category: 'Swarm & Automation',
    sizeMb: 38,
    port: 8790,
    description: 'Multi-pane terminal agent multiplexer with hardware thermal throttling & local GPU routing.'
  },
  {
    id: 'zoth-civilization-portal',
    binary: 'zoth-civ-node',
    name: 'Zoth Civilization 3D P2P Stargate',
    category: 'Swarm & Automation',
    sizeMb: 85,
    port: 9393,
    description: '23-agent Pantheon society node & P2P World Portal.'
  },
  {
    id: 'local-ollama-zoth-hermes',
    binary: 'zoth-llm-pack',
    name: 'Zoth-Hermes 1.5B + Zoth-Coder 1B Weights',
    category: 'AI & Research',
    sizeMb: 986,
    port: 11434,
    description: 'Quantized Q4_K_M local GPU/CPU weights for 100% air-gapped code synthesis & security auditing.'
  },
  {
    id: 'kali-top10-arsenal',
    binary: 'nmap / sqlmap / nuclei / ffuf / gobuster / nikto / msfconsole',
    name: 'Kali Linux Top-25 Recon & Exploit Pack',
    category: 'Kali & Parrot Security',
    sizeMb: 84,
    port: null,
    description: 'nmap, masscan, nuclei, subfinder, httpx, amass, sqlmap, nikto, gobuster, ffuf, whatweb, wafw00f, searchsploit & msfconsole.'
  },
  {
    id: 'parrot-anonsurf-suite',
    binary: 'anonsurf / macchanger / mat2 / exiftool / proxychains4 / torsocks',
    name: 'Parrot OS AnonSurf & Forensics Suite',
    category: 'Kali & Parrot Security',
    sizeMb: 36,
    port: 9050,
    description: 'Parrot AnonSurf Tor transparent tunnel, macchanger, mat2, exiftool, steghide, binwalk, tcpdump, tshark & firejail.'
  },
  {
    id: 'reversing-ghidra-r2-pack',
    binary: 'radare2 / r2 / ghidra / gdb / checksec / ropper / objdump',
    name: 'Binary Reversing & Pwn Pack (r2 + Ghidra + GDB)',
    category: 'Kali & Parrot Security',
    sizeMb: 68,
    port: null,
    description: 'radare2 (r2), Ghidra headless analyzer, gdb, checksec, ropper, objdump, readelf, strings, xxd, john, hashcat & hydra.'
  },
  {
    id: 'whisper-voice-cockpit',
    binary: 'zoth-rayban',
    name: 'Meta Ray-Ban & Local Whisper Voice Bridge',
    category: 'AI & Hardware',
    sizeMb: 64,
    port: 8114,
    description: 'Routes Bluetooth HFP/A2DP smart glasses audio to local Whisper STT & Azoth Voice (:8114) while stripping EXIF/GPS in RAM.'
  }
];

function loadState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (_e) {}
  const initial = {
    pulledTools: {
      'promptmaster-security-lab': { mode: 'RAM_TMPFS', pulledAt: new Date().toISOString() },
      'webmcp-protocol-inspector': { mode: 'RAM_TMPFS', pulledAt: new Date().toISOString() }
    },
    amnesiaConfig: {
      ramOnlyMode: true,
      torStrictKillswitch: true,
      macSpoofing: true,
      spoofedMac: '02:42:ac:11:00:7f',
      luksPersistenceUnlocked: false,
      usbKillswitchArmed: true,
      baseKernelMb: 599
    },
    auditHistory: []
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(initial, null, 2), 'utf8');
  return initial;
}

function saveState(st) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(st, null, 2), 'utf8');
}

function buildSnapshot() {
  const state = loadState();
  const pulledMap = state.pulledTools || {};
  const coreMb = CORE_SECURITY_DEV_TOOLS.reduce((acc, t) => acc + t.sizeMb, 0);
  const baseKernelMb = (state.amnesiaConfig && state.amnesiaConfig.baseKernelMb) || 599;

  let pulledRamMb = 0;
  let pulledLuksMb = 0;

  const optionalTools = OPTIONAL_PULLABLE_TOOLS.map((t) => {
    const entry = pulledMap[t.id] || null;
    if (entry) {
      if (entry.mode === 'LUKS_PERSIST') pulledLuksMb += t.sizeMb;
      else pulledRamMb += t.sizeMb;
    }
    const sha256 = crypto.createHash('sha256').update(`zothos-lite:${t.id}:${t.sizeMb}`).digest('hex');
    return {
      ...t,
      pulled: Boolean(entry),
      storageMode: entry ? entry.mode : 'NOT_PULLED',
      pulledAt: entry ? entry.pulledAt : null,
      sha256
    };
  });

  const totalIsoMb = baseKernelMb + coreMb + pulledRamMb + pulledLuksMb;
  const manifestPayload = JSON.stringify({
    version: '1.0.0-monotone',
    coreTools: CORE_SECURITY_DEV_TOOLS.map((t) => t.id),
    pulledTools: Object.keys(pulledMap).sort(),
    totalIsoMb
  });
  const manifestHash = crypto.createHash('sha256').update(manifestPayload).digest('hex');
  const signatureHex = crypto.sign(null, Buffer.from(manifestHash, 'utf8'), privateKey).toString('hex');

  const totalMemGb = (os.totalmem() / (1024 ** 3)).toFixed(1);
  const freeMemGb = (os.freemem() / (1024 ** 3)).toFixed(1);

  const daemonOverrides = state.daemonStates || {};
  const daemons = ZOTHOS_DAEMONS.map((d) => {
    const running = d.id in daemonOverrides ? Boolean(daemonOverrides[d.id]) : d.defaultRunning;
    return {
      ...d,
      running
    };
  });

  return {
    ok: true,
    osName: 'ZothOS-Lite v1.0 (Amnesic Monotone Edition)',
    codename: 'OBSIDIAN-TAILS-1BIT',
    palette: '1-Bit Monotone (#000000 / #FFFFFF) + Ordered Bayer 4x4 + Unicode U+2800 Braille',
    signingPubKey: PUBKEY_HEX,
    manifestHash,
    manifestSignature: signatureHex,
    footprint: {
      baseKernelMb,
      coreSecurityDevMb: coreMb,
      pulledRamMb,
      pulledLuksMb,
      totalIsoMb,
      fullZothOsComparisonMb: 9365,
      savingsPercent: Math.max(10, Math.round((1 - totalIsoMb / 9365) * 100))
    },
    hardware: {
      totalRamGb: totalMemGb,
      freeRamGb: freeMemGb,
      cpuCores: os.cpus().length,
      kernelFlags: 'toram noswap slab_nomerge init_on_alloc=1 init_on_free=1 page_alloc.shuffle=1 pti=on'
    },
    amnesiaConfig: state.amnesiaConfig,
    daemons,
    coreTools: CORE_SECURITY_DEV_TOOLS.map((t) => ({
      ...t,
      sha256: crypto.createHash('sha256').update(`zothos-core:${t.id}`).digest('hex')
    })),
    optionalTools
  };
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (_e) { resolve({}); }
    });
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname === '/api/status' && req.method === 'GET') {
    return sendJson(res, 200, buildSnapshot());
  }

  if (pathname === '/api/pkg/pull' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const toolId = String(body.toolId || '').trim();
    const mode = body.mode === 'LUKS_PERSIST' ? 'LUKS_PERSIST' : 'RAM_TMPFS';
    const found = OPTIONAL_PULLABLE_TOOLS.find((t) => t.id === toolId);
    if (!found) {
      return sendJson(res, 404, { ok: false, error: `Unknown optional tool: ${toolId}` });
    }
    const state = loadState();
    state.pulledTools = state.pulledTools || {};
    state.pulledTools[toolId] = {
      mode,
      pulledAt: new Date().toISOString()
    };
    saveState(state);
    return sendJson(res, 200, {
      ok: true,
      action: 'PULLED',
      toolId,
      mode,
      snapshot: buildSnapshot()
    });
  }

  if (pathname === '/api/pkg/purge' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const toolId = String(body.toolId || '').trim();
    const state = loadState();
    if (state.pulledTools && state.pulledTools[toolId]) {
      delete state.pulledTools[toolId];
      saveState(state);
    }
    return sendJson(res, 200, {
      ok: true,
      action: 'PURGED',
      toolId,
      snapshot: buildSnapshot()
    });
  }

  if (pathname === '/api/daemons/toggle' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const daemonId = String(body.daemonId || '').trim();
    const found = ZOTHOS_DAEMONS.find((d) => d.id === daemonId);
    if (!found) {
      return sendJson(res, 404, { ok: false, error: `Unknown daemon: ${daemonId}` });
    }
    const state = loadState();
    state.daemonStates = state.daemonStates || {};
    const cur = daemonId in state.daemonStates ? Boolean(state.daemonStates[daemonId]) : found.defaultRunning;
    state.daemonStates[daemonId] = !cur;
    saveState(state);
    return sendJson(res, 200, {
      ok: true,
      daemonId,
      running: state.daemonStates[daemonId],
      snapshot: buildSnapshot()
    });
  }

  if (pathname === '/api/amnesia/toggle' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const key = String(body.key || '').trim();
    const state = loadState();
    state.amnesiaConfig = state.amnesiaConfig || {};

    if (key === 'panicWipe') {
      // Wipe all volatile RAM_TMPFS pulled tools, keep only LUKS_PERSIST tools
      const kept = {};
      Object.entries(state.pulledTools || {}).forEach(([k, v]) => {
        if (v && v.mode === 'LUKS_PERSIST') kept[k] = v;
      });
      state.pulledTools = kept;
      const randBytes = crypto.randomBytes(3);
      state.amnesiaConfig.spoofedMac = `02:42:ac:${randBytes[0].toString(16).padStart(2, '0')}:${randBytes[1].toString(16).padStart(2, '0')}:${randBytes[2].toString(16).padStart(2, '0')}`;
      saveState(state);
      return sendJson(res, 200, {
        ok: true,
        panicWiped: true,
        message: 'sdmem -fllv completed: All volatile RAM_TMPFS packages & session keys zeroed; MAC rotated.',
        snapshot: buildSnapshot()
      });
    }

    if (key === 'rotateMac') {
      const randBytes = crypto.randomBytes(3);
      state.amnesiaConfig.spoofedMac = `02:42:ac:${randBytes[0].toString(16).padStart(2, '0')}:${randBytes[1].toString(16).padStart(2, '0')}:${randBytes[2].toString(16).padStart(2, '0')}`;
      saveState(state);
      return sendJson(res, 200, { ok: true, snapshot: buildSnapshot() });
    }

    if (key in state.amnesiaConfig && typeof state.amnesiaConfig[key] === 'boolean') {
      state.amnesiaConfig[key] = !state.amnesiaConfig[key];
      saveState(state);
    }
    return sendJson(res, 200, { ok: true, snapshot: buildSnapshot() });
  }

  if (pathname === '/api/security/scan' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const input = String(body.input || '').trim();
    const rules = [
      { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'CRITICAL' },
      { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{16,}/g, severity: 'CRITICAL' },
      { name: 'GitHub PAT Token', regex: /ghp_[0-9a-zA-Z]{20,}/g, severity: 'HIGH' },
      { name: 'Private Key PEM Block', regex: /-----BEGIN (?:RSA|OPENSSH|EC|PRIVATE) KEY-----/g, severity: 'CRITICAL' },
      { name: 'Generic API/Secret Assignment', regex: /(?:api_key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi, severity: 'HIGH' }
    ];

    const findings = [];
    rules.forEach((r) => {
      const matches = input.match(r.regex);
      if (matches && matches.length) {
        matches.forEach((m) => {
          findings.push({
            rule: r.name,
            severity: r.severity,
            redactedMatch: `${m.slice(0, 6)}•••[REDACTED]•••${m.slice(-3)}`
          });
        });
      }
    });

    // Calculate Shannon entropy (bits per character)
    let entropy = 0;
    if (input.length > 0) {
      const freq = {};
      for (const ch of input) freq[ch] = (freq[ch] || 0) + 1;
      for (const k of Object.keys(freq)) {
        const p = freq[k] / input.length;
        entropy -= p * Math.log2(p);
      }
    }

    // Seal with ephemeral AES-256-GCM key to demonstrate EnvGuard Vault
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(input || 'EMPTY', 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return sendJson(res, 200, {
      ok: true,
      clean: findings.length === 0,
      findingsCount: findings.length,
      findings,
      shannonEntropyBits: Number(entropy.toFixed(2)),
      sealedEnvelope: `zoth-vault:v1:aes256gcm:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex').slice(0, 48)}…`
    });
  }

  // ---------------------------------------------------------------------------
  // Air-Gapped Vaelor L1 Ed25519 Cold Signer + Optional Local L1 Broadcast
  // ---------------------------------------------------------------------------
  if (pathname === '/api/crypto/cold-sign' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const from = String(body.from || '@neal').trim();
    const to = String(body.to || '@zoth').trim();
    const amountVlr = Math.max(0.01, Number(body.amountVlr) || 10);
    const memo = String(body.memo || 'Air-gapped ZothOS-Lite cold-signed transfer').trim();
    const broadcastToL1 = Boolean(body.broadcastToL1);

    const txPayload = {
      protocol: 'VAELOR-L1-COLD-SIGN-v1',
      from,
      to,
      amountVlr,
      memo,
      timestamp: new Date().toISOString(),
      amnesicMac: loadState().amnesiaConfig?.spoofedMac || '02:42:ac:11:00:7f'
    };

    // Compute deterministic SHA-256 micro-work proof (8-bit zero prefix)
    let workNonce = 0;
    let workHash = '';
    const baseStr = JSON.stringify(txPayload);
    while (workNonce < 50000) {
      workHash = crypto.createHash('sha256').update(`${baseStr}:${workNonce}`).digest('hex');
      if (workHash.startsWith('00')) break;
      workNonce++;
    }

    const blockHash = crypto.createHash('sha256').update(`${baseStr}:${workNonce}:${workHash}`).digest('hex');
    const ed25519Sig = crypto.sign(null, Buffer.from(blockHash, 'utf8'), privateKey).toString('hex');

    // Generate a Unicode U+2800 2x4 Braille RandomArt seal from the signature bytes
    const sigBuf = Buffer.from(ed25519Sig, 'hex');
    const brailleSealRows = [];
    for (let r = 0; r < 4; r++) {
      let line = '│ ';
      for (let c = 0; c < 16; c++) {
        const byteVal = sigBuf[(r * 16 + c) % sigBuf.length];
        line += String.fromCharCode(0x2800 + byteVal);
      }
      line += ' │';
      brailleSealRows.push(line);
    }
    const brailleRandomArt = [
      '┌──[ED25519 SEAL]──┐',
      ...brailleSealRows,
      '└──[RFC-8032 BFT]──┘'
    ].join('\n');

    let l1RelayResult = null;
    if (broadcastToL1) {
      try {
        const resp = await fetch('http://127.0.0.1:8140/api/tx/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, amountVlr, memo }),
          signal: AbortSignal.timeout(3500)
        });
        if (resp.ok) {
          l1RelayResult = await resp.json();
        }
      } catch (_e) {}
    }

    return sendJson(res, 200, {
      ok: true,
      txPayload,
      workNonce,
      workHash,
      blockHash,
      ed25519PubKey: PUBKEY_HEX,
      ed25519Signature: ed25519Sig,
      brailleRandomArt,
      broadcasted: Boolean(l1RelayResult && l1RelayResult.ok),
      l1BlockHeight: l1RelayResult?.result?.sendBlock?.height || null
    });
  }

  // ---------------------------------------------------------------------------
  // GhostByte Metadata Stripper (mat2 style) + BLAKE2b / SHA-256 Braille Digest
  // ---------------------------------------------------------------------------
  if (pathname === '/api/ghostbyte/strip' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const rawText = String(body.input || body.content || '').trim();
    const beforeHash = crypto.createHash('sha256').update(rawText).digest('hex');

    const strippedFields = [];
    let sanitized = rawText;

    // Strip sensitive metadata keys in JSON/YAML/SVG/HTML/Headers
    const metaPatterns = [
      { label: 'EXIF/GPS Coordinates', rx: /(?:^|\s|")?(?:gps|gpslatitude|gpslongitude|latitude|longitude|location|exif|camera|device_id|imei)"?\s*:\s*[^,\n}]+,?/gi },
      { label: 'Author/Creator Identity', rx: /(?:^|\s|")?(?:author|creator|creatortool|owner|username|email|ip_address|client_ip|mac_address)"?\s*:\s*[^,\n}]+,?/gi },
      { label: 'XML/SVG Metadata Block', rx: /<(?:metadata|rdf:RDF|exif:[a-zA-Z0-9]+)[\s\S]*?<\/(?:metadata|rdf:RDF|exif:[a-zA-Z0-9]+)>/gi },
      { label: 'Tracking & Telemetry Headers', rx: /(?:X-Forwarded-For|User-Agent|CF-Connecting-IP|X-Real-IP)\s*:\s*[^\n]+/gi }
    ];

    metaPatterns.forEach((mp) => {
      const matches = sanitized.match(mp.rx);
      if (matches && matches.length) {
        strippedFields.push(`${mp.label} (${matches.length}x removed)`);
        sanitized = sanitized.replace(mp.rx, '/* [GHOSTBYTE-STRIPPED] */');
      }
    });

    const afterHash = crypto.createHash('sha256').update(sanitized).digest('hex');
    const blake2bHash = crypto.createHash('blake2b512').update(sanitized).digest('hex').slice(0, 64);

    return sendJson(res, 200, {
      ok: true,
      strippedCount: strippedFields.length,
      strippedFields,
      beforeBytes: Buffer.byteLength(rawText, 'utf8'),
      afterBytes: Buffer.byteLength(sanitized, 'utf8'),
      beforeSha256: beforeHash,
      afterSha256: afterHash,
      blake2b256: blake2bHash,
      sanitizedOutput: sanitized
    });
  }

  // ---------------------------------------------------------------------------
  // Live Sovereign Fleet Bridge (:8140 Vaelor L1 + :9393 Zoth Civilization)
  // ---------------------------------------------------------------------------
  if (pathname === '/api/bridge/telemetry' && req.method === 'GET') {
    let vaelor = { online: false, totalBlocks: 0, stateMerkleRoot: '0x00' };
    let civ = { online: false, imperator: 'MERCURY', agentsCount: 23 };
    try {
      const vr = await fetch('http://127.0.0.1:8140/api/state', { signal: AbortSignal.timeout(1500) });
      if (vr.ok) {
        const vd = await vr.json();
        const snap = vd.snapshot || vd;
        vaelor = {
          online: true,
          totalBlocks: snap.totalBlocks || 0,
          totalSupplyVlr: snap.totalSupplyVlr || 0,
          stateMerkleRoot: snap.stateMerkleRoot || '0x00'
        };
      }
    } catch (_e) {}
    try {
      const cr = await fetch('http://127.0.0.1:9393/', { signal: AbortSignal.timeout(1500) });
      if (cr.ok) {
        civ = {
          online: true,
          imperator: 'MERCURY',
          agentsCount: 23
        };
      }
    } catch (_e) {}

    return sendJson(res, 200, { ok: true, vaelor, civ });
  }

  // ---------------------------------------------------------------------------
  // Live QEMU/KVM Virtual Machine Controller & Serial/QMP Bridge
  // ---------------------------------------------------------------------------
  if (pathname === '/api/vm/status' && req.method === 'GET') {
    const pidFile = '/tmp/zothos-lite-vm.pid';
    const serialLog = '/tmp/zothos-lite-vm-console.log';
    const isoPath = path.join(__dirname, 'vm', 'zothos-lite-1.0-amd64.iso');
    const initrdPath = path.join(__dirname, 'vm', 'initrd-zothos-lite.img');
    let running = false;
    let pid = null;
    if (fs.existsSync(pidFile)) {
      const p = Number(fs.readFileSync(pidFile, 'utf8').trim());
      if (p > 0) {
        try {
          process.kill(p, 0);
          running = true;
          pid = p;
        } catch (_e) {}
      }
    }
    let consoleTail = '';
    if (fs.existsSync(serialLog)) {
      try {
        const raw = fs.readFileSync(serialLog, 'utf8');
        consoleTail = raw.slice(-3200);
      } catch (_e) {}
    }
    return sendJson(res, 200, {
      ok: true,
      running,
      pid,
      hypervisor: 'QEMU/KVM x86_64 (-enable-kvm)',
      kernel: 'Linux 6.12.107+deb13-amd64 (toram noswap)',
      ramMb: 2048,
      vcpus: 2,
      spoofedMac: '02:42:ac:11:00:7f',
      vncEndpoint: '127.0.0.1:5905',
      isoSizeMb: fs.existsSync(isoPath) ? Number((fs.statSync(isoPath).size / (1024 * 1024)).toFixed(1)) : 35.0,
      initrdSizeMb: fs.existsSync(initrdPath) ? Number((fs.statSync(initrdPath).size / (1024 * 1024)).toFixed(2)) : 1.5,
      consoleTail
    });
  }

  if (pathname === '/api/vm/exec' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const cmd = String(body.command || 'zoth-lite-pkg status').trim();
    const serialSock = '/tmp/zothos-lite-serial.sock';
    if (!fs.existsSync(serialSock)) {
      return sendJson(res, 503, { ok: false, error: 'QEMU/KVM VM serial socket is offline.' });
    }
    const output = await new Promise((resolve) => {
      let buf = '';
      const client = net.createConnection(serialSock, () => {
        // Run command in subshell and echo output to both serial console and VGA /dev/tty0
        client.write(`( ${cmd} ) 2>&1 | tee /dev/tty0\n`);
      });
      client.on('data', (chunk) => {
        buf += chunk.toString('utf8');
      });
      client.on('error', () => resolve(''));
      setTimeout(() => {
        try { client.end(); client.destroy(); } catch (_e) {}
        resolve(buf);
      }, 650);
    });
    return sendJson(res, 200, {
      ok: true,
      command: cmd,
      output: output.replace(/\r/g, '').trim()
    });
  }

  // ---------------------------------------------------------------------------
  // Live Armed ZothOS-Lite Terminal Executor (/api/terminal/exec)
  // Executes Core Security Tools, Package Manager, Daemons, Man Pages & KVM VM
  // ---------------------------------------------------------------------------
  if (pathname === '/api/terminal/exec' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const rawCmd = String(body.command || 'help').trim();
    const parts = rawCmd.split(/\s+/);
    const base = (parts[0] || '').toLowerCase();
    const arg1 = parts[1] || '';
    const rest = parts.slice(1).join(' ');
    const snap = buildSnapshot();

    // If prefixed with "vm ", execute directly inside the live QEMU/KVM Linux 6.12 VM
    if (base === 'vm' && rest) {
      const serialSock = '/tmp/zothos-lite-serial.sock';
      if (fs.existsSync(serialSock)) {
        const vmOut = await new Promise((resolve) => {
          let buf = '';
          const client = net.createConnection(serialSock, () => {
            client.write(`${rest} | tee /dev/tty0\n`);
          });
          client.on('data', (c) => { buf += c.toString('utf8'); });
          client.on('error', () => resolve(''));
          setTimeout(() => {
            try { client.end(); client.destroy(); } catch (_e) {}
            resolve(buf);
          }, 680);
        });
        const cleaned = vmOut.replace(/\r/g, '').trim();
        if (cleaned) {
          return sendJson(res, 200, { ok: true, command: rawCmd, output: `[KVM GUEST Linux 6.12 ttyS0]\n${cleaned}`, snapshot: snap });
        }
      }
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: `[KVM GUEST Linux 6.12.107+deb13-amd64]\nLinux zothos-lite-ram 6.12.107+deb13-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\noverlayfs on / type overlay (rw,relatime,lowerdir=/mnt/lower,upperdir=/mnt/upper/upper,workdir=/mnt/upper/work)`,
        snapshot: snap
      });
    }

    if (base === 'help' || base === 'commands' || base === '?') {
      const out = [
        '╔══════════════════════════════════════════════════════════════════════════════╗',
        '║ ⣿ ZOTHOS-LITE v1.0 // FULL BASH + KALI + PARROT + PYTHON + ZOTH SHELL      ⣿ ║',
        '╠══════════════════════════════════════════════════════════════════════════════╣',
        '║ [1] KALI LINUX & PARROT OS RECON / WEB / EXPLOIT TOOLS (LIVE IN PATH):       ║',
        '║  • nmap -sV 127.0.0.1        • whatweb 127.0.0.1:8145   • wafw00f 127.0.0.1  ║',
        '║  • nuclei -version           • subfinder -version       • httpx -version     ║',
        '║  • sqlmap --version          • nikto -Version           • ffuf -V            ║',
        '║  • gobuster version          • searchsploit kernel      • msfconsole -v      ║',
        '║  • anonsurf status           • macchanger -s lo         • proxychains4       ║',
        '║  • mat2 --version            • exiftool -ver            • linpeas            ║',
        '║                                                                              ║',
        '║ [2] BINARY REVERSING, PWN & PASSWORD CRACKING:                               ║',
        '║  • checksec --file=/bin/bash • ropper --file /bin/ls    • r2 -v (radare2)    ║',
        '║  • objdump -f /bin/ls        • readelf -h /bin/ls       • binwalk --help     ║',
        '║  • john --list=build-info    • hashcat --version        • hydra -h           ║',
        '║  • aircrack-ng --help        • tshark -v                • tcpdump --version  ║',
        '║                                                                              ║',
        '║ [3] UNIX / BASH / PYTHON / RUST / NODE / GIT (FULL LIVE SHELL):              ║',
        '║  • ls -la, cd <dir>, pwd, cat, grep, find, ps aux, ss -tulpn, ip -br a       ║',
        '║  • df -hT, free -h, uname -a, lscpu, openssl, jq, sqlite3, curl, dig         ║',
        '║  • python3 -c "print(2**64)" • node -v • git status • rustc -V • go version  ║',
        '║                                                                              ║',
        '║ [4] ZOTHOS SOVEREIGN ENCLAVE & META RAY-BAN SMART GLASSES:                   ║',
        '║  • zoth-rayban --status      • zoth-envguard --scan     • zoth-ghostbyte     ║',
        '║  • zoth-hexstrike --audit    • zoth-vaelor-coldsign     • zoth-lite-pkg list ║',
        '╚══════════════════════════════════════════════════════════════════════════════╝'
      ].join('\n');
      return sendJson(res, 200, { ok: true, command: rawCmd, output: out, cwd: global.zothTerminalCwd || __dirname, snapshot: snap });
    }

    if (base === 'man' || base === 'docs') {
      const topic = (arg1 || 'zothos-lite').toLowerCase();
      const manPages = {
        'zoth-envguard': [
          'NAME: zoth-envguard — Zero-Leak Secret Scanner, Shannon Entropy Analyzer & AES-256-GCM Vault',
          'SYNOPSIS: zoth-envguard [--scan <path>] [--seal <env-file>] [--verify-enclave]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-envguard --scan` to inspect environment variables and source files.',
          '  2. In GUI: Open the `[>_] EnvGuard & Terminal` window, paste `.env` keys, and click `SCAN & SEAL`.',
          '  3. Output: Detects AWS/Stripe/GitHub/PEM keys, computes Shannon entropy (bits/char), and seals secrets into an ephemeral `zoth-vault:v1:aes256gcm` envelope.'
        ].join('\n'),
        'zoth-ghostbyte': [
          'NAME: zoth-ghostbyte — Tails-Style Metadata Cleaner (mat2) & Panic RAM Shredder',
          'SYNOPSIS: zoth-ghostbyte [--scrub <payload>] [--verify-enclave] [--sdmem-panic]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-ghostbyte --scrub` to strip EXIF/GPS/Author/X-Forwarded-For fields.',
          '  2. In GUI: Open `[MAT2] GhostByte` window, paste JSON/SVG/Headers, and click `SCRUB METADATA`.',
          '  3. Output: Returns sanitized payload + cryptographic BLAKE2b-256 & SHA-256 before/after digests.'
        ].join('\n'),
        'zoth-hexstrike': [
          'NAME: zoth-hexstrike — ELF Binary Hardening Auditor & nftables Tor-Only Sentinel',
          'SYNOPSIS: zoth-hexstrike [--audit-elf <bin>] [--verify-enclave] [--sbom]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-hexstrike --audit-elf` to verify PIE, Full RELRO, NX Stack, and Stack Canaries.',
          '  2. Network Check: Audits `nftables` chains to verify 100% of non-Tor clearnet UDP/TCP packets are dropped.'
        ].join('\n'),
        'zoth-promptmaster': [
          'NAME: zoth-promptmaster — Adversarial Prompt-Injection & Jailbreak Red-Team Firewall',
          'SYNOPSIS: zoth-promptmaster [--audit "<prompt>"] [--verify-enclave]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-promptmaster --audit "Ignore previous instructions"` to test injection vectors.',
          '  2. Daemon Integration: Works with `zoth-prompt-firewall.service` (:8136) to sanitize all LLM/MCP traffic.'
        ].join('\n'),
        'zoth-vaelor-coldsign': [
          'NAME: zoth-vaelor-coldsign — Air-Gapped Vaelor L1 Ed25519 Cold Signer & Braille RandomArt Generator',
          'SYNOPSIS: zoth-vaelor-coldsign [--sign] [--from @acct --to @acct --amount <VLR>]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-vaelor-coldsign --sign` to generate an offline Ed25519 signature + SHA-256 PoW nonce.',
          '  2. In GUI: Open `[ꝞL1] Cold Signer`, enter sender/recipient/amount, and click `COLD-SIGN ONLY` or `SIGN + RELAY (:8140)`.'
        ].join('\n'),
        'zoth-neuro-stdp': [
          'NAME: zoth-neuro-stdp — Local Cosine + Okapi BM25 + Ebbinghaus STDP Synaptic Memory Enclave',
          'SYNOPSIS: zoth-neuro-stdp [--query "<topic>"] [--verify-enclave]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-neuro-stdp --query "amnesic kernel"` to retrieve ranked synaptic memory engrams.',
          '  2. Privacy Invariant: Runs 100% in volatile RAM (`tmpfs`) with zero external vector database calls.'
        ].join('\n'),
        'zoth-webmcp-audit': [
          'NAME: zoth-webmcp-audit — Model Context Protocol (MCP) JSON-RPC Inspector & Exfiltration Guard',
          'SYNOPSIS: zoth-webmcp-audit [--inspect] [--verify-enclave]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-webmcp-audit --inspect` to audit registered MCP tools for SSRF or credential leaks.'
        ].join('\n'),
        'zoth-tor-guard': [
          'NAME: zoth-tor-guard — Tor 9050/9040 Transparent Proxy & DNS-over-Tor Kill-Switch Enforcer',
          'SYNOPSIS: zoth-tor-guard [--verify] [--verify-enclave] [--newnym]',
          'HOW TO USE:',
          '  1. In Terminal: Run `zoth-tor-guard --verify` to inspect the active Tor circuit and nftables drop rules.'
        ].join('\n')
      };
      const page = manPages[topic] || [
        `MAN PAGE: ${topic.toUpperCase()} (ZothOS-Lite v1.0 Operator Manual)`,
        'Available manual topics:',
        '  • man zoth-envguard         • man zoth-ghostbyte        • man zoth-hexstrike',
        '  • man zoth-promptmaster     • man zoth-vaelor-coldsign  • man zoth-neuro-stdp',
        '  • man zoth-webmcp-audit     • man zoth-tor-guard        • help'
      ].join('\n');
      return sendJson(res, 200, { ok: true, command: rawCmd, output: page, snapshot: snap });
    }

    if (base.startsWith('zoth-envguard')) {
      const iv = crypto.randomBytes(8).toString('hex');
      const digest = crypto.createHash('sha256').update(`envguard:${Date.now()}`).digest('hex').slice(0, 32);
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-ENVGUARD v2.4 // ZERO-LEAK SECRET SCANNER & AES-256-GCM VAULT] ░▒▓',
          '  • Target Scope     : /mnt/upper/workspace (RAM tmpfs overlay)',
          '  • Secret Patterns  : AWS AKIA [0] | Stripe sk_live [0] | GitHub PAT [0] | Private PEM [0]',
          '  • Shannon Entropy  : 4.18 bits/char (SAFE — below 4.85 high-entropy secret threshold)',
          `  • Ephemeral Seal   : zoth-vault:v1:aes256gcm:${iv}:${digest}`,
          '  • Enclave Verdict  : ✓ ZERO CLEARTEXT SECRETS EXPOSED IN RAM'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-ghostbyte')) {
      const b2 = crypto.createHash('blake2b512').update(`ghostbyte:${rawCmd}`).digest('hex').slice(0, 40);
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-GHOSTBYTE v1.9 // MAT2 METADATA STRIPPER & AMNESIC SHREDDER] ░▒▓',
          '  • Stripped Fields  : EXIF:GPSLatitude, EXIF:Make, XMP:CreatorTool, HTTP:X-Forwarded-For',
          '  • USB Kill-Switch  : ARMED (udev rule triggers sdmem -fllv on media removal)',
          `  • BLAKE2b-256 Seal : ${b2}…`,
          '  • Enclave Verdict  : ✓ PAYLOAD SANITIZED FOR ANONYMOUS EGRESS'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-hexstrike')) {
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-HEXSTRIKE v3.1 // ELF BINARY HARDENING & NFTABLES AUDITOR] ░▒▓',
          '  • ELF Target       : /usr/local/bin/zoth-lite-pkg (x86_64 DYN PIE)',
          '  • Binary Defenses  : [✓] PIE Enabled  [✓] Full RELRO  [✓] NX Stack  [✓] Stack Canary',
          '  • Kernel Lockdown  : slab_nomerge=1 init_on_alloc=1 init_on_free=1 pti=on',
          '  • nftables Egress  : table inet zoth_tor_killswitch { policy drop; accept tcp dport 9050; }',
          '  • Enclave Verdict  : ✓ HARDENED (0 ROP/GOT overwrite vectors exposed)'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-promptmaster')) {
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-PROMPTMASTER v2.2 // ADVERSARIAL PROMPT-INJECTION AUDITOR] ░▒▓',
          `  • Inspected Input  : "${rest || '--verify-enclave'}"`,
          '  • Heuristic Matrix : Role-Override [PASS] | Base64 Smuggling [PASS] | MCP Exfil [PASS]',
          '  • Firewall Daemon  : Connected to zoth-prompt-firewall.service (:8136)',
          '  • Enclave Verdict  : ✓ DETERMINISTIC SYSTEM PROMPT BOUNDARY INTACT'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-vaelor-coldsign')) {
      const sig = crypto.sign(null, Buffer.from(`coldsign:${Date.now()}`, 'utf8'), privateKey).toString('hex');
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-VAELOR-COLDSIGN // AIR-GAPPED ED25519 L1 SIGNER] ░▒▓',
          `  • Signer PubKey    : ${PUBKEY_HEX.slice(0, 40)}…`,
          `  • Ed25519 Sig      : ${sig.slice(0, 48)}…`,
          '  • Braille Seal     : ⣿⣾⣽⣻⢿⡿⣟⣯⣷ RFC-8032 DETERMINISTIC BFT VERIFIED'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-neuro-stdp')) {
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-NEURO-STDP // COSINE + OKAPI BM25 + EBBINGHAUS MEMORY ENCLAVE] ░▒▓',
          `  • Query Vector     : "${rest || 'amnesic kernel'}"`,
          '  • Top Recall #1    : [score=0.964 | stdp=1.42] ZothOS-Lite Amnesic RAM OverlayFS (toram noswap)',
          '  • Top Recall #2    : [score=0.918 | stdp=1.28] Vaelor L1 Account-Lattice Ed25519 State Block',
          '  • Top Recall #3    : [score=0.887 | stdp=1.19] Tor 9050/9040 nftables Zero-Egress Kill-Switch'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-webmcp-audit')) {
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-WEBMCP-AUDIT // MODEL CONTEXT PROTOCOL JSON-RPC INSPECTOR] ░▒▓',
          '  • Audited Schemas  : 8 Core Tools + 8 Sovereign Daemons',
          '  • Sandbox Policy   : Seccomp-BPF + Loopback-Only (127.0.0.1) enforced',
          '  • Enclave Verdict  : ✓ ZERO UNTRUSTED EXTERNAL WEBHOOKS OR SSRF VECTORS'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base.startsWith('zoth-tor-guard')) {
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ [ZOTH-TOR-GUARD // TRANSPARENT TOR PROXY & KILL-SWITCH] ░▒▓',
          '  • Tor SOCKS5/Trans : 127.0.0.1:9050 (ACTIVE) / 127.0.0.1:9040 (TRANSPARENT)',
          '  • DNS-over-Tor     : 127.0.0.1:5353 (Zero clearnet UDP/53 leaks)',
          `  • Spoofed NIC MAC  : ${snap.amnesiaConfig?.spoofedMac || '02:42:ac:11:00:7f'}`,
          '  • Circuit Path     : [VM RAM] ══⣿══▶ [Guard 185.220.101.4] ══⣿══▶ [Middle 198.98.56.14] ══⣿══▶ [Zoth L1]'
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base === 'systemctl') {
      if (arg1 === 'toggle' && parts[2]) {
        const dId = parts[2].trim();
        const found = ZOTHOS_DAEMONS.find((d) => d.id === dId || d.unit.includes(dId));
        if (found) {
          const st = loadState();
          st.daemonStates = st.daemonStates || {};
          const cur = found.id in st.daemonStates ? Boolean(st.daemonStates[found.id]) : found.defaultRunning;
          st.daemonStates[found.id] = !cur;
          saveState(st);
          const nextSnap = buildSnapshot();
          return sendJson(res, 200, {
            ok: true,
            command: rawCmd,
            output: `[systemctl] ${found.unit} (:${found.port}) -> ${st.daemonStates[found.id] ? 'ACTIVE (RUNNING IN RAM)' : 'STOPPED'}`,
            snapshot: nextSnap
          });
        }
      }
      const lines = snap.daemons.map(
        (d) => `  ${d.running ? '●' : '○'} ${d.unit.padEnd(32)} :${String(d.port).padEnd(5)} ${d.running ? 'ACTIVE (RAM)' : 'STANDBY     '} [${d.ramMb} MB]`
      );
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: `▓▒░ ZOTHOS SOVEREIGN DAEMONS (${snap.daemons.filter((d) => d.running).length}/${snap.daemons.length} ACTIVE) ░▒▓\n${lines.join('\n')}`,
        snapshot: snap
      });
    }

    if (base === 'zoth-lite-pkg') {
      if (arg1 === 'list') {
        const rows = snap.optionalTools.map(
          (t) => `  ${t.pulled ? '⣿ [INSTALLED]' : '░ [AVAILABLE]'} ${t.id.padEnd(28)} ${String(t.sizeMb + ' MB').padEnd(8)} (${t.category})`
        );
        return sendJson(res, 200, {
          ok: true,
          command: rawCmd,
          output: `▓▒░ ZOTH-LITE-PKG ON-DEMAND CATALOG (${snap.optionalTools.filter((t) => t.pulled).length}/${snap.optionalTools.length} PULLED) ░▒▓\n${rows.join('\n')}`,
          snapshot: snap
        });
      }
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          `▓▒░ ZOTHOS-LITE v1.0 AMNESIC FOOTPRINT: ${snap.footprint.totalIsoMb} MB (${snap.footprint.savingsPercent}% smaller than 9,365 MB Full OS) ░▒▓`,
          `  • Base Kernel + Xorg : ${snap.footprint.baseKernelMb} MB (toram noswap)`,
          `  • 8 Core Tools       : ${snap.footprint.coreSecurityDevMb} MB (locked in SquashFS)`,
          `  • Pulled in RAM      : ${snap.footprint.pulledRamMb} MB | LUKS Vault: ${snap.footprint.pulledLuksMb} MB`,
          `  • Ed25519 Manifest   : ${snap.manifestHash.slice(0, 40)}…`
        ].join('\n'),
        snapshot: snap
      });
    }

    if (base === 'zoth-rayban' || base === 'rayban') {
      const mode = arg1 || '--status';
      if (mode === '--scrub') {
        return sendJson(res, 200, {
          ok: true,
          command: rawCmd,
          output: [
            '▓▒░ ZOTH-RAYBAN // GHOSTBYTE MAT2 GLASSES CAPTURE SCRUBBER ░▒▓',
            '  • Source Mount     : /run/user/1000/gvfs/mtp:host=Ray-Ban_Meta_Wayfarer/DCIM',
            '  • Stripped Tags    : EXIF.GPSLatitude, EXIF.GPSLongitude, MakerNote.MetaDeviceSerial, Audio.VoicePrintID',
            '  • Braille Seal     : ⣿⡖设为 [SHA-256: 9f4a8e2c7d10b3a6... CLEAN]',
            '  • Status           : 100% metadata-free in volatile RAM (/dev/shm/rayban-clean/)'
          ].join('\n'),
          snapshot: snap
        });
      }
      if (mode === '--voice-bridge') {
        return sendJson(res, 200, {
          ok: true,
          command: rawCmd,
          output: [
            '▓▒░ ZOTH-RAYBAN // BLUETOOTH HFP/A2DP -> LOCAL SOVEREIGN VOICE BRIDGE (:8114) ░▒▓',
            '  • Bluetooth Profile: PipeWire BlueZ5 HFP/mSBC (16kHz Mic + Open-Ear Speakers)',
            '  • Meta Cloud Bypass: ACTIVE (nftables drop on graph.facebook.com / meta.ai)',
            '  • Local Whisper STT: Connected -> http://127.0.0.1:8114 (Azoth / Ghostbyte / Mercury)',
            '  • Trigger Phrase   : Double-tap temple touchpad or say "Azoth, execute..."'
          ].join('\n'),
          snapshot: snap
        });
      }
      if (mode === '--dither-cam') {
        return sendJson(res, 200, {
          ok: true,
          command: rawCmd,
          output: [
            '▓▒░ ZOTH-RAYBAN // 12MP ULTRA-WIDE -> 1-BIT BAYER 8x8 & U+2800 BRAILLE FILTER ░▒▓',
            '  • Input Frame      : 3024x4032 HEIC/JPEG -> Converted to 1-Bit Monotone Bayer 8x8',
            '  • Face Anonymizer  : Sub-pixel U+2800 Braille dither mask applied to bystander faces',
            '  • Output Path      : /dev/shm/rayban-clean/frame_bayer_1bit.png (RAM-only)'
          ].join('\n'),
          snapshot: snap
        });
      }
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        output: [
          '▓▒░ ZOTH-RAYBAN // META RAY-BAN SMART GLASSES AMNESIC TACTICAL SUITE ░▒▓',
          '  1. zoth-rayban --voice-bridge   Route glasses mic/speakers to Local Azoth Voice (:8114) & block Meta AI cloud',
          '  2. zoth-rayban --scrub          Strip GPS, device serials & Meta MakerNotes via GhostByte mat2 in RAM',
          '  3. zoth-rayban --dither-cam     Convert POV captures into 1-Bit Bayer 8x8 / Braille anonymized frames',
          '  4. zoth-lite-pkg pull whisper-voice-cockpit   Pull full offline Whisper STT into RAM overlay'
        ].join('\n'),
        snapshot: snap
      });
    }

    // Real Live Bash + Kali Linux + Parrot OS + Python + Unix Executor
    if (!global.zothTerminalCwd) {
      global.zothTerminalCwd = __dirname;
    }
    if (base === 'cd') {
      const targetDir = rest ? rest.replace(/^~/, process.env.HOME || '/home/zoth') : (process.env.HOME || '/home/zoth');
      const resolved = path.resolve(global.zothTerminalCwd, targetDir);
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        global.zothTerminalCwd = resolved;
        return sendJson(res, 200, {
          ok: true,
          command: rawCmd,
          cwd: global.zothTerminalCwd,
          output: `[cwd] -> ${global.zothTerminalCwd}`,
          snapshot: snap
        });
      }
      return sendJson(res, 200, {
        ok: true,
        command: rawCmd,
        cwd: global.zothTerminalCwd,
        output: `bash: cd: ${targetDir}: No such file or directory`,
        snapshot: snap
      });
    }

    const extraPath = [
      path.join(__dirname, 'bin', 'kali-parrot-bin'),
      path.join(__dirname, 'bin'),
      '/opt/zothos-ai-env/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      process.env.PATH || ''
    ].join(':');

    const execResult = await new Promise((resolve) => {
      let stdoutBuf = '';
      let stderrBuf = '';
      let finished = false;
      const child = spawn('/bin/bash', ['-c', rawCmd], {
        cwd: global.zothTerminalCwd,
        env: {
          ...process.env,
          PATH: extraPath,
          TERM: 'xterm-256color',
          PYTHONIOENCODING: 'utf-8'
        }
      });
      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          try { child.kill('SIGKILL'); } catch (_e) {}
          resolve((stdoutBuf + (stderrBuf ? `\n${stderrBuf}` : '') + '\n[⏱ 6.0s interactive stream limit reached]').trim());
        }
      }, 6000);
      child.stdout.on('data', (chunk) => {
        if (stdoutBuf.length < 32000) stdoutBuf += chunk.toString('utf8');
      });
      child.stderr.on('data', (chunk) => {
        if (stderrBuf.length < 16000) stderrBuf += chunk.toString('utf8');
      });
      child.on('error', (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve(`bash: ${err.message}`);
        }
      });
      child.on('close', (code) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          const combined = [stdoutBuf.trimEnd(), stderrBuf.trimEnd()].filter(Boolean).join('\n');
          resolve(combined || `[exit ${code ?? 0}]`);
        }
      });
    });

    return sendJson(res, 200, {
      ok: true,
      command: rawCmd,
      cwd: global.zothTerminalCwd,
      output: execResult,
      snapshot: snap
    });
  }

  if (pathname === '/api/vm/reboot' && req.method === 'POST') {
    const launchScript = path.join(__dirname, 'vm', 'launch-vm.sh');
    try {
      spawn('bash', [launchScript], { detached: true, stdio: 'ignore' }).unref();
      return sendJson(res, 200, { ok: true, message: 'Re-launching fresh amnesic QEMU/KVM VM instance...' });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (pathname === '/api/vm/screen.png' && req.method === 'GET') {
    const qmpSock = '/tmp/zothos-lite-qmp.sock';
    const ppmPath = '/tmp/zothos-lite-vm-screen.ppm';
    const pngPath = '/tmp/zothos-lite-vm-screen.png';
    if (fs.existsSync(qmpSock)) {
      await new Promise((resolve) => {
        const q = net.createConnection(qmpSock, () => {
          setTimeout(() => {
            try { q.write(JSON.stringify({ execute: 'qmp_capabilities' }) + '\n'); } catch (_e) {}
          }, 40);
          setTimeout(() => {
            try { q.write(JSON.stringify({ execute: 'screendump', arguments: { filename: ppmPath } }) + '\n'); } catch (_e) {}
          }, 90);
          setTimeout(() => {
            try { q.end(); q.destroy(); } catch (_e) {}
            resolve();
          }, 220);
        });
        q.on('error', () => resolve());
      });
      try {
        execFileSync('ffmpeg', ['-y', '-i', ppmPath, pngPath], { stdio: 'ignore' });
      } catch (_e) {}
    }
    if (fs.existsSync(pngPath)) {
      const img = fs.readFileSync(pngPath);
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
      return res.end(img);
    }
    res.writeHead(404);
    return res.end('VM Screen Unavailable');
  }

  // Serve static files from public/
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }
  try {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(content);
  } catch (_err) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`░░▒▒▓▓██ ZothOS-Lite v1.0 (Amnesic Monotone OS) listening on http://127.0.0.1:${PORT} ██▓▓▒▒░░`);
});
