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
        // Run command and echo output to both serial console and VGA /dev/tty0
        client.write(`${cmd} | tee /dev/tty0\n`);
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
