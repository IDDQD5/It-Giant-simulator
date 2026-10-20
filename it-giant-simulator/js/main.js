/**
 * IT Giant Simulator — Bootstrap / Main Entry Point
 * Initializes all systems in the correct order and starts the game loop.
 */

(function () {
  'use strict';

  // ─── BOOT SEQUENCE ────────────────────────────────────────────────────────

  window.addEventListener('load', function () {
    try {
      boot();
    } catch (err) {
      console.error('[ITG] Fatal boot error:', err);
      document.getElementById('loading-screen').innerHTML =
        `<div style="color:#ff4455;font-family:monospace;padding:40px;text-align:center">
          <div style="font-size:48px">⚠️</div>
          <div style="font-size:20px;margin:16px 0">Boot Failed</div>
          <div style="font-size:14px;color:#888">${err.message}</div>
          <div style="font-size:12px;color:#555;margin-top:8px">Check browser console for details</div>
        </div>`;
    }
  });

  function boot() {
    const loading = document.getElementById('loading-screen');
    const app = document.getElementById('app');

    setLoadingStatus('Initializing event system...');
    assertExists('ITG.EventBus', window.ITG && window.ITG.EventBus);

    setLoadingStatus('Loading component database...');
    assertExists('ITG.Data', window.ITG && window.ITG.Data);
    assertExists('ITG.Data.components', ITG.Data.components && ITG.Data.components.length > 0);

    setLoadingStatus('Starting game engine...');
    assertExists('ITG.GameState', window.ITG && window.ITG.GameState);
    assertExists('ITG.Calculator', window.ITG && window.ITG.Calculator);
    assertExists('ITG.Market', window.ITG && window.ITG.Market);

    setLoadingStatus('Booting UI systems...');
    assertExists('ITG.UI', window.ITG && window.ITG.UI);

    setLoadingStatus('Loading 3D editor...');
    assertExists('ITG.Editor', window.ITG && window.ITG.Editor);

    // ── Wire up global events ──────────────────────────────────────────────

    // Week advance button
    const btnAdvance = document.getElementById('btn-advance');
    if (btnAdvance) {
      btnAdvance.addEventListener('click', function () {
        if (!ITG.GameState.meta.paused) {
          ITG.GameState.advance();
        }
      });
    }

    // Pause button
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('click', function () {
        ITG.GameState.meta.paused = !ITG.GameState.meta.paused;
        btnPause.textContent = ITG.GameState.meta.paused ? '▶' : '⏸';
        btnPause.title = ITG.GameState.meta.paused ? 'Resume' : 'Pause';
      });
    }

    // Speed button (cycles 1x → 2x → 3x)
    const btnSpeed = document.getElementById('btn-speed');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', function () {
        const speeds = [1, 2, 3];
        const cur = ITG.GameState.meta.speed;
        ITG.GameState.meta.speed = speeds[(speeds.indexOf(cur) + 1) % speeds.length];
        btnSpeed.textContent = ITG.GameState.meta.speed + 'x';
        startAutoAdvance();
      });
    }

    // Sidebar navigation
    document.querySelectorAll('#sidebar .nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        const screen = this.getAttribute('data-screen');
        if (screen) ITG.UI.showScreen(screen);
      });
    });

    // Editor close button
    const editorCloseBtn = document.getElementById('editor-close-btn');
    if (editorCloseBtn) {
      editorCloseBtn.addEventListener('click', function () {
        ITG.Editor.close();
      });
    }

    // EventBus listeners
    ITG.EventBus.on('editor:open', function (opts) {
      ITG.Editor.open(opts);
    });

    ITG.EventBus.on('editor:save', function (data) {
      if (data && data.device) {
        ITG.GameState.addProduct(data.device);
        ITG.UI.showToast('✅ Device design saved! Go to Products to launch it.', 'success');
        ITG.UI.refreshAll();
      }
    });

    ITG.EventBus.on('week:advance', function (data) {
      updateHUD();
      ITG.UI.refreshAll();
    });

    ITG.EventBus.on('toast:show', function (data) {
      ITG.UI.showToast(data.message, data.type || 'info');
    });

    ITG.EventBus.on('screen:change', function (data) {
      ITG.UI.showScreen(data.screen);
    });

    // ── Try to load saved game ─────────────────────────────────────────────
    setLoadingStatus('Loading saved game...');
    const loaded = ITG.GameState.load();
    if (!loaded) {
      setLoadingStatus('Starting new game...');
      ITG.Market.init(ITG.GameState);
    }

    // ── Initialize UI ──────────────────────────────────────────────────────
    setLoadingStatus('Rendering interface...');
    ITG.UI.init();
    updateHUD();

    // ── Show app ───────────────────────────────────────────────────────────
    setTimeout(function () {
      loading.style.opacity = '0';
      loading.style.transition = 'opacity 0.5s ease';
      setTimeout(function () {
        loading.style.display = 'none';
        app.style.display = 'flex';
        app.style.opacity = '0';
        app.style.transition = 'opacity 0.5s ease';
        setTimeout(function () { app.style.opacity = '1'; }, 10);

        ITG.UI.showScreen('dashboard');
        ITG.UI.showToast('🚀 Welcome to IT Giant Simulator! Start by designing your first PC in Products.', 'info');
      }, 500);
    }, 800);

    // ── Auto-advance loop (for 2x/3x speed) ───────────────────────────────
    startAutoAdvance();
  }

  // ─── AUTO-ADVANCE LOOP ───────────────────────────────────────────────────

  let autoAdvanceTimer = null;

  function startAutoAdvance() {
    if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);

    const INTERVAL_MS = {
      1: null,      // manual only
      2: 8000,      // 8 seconds per week
      3: 3000,      // 3 seconds per week
    };

    const ms = INTERVAL_MS[ITG.GameState.meta.speed];
    if (ms) {
      autoAdvanceTimer = setInterval(function () {
        if (!ITG.GameState.meta.paused) {
          ITG.GameState.advance();
        }
      }, ms);
    }
  }

  // ─── HUD UPDATE ──────────────────────────────────────────────────────────

  function updateHUD() {
    const gs = ITG.GameState;
    const hudTime = document.getElementById('hud-time');
    const hudMoney = document.getElementById('hud-money');
    const hudRep = document.getElementById('hud-rep');
    const hudCompany = document.getElementById('hud-company');

    if (hudTime) hudTime.textContent = gs.getWeekLabel ? gs.getWeekLabel() : `Year ${gs.meta.year}, Week ${gs.meta.week}`;
    if (hudMoney) hudMoney.textContent = formatMoney(gs.company.money);
    if (hudRep) hudRep.textContent = `⭐ ${Math.round(gs.company.reputation)}`;
    if (hudCompany) hudCompany.textContent = gs.company.name;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  function setLoadingStatus(msg) {
    const el = document.querySelector('#loading-screen .loading-status');
    if (el) el.textContent = msg;
    console.log('[ITG Boot]', msg);
  }

  function assertExists(name, condition) {
    if (!condition) {
      throw new Error(`Required system "${name}" not found. Check script loading order.`);
    }
  }

  function formatMoney(n) {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(n).toLocaleString();
  }

  // Expose formatMoney globally for UI modules
  window.ITG = window.ITG || {};
  window.ITG.formatMoney = formatMoney;

})();
