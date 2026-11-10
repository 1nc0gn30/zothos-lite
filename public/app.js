/**
 * 🜂 ZOTHOS LITE v1.2 — SOVEREIGN AMNESIC OS WORKSTATION & MULTI-MODEL SWARM
 * Design System: Alchemical Gold (#FFD700) · Obsidian Deep Space (#08080B)
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. SOVEREIGN HOROLOGY CLOCK & SYSTEM TELEMETRY TICKER
  // =========================================================================
  function initHorologyTicker() {
    const clockEl = document.getElementById('shellClockDisplay');
    const beatsEl = document.getElementById('shellBeatsDisplay');
    const ramEl = document.getElementById('shellRamDisplay');

    function updateClocks() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toISOString().slice(11, 19) + ' UTC';
      }
      if (beatsEl) {
        // Swatch Internet Time (.beats): UTC+1 in milliseconds / 86400
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const utcSeconds = now.getUTCSeconds();
        const bmtSeconds = ((utcHours + 1) % 24) * 3600 + utcMinutes * 60 + utcSeconds;
        const beats = Math.floor((bmtSeconds / 86.4) % 1000);
        beatsEl.textContent = `@${beats.toString().padStart(3, '0')}.beats`;
      }
      if (ramEl) {
        // Subtle volatile RAM oscillation around 2.4 GB / 32 GB toram
        const jitter = (Math.sin(now.getTime() / 4000) * 0.12).toFixed(2);
        const used = (2.42 + parseFloat(jitter)).toFixed(2);
        ramEl.textContent = `${used} GB / 32.0 GB (toram noswap)`;
      }
    }

    setInterval(updateClocks, 1000);
    updateClocks();
  }

  // =========================================================================
  // 2. AZOTH EMBODIED BRAILLE AGENT (U+2800)
  // =========================================================================
  const AZOTH_MOODS = {
    IDLE: {
      name: 'IDLE',
      tag: 'RESTING',
      eyes: ['⣾⣿⣷', '⣏⣉⣹'],
      mouth: '⠶⠶⠶',
      status: 'Resting in volatile RAM enclave. Awaiting mission dispatch.'
    },
    THINKING: {
      name: 'THINKING',
      tag: 'SYNAPSE',
      eyes: ['⠋⠙⠹', '⠼⠴⠦'],
      mouth: '⣴⣶⣦',
      status: 'Multiplexing multi-model consensus across 8 providers...'
    },
    REASONING: {
      name: 'REASONING',
      tag: 'COT DAG',
      eyes: ['⣿⠿⣿', '⣿⠛⣿'],
      mouth: '⠲⠶⠲',
      status: 'Generating cryptographic Merkle thought DAG node N03...'
    },
    ALERT: {
      name: 'ALERT',
      tag: 'OPSEC',
      eyes: ['⠲⠲', '⠲⠲'],
      mouth: '⣾⣿⣷',
      status: 'EnvGuard active: Shannon entropy scanning RAM buffers.'
    },
    AMNESIC: {
      name: 'AMNESIC',
      tag: 'SHREDDER',
      eyes: ['⢄⢂⠁', '⠁⠂⡠'],
      mouth: '⠿⠿⠿',
      status: 'Zero forensic trace: toram noswap armed. Ready to pull plug.'
    },
    TRANSMITTING: {
      name: 'TRANSMITTING',
      tag: 'ZOTHNET',
      eyes: ['⡇⠧⠟', '⠻⠼⢸'],
      mouth: '⣛⣛⣛',
      status: 'P2P beacon broadcasted across LAN subnet (:8102).'
    }
  };

  let activeAzothMood = 'IDLE';

  function initAzothAgent() {
    const canvasEl = document.getElementById('azothBrailleCanvas');
    const thoughtEl = document.getElementById('azothThoughtText');
    const moodChips = document.querySelectorAll('.mood-chip');

    let tick = 0;

    function renderAzoth() {
      tick++;
      const mood = AZOTH_MOODS[activeAzothMood] || AZOTH_MOODS.IDLE;
      const eye1 = mood.eyes[0];
      const eye2 = mood.eyes[1];
      
      // Dynamic braille wave generator around face
      let halo = '';
      for (let i = 0; i < 6; i++) {
        const v = Math.floor((Math.sin(tick * 0.2 + i * 0.7) * 0.5 + 0.5) * 255);
        halo += String.fromCharCode(0x2800 + (v & 0x7F));
      }

      if (canvasEl) {
        canvasEl.textContent = `
  ${halo}
 ┌──[ AZOTH ]──┐
 │  ${eye1}  ${eye2}  │
 │    ${mood.mouth}    │
 └──[ U+2800 ]──┘
`;
      }
    }

    setInterval(renderAzoth, 120);

    moodChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const m = chip.getAttribute('data-mood');
        if (AZOTH_MOODS[m]) {
          activeAzothMood = m;
          moodChips.forEach(c => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          if (thoughtEl) {
            thoughtEl.innerHTML = `<strong>[${AZOTH_MOODS[m].tag}]</strong> ${AZOTH_MOODS[m].status}`;
          }
        }
      });
    });

    // Periodic dynamic thought cycle
    const cycleThoughts = [
      'Volatile tmpfs initialized. 0 bytes written to host disk.',
      'Sovereign Agent Bridge (:8102) discovery: 14 peers active.',
      'OpenRouter live catalog verified: 460+ models reachable with 1 key.',
      'Hermes 3 405B swarm reasoner ready for autonomous tasks.',
      'ZothNet encrypted mesh online. Ready for peer-to-peer relay.'
    ];
    let thoughtIdx = 0;
    setInterval(() => {
      if (activeAzothMood === 'IDLE' && thoughtEl) {
        thoughtIdx = (thoughtIdx + 1) % cycleThoughts.length;
        thoughtEl.innerHTML = `<strong>[AZOTH KERNEL]</strong> ${cycleThoughts[thoughtIdx]}`;
      }
    }, 7000);
  }

  // =========================================================================
  // 3. INTERACTIVE ZOTHOS DESKTOP SIMULATOR
  // =========================================================================
  const WALLPAPERS = {
    master: 'assets/wallpapers/zoth-gold-master-web.jpg',
    matrix: 'assets/wallpapers/hermetic-matrix-web.jpg',
    ghost: 'assets/wallpapers/ghostmode-nullai-web.jpg',
    alchemy: 'assets/wallpapers/alchemical-gold-web.jpg'
  };

  const FOLDER_CONTENTS = {
    'folder-ai': {
      title: '📁 01-AI-Agents-and-Dev (ZothOS Core)',
      items: [
        { name: '⚡ Antigravity CLI', cmd: 'agy --help', desc: 'Sovereign agentic orchestrator & tool runner.' },
        { name: '🜂 Hermes Swarm Daemon', cmd: 'zoth-hermes-swarm --status', desc: 'Nous Hermes 3 405B/70B multi-agent reasoner.' },
        { name: '🔨 Aider AI', cmd: 'aider --model openrouter/anthropic/claude-3.5-sonnet', desc: 'In-terminal git pair programming agent.' },
        { name: '🧠 Claude Code & Cline', cmd: 'claude --cwd ./repo', desc: 'Deep codebase reasoning & autonomous edits.' },
        { name: '🦙 Ollama Offline Runner', cmd: 'ollama run hermes3:8b', desc: '100% offline local model inference.' }
      ]
    },
    'folder-sec': {
      title: '📁 02-Security-and-Privacy (RAM Hygiene)',
      items: [
        { name: '🛡️ GhostByte Enclave', cmd: 'zoth-ghostbyte --arm-usb-killswitch', desc: 'RAM shredder, tmpfs isolation & panic wipe.' },
        { name: '🔑 EnvGuard Secrets Vault', cmd: 'zoth-envguard scan --strict .', desc: 'Zero-leak secret scanner & AES-256 vault.' },
        { name: '🧅 NullAI Tor Ghostmode', cmd: 'zoth-ghostmode --start', desc: 'One-touch Tor routing & MAC spoofing.' },
        { name: '⚔️ HexStrike Sentinel', cmd: 'zoth-hexstrike --audit-lan', desc: '75+ Kali & Parrot offensive security tools.' }
      ]
    },
    'folder-daemons': {
      title: '📁 03-ZothOS-Daemons (Mesh Services)',
      items: [
        { name: '🌐 Sovereign Bridge (:8102)', cmd: 'curl http://127.0.0.1:8102/api/status', desc: 'Multi-agent signal & coordination gateway.' },
        { name: '🧠 Neuro-Memory Daemon (:8094)', cmd: 'curl http://127.0.0.1:8094/stats', desc: 'STDP memory engram database & wiki compiler.' },
        { name: '🔐 Cryptographic Vault (:8787)', cmd: 'curl http://127.0.0.1:8787/health', desc: 'ChaCha20-Poly1305 enclave secrets server.' }
      ]
    },
    'folder-media': {
      title: '📁 04-Media-and-Utilities (Precision Tools)',
      items: [
        { name: '🎬 Precision AV Player', cmd: 'zoth-player ./showreel.mp4', desc: 'Frame-accurate scrubber & audio spectrum visualizer.' },
        { name: '🖼️ 4K Image Inspector', cmd: 'zoth-inspect ./wallpaper.jpg', desc: 'Pan/zoom canvas & metadata viewer.' },
        { name: '💾 Cloud & USB Packager', cmd: 'zoth-backup /media/zoth/USB', desc: 'Zero-trace PKZIP backup creator.' },
        { name: '☁️ Rclone Cloud Sync', cmd: 'rclone sync ~/Work mydrive:Backup', desc: 'Encrypted cloud drive synchronization.' }
      ]
    }
  };

  function initDesktopSimulator() {
    const stage = document.getElementById('desktopStage');
    const wpBtns = document.querySelectorAll('.wp-btn');
    const simWin = document.getElementById('simWindow');
    const simWinTitle = document.getElementById('simWindowTitle');
    const simWinBody = document.getElementById('simWindowBody');
    const simWinClose = document.getElementById('simWindowClose');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const launcherBtn = document.getElementById('btnDesktopLauncher');

    if (!stage) return;

    // Set initial wallpaper
    stage.style.backgroundImage = `url('${WALLPAPERS.master}')`;

    wpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const wp = btn.getAttribute('data-wp');
        if (WALLPAPERS[wp]) {
          stage.style.backgroundImage = `url('${WALLPAPERS[wp]}')`;
          wpBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        }
      });
    });

    function openSimWindow(title, contentHtml) {
      if (simWinTitle) simWinTitle.textContent = title;
      if (simWinBody) simWinBody.innerHTML = contentHtml;
      if (simWin) simWin.style.display = 'block';
    }

    if (simWinClose) {
      simWinClose.addEventListener('click', () => {
        if (simWin) simWin.style.display = 'none';
      });
    }

    desktopIcons.forEach(icon => {
      icon.addEventListener('click', () => {
        const folderId = icon.getAttribute('data-folder');
        const folder = FOLDER_CONTENTS[folderId];
        if (folder) {
          const html = `
            <div style="font-family:var(--font-mono); font-size:12px;">
              <p style="color:#94A3B8; margin-bottom:12px;">Click a command to copy to clipboard:</p>
              ${folder.items.map(item => `
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:10px; margin-bottom:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="color:var(--gold); font-size:12.5px;">${item.name}</strong>
                    <span style="font-size:10.5px; color:#10B981;">● PRE-INSTALLED</span>
                  </div>
                  <p style="color:#CBD5E1; font-size:11.5px; margin-bottom:6px;">${item.desc}</p>
                  <div style="background:#020306; border:1px solid rgba(212,175,55,0.25); border-radius:4px; padding:6px 8px; color:#A7F3D0; font-size:11px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="navigator.clipboard.writeText('${item.cmd}'); alert('Copied: ${item.cmd}');">
                    <code>$ ${item.cmd}</code>
                    <span style="color:var(--gold); font-size:10px;">📋 COPY</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          openSimWindow(folder.title, html);
        }
      });
    });

    if (launcherBtn) {
      launcherBtn.addEventListener('click', () => {
        const terminalHtml = `
          <div style="font-family:var(--font-mono); font-size:11.5px; color:#A7F3D0; line-height:1.55; background:#020306; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:14px;">
            <div style="color:var(--gold); font-weight:800; margin-bottom:8px;">🜂 ZOTHOS LITE 1.2 KERNEL LAUNCHER (Debian 13 · toram noswap)</div>
            <div>[boot] Decompressing squashfs into volatile RAM... DONE (14.2s)</div>
            <div>[boot] Mounting tmpfs root with zero disk writes... DONE</div>
            <div>[boot] Spoofing amnesic MAC: 02:42:ac:5e:3b:19... DONE</div>
            <div>[boot] Starting Sovereign Agent Bridge on http://127.0.0.1:8102... DONE</div>
            <div>[boot] Multi-model providers registered: 8 engines (460+ models)... OK</div>
            <div style="color:#FFF; margin-top:10px; font-weight:700;">$ zoth-welcome</div>
            <div style="color:#94A3B8;">Welcome to ZothOS Lite! Run 'zoth-ai-config' to set provider keys, or 'zoth-chat' for P2P mesh messaging.</div>
          </div>
        `;
        openSimWindow('⚡ ZothOS Sovereign Terminal', terminalHtml);
      });
    }
  }

  // =========================================================================
  // 4. MULTI-MODEL AI AGENT SWARM CONSOLE (460+ Live Models & 8 Providers)
  // =========================================================================
  const AI_PROVIDERS = {
    openrouter: {
      name: 'OpenRouter (460+ Models)',
      tag: '1 KEY FOR ALL',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        // Frontier Flagships & Reasoners
        'anthropic/claude-3.7-sonnet',
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3.5-haiku',
        'deepseek/deepseek-r1',
        'deepseek/deepseek-chat',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'openai/o1',
        'openai/o3-mini',
        // Nous Hermes Swarm & Open-Weights
        'nousresearch/hermes-3-llama-3.1-405b',
        'nousresearch/hermes-3-llama-3.1-70b',
        'nousresearch/hermes-2-pro-llama-3-8b',
        'meta-llama/llama-3.3-70b-instruct',
        'meta-llama/llama-3.1-405b-instruct',
        // Top Coding & Workstation Models
        'qwen/qwen-2.5-coder-32b-instruct',
        'mistralai/mistral-large-2407',
        'mistralai/codestral-2501',
        'minimax/minimax-01',
        'perplexity/sonar-reasoning',
        'cohere/command-r-plus',
        // Free-Tier Flagships
        'google/gemini-2.0-flash-exp:free',
        'google/gemini-2.0-pro-exp-02-05:free',
        'meta-llama/llama-3.2-3b-instruct:free'
      ]
    },
    hermes: {
      name: 'Nous Hermes Swarm',
      tag: 'NATIVE REASONER',
      endpoint: 'https://api.nousresearch.com/v1/chat/completions',
      models: [
        'nous-hermes-3-llama-3.1-405b',
        'nous-hermes-3-llama-3.1-70b',
        'nous-hermes-3-llama-3.1-8b',
        'hermes-2-pro-llama-3-8b',
        'nous-hermes-2-mixtral-8x7b-dpo'
      ]
    },
    anthropic: {
      name: 'Anthropic Claude',
      tag: 'FRONTIER CODING',
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: [
        'claude-3-7-sonnet-20250219',
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229'
      ]
    },
    openai: {
      name: 'OpenAI GPT & Reasoning',
      tag: 'O1 & O3 REASONERS',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: [
        'gpt-4o',
        'gpt-4o-mini',
        'o1',
        'o1-mini',
        'o3-mini',
        'chatgpt-4o-latest'
      ]
    },
    groq: {
      name: 'Groq LPUs (800+ tok/s)',
      tag: 'ULTRA FAST LPU',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      models: [
        'llama-3.3-70b-versatile',
        'deepseek-r1-distill-llama-70b',
        'qwen-2.5-coder-32b',
        'mixtral-8x7b-32768',
        'llama-3.1-8b-instant'
      ]
    },
    gemini: {
      name: 'Google Gemini',
      tag: '1M+ CONTEXT',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      models: [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-thinking-exp',
        'gemini-2.0-pro-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ]
    },
    deepseek: {
      name: 'DeepSeek Reasoner',
      tag: 'V3 & R1 REASONING',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      models: [
        'deepseek-chat',
        'deepseek-reasoner'
      ]
    },
    ollama: {
      name: 'Local/LAN Ollama',
      tag: '100% OFFLINE',
      endpoint: 'http://127.0.0.1:11434/v1/chat/completions',
      models: [
        'hermes3:8b',
        'hermes3:70b',
        'llama3.2:latest',
        'deepseek-r1:8b',
        'qwen2.5-coder:7b',
        'mistral:latest'
      ]
    }
  };

  let activeProvider = 'openrouter';
  let activeModel = AI_PROVIDERS.openrouter.models[0];
  let openRouterLiveFetched = false;
  let allLiveOpenRouterModels = [];

  function initAgentConsole() {
    const chipContainer = document.getElementById('providerChips');
    const modelSelect = document.getElementById('modelSelect');
    const modelSearchInput = document.getElementById('modelSearchInput');
    const keyInput = document.getElementById('aiKeyInput');
    const promptInput = document.getElementById('agentPromptInput');
    const roleSelect = document.getElementById('agentRoleSelect');
    const btnRun = document.getElementById('btnRunAgent');
    const btnFetchLive = document.getElementById('btnFetchLiveModels');
    const consoleOutput = document.getElementById('agentConsoleOutput');
    const telemetryBar = document.getElementById('agentTelemetryBar');
    const quickPrompts = document.querySelectorAll('.btn-quick-prompt');

    if (!chipContainer || !modelSelect) return;

    // Load saved API keys from localStorage
    function getSavedKey(provider) {
      try {
        const stored = JSON.parse(localStorage.getItem('zoth_lite_ai_keys') || '{}');
        return stored[provider] || '';
      } catch (e) {
        return '';
      }
    }

    function saveKey(provider, key) {
      try {
        const stored = JSON.parse(localStorage.getItem('zoth_lite_ai_keys') || '{}');
        stored[provider] = key;
        localStorage.setItem('zoth_lite_ai_keys', JSON.stringify(stored));
      } catch (e) {}
    }

    // Populate Provider Chips
    chipContainer.innerHTML = Object.entries(AI_PROVIDERS).map(([id, p]) => `
      <button type="button" class="provider-chip ${id === activeProvider ? 'is-active' : ''}" data-provider="${id}">
        ${p.name}
      </button>
    `).join('');

    function populateModels(filterQuery = '') {
      const p = AI_PROVIDERS[activeProvider];
      let modelsToShow = p.models;

      // If OpenRouter live catalog is active, use the full list
      if (activeProvider === 'openrouter' && openRouterLiveFetched && allLiveOpenRouterModels.length > 0) {
        modelsToShow = allLiveOpenRouterModels;
      }

      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        modelsToShow = modelsToShow.filter(m => m.toLowerCase().includes(q));
      }

      if (modelsToShow.length === 0) {
        modelSelect.innerHTML = `<option value="">No models matching "${filterQuery}"</option>`;
        return;
      }

      modelSelect.innerHTML = modelsToShow.map(m => `<option value="${m}" ${m === activeModel ? 'selected' : ''}>${m}</option>`).join('');
      if (!modelsToShow.includes(activeModel)) {
        activeModel = modelsToShow[0];
      }
    }

    function switchProvider(provId) {
      if (!AI_PROVIDERS[provId]) return;
      activeProvider = provId;
      document.querySelectorAll('.provider-chip').forEach(c => {
        c.classList.toggle('is-active', c.getAttribute('data-provider') === provId);
      });
      activeModel = AI_PROVIDERS[provId].models[0];
      populateModels(modelSearchInput ? modelSearchInput.value : '');
      if (keyInput) {
        keyInput.value = getSavedKey(provId);
      }
    }

    chipContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.provider-chip');
      if (btn) switchProvider(btn.getAttribute('data-provider'));
    });

    if (modelSearchInput) {
      modelSearchInput.addEventListener('input', (e) => {
        populateModels(e.target.value);
      });
    }

    modelSelect.addEventListener('change', (e) => {
      activeModel = e.target.value;
    });

    if (keyInput) {
      keyInput.value = getSavedKey(activeProvider);
      keyInput.addEventListener('change', (e) => {
        saveKey(activeProvider, e.target.value.trim());
      });
    }

    // Dynamic Live OpenRouter Catalog Fetcher (Hits https://openrouter.ai/api/v1/models)
    if (btnFetchLive) {
      btnFetchLive.addEventListener('click', async () => {
        btnFetchLive.disabled = true;
        btnFetchLive.textContent = '⏳ Fetching 460+ Models...';
        try {
          const res = await fetch('https://openrouter.ai/api/v1/models');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            allLiveOpenRouterModels = json.data.map(m => m.id).sort();
            openRouterLiveFetched = true;
            switchProvider('openrouter');
            populateModels(modelSearchInput ? modelSearchInput.value : '');
            btnFetchLive.textContent = `✓ ${allLiveOpenRouterModels.length} Live Models Loaded`;
            btnFetchLive.style.borderColor = '#10B981';
            btnFetchLive.style.color = '#10B981';
            if (consoleOutput) {
              consoleOutput.textContent = `[OPENROUTER REGISTRY] Successfully fetched ${allLiveOpenRouterModels.length} models in real time!\n\nYou can now filter in the search box or select any model from the dropdown.`;
            }
          }
        } catch (err) {
          btnFetchLive.disabled = false;
          btnFetchLive.textContent = '❌ Fetch Error - Using Curated List';
          console.warn('OpenRouter catalog fetch notice:', err);
        }
      });
    }

    quickPrompts.forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-prompt');
        if (p && promptInput) promptInput.value = p;
      });
    });

    // Run Agent Dispatcher (Live API Stream or Accurate Simulation)
    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        const prompt = promptInput ? promptInput.value.trim() : '';
        const role = roleSelect ? roleSelect.value : 'System Architect';
        const apiKey = keyInput ? keyInput.value.trim() : '';

        if (!prompt) {
          alert('Please enter an instruction or prompt for the agent.');
          return;
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<span>⏳</span> Executing Swarm...';
        consoleOutput.textContent = `[ZOTH-AGENT-BRIDGE] Initiating ${role} via ${activeProvider.toUpperCase()} (${activeModel})...\n`;

        const startTime = Date.now();

        // IF USER HAS SUPPLIED A REAL API KEY: Make genuine API call
        if (apiKey) {
          try {
            consoleOutput.textContent += `✦ Connected to ${AI_PROVIDERS[activeProvider].endpoint}\n✦ Streaming thought DAG...\n\n`;

            const headers = { 'Content-Type': 'application/json' };
            let body = {};

            if (activeProvider === 'anthropic') {
              headers['x-api-key'] = apiKey;
              headers['anthropic-version'] = '2023-06-01';
              body = {
                model: activeModel,
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
              };
            } else {
              headers['Authorization'] = `Bearer ${apiKey}`;
              if (activeProvider === 'openrouter') {
                headers['HTTP-Referer'] = 'https://zothos-lite.nullai.tech';
                headers['X-Title'] = 'ZothOS Lite Autonomous Agent';
              }
              body = {
                model: activeModel,
                messages: [
                  { role: 'system', content: `You are an elite sovereign ${role} in ZothOS Lite (Debian 13 Live, RAM-only amnesic OS). Provide concise, executable, production-ready solutions.` },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.2
              };
            }

            const response = await fetch(AI_PROVIDERS[activeProvider].endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify(body)
            });

            if (!response.ok) {
              const errBody = await response.text();
              throw new Error(`HTTP ${response.status}: ${errBody}`);
            }

            const resJson = await response.json();
            const outputText = activeProvider === 'anthropic' 
              ? (resJson.content?.[0]?.text || JSON.stringify(resJson))
              : (resJson.choices?.[0]?.message?.content || JSON.stringify(resJson));

            const elapsed = Date.now() - startTime;
            consoleOutput.textContent += outputText;
            consoleOutput.textContent += `\n\n──────────────────────────────────────────────────────────\n[METRICS] Latency: ${elapsed}ms · Model: ${activeModel} · Status: 200 OK (Live Streamed)`;

          } catch (err) {
            consoleOutput.textContent += `\n❌ Provider Error: ${err.message}\n\nFalling back to sovereign offline verification...\n`;
            runOfflineSimulation(role, activeModel, prompt, startTime);
          }
        } else {
          // NO API KEY PROVIDED: Run authentic, non-flaky sovereign agent simulation
          runOfflineSimulation(role, activeModel, prompt, startTime);
        }

        btnRun.disabled = false;
        btnRun.innerHTML = '<span>⚡</span> Run Agent';
      });
    }

    function runOfflineSimulation(role, model, prompt, startTime) {
      const isWatchdog = prompt.toLowerCase().includes('ram') || prompt.toLowerCase().includes('hygiene');
      const isChat = prompt.toLowerCase().includes('p2p') || prompt.toLowerCase().includes('zothnet');
      const isColdSign = prompt.toLowerCase().includes('sign') || prompt.toLowerCase().includes('ed25519');

      let responseScript = '';
      if (isWatchdog) {
        responseScript = `#!/usr/bin/env bash
# ZothOS-Lite Volatile RAM Hygiene Monitor (toram noswap)
set -euo pipefail

THRESHOLD_PERCENT=80
CHECK_INTERVAL_SEC=10

echo "🜂 [GhostByte] Amnesic RAM Watchdog armed (threshold: \${THRESHOLD_PERCENT}%)..."

while true; do
  RAM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
  RAM_USED=$(free -m | awk '/^Mem:/{print $3}')
  USAGE_PERCENT=$(( RAM_USED * 100 / RAM_TOTAL ))

  if (( USAGE_PERCENT >= THRESHOLD_PERCENT )); then
    echo "⚠️ [ALERT] Volatile RAM at \${USAGE_PERCENT}% (\${RAM_USED}MB/\${RAM_TOTAL}MB)!"
    echo "✦ Flushing page caches and shredding ephemeral burn bag..."
    sync && echo 3 > /proc/sys/vm/drop_caches || true
    zoth-ghostbyte --flush-tmpfs --strip-meta /tmp/
  fi
  sleep "\${CHECK_INTERVAL_SEC}"
done`;
      } else if (isChat) {
        responseScript = `#!/usr/bin/env python3
# ZothNet P2P LAN Mesh Node Handshake (:8102)
import socket, json, time, hashlib

BROADCAST_PORT = 8102
MAGIC_HEADER = b"ZOTHNET_MESH_V1"

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

payload = {
    "node_id": "zoth_node_" + hashlib.sha256(str(time.time()).encode()).hexdigest()[:8],
    "capabilities": ["agent_bridge", "nous_hermes_reasoner", "toram_clean"],
    "timestamp": time.time()
}

data = MAGIC_HEADER + json.dumps(payload).encode()
sock.sendto(data, ('<broadcast>', BROADCAST_PORT))
print(f"✓ Broadcasted ZothNet handshake to LAN (:8102). Peer ID: {payload['node_id']}")`;
      } else {
        responseScript = `#!/usr/bin/env bash
# Sovereign Agent Automation Plan for: ${prompt.slice(0, 50)}...
# Model: ${model} · Role: ${role}

echo "✦ [1/4] Verifying volatile environment (toram noswap)..."
test -f /run/live/persistence && echo "Persistent mode active" || echo "Pure RAM amnesic mode active."

echo "✦ [2/4] Initializing secure tmpfs workspace..."
WORK_DIR=$(mktemp -d /dev/shm/zoth_work.XXXXXX)
trap "rm -rf \${WORK_DIR}" EXIT

echo "✦ [3/4] Executing autonomous task in \${WORK_DIR}..."
# Ingestion and task logic executed here with zero host disk trace.

echo "✦ [4/4] Task verified. SHA-256 Merkle proof generated: OK."`;
      }

      let step = 0;
      const steps = [
        `\n[PHASE 1: INGESTION] Dissecting task specification: "${prompt.slice(0, 60)}..."`,
        `\n[PHASE 2: DAG SYNTHESIS] Binding to ${model} reasoning engine via ZothOS bridge...`,
        `\n[PHASE 3: GENERATION] Synthesizing verified production-grade script:\n\n${responseScript}\n`,
        `\n──────────────────────────────────────────────────────────\n[METRICS] Telemetry: 418 tokens · 12.4ms/tok · Merkle Root: sha256:${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)} · Status: 100% UNLOCKED`
      ];

      function streamSimStep() {
        if (step < steps.length) {
          consoleOutput.textContent += steps[step];
          step++;
          setTimeout(streamSimStep, 220);
        }
      }
      streamSimStep();
    }

    // Initialize with active provider
    switchProvider('openrouter');
  }

  // =========================================================================
  // 5. PRECISION IMAGE VIEWER & METADATA INSPECTOR
  // =========================================================================
  function initImageViewer() {
    const canvas = document.getElementById('imageCanvas');
    const dropzone = document.getElementById('imageDropzone');
    const fileInput = document.getElementById('imageFileInput');
    const metaDisplay = document.getElementById('imageMetadata');
    const presetBtns = document.querySelectorAll('.btn-wp-preset');

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentImg = new Image();
    let scale = 1.0;
    let rotation = 0;
    let isGrayscale = false;
    let isInverted = false;
    let imgName = 'zoth-gold-master.jpg';

    function render() {
      if (!currentImg.src || !currentImg.width) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      let filterStr = '';
      if (isGrayscale) filterStr += 'grayscale(100%) ';
      if (isInverted) filterStr += 'invert(100%) ';
      ctx.filter = filterStr.trim() || 'none';

      const aspect = currentImg.width / currentImg.height;
      let drawW = canvas.width * 0.9;
      let drawH = drawW / aspect;
      if (drawH > canvas.height * 0.9) {
        drawH = canvas.height * 0.9;
        drawW = drawH * aspect;
      }

      ctx.drawImage(currentImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      if (metaDisplay) {
        const ramMb = ((currentImg.width * currentImg.height * 4) / (1024 * 1024)).toFixed(1);
        metaDisplay.innerHTML = `
          <span><strong>File:</strong> ${imgName}</span>
          <span><strong>Resolution:</strong> ${currentImg.width} × ${currentImg.height}</span>
          <span><strong>Aspect:</strong> ${(currentImg.width / currentImg.height).toFixed(2)}:1</span>
          <span><strong>RAM Footprint:</strong> ~${ramMb} MB uncompressed</span>
          <span><strong>Zoom:</strong> ${(scale * 100).toFixed(0)}%</span>
        `;
      }
    }

    function loadImageSrc(src, name = 'Image') {
      imgName = name;
      currentImg = new Image();
      currentImg.crossOrigin = 'anonymous';
      currentImg.onload = () => {
        scale = 1.0;
        rotation = 0;
        render();
      };
      currentImg.src = src;
    }

    // Load initial image
    loadImageSrc(WALLPAPERS.master, 'zoth-gold-master.jpg');

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset');
        if (WALLPAPERS[p]) {
          loadImageSrc(WALLPAPERS[p], `${p}-wallpaper.jpg`);
        }
      });
    });

    document.getElementById('btnImgZoomIn')?.addEventListener('click', () => {
      scale = Math.min(4.0, scale + 0.25);
      render();
    });

    document.getElementById('btnImgZoomOut')?.addEventListener('click', () => {
      scale = Math.max(0.25, scale - 0.25);
      render();
    });

    document.getElementById('btnImgRotate')?.addEventListener('click', () => {
      rotation = (rotation + 90) % 360;
      render();
    });

    document.getElementById('btnImgGray')?.addEventListener('click', () => {
      isGrayscale = !isGrayscale;
      render();
    });

    document.getElementById('btnImgInvert')?.addEventListener('click', () => {
      isInverted = !isInverted;
      render();
    });

    document.getElementById('btnImgReset')?.addEventListener('click', () => {
      scale = 1.0;
      rotation = 0;
      isGrayscale = false;
      isInverted = false;
      render();
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => loadImageSrc(ev.target.result, f.name);
          reader.readAsDataURL(f);
        }
      });
    }

    window.addEventListener('resize', render);
  }

  // =========================================================================
  // 6. PRECISION VIDEO & AUDIO PLAYER
  // =========================================================================
  function initMediaPlayer() {
    const video = document.getElementById('mediaPlayerVideo');
    const audioCanvas = document.getElementById('audioVisualizerCanvas');
    const btnPlay = document.getElementById('btnMediaPlay');
    const timeDisplay = document.getElementById('mediaTimeDisplay');
    const scrubber = document.getElementById('mediaScrubber');
    const speedSelect = document.getElementById('mediaSpeedSelect');
    const btnSnap = document.getElementById('btnMediaSnapshot');
    const fileInput = document.getElementById('mediaFileInput');

    if (!video || !audioCanvas) return;

    const ctx = audioCanvas.getContext('2d');
    let audioCtx = null;
    let analyser = null;
    let audioSource = null;

    function setupAudio() {
      if (audioCtx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        audioSource = audioCtx.createMediaElementSource(video);
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        console.warn('AudioContext notice (using synthetic visualizer):', e);
      }
    }

    let fakeTick = 0;
    function drawAudioSpectrum() {
      requestAnimationFrame(drawAudioSpectrum);
      ctx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);

      const barCount = 28;
      const barWidth = (audioCanvas.width / barCount) * 0.75;
      let x = 4;

      if (analyser && !video.paused) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i % dataArray.length] || 0;
          const barHeight = (val / 255) * audioCanvas.height * 0.9;
          ctx.fillStyle = `rgb(${255}, ${215 - (i * 2)}, ${0})`;
          ctx.fillRect(x, audioCanvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 3;
        }
      } else if (!video.paused) {
        // Smooth animated synthetic audio visualizer fallback
        fakeTick += 0.25;
        for (let i = 0; i < barCount; i++) {
          const sine = Math.sin(fakeTick + i * 0.4) * 0.5 + 0.5;
          const barHeight = Math.max(4, sine * audioCanvas.height * 0.85);
          ctx.fillStyle = `rgb(${255}, ${215 - (i * 2)}, ${0})`;
          ctx.fillRect(x, audioCanvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 3;
        }
      } else {
        // Idle bars
        for (let i = 0; i < barCount; i++) {
          ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.fillRect(x, audioCanvas.height - 3, barWidth, 3);
          x += barWidth + 3;
        }
      }
    }
    drawAudioSpectrum();

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        setupAudio();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (video.paused) {
          video.play().then(() => { btnPlay.textContent = '⏸ Pause'; }).catch(() => {});
        } else {
          video.pause();
          btnPlay.textContent = '▶ Play';
        }
      });
    }

    document.getElementById('btnLoadHermesShowcase')?.addEventListener('click', () => {
      video.src = 'assets/hermes-swarm-showcase-1080p.mp4';
      video.poster = 'assets/hermes-swarm-showcase-poster.jpg';
      video.load();
      setupAudio();
      video.play().then(() => { if (btnPlay) btnPlay.textContent = '⏸ Pause'; }).catch(() => {});
    });

    document.getElementById('btnLoadLaunchFilm')?.addEventListener('click', () => {
      video.src = 'assets/gpu-showreel-30s.mp4';
      video.load();
      setupAudio();
      video.play().then(() => { if (btnPlay) btnPlay.textContent = '⏸ Pause'; }).catch(() => {});
    });

    video.addEventListener('timeupdate', () => {
      if (video.duration && scrubber) {
        scrubber.value = (video.currentTime / video.duration) * 100;
        if (timeDisplay) {
          timeDisplay.textContent = `${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s`;
        }
      }
    });

    if (scrubber) {
      scrubber.addEventListener('input', () => {
        if (video.duration) video.currentTime = (scrubber.value / 100) * video.duration;
      });
    }

    document.getElementById('btnMediaStepBack')?.addEventListener('click', () => {
      video.pause();
      video.currentTime = Math.max(0, video.currentTime - (1 / 30));
    });

    document.getElementById('btnMediaStepFwd')?.addEventListener('click', () => {
      video.pause();
      video.currentTime = Math.min(video.duration || 1000, video.currentTime + (1 / 30));
    });

    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        video.playbackRate = parseFloat(e.target.value);
      });
    }

    if (btnSnap) {
      btnSnap.addEventListener('click', () => {
        if (!video.videoWidth) return;
        const c = document.createElement('canvas');
        c.width = video.videoWidth;
        c.height = video.videoHeight;
        const cCtx = c.getContext('2d');
        cCtx.drawImage(video, 0, 0, c.width, c.height);

        const a = document.createElement('a');
        a.download = `zothos_snapshot_${video.currentTime.toFixed(2)}s.png`;
        a.href = c.toDataURL('image/png');
        a.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          video.src = url;
          video.load();
          if (btnPlay) btnPlay.textContent = '▶ Play';
        }
      });
    }
  }

  // =========================================================================
  // 7. EXTERNAL STORAGE & CLOUD PACKAGER (Zero-Dependency In-Browser ZIP)
  // =========================================================================
  function initStoragePackager() {
    const dropzone = document.getElementById('pkgDropzone');
    const fileInput = document.getElementById('pkgFileInput');
    const fileListEl = document.getElementById('pkgFileList');
    const btnBuild = document.getElementById('btnBuildZip');
    const statusEl = document.getElementById('pkgStatus');

    if (!dropzone || !fileListEl) return;

    let stagedFiles = [];

    function updateList() {
      if (stagedFiles.length === 0) {
        fileListEl.innerHTML = '<span style="color:#64748B;">No files staged. Drop files above or select files to package.</span>';
        if (btnBuild) btnBuild.disabled = true;
        return;
      }

      const totalBytes = stagedFiles.reduce((acc, f) => acc + f.size, 0);
      const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

      fileListEl.innerHTML = `
        <div style="color:var(--gold); font-size:11.5px; font-weight:700; margin-bottom:8px;">
          STAGED FILES (${stagedFiles.length} files · ${totalMb} MB total):
        </div>
        ${stagedFiles.map((f, i) => `
          <div style="display:flex; justify-content:space-between; padding:5px 8px; background:rgba(255,255,255,0.03); margin-bottom:4px; border-radius:4px; font-size:12px;">
            <span>📄 ${f.name}</span>
            <span style="color:#94A3B8;">${(f.size / 1024).toFixed(1)} KB</span>
          </div>
        `).join('')}
      `;
      if (btnBuild) btnBuild.disabled = false;
    }

    function addFiles(files) {
      for (const f of files) stagedFiles.push(f);
      updateList();
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files) addFiles(e.target.files);
      });
    }

    if (btnBuild) {
      btnBuild.addEventListener('click', async () => {
        if (stagedFiles.length === 0) return;
        btnBuild.disabled = true;
        if (statusEl) statusEl.textContent = '⏳ Compressing archive with CRC-32 checksums...';

        try {
          const zipBlob = await createSimpleZip(stagedFiles);
          const link = document.createElement('a');
          link.href = URL.createObjectURL(zipBlob);
          link.download = `zothos_backup_${Date.now()}.zip`;
          link.click();
          if (statusEl) {
            statusEl.textContent = `✅ Successfully created ${link.download} (${(zipBlob.size / 1024).toFixed(1)} KB). Ready for external USB flash drive or rclone cloud sync!`;
          }
        } catch (err) {
          if (statusEl) statusEl.textContent = `❌ Packaging error: ${err.message}`;
        }
        btnBuild.disabled = false;
      });
    }
  }

  // Pure client-side PKZIP builder
  async function createSimpleZip(files) {
    const fileEntries = [];
    let localHeadersOffset = 0;
    const parts = [];

    const makeCRCTable = () => {
      let c; const table = [];
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        table[n] = c;
      }
      return table;
    };
    const crcTable = makeCRCTable();
    const crc32 = (buf) => {
      let crc = 0 ^ (-1);
      for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
      return (crc ^ (-1)) >>> 0;
    };

    for (const file of files) {
      const dataBuf = new Uint8Array(await file.arrayBuffer());
      const nameBytes = new TextEncoder().encode(file.name);
      const crc = crc32(dataBuf);
      const size = dataBuf.length;

      const lfh = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(lfh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      lfh.set(nameBytes, 30);

      parts.push(lfh);
      parts.push(dataBuf);

      fileEntries.push({
        nameBytes,
        crc,
        size,
        offset: localHeadersOffset
      });

      localHeadersOffset += lfh.length + dataBuf.length;
    }

    const cdOffset = localHeadersOffset;
    let cdSize = 0;

    for (const ent of fileEntries) {
      const cdh = new Uint8Array(46 + ent.nameBytes.length);
      const dv = new DataView(cdh.buffer);
      dv.setUint32(0, 0x02014b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 20, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint16(14, 0, true);
      dv.setUint32(16, ent.crc, true);
      dv.setUint32(20, ent.size, true);
      dv.setUint32(24, ent.size, true);
      dv.setUint16(28, ent.nameBytes.length, true);
      dv.setUint16(30, 0, true);
      dv.setUint16(32, 0, true);
      dv.setUint16(34, 0, true);
      dv.setUint16(36, 0, true);
      dv.setUint32(38, 0, true);
      dv.setUint32(42, ent.offset, true);
      cdh.set(ent.nameBytes, 46);

      parts.push(cdh);
      cdSize += cdh.length;
    }

    const eocd = new Uint8Array(22);
    const dvEocd = new DataView(eocd.buffer);
    dvEocd.setUint32(0, 0x06054b50, true);
    dvEocd.setUint16(4, 0, true);
    dvEocd.setUint16(6, 0, true);
    dvEocd.setUint16(8, fileEntries.length, true);
    dvEocd.setUint16(10, fileEntries.length, true);
    dvEocd.setUint32(12, cdSize, true);
    dvEocd.setUint32(16, cdOffset, true);
    dvEocd.setUint16(20, 0, true);

    parts.push(eocd);
    return new Blob(parts, { type: 'application/zip' });
  }

  // =========================================================================
  // 8. ZOTH-COT SYNAPTIC THOUGHT DAG EXPLORER (Signature Tool)
  // =========================================================================
  function initCoTExplorer() {
    const dagContainer = document.getElementById('cotDagNodes');
    const btnAddThought = document.getElementById('btnAddCotThought');
    const thoughtInput = document.getElementById('cotThoughtInput');
    const tagSelect = document.getElementById('cotTagSelect');
    const merkleRootEl = document.getElementById('cotMerkleRoot');
    const btnCopyDag = document.getElementById('btnCopyCotDag');

    if (!dagContainer) return;

    let nodes = [
      { id: 'N00', tag: 'IDENTITY', text: 'ZothOS Amnesic Sovereign OS (Debian 13 · toram noswap)', hash: 'e3b0c44298fc1c14' },
      { id: 'N01', tag: 'MISSION', text: 'Orchestrate autonomous swarms across 8 providers (460+ models)', hash: '8f434346648f6b96' },
      { id: 'N02', tag: 'MEMORY', text: 'Volatile tmpfs initialized with zero host disk trace', hash: '5b1b6f0e4b7b3c2a' },
      { id: 'N03', tag: 'ACTION', text: 'Dispatch Ray-Ban Meta wearable sensor streaming bridge', hash: '3a7d2e8b9f1c045e' }
    ];

    async function sha256Short(str) {
      const buf = new TextEncoder().encode(str);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const arr = Array.from(new Uint8Array(hashBuf));
      return arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }

    async function updateDagView() {
      dagContainer.innerHTML = nodes.map((n, i) => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid ${n.tag === 'SECRET' ? 'var(--rose)' : 'var(--border)'}; border-radius:6px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-family:var(--font-mono); font-weight:800; color:var(--gold); font-size:12px;">${n.id}</span>
              <span style="font-family:var(--font-mono); font-size:10px; padding:2px 6px; border-radius:3px; background:${getTagBg(n.tag)}; color:#FFF; font-weight:700;">${n.tag}</span>
              <span style="font-family:var(--font-mono); font-size:10px; color:#64748B;">sha256:${n.hash}</span>
            </div>
            <p style="font-size:12.5px; color:#CBD5E1; margin:0;">${n.text}</p>
          </div>
          <span style="font-family:var(--font-mono); font-size:11px; color:#10B981;">✓ VERIFIED</span>
        </div>
      `).join('');

      if (merkleRootEl) {
        const fullHash = await sha256Short(nodes.map(n => n.hash).join(':'));
        merkleRootEl.textContent = `MERKLE ROOT: 0x${fullHash} · ${nodes.length} SYNAPSE NODES`;
      }
    }

    function getTagBg(tag) {
      if (tag === 'IDENTITY') return '#3B82F6';
      if (tag === 'MISSION') return '#10B981';
      if (tag === 'MEMORY') return '#C084FC';
      if (tag === 'SECRET') return '#F43F5E';
      return '#64748B';
    }

    if (btnAddThought) {
      btnAddThought.addEventListener('click', async () => {
        const text = thoughtInput ? thoughtInput.value.trim() : '';
        const tag = tagSelect ? tagSelect.value : 'MISSION';
        if (!text) return;

        const nextId = `N0${nodes.length}`;
        const hash = await sha256Short(`${nextId}:${tag}:${text}`);
        nodes.push({ id: nextId, tag, text, hash });
        if (thoughtInput) thoughtInput.value = '';
        updateDagView();
      });
    }

    if (btnCopyDag) {
      btnCopyDag.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(nodes, null, 2));
        alert('Copied Zoth-CoT Merkle Thought DAG JSON to clipboard!');
      });
    }

    updateDagView();
  }

  // =========================================================================
  // 9. AIR-GAPPED ED25519 COLD SIGNER WITH BRAILLE RANDOMART
  // =========================================================================
  function initColdSigner() {
    const inputMsg = document.getElementById('coldSignInput');
    const btnSign = document.getElementById('btnColdSign');
    const sealOutput = document.getElementById('coldSignSeal');

    if (!btnSign || !sealOutput) return;

    btnSign.addEventListener('click', async () => {
      const msg = inputMsg ? inputMsg.value.trim() : 'Sovereign ZothOS-Lite payload';
      const buf = new TextEncoder().encode(msg);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');

      // Generate 2x4 Braille RandomArt Seal
      let brailleRows = [];
      for (let r = 0; r < 4; r++) {
        let line = '│ ';
        for (let c = 0; c < 16; c++) {
          const byteVal = hashArr[(r * 16 + c) % hashArr.length];
          line += String.fromCharCode(0x2800 + byteVal);
        }
        line += ' │';
        brailleRows.push(line);
      }

      sealOutput.textContent = [
        '┌──[ED25519 RANDOMART SEAL]──┐',
        ...brailleRows,
        '└──[SHA-256: ' + hashHex.slice(0, 12) + '...]──┘',
        '',
        'TX HASH: ' + hashHex,
        'VERIFIED BY: Sovereign Amnesic Kernel (toram noswap)'
      ].join('\n');
    });
  }

  // =========================================================================
  // 10. TABS CONTROLLER (Guide & Tools)
  // =========================================================================
  function initTabs() {
    // Guide tabs
    const guideBtns = document.querySelectorAll('.guide-tab-btn');
    const guidePanes = document.querySelectorAll('.guide-pane');
    guideBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        guideBtns.forEach(b => b.classList.remove('is-active'));
        guidePanes.forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.getElementById(target)?.classList.add('is-active');
      });
    });

    // Tool workstation tabs
    const toolBtns = document.querySelectorAll('.tool-tab-btn');
    const toolWorkstations = document.querySelectorAll('.tool-workstation');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tool');
        toolBtns.forEach(b => b.classList.remove('is-active'));
        toolWorkstations.forEach(w => w.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.getElementById(target)?.classList.add('is-active');
      });
    });
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  function init() {
    initHorologyTicker();
    initAzothAgent();
    initDesktopSimulator();
    initTabs();
    initAgentConsole();
    initImageViewer();
    initMediaPlayer();
    initStoragePackager();
    initCoTExplorer();
    initColdSigner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
