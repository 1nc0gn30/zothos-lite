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
    cliExample: 'zoth-dev-core verify- toolchain && nvim -u /etc/zothos-lite/monotone.lua'
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
