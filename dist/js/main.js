/**
 * IT Giant Simulator — Bootstrap / Main Entry Point
 * Initializes all systems in the correct order and starts the game loop.
 */

(function () {
  'use strict';

  // ─── BOOT SEQUENCE ────────────────────────────────────────────────────────

  function startBoot() {
    try {
      boot();
    } catch (err) {
      console.error('[ITG] Fatal boot error:', err);
      const ls = document.getElementById('loading-screen');
      if (ls) {
        ls.innerHTML =
          `<div style="color:#ff4455;font-family:monospace;padding:40px;text-align:center">
          <div style="font-size:48px">⚠️</div>
          <div style="font-size:20px;margin:16px 0">Boot Failed</div>
          <div style="font-size:14px;color:#888">${err.message}</div>
          <div style="font-size:12px;color:#555;margin-top:8px">Check browser console for details</div>
        </div>`;
      }
    }
  }

  if (document.readyState === 'complete') {
    startBoot();
  } else {
    window.addEventListener('load', startBoot);
  }

  // ── Fallback: if 'load' hasn't fired in 15 seconds, show an error ────────
  setTimeout(function () {
    if (document.getElementById('loading-screen') && document.getElementById('loading-screen').style.display !== 'none') {
      if (typeof THREE === 'undefined') {
        document.getElementById('loading-screen').innerHTML =
          `<div style="color:#ff4455;font-family:monospace;padding:40px;text-align:center">
            <div style="font-size:48px">⚠️</div>
            <div style="font-size:20px;margin:16px 0">Loading Timeout</div>
            <div style="font-size:14px;color:#888">3D engine (Three.js) failed to load after 15 seconds.</div>
            <div style="font-size:12px;color:#555;margin-top:8px">Check your internet connection and refresh.</div>
          </div>`;
      }
    }
  }, 15000);

  function boot() {
    const loading = document.getElementById('loading-screen');
    const app = document.getElementById('app');

    // ── Verify Three.js loaded (critical dependency) ──────────────────────
    if (typeof THREE === 'undefined') {
      loading.innerHTML =
        `<div style="color:#ff4455;font-family:monospace;padding:40px;text-align:center">
          <div style="font-size:48px">⚠️</div>
          <div style="font-size:20px;margin:16px 0">3D Engine Failed</div>
          <div style="font-size:14px;color:#888">Three.js could not be loaded. Check your connection.</div>
        </div>`;
      return;
    }

    setLoadingStatus('Initializing event system...');
    assertExists('ITG.EventBus', window.ITG && window.ITG.EventBus);

    setLoadingStatus('Loading component database...');
    assertExists('ITG.Data', window.ITG && window.ITG.Data);
    assertExists('ITG.Data.components', ITG.Data.components && ITG.Data.components.length > 0);

    setLoadingStatus('Initializing localization...');
    if (window.ITG.I18n) ITG.I18n.init();

    setLoadingStatus('Initializing sound engine...');
    if (window.ITG.Sound) ITG.Sound.init();

    setLoadingStatus('Initializing achievements...');
    if (window.ITG.Achievements) ITG.Achievements.init();

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

    // Settings button
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', function () {
        if (ITG.Sound) ITG.Sound.ensureContext();
        if (ITG.UI && ITG.UI.openSettingsModal) ITG.UI.openSettingsModal();
      });
    }

    // Settings modal close
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', function () {
        document.getElementById('settings-modal').style.display = 'none';
      });
    }

    // Game state overlay buttons
    const btnGameContinue = document.getElementById('btn-game-continue');
    if (btnGameContinue) {
      btnGameContinue.addEventListener('click', function () {
        document.getElementById('game-state-overlay').style.display = 'none';
        ITG.GameState.meta.gameEnded = false;
      });
    }
    const btnGameNew = document.getElementById('btn-game-new');
    if (btnGameNew) {
      btnGameNew.addEventListener('click', function () {
        document.getElementById('game-state-overlay').style.display = 'none';
        if (ITG.GameState.newGame) ITG.GameState.newGame();
        if (ITG.Achievements) ITG.Achievements.reset();
        updateHUD();
        ITG.UI.refreshAll();
        ITG.UI.showScreen('dashboard');
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

    ITG.EventBus.on('game:victory', function () {
      if (window.ITG.Sound) ITG.Sound.play('victory');
      if (ITG.UI && ITG.UI.showGameStateOverlay) ITG.UI.showGameStateOverlay('victory');
    });

    ITG.EventBus.on('game:defeat', function () {
      if (window.ITG.Sound) ITG.Sound.play('defeat');
      if (ITG.UI && ITG.UI.showGameStateOverlay) ITG.UI.showGameStateOverlay('defeat');
    });

    ITG.EventBus.on('screen:change', function (data) {
      ITG.UI.showScreen(data.screen);
    });

    // Start music on first user interaction (browser autoplay policy)
    function startMusicOnce() {
      if (window.ITG.Sound) { ITG.Sound.ensureContext(); ITG.Sound.startMusic(); }
      document.removeEventListener('click', startMusicOnce);
      document.removeEventListener('keydown', startMusicOnce);
    }
    document.addEventListener('click', startMusicOnce);
    document.addEventListener('keydown', startMusicOnce);

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
      try {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease';
        setTimeout(function () {
          try {
            loading.classList.add('is-hidden');
            app.classList.add('is-ready');

            ITG.UI.showScreen('dashboard');
            ITG.UI.showToast(ITG.I18n ? ITG.I18n.t('toast.welcome') : 'Welcome to IT Giant Simulator!', 'info');
            console.log('[ITG Boot] App revealed successfully');
          } catch (err) {
            console.error('[ITG] Error revealing app:', err);
            loading.classList.add('is-hidden');
            app.classList.add('is-ready');
          }
        }, 300);
      } catch (err) {
        console.error('[ITG] Error hiding loading screen:', err);
        loading.classList.add('is-hidden');
        app.classList.add('is-ready');
      }
    }, 100);

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
