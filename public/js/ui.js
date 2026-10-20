/**
 * IT Giant Simulator — Manager UI System
 * Renders all manager screens (Dashboard, Products, R&D, Market, Finance, HR)
 * and coordinates modals, toasts, and game state interactions.
 */

(function () {
  'use strict';

  window.ITG = window.ITG || {};

  // ─── INTERNAL STATE ─────────────────────────────────────────────────────────

  let currentScreen = 'dashboard';
  let activeDetailProductId = null;

  // ─── DEFAULT FALLBACK DATA (When not in GameState/Data) ──────────────────────

  const DEFAULT_TECH_LIST = [
    {
      id: 'tech_ddr5',
      name: 'High-Speed DDR5 Architecture',
      category: 'Memory',
      cost: 100,
      desc: 'Enables high-bandwidth DDR5 memory kits, improving overall system responsiveness.',
      unlocked: true,
      progress: 100,
    },
    {
      id: 'tech_gen4_pcie',
      name: 'PCIe Gen 4.0 Subsystem',
      category: 'Motherboard',
      cost: 180,
      desc: 'Doubles motherboard interconnect throughput for flagship GPUs and rapid NVMe storage.',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'tech_liquid_cooling',
      name: 'Direct-Die Liquid Flow',
      category: 'Cooling',
      cost: 320,
      desc: 'Custom closed-loop liquid cooling reducing thermal throttling in extreme TDP processors.',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'tech_neural_upscale',
      name: 'Neural Tensor Accelerator',
      category: 'Graphics',
      cost: 480,
      desc: 'AI frame-generation cores yielding up to 2x framerates in gaming and rendering tests.',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'tech_titanium_chassis',
      name: 'Aerospace Alloy Chassis',
      category: 'Industrial Design',
      cost: 420,
      desc: 'Precision CNC-machined titanium-aluminum housing, boosting aesthetic appeal score to maximum.',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'tech_litho_3nm',
      name: '3nm FinFET Lithography',
      category: 'Processor',
      cost: 750,
      desc: 'Sub-nanometer silicon fabrication delivering unmatched performance per watt.',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'tech_quantum_cache',
      name: 'Quantum 3D-Stacked Cache',
      category: 'Architecture',
      cost: 950,
      desc: 'Ultra-dense 3D silicon stacking providing massive cache headroom for high-end computing.',
      unlocked: false,
      progress: 0,
    },
  ];

  const DEFAULT_COMPETITORS = [
    {
      name: 'Apex Corp',
      share: 36,
      color: '#ff4d4d',
      strategy: 'High-volume production with aggressive value pricing in budget gaming',
      products: [
        { name: 'Apex Titan GX', score: 79, price: 699, weeklySales: 2850 },
        { name: 'Apex Stealth Air', score: 68, price: 449, weeklySales: 3900 },
      ],
    },
    {
      name: 'OmniTech',
      share: 30,
      color: '#00d4ff',
      strategy: 'Premium creator workstations with exceptional build quality and margins',
      products: [
        { name: 'OmniStation X9', score: 92, price: 1799, weeklySales: 980 },
        { name: 'OmniTower Pro', score: 85, price: 1199, weeklySales: 1650 },
      ],
    },
    {
      name: 'Hyperion Labs',
      share: 18,
      color: '#a855f7',
      strategy: 'Enthusiast liquid-cooled RGB showcase rigs targeting esport tournaments',
      products: [
        { name: 'HyperStorm Ultra', score: 87, price: 1349, weeklySales: 1720 },
      ],
    },
  ];

  const DEFAULT_TRENDS = [
    {
      id: 'trend_gaming',
      name: 'Cyberpunk Gaming Craze',
      icon: '🎮',
      intensity: 85,
      desc: 'Surge in enthusiast gaming demand (+30% weekly sales boost for high-end GPUs).',
      weeksRemaining: 6,
    },
    {
      id: 'trend_minimalism',
      name: 'Matte Stealth Aesthetics',
      icon: '✨',
      intensity: 65,
      desc: 'Clean industrial lines preferred over RGB lighting (+15% press review score).',
      weeksRemaining: 11,
    },
  ];

  // ─── UTILITY HELPERS ────────────────────────────────────────────────────────

  function formatMoney(n) {
    if (typeof n !== 'number' || isNaN(n)) return '$0';
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(1) + 'K';
    return sign + '$' + Math.round(abs).toLocaleString();
  }

  function formatWeek(week, year) {
    return `Week ${week || 1} of Year ${year || 1}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── GAME STATE ACCESS & NORMALIZATION ──────────────────────────────────────

  function getGS() {
    const gs = (window.ITG && window.ITG.GameState) ? window.ITG.GameState : {};

    if (!gs.meta) {
      gs.meta = { week: 1, year: 1, speed: 1, paused: false };
    }

    if (!gs.company) {
      gs.company = {
        name: 'Nexus Dynamics',
        money: 500000,
        reputation: 60,
        awareness: 35,
        employees: { engineers: 4, designers: 2, marketers: 2, researchers: 1 },
        assignedEngineers: { rnd: 1, production: 3 },
        factories: [
          { name: 'Assembly Plant Alpha', capacity: 3000, automation: 1, defectRate: 2.2 },
        ],
      };
    }

    if (!gs.company.employees) {
      gs.company.employees = { engineers: 4, designers: 2, marketers: 2, researchers: 1 };
    }

    if (!gs.company.assignedEngineers) {
      const eng = gs.company.employees.engineers || 4;
      gs.company.assignedEngineers = { rnd: 1, production: Math.max(0, eng - 1) };
    }

    if (!Array.isArray(gs.company.factories) || gs.company.factories.length === 0) {
      gs.company.factories = [
        { name: 'Assembly Plant Alpha', capacity: 3000, automation: 1, defectRate: 2.2 },
      ];
    }

    if (!Array.isArray(gs.products)) {
      gs.products = [];
    }

    if (!gs.research) {
      gs.research = { points: 150, queue: [], completed: ['tech_ddr5'] };
    }
    if (!Array.isArray(gs.research.completed)) {
      gs.research.completed = ['tech_ddr5'];
    }
    if (!Array.isArray(gs.research.queue)) {
      gs.research.queue = [];
    }

    if (!gs.technologies) {
      gs.technologies = (window.ITG.Data && window.ITG.Data.technologies)
        ? JSON.parse(JSON.stringify(window.ITG.Data.technologies))
        : JSON.parse(JSON.stringify(DEFAULT_TECH_LIST));
    }

    // Sync unlocked status
    gs.technologies.forEach(t => {
      if (gs.research.completed.includes(t.id)) {
        t.unlocked = true;
        t.progress = 100;
      }
    });

    if (!gs.finances) {
      gs.finances = {
        weeklyIncome: 0,
        weeklyExpenses: 0,
        history: [],
      };
    }
    if (!Array.isArray(gs.finances.history)) {
      gs.finances.history = [];
    }

    if (!Array.isArray(gs.news)) {
      gs.news = [
        { icon: '🚀', text: 'Welcome to IT Giant Simulator! Design and launch your first PC in Products.', time: 'Week 1', type: 'info' },
        { icon: '💡', text: 'Assign engineers to R&D to generate tech points and unlock next-gen components.', time: 'Week 1', type: 'info' },
      ];
    }

    if (!gs.market) {
      gs.market = {
        competitors: (window.ITG.Market && window.ITG.Market.competitors)
          ? window.ITG.Market.competitors
          : JSON.parse(JSON.stringify(DEFAULT_COMPETITORS)),
        trends: (window.ITG.Market && window.ITG.Market.trends)
          ? window.ITG.Market.trends
          : JSON.parse(JSON.stringify(DEFAULT_TRENDS)),
      };
    }

    return gs;
  }

  // ─── CALCULATOR INTEGRATION WITH ROBUST FALLBACKS ───────────────────────────

  function calcWeeklyIncome(gs) {
    if (window.ITG.Calculator && typeof window.ITG.Calculator.calcWeeklyIncome === 'function') {
      return window.ITG.Calculator.calcWeeklyIncome(gs);
    }
    let total = 0;
    (gs.products || []).forEach(p => {
      if (p.stage !== 'discontinued') {
        total += (p.weeklyRevenue || ((p.weeklySales || 0) * (p.price || 0)));
      }
    });
    return total;
  }

  function calcWeeklyExpenses(gs) {
    if (window.ITG.Calculator && typeof window.ITG.Calculator.calcWeeklyExpenses === 'function') {
      return window.ITG.Calculator.calcWeeklyExpenses(gs);
    }
    const emp = gs.company.employees || {};
    const salaries = ((emp.engineers || 0) * 8000) +
                     ((emp.designers || 0) * 6000) +
                     ((emp.marketers || 0) * 5000) +
                     ((emp.researchers || 0) * 7000);

    const factoryCosts = (gs.company.factories || []).reduce((acc, f) => {
      return acc + ((f.capacity || 2000) * 3) + ((f.automation || 1) * 2500);
    }, 0);

    const rndInvestment = (gs.company.assignedEngineers ? gs.company.assignedEngineers.rnd || 0 : 1) * 2000;

    const marketing = (gs.products || []).reduce((acc, p) => {
      return p.stage !== 'discontinued' ? acc + (p.marketingBudget || 0) : acc;
    }, 0);

    return salaries + factoryCosts + rndInvestment + marketing;
  }

  function calcWeeklyProfit(gs) {
    if (window.ITG.Calculator && typeof window.ITG.Calculator.calcWeeklyProfit === 'function') {
      return window.ITG.Calculator.calcWeeklyProfit(gs);
    }
    return calcWeeklyIncome(gs) - calcWeeklyExpenses(gs);
  }

  function calcCompanyValue(gs) {
    if (window.ITG.Calculator && typeof window.ITG.Calculator.calcCompanyValue === 'function') {
      return window.ITG.Calculator.calcCompanyValue(gs);
    }
    const cash = gs.company.money || 0;
    const weeklyIncome = calcWeeklyIncome(gs);
    const repVal = (gs.company.reputation || 50) * 20000;
    const productPotential = (gs.products || []).reduce((acc, p) => {
      if (p.stage === 'discontinued') return acc;
      return acc + (p.revenue || 0) * 0.4 + (p.weeklyRevenue || 0) * 16;
    }, 0);
    return Math.max(100000, cash + productPotential + repVal + (weeklyIncome * 10));
  }

  function calcMarketShare(gs) {
    if (window.ITG.Market && typeof window.ITG.Market.getMarketShare === 'function') {
      return window.ITG.Market.getMarketShare(gs);
    }
    const playerSales = (gs.products || []).reduce((acc, p) => {
      return p.stage !== 'discontinued' ? acc + (p.weeklySales || 0) : acc;
    }, 0);

    let competitorSales = 0;
    const comps = gs.market && gs.market.competitors ? gs.market.competitors : DEFAULT_COMPETITORS;
    comps.forEach(c => {
      (c.products || []).forEach(p => { competitorSales += (p.weeklySales || 0); });
    });

    const totalSales = playerSales + competitorSales;
    if (totalSales <= 0) return 16;
    return Math.max(1, Math.min(99, Math.round((playerSales / totalSales) * 100)));
  }

  // ─── HUD UPDATE ────────────────────────────────────────────────────────────

  function updateHUD() {
    const gs = getGS();
    const hudTime = document.getElementById('hud-time');
    const hudMoney = document.getElementById('hud-money');
    const hudRep = document.getElementById('hud-rep');
    const hudCompany = document.getElementById('hud-company');

    if (hudTime) {
      hudTime.textContent = gs.getWeekLabel ? gs.getWeekLabel() : formatWeek(gs.meta.week, gs.meta.year);
    }
    if (hudMoney) {
      hudMoney.textContent = formatMoney(gs.company.money);
    }
    if (hudRep) {
      hudRep.textContent = `⭐ ${Math.round(gs.company.reputation || 50)}`;
    }
    if (hudCompany) {
      hudCompany.textContent = gs.company.name || 'Nexus Dynamics';
    }
  }

  // ─── TOAST NOTIFICATION SYSTEM ─────────────────────────────────────────────

  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  // ─── CSS STYLE INJECTION FOR MANAGER UI ────────────────────────────────────

  function injectManagerStyles() {
    if (document.getElementById('itg-manager-styles')) return;

    const style = document.createElement('style');
    style.id = 'itg-manager-styles';
    style.textContent = `
      #toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10000;
        pointer-events: none;
      }
      .toast {
        padding: 12px 18px;
        border-radius: 8px;
        background: #151824;
        color: #f1f5f9;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
        opacity: 0;
        transform: translateY(14px) scale(0.97);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: auto;
        border-left: 4px solid #3b82f6;
        max-width: 380px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .toast-success { border-left-color: #10b981; }
      .toast-error { border-left-color: #ef4444; }
      .toast-warning { border-left-color: #f59e0b; }
      .toast-info { border-left-color: #00d4ff; }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(4, 7, 15, 0.75);
        backdrop-filter: blur(6px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: itgFadeIn 0.2s ease;
      }
      @keyframes itgFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .modal-box {
        background: #111422;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        width: 100%;
        max-width: 640px;
        max-height: 90vh;
        overflow-y: auto;
        color: #e2e8f0;
      }
      .modal-box.modal-lg {
        max-width: 860px;
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 1024px) {
        .grid-3 { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .grid-3, .grid-2 { grid-template-columns: 1fr; }
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .badge-green { background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
      .badge-red { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      .badge-yellow { background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
      .badge-blue { background: rgba(0, 212, 255, 0.18); color: #38bdf8; border: 1px solid rgba(0, 212, 255, 0.3); }

      .card {
        background: #141726;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        overflow: hidden;
        transition: transform 0.15s ease, border-color 0.15s ease;
      }
      .card:hover {
        border-color: rgba(255, 255, 255, 0.15);
      }
      .card-header {
        padding: 14px 18px;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .card-body {
        padding: 16px 18px;
      }
      .progress-bar-wrap {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.3s ease;
      }
      .table-like {
        width: 100%;
        border-collapse: collapse;
      }
      .table-row {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .table-row:last-child {
        border-bottom: none;
      }
      .table-row-header {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.02);
      }
      .table-cell {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
      }
      .empty-state-icon {
        font-size: 44px;
        margin-bottom: 12px;
      }
      .chart-bar {
        border-radius: 4px 4px 0 0;
        transition: height 0.3s ease, background-color 0.2s ease;
      }
      .chart-bar:hover {
        filter: brightness(1.2);
      }
      .dimmed-card {
        opacity: 0.65;
        filter: grayscale(0.2);
      }
    `;
    document.head.appendChild(style);
  }

  // ─── MODAL MANAGEMENT ──────────────────────────────────────────────────────

  function getModalRoot() {
    let root = document.getElementById('itg-ui-modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'itg-ui-modal-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function closeModal() {
    const root = getModalRoot();
    root.innerHTML = '';
  }

  // ─── SCREEN 1: DASHBOARD (#screen-dashboard) ───────────────────────────────

  function renderDashboard() {
    const el = document.getElementById('screen-dashboard');
    if (!el) return;

    const gs = getGS();
    const companyVal = calcCompanyValue(gs);
    const weeklyProfit = calcWeeklyProfit(gs);
    const weeklyIncome = calcWeeklyIncome(gs);
    const weeklyExpenses = calcWeeklyExpenses(gs);
    const marketShare = calcMarketShare(gs);
    const brandAwareness = Math.round(gs.company.awareness || 25);

    const activeProducts = (gs.products || []).filter(p => p.stage !== 'discontinued');
    const competitors = gs.market && gs.market.competitors ? gs.market.competitors : DEFAULT_COMPETITORS;
    const newsFeed = Array.isArray(gs.news) ? gs.news.slice(0, 10) : [];

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Top Stats Row (4 Stat Cards) -->
        <div class="grid-3" style="grid-template-columns: repeat(4, 1fr);">
          <div class="card">
            <div class="card-body">
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Company Valuation</div>
              <div style="font-size: 26px; font-weight: 700; color: #fff; margin: 8px 0;">${formatMoney(companyVal)}</div>
              <div style="font-size: 12px; color: #10b981; display: flex; align-items: center; gap: 4px;">
                <span>▲ Assets & Potential</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Weekly Profit / Loss</div>
              <div style="font-size: 26px; font-weight: 700; color: ${weeklyProfit >= 0 ? '#10b981' : '#ef4444'}; margin: 8px 0;">
                ${formatMoney(weeklyProfit)}
              </div>
              <div style="font-size: 12px; color: #94a3b8;">
                In: <span style="color:#10b981">${formatMoney(weeklyIncome)}</span> | Ex: <span style="color:#ef4444">${formatMoney(weeklyExpenses)}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Market Share</div>
              <div style="font-size: 26px; font-weight: 700; color: #00d4ff; margin: 8px 0;">${marketShare}%</div>
              <div class="progress-bar-wrap" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${marketShare}%; background: #00d4ff;"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Brand Awareness</div>
              <div style="font-size: 26px; font-weight: 700; color: #a855f7; margin: 8px 0;">${brandAwareness}%</div>
              <div class="progress-bar-wrap" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${brandAwareness}%; background: #a855f7;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Section: Active Products & Competitor Activity -->
        <div class="grid-2">
          <!-- Active Products List -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>💻 Active Products</span>
                <span class="badge badge-blue">${activeProducts.length} Live</span>
              </div>
              <button id="dash-btn-new-product" class="btn-primary" style="padding: 6px 12px; font-size: 12px; cursor: pointer;">
                + New Product
              </button>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;">
              ${activeProducts.length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">🖥️</div>
                  <div style="font-weight: 600; color: #fff;">No active products</div>
                  <div style="font-size: 13px; margin: 6px 0 16px;">Design and assemble your first computer to start generating revenue.</div>
                  <button id="dash-btn-empty-new" class="btn-primary" style="padding: 8px 16px; cursor: pointer;">
                    Launch First Product
                  </button>
                </div>
              ` : activeProducts.map(p => {
                const stage = p.stage || 'on_market';
                const stageBadge = stage === 'on_market'
                  ? '<span class="badge badge-green">🟢 On Market</span>'
                  : stage === 'development'
                  ? '<span class="badge badge-yellow">🟡 In Dev</span>'
                  : '<span class="badge badge-red">🔴 Declining</span>';
                const peak = p.peakProgress !== undefined ? p.peakProgress : Math.min(100, Math.round(((p.sales || 500) / 5000) * 100));

                return `
                  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 12px;">
                    <div class="stat-row" style="margin-bottom: 6px;">
                      <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                        <span>💻</span>
                        <span>${escapeHtml(p.name)}</span>
                      </div>
                      ${stageBadge}
                    </div>
                    <div class="stat-row" style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">
                      <span>Sales: <strong style="color: #fff;">${(p.weeklySales || 0).toLocaleString()}</strong> units/wk</span>
                      <span>Price: <strong style="color: #10b981;">${formatMoney(p.price || 0)}</strong></span>
                    </div>
                    <div>
                      <div class="stat-row" style="font-size: 11px; color: #64748b; margin-bottom: 3px;">
                        <span>Progress to Peak Sales</span>
                        <span>${peak}%</span>
                      </div>
                      <div class="progress-bar-wrap" style="height: 5px;">
                        <div class="progress-bar-fill" style="width: ${peak}%; background: #38bdf8;"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Competitor Activity -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>🏢 Competitor Intelligence</span>
                <span class="badge badge-yellow">Live AI</span>
              </div>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 14px; max-height: 380px; overflow-y: auto;">
              ${competitors.map(c => `
                <div style="background: rgba(255, 255, 255, 0.02); border-left: 3px solid ${c.color}; border-radius: 0 8px 8px 0; padding: 12px;">
                  <div class="stat-row" style="margin-bottom: 4px;">
                    <strong style="color: #fff; font-size: 14px;">${escapeHtml(c.name)}</strong>
                    <span class="badge" style="background: rgba(255,255,255,0.08); color: ${c.color};">${c.share}% Share</span>
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
                    ${escapeHtml(c.strategy)}
                  </div>
                  <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-wrap: wrap; gap: 8px;">
                    ${(c.products || []).map(cp => `
                      <span style="background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 4px;">
                        🏷️ ${escapeHtml(cp.name)} — ${formatMoney(cp.price)} (~${cp.weeklySales || 0}/wk)
                      </span>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Bottom Section: News & Events Feed -->
        <div class="card">
          <div class="card-header">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>📰 Tech Industry News & Events</span>
              <span class="badge badge-blue">Chronological</span>
            </div>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
            ${newsFeed.length === 0 ? `
              <div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">No recent news events. Advance the week to view industry updates.</div>
            ` : newsFeed.map(n => `
              <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.04);">
                <div style="font-size: 20px; flex-shrink: 0;">${n.icon || '📰'}</div>
                <div style="flex: 1; font-size: 13px; color: #e2e8f0;">${escapeHtml(n.text)}</div>
                <div style="font-size: 11px; color: #64748b; white-space: nowrap;">${n.time || 'Recent'}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Attach Dashboard Event Listeners
    const btnNew = el.querySelector('#dash-btn-new-product');
    if (btnNew) btnNew.addEventListener('click', () => window.ITG.UI.openNewProductModal());

    const btnEmpty = el.querySelector('#dash-btn-empty-new');
    if (btnEmpty) btnEmpty.addEventListener('click', () => window.ITG.UI.openNewProductModal());
  }

  // ─── SCREEN 2: PRODUCTS SCREEN (#screen-products) ──────────────────────────

  function renderProducts() {
    const el = document.getElementById('screen-products');
    if (!el) return;

    const gs = getGS();
    const products = gs.products || [];

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #141726; padding: 16px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 20px; font-weight: 700; color: #fff;">Products Portfolio</div>
            <div style="font-size: 13px; color: #94a3b8;">Manage pricing, marketing campaigns, life cycles, and design new computers.</div>
          </div>
          <button id="products-btn-new" class="btn-primary" style="padding: 10px 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
            <span>✨ + New Product</span>
          </button>
        </div>

        <!-- Products Grid (3 per row) -->
        ${products.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">🖥️</div>
              <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;">No Products in Catalog</div>
              <div style="max-width: 480px; margin: 0 auto 20px; font-size: 14px; color: #94a3b8;">
                Your engineering and design team is ready. Launch the 3D PC Constructor to combine motherboards, processors, graphics, and chassis into your debut flagship.
              </div>
              <button id="products-btn-first" class="btn-primary" style="padding: 10px 24px; font-size: 14px; cursor: pointer;">
                + Design Your First PC
              </button>
            </div>
          </div>
        ` : `
          <div class="grid-3">
            ${products.map(p => {
              const stage = p.stage || 'on_market';
              let stageBadge = '<span class="badge badge-green">🟢 On Market</span>';
              if (stage === 'discontinued') {
                stageBadge = '<span class="badge badge-red">🔴 Discontinued</span>';
              } else if (stage === 'development') {
                stageBadge = '<span class="badge badge-yellow">🟡 Development</span>';
              }

              const score = p.overallScore || p.score || (p.scores && p.scores.overall) || 78;
              const unitsSold = (p.sales || 0).toLocaleString();
              const revenue = formatMoney(p.revenue || 0);
              const weeklyUnits = (p.weeklySales || 0).toLocaleString();

              return `
                <div class="card ${stage === 'discontinued' ? 'dimmed-card' : ''}" style="display: flex; flex-direction: column;">
                  <div class="card-header">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; color: #fff;">
                      <span>💻</span>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">
                        ${escapeHtml(p.name)}
                      </span>
                    </div>
                    ${stageBadge}
                  </div>
                  <div class="card-body" style="display: flex; flex-direction: column; gap: 12px; flex: 1;">
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">
                      ${escapeHtml(p.category || 'PC')} · ${escapeHtml(p.segment || 'Desktop Gaming')}
                    </div>

                    <!-- Score Bar -->
                    <div>
                      <div class="stat-row" style="font-size: 12px; margin-bottom: 4px;">
                        <span style="color: #cbd5e1;">Overall Quality</span>
                        <strong style="color: #00d4ff;">${score}% Score</strong>
                      </div>
                      <div class="progress-bar-wrap" style="height: 7px;">
                        <div class="progress-bar-fill" style="width: ${score}%; background: linear-gradient(90deg, #3b82f6, #00d4ff);"></div>
                      </div>
                    </div>

                    <!-- Sales Metrics -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                      <div class="stat-row">
                        <span style="color: #94a3b8;">Total Sold:</span>
                        <strong style="color: #fff;">${unitsSold} units</strong>
                      </div>
                      <div class="stat-row">
                        <span style="color: #94a3b8;">Weekly Sales:</span>
                        <strong style="color: #38bdf8;">${weeklyUnits} /wk</strong>
                      </div>
                      <div class="stat-row">
                        <span style="color: #94a3b8;">Total Revenue:</span>
                        <strong style="color: #10b981;">${revenue}</strong>
                      </div>
                      <div class="stat-row">
                        <span style="color: #94a3b8;">Retail Price:</span>
                        <strong style="color: #fbbf24;">${formatMoney(p.price || 0)}</strong>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="margin-top: auto; display: flex; gap: 8px; padding-top: 8px;">
                      <button class="btn-secondary btn-view-product" data-product-id="${p.id}" style="flex: 1; padding: 8px 12px; font-size: 12px; cursor: pointer;">
                        👁️ View Details
                      </button>
                      ${stage !== 'discontinued' ? `
                        <button class="btn-danger btn-discontinue-product" data-product-id="${p.id}" style="padding: 8px 12px; font-size: 12px; cursor: pointer;">
                          🛑 Discontinue
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    `;

    // Attach Products Event Listeners
    const btnNew = el.querySelector('#products-btn-new');
    if (btnNew) btnNew.addEventListener('click', () => window.ITG.UI.openNewProductModal());

    const btnFirst = el.querySelector('#products-btn-first');
    if (btnFirst) btnFirst.addEventListener('click', () => window.ITG.UI.openNewProductModal());

    el.querySelectorAll('.btn-view-product').forEach(btn => {
      btn.addEventListener('click', function () {
        const pId = this.getAttribute('data-product-id');
        openProductDetailModal(pId);
      });
    });

    el.querySelectorAll('.btn-discontinue-product').forEach(btn => {
      btn.addEventListener('click', function () {
        const pId = this.getAttribute('data-product-id');
        discontinueProduct(pId);
      });
    });
  }

  function discontinueProduct(productId) {
    const gs = getGS();
    const product = (gs.products || []).find(p => p.id === productId);
    if (product) {
      product.stage = 'discontinued';
      showToast(`Product "${product.name}" has been discontinued.`, 'warning');
      window.ITG.UI.refreshAll();
    }
  }

  // ─── PRODUCT DETAIL MODAL VIEW ─────────────────────────────────────────────

  function openProductDetailModal(productId) {
    const gs = getGS();
    const product = (gs.products || []).find(p => p.id === productId);
    if (!product) {
      showToast('Product not found.', 'error');
      return;
    }

    activeDetailProductId = productId;
    const root = getModalRoot();

    const bomCost = product.bomCost || Math.round((product.price || 500) * 0.45);
    const price = product.price || 699;
    const margin = price - bomCost;
    const marginPct = price > 0 ? Math.round((margin / price) * 100) : 0;
    const score = product.overallScore || product.score || 78;
    const pressScore = product.pressScore || (score / 10).toFixed(1);
    const userScore = product.userScore || ((score - 3) / 10).toFixed(1);
    const marketingBudget = product.marketingBudget !== undefined ? product.marketingBudget : 5000;

    // Last 12 weeks sales history
    let history = product.salesHistory || [];
    if (!Array.isArray(history) || history.length === 0) {
      const curWeekly = product.weeklySales || 150;
      history = [
        Math.round(curWeekly * 0.4), Math.round(curWeekly * 0.6), Math.round(curWeekly * 0.8),
        Math.round(curWeekly * 0.9), Math.round(curWeekly * 1.1), Math.round(curWeekly * 1.25),
        Math.round(curWeekly * 1.2), Math.round(curWeekly * 1.1), Math.round(curWeekly * 1.05),
        Math.round(curWeekly * 0.98), Math.round(curWeekly * 0.95), curWeekly,
      ];
      product.salesHistory = history;
    }
    const maxSales = Math.max(10, ...history);

    root.innerHTML = `
      <div class="modal-overlay" id="product-detail-overlay">
        <div class="modal-box modal-lg card">
          <div class="card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">💻</span>
              <div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${escapeHtml(product.name)}</div>
                <div style="font-size: 12px; color: #94a3b8;">${escapeHtml(product.category || 'PC')} · Detailed Diagnostics</div>
              </div>
            </div>
            <button id="modal-detail-close" class="btn-secondary" style="background: transparent; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;">✕</button>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Key Performance Metrics Grid -->
            <div class="grid-3">
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Unit Economics</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff; margin: 4px 0;">BOM: ${formatMoney(bomCost)}</div>
                <div style="font-size: 12px; color: ${margin >= 0 ? '#10b981' : '#ef4444'};">
                  Margin: ${formatMoney(margin)} (${marginPct}%)
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Press Rating</div>
                <div style="font-size: 18px; font-weight: 700; color: #fbbf24; margin: 4px 0;">⭐ ${pressScore} / 10</div>
                <div style="font-size: 12px; color: #94a3b8;">Review consensus: Positive</div>
              </div>

              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Consumer Rating</div>
                <div style="font-size: 18px; font-weight: 700; color: #00d4ff; margin: 4px 0;">⭐ ${userScore} / 10</div>
                <div style="font-size: 12px; color: #94a3b8;">Customer satisfaction</div>
              </div>
            </div>

            <!-- Weekly Sales Chart (Last 12 Weeks) -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px;">
              <div class="stat-row" style="margin-bottom: 12px;">
                <span style="font-weight: 600; font-size: 13px; color: #cbd5e1;">📊 Weekly Unit Sales (Last 12 Weeks)</span>
                <span style="font-size: 12px; color: #94a3b8;">Peak: ${maxSales.toLocaleString()} units</span>
              </div>
              <div style="display: flex; align-items: flex-end; gap: 8px; height: 130px; padding-top: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                ${history.slice(-12).map((val, idx) => {
                  const hPct = Math.max(6, Math.min(100, Math.round((val / maxSales) * 100)));
                  return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                      <span style="font-size: 9px; color: #64748b; margin-bottom: 4px;">${val}</span>
                      <div class="chart-bar" style="width: 100%; height: ${hPct}%; background: linear-gradient(180deg, #00d4ff, #2563eb);" title="Week ${idx + 1}: ${val} units"></div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 6px;">
                <span>12 Weeks Ago</span>
                <span>Current Week</span>
              </div>
            </div>

            <!-- Interactive Adjustments: Price & Marketing Budget -->
            <div class="grid-2">
              <!-- Retail Price Adjustment -->
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 14px;">
                <label style="font-size: 13px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 8px;">
                  Retail Sale Price ($)
                </label>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="number" id="detail-input-price" value="${price}" min="50" max="10000" step="10"
                    style="flex: 1; background: #0a0c16; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 15px; font-weight: 700;">
                  <span id="detail-price-preview" style="font-size: 14px; color: #10b981; font-weight: 600;">
                    ${formatMoney(price)}
                  </span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
                  Lower prices stimulate unit demand; higher prices increase margin per sale.
                </div>
              </div>

              <!-- Marketing Campaign Budget -->
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 14px;">
                <div class="stat-row" style="margin-bottom: 8px;">
                  <label style="font-size: 13px; font-weight: 600; color: #cbd5e1;">Marketing Budget / Week</label>
                  <span id="detail-budget-label" style="font-size: 13px; color: #38bdf8; font-weight: 700;">
                    ${formatMoney(marketingBudget)}/wk
                  </span>
                </div>
                <input type="range" id="detail-slider-budget" min="0" max="50000" step="1000" value="${marketingBudget}"
                  style="width: 100%; cursor: pointer;">
                <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
                  Sustains brand exposure and decelerates market maturity decay.
                </div>
              </div>
            </div>

            <!-- Modal Action Footer -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
              <button id="modal-detail-cancel" class="btn-secondary" style="padding: 10px 18px; cursor: pointer;">
                Cancel
              </button>
              <button id="modal-detail-save" class="btn-primary" style="padding: 10px 22px; cursor: pointer; font-weight: 600;">
                💾 Save Adjustments
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // Modal Events
    const overlay = root.querySelector('#product-detail-overlay');
    const btnClose = root.querySelector('#modal-detail-close');
    const btnCancel = root.querySelector('#modal-detail-cancel');
    const btnSave = root.querySelector('#modal-detail-save');
    const inputPrice = root.querySelector('#detail-input-price');
    const sliderBudget = root.querySelector('#detail-slider-budget');
    const budgetLabel = root.querySelector('#detail-budget-label');
    const pricePreview = root.querySelector('#detail-price-preview');

    sliderBudget.addEventListener('input', (e) => {
      budgetLabel.textContent = formatMoney(Number(e.target.value)) + '/wk';
    });

    inputPrice.addEventListener('input', (e) => {
      pricePreview.textContent = formatMoney(Number(e.target.value));
    });

    const dismiss = () => closeModal();
    btnClose.addEventListener('click', dismiss);
    btnCancel.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    btnSave.addEventListener('click', () => {
      const newPrice = Math.max(10, Number(inputPrice.value) || price);
      const newBudget = Math.max(0, Number(sliderBudget.value) || 0);

      product.price = newPrice;
      product.marketingBudget = newBudget;

      showToast(`Updated pricing ($${newPrice}) & marketing budget for ${product.name}.`, 'success');
      closeModal();
      window.ITG.UI.refreshAll();
    });
  }

  // ─── NEW PRODUCT MODAL ─────────────────────────────────────────────────────

  function openNewProductModal() {
    const gs = getGS();
    const root = getModalRoot();
    const defaultName = `NovaBlade ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(10 + Math.random() * 90)}`;

    root.innerHTML = `
      <div class="modal-overlay" id="new-product-overlay">
        <div class="modal-box card">
          <div class="card-header">
            <div style="font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span>✨ Start New Product</span>
            </div>
            <button id="modal-new-close" class="btn-secondary" style="background: transparent; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;">✕</button>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="font-size: 13px; color: #94a3b8;">
              Configure your new project and enter the 3D Hardware Constructor to assemble your custom chassis, motherboard, CPU, GPU, memory, and cooling configuration.
            </div>

            <!-- Product Name Input -->
            <div class="input-group">
              <label class="label" style="font-size: 13px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">
                Product Name
              </label>
              <input type="text" id="modal-product-name" class="input" value="${defaultName}"
                style="width: 100%; box-sizing: border-box; background: #0b0d18; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 15px;">
            </div>

            <!-- Category Select -->
            <div class="input-group">
              <label class="label" style="font-size: 13px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">
                Product Category
              </label>
              <select id="modal-product-category" class="select"
                style="width: 100%; box-sizing: border-box; background: #0b0d18; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 14px;">
                <option value="PC" selected>Desktop PC / Workstation</option>
                <option value="Gaming" disabled>Gaming Console (Requires Tier 2 R&D)</option>
                <option value="Server" disabled>Enterprise Rack Server (Requires Tier 3 R&D)</option>
              </select>
            </div>

            <!-- Segment Target -->
            <div class="input-group">
              <label class="label" style="font-size: 13px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">
                Market Target
              </label>
              <select id="modal-product-segment" class="select"
                style="width: 100%; box-sizing: border-box; background: #0b0d18; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 10px 14px; color: #fff; font-size: 14px;">
                <option value="Gaming Enthusiast" selected>Gaming Enthusiast (High GPU / Aesthetic Demand)</option>
                <option value="Mainstream Productivity">Mainstream Productivity (Balanced Specs & Cost)</option>
                <option value="Budget Home PC">Budget Value (Lowest BOM Cost / High Margin)</option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
              <button id="modal-new-cancel" class="btn-secondary" style="padding: 10px 18px; cursor: pointer;">
                Cancel
              </button>
              <button id="modal-new-launch-editor" class="btn-primary" style="padding: 10px 22px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <span>🛠️ Open 3D Designer</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    const overlay = root.querySelector('#new-product-overlay');
    const btnClose = root.querySelector('#modal-new-close');
    const btnCancel = root.querySelector('#modal-new-cancel');
    const btnLaunch = root.querySelector('#modal-new-launch-editor');
    const inputName = root.querySelector('#modal-product-name');
    const selectCat = root.querySelector('#modal-product-category');
    const selectSeg = root.querySelector('#modal-product-segment');

    const dismiss = () => closeModal();
    btnClose.addEventListener('click', dismiss);
    btnCancel.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    btnLaunch.addEventListener('click', () => {
      const pName = (inputName.value || defaultName).trim();
      const pCat = selectCat.value || 'PC';
      const pSeg = selectSeg.value || 'Gaming Enthusiast';

      closeModal();
      showToast(`Opening 3D Constructor for "${pName}"...`, 'info');

      if (window.ITG.EventBus) {
        window.ITG.EventBus.emit('editor:open', {
          category: pCat,
          name: pName,
          segment: pSeg,
        });
      }
    });
  }

  // ─── SCREEN 3: R&D SCREEN (#screen-rnd) ────────────────────────────────────

  function renderRnd() {
    const el = document.getElementById('screen-rnd');
    if (!el) return;

    const gs = getGS();
    const rndPoints = gs.research ? gs.research.points || 0 : 0;
    const totalEngineers = gs.company.employees.engineers || 4;
    const rndEngineers = gs.company.assignedEngineers ? gs.company.assignedEngineers.rnd || 0 : 1;
    const pointsPerWeek = rndEngineers * 10;

    const queue = gs.research && Array.isArray(gs.research.queue) ? gs.research.queue : [];
    const techTree = gs.technologies || DEFAULT_TECH_LIST;

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top R&D Control Center Card -->
        <div class="card">
          <div class="card-body stat-row" style="flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Laboratory Research Points</div>
              <div style="font-size: 28px; font-weight: 700; color: #00d4ff; margin: 4px 0;">
                🔬 ${rndPoints.toLocaleString()} <span style="font-size: 14px; font-weight: 500; color: #10b981;">(+${pointsPerWeek} pts/week)</span>
              </div>
              <div style="font-size: 12px; color: #94a3b8;">
                Generates 10 points/week per engineer assigned to R&D.
              </div>
            </div>

            <!-- Engineer Assignment Control -->
            <div style="display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; border-radius: 8px;">
              <div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">ASSIGNED TO R&D</div>
                <div style="font-size: 14px; font-weight: 700; color: #fff;">
                  ${rndEngineers} of ${totalEngineers} Engineers
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button id="rnd-assign-dec" class="btn-secondary" style="padding: 6px 12px; font-weight: 700; cursor: pointer;" ${rndEngineers <= 0 ? 'disabled' : ''}>-</button>
                <button id="rnd-assign-inc" class="btn-secondary" style="padding: 6px 12px; font-weight: 700; cursor: pointer;" ${rndEngineers >= totalEngineers ? 'disabled' : ''}>+</button>
              </div>
            </div>

            <!-- Hire Researcher Button -->
            <div>
              <button id="rnd-btn-hire-researcher" class="btn-success" style="padding: 10px 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <span>🎓 Hire Researcher</span>
                <span class="badge" style="background: rgba(0,0,0,0.3);">$50,000</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Research Queue Section -->
        <div class="card">
          <div class="card-header">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>⏳ Active Research Pipeline</span>
              <span class="badge badge-blue">${queue.length} Active</span>
            </div>
          </div>
          <div class="card-body">
            ${queue.length === 0 ? `
              <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
                No technologies currently queued. Select an available tech from the Technology Tree below to begin research.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${queue.map(q => {
                  const totalW = q.totalWeeks || 4;
                  const leftW = q.weeksLeft !== undefined ? q.weeksLeft : 2;
                  const progress = Math.min(100, Math.round(((totalW - leftW) / totalW) * 100));

                  return `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px;">
                      <div class="stat-row" style="margin-bottom: 6px;">
                        <strong style="color: #fff; font-size: 15px;">🔬 ${escapeHtml(q.name)}</strong>
                        <span class="badge badge-yellow">${leftW} weeks remaining</span>
                      </div>
                      <div class="progress-bar-wrap" style="height: 8px;">
                        <div class="progress-bar-fill" style="width: ${progress}%; background: linear-gradient(90deg, #38bdf8, #10b981);"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Technology Tree Grid -->
        <div>
          <div class="section-title">
            <span>🧬 Technology Tree</span>
          </div>

          <div class="grid-3">
            ${techTree.map(tech => {
              const isCompleted = gs.research.completed.includes(tech.id) || tech.unlocked === true;
              const isQueued = queue.some(q => q.id === tech.id);
              const canAfford = rndPoints >= tech.cost;

              let statusBadge = '<span class="badge badge-yellow">🔒 Locked</span>';
              if (isCompleted) {
                statusBadge = '<span class="badge badge-green">✅ Completed</span>';
              } else if (isQueued) {
                statusBadge = '<span class="badge badge-blue">⏳ In Progress</span>';
              }

              return `
                <div class="card ${(!isCompleted && !canAfford && !isQueued) ? 'dimmed-card' : ''}" style="display: flex; flex-direction: column;">
                  <div class="card-header">
                    <span class="badge" style="background: rgba(255,255,255,0.08); color: #cbd5e1;">${escapeHtml(tech.category || 'Tech')}</span>
                    ${statusBadge}
                  </div>
                  <div class="card-body" style="display: flex; flex-direction: column; gap: 10px; flex: 1;">
                    <div style="font-size: 15px; font-weight: 700; color: #fff;">
                      ${isCompleted ? '✅ ' : (!canAfford ? '🔒 ' : '🔬 ')}${escapeHtml(tech.name)}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; flex: 1;">
                      ${escapeHtml(tech.desc || tech.description || '')}
                    </div>

                    <!-- Cost & Progress -->
                    <div style="margin-top: 6px;">
                      <div class="stat-row" style="font-size: 12px; margin-bottom: 4px;">
                        <span style="color: #64748b;">Research Cost:</span>
                        <strong style="color: #00d4ff;">${tech.cost} Points</strong>
                      </div>
                      <div class="progress-bar-wrap" style="height: 6px;">
                        <div class="progress-bar-fill" style="width: ${isCompleted ? 100 : (tech.progress || 0)}%; background: ${isCompleted ? '#10b981' : '#38bdf8'};"></div>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <div style="margin-top: 10px;">
                      ${isCompleted ? `
                        <button class="btn-secondary" style="width: 100%; padding: 8px; font-size: 12px; opacity: 0.6; cursor: default;" disabled>
                          ✅ Tech Mastered
                        </button>
                      ` : isQueued ? `
                        <button class="btn-secondary" style="width: 100%; padding: 8px; font-size: 12px; opacity: 0.8; cursor: default;" disabled>
                          ⏳ In Pipeline
                        </button>
                      ` : canAfford ? `
                        <button class="btn-primary btn-unlock-tech" data-tech-id="${tech.id}" style="width: 100%; padding: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
                          🚀 Unlock (${tech.cost} pts)
                        </button>
                      ` : `
                        <button class="btn-secondary" style="width: 100%; padding: 8px; font-size: 12px; opacity: 0.5; cursor: not-allowed;" disabled>
                          🔒 Need ${tech.cost - rndPoints} more pts
                        </button>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    // Attach R&D Listeners
    const btnHire = el.querySelector('#rnd-btn-hire-researcher');
    if (btnHire) {
      btnHire.addEventListener('click', () => {
        if (gs.company.money >= 50000) {
          gs.company.money -= 50000;
          gs.company.employees.engineers = (gs.company.employees.engineers || 0) + 1;
          gs.company.assignedEngineers.rnd = (gs.company.assignedEngineers.rnd || 0) + 1;
          showToast('Hired 1 Researcher! Assigned immediately to R&D lab (-$50,000).', 'success');
          updateHUD();
          window.ITG.UI.refreshAll();
        } else {
          showToast('Insufficient capital. Hiring a researcher requires $50,000.', 'error');
        }
      });
    }

    const btnInc = el.querySelector('#rnd-assign-inc');
    if (btnInc) {
      btnInc.addEventListener('click', () => {
        if (rndEngineers < totalEngineers) {
          gs.company.assignedEngineers.rnd = rndEngineers + 1;
          gs.company.assignedEngineers.production = Math.max(0, totalEngineers - gs.company.assignedEngineers.rnd);
          showToast(`Assigned engineer to R&D (+10 pts/week).`, 'info');
          window.ITG.UI.refreshAll();
        }
      });
    }

    const btnDec = el.querySelector('#rnd-assign-dec');
    if (btnDec) {
      btnDec.addEventListener('click', () => {
        if (rndEngineers > 0) {
          gs.company.assignedEngineers.rnd = rndEngineers - 1;
          gs.company.assignedEngineers.production = Math.max(0, totalEngineers - gs.company.assignedEngineers.rnd);
          showToast(`Reassigned engineer back to factory production.`, 'info');
          window.ITG.UI.refreshAll();
        }
      });
    }

    el.querySelectorAll('.btn-unlock-tech').forEach(btn => {
      btn.addEventListener('click', function () {
        const techId = this.getAttribute('data-tech-id');
        startResearchTech(techId);
      });
    });
  }

  function startResearchTech(techId) {
    const gs = getGS();
    const tech = (gs.technologies || []).find(t => t.id === techId);
    if (!tech) return;

    if (gs.research.points < tech.cost) {
      showToast('Insufficient research points.', 'error');
      return;
    }

    gs.research.points -= tech.cost;
    tech.unlocked = true;
    tech.progress = 100;

    if (!gs.research.completed.includes(techId)) {
      gs.research.completed.push(techId);
    }

    // Inform GameState tech unlocked if supported
    if (typeof gs.unlockTech === 'function') {
      gs.unlockTech(techId);
    }

    showToast(`🎉 Technology Unlocked: "${tech.name}" is now available in the 3D Designer!`, 'success');
    window.ITG.UI.refreshAll();
  }

  // ─── SCREEN 4: MARKET SCREEN (#screen-market) ──────────────────────────────

  function renderMarket() {
    const el = document.getElementById('screen-market');
    if (!el) return;

    const gs = getGS();
    const playerShare = calcMarketShare(gs);
    const competitors = gs.market && gs.market.competitors ? gs.market.competitors : DEFAULT_COMPETITORS;
    const trends = gs.market && gs.market.trends ? gs.market.trends : DEFAULT_TRENDS;

    // Build brands list for horizontal market share bar
    const brands = [
      { name: gs.company.name || 'Your Company', share: playerShare, color: '#38bdf8', isPlayer: true },
      ...competitors.map(c => ({
        name: c.name,
        share: Math.round(((100 - playerShare) * (c.share / 100))),
        color: c.color,
        isPlayer: false,
      })),
    ];

    // Normalize share sum to 100%
    const sumShare = brands.reduce((acc, b) => acc + b.share, 0);
    if (sumShare > 0) {
      brands.forEach(b => { b.share = Math.max(1, Math.round((b.share / sumShare) * 100)); });
    }

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Market Share Horizontal Bar Chart -->
        <div class="card">
          <div class="card-header">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>🌐 Global PC Market Share Breakdown</span>
            </div>
            <span class="badge badge-blue">Rank #${playerShare >= 35 ? '1' : playerShare >= 20 ? '2' : '3'} Globally</span>
          </div>
          <div class="card-body">
            <!-- Multi-Color Segmented Horizontal Bar -->
            <div class="progress-bar-wrap" style="height: 32px; display: flex; border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
              ${brands.map(b => `
                <div style="width: ${b.share}%; background: ${b.color}; height: 100%; transition: width 0.4s ease; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); overflow: hidden; white-space: nowrap;" title="${escapeHtml(b.name)}: ${b.share}%">
                  ${b.share >= 8 ? `${escapeHtml(b.name)} (${b.share}%)` : ''}
                </div>
              `).join('')}
            </div>

            <!-- Legend Pills -->
            <div style="display: flex; flex-wrap: wrap; gap: 14px;">
              ${brands.map(b => `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; background: rgba(255,255,255,0.02); padding: 4px 10px; border-radius: 6px;">
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${b.color}; display: inline-block;"></span>
                  <span style="font-weight: 600; color: #fff;">${escapeHtml(b.name)}</span>
                  <span class="badge ${b.isPlayer ? 'badge-blue' : 'badge-yellow'}">${b.share}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 2-Column: Active Trends (Left) & Competitor Products (Right) -->
        <div class="grid-2">
          <!-- Left Column: Active Consumer Trends -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>🔥 Active Consumer Trends</span>
                <span class="badge badge-yellow">${trends.length} Active</span>
              </div>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 14px;">
              ${trends.length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">⚖️</div>
                  <div style="font-weight: 600; color: #fff;">Market is stable</div>
                  <div style="font-size: 13px;">No volatile trends active. Consumer demand is consistent.</div>
                </div>
              ` : trends.map(t => `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px;">
                  <div class="stat-row" style="margin-bottom: 6px;">
                    <div style="font-weight: 700; color: #fff; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                      <span>${t.icon || '📈'}</span>
                      <span>${escapeHtml(t.name)}</span>
                    </div>
                    <span class="badge badge-yellow">⏳ ${t.weeksRemaining} wks left</span>
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">
                    ${escapeHtml(t.desc)}
                  </div>
                  <div>
                    <div class="stat-row" style="font-size: 11px; color: #64748b; margin-bottom: 3px;">
                      <span>Trend Intensity</span>
                      <strong style="color: #fbbf24;">${t.intensity}%</strong>
                    </div>
                    <div class="progress-bar-wrap" style="height: 6px;">
                      <div class="progress-bar-fill" style="width: ${t.intensity}%; background: #f59e0b;"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Column: Competitor Products Table -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>🥊 Competitor Products</span>
              </div>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="table-like" style="font-size: 12px;">
                <thead>
                  <tr class="table-row table-row-header">
                    <th class="table-cell" style="text-align: left; padding: 10px 14px;">Brand</th>
                    <th class="table-cell" style="text-align: left; padding: 10px 14px;">Product</th>
                    <th class="table-cell" style="text-align: center; padding: 10px 14px;">Score</th>
                    <th class="table-cell" style="text-align: right; padding: 10px 14px;">Price</th>
                    <th class="table-cell" style="text-align: right; padding: 10px 14px;">Est. Sales</th>
                  </tr>
                </thead>
                <tbody>
                  ${competitors.flatMap(c => (c.products || []).map(p => `
                    <tr class="table-row">
                      <td class="table-cell" style="padding: 10px 14px; font-weight: 600; color: ${c.color};">${escapeHtml(c.name)}</td>
                      <td class="table-cell" style="padding: 10px 14px; color: #fff;">${escapeHtml(p.name)}</td>
                      <td class="table-cell" style="padding: 10px 14px; text-align: center;">
                        <span class="badge ${p.score >= 85 ? 'badge-green' : p.score >= 75 ? 'badge-blue' : 'badge-yellow'}">
                          ${p.score}%
                        </span>
                      </td>
                      <td class="table-cell" style="padding: 10px 14px; text-align: right; color: #fbbf24; font-weight: 600;">
                        ${formatMoney(p.price)}
                      </td>
                      <td class="table-cell" style="padding: 10px 14px; text-align: right; color: #94a3b8;">
                        ${(p.weeklySales || 0).toLocaleString()}/wk
                      </td>
                    </tr>
                  `)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Bottom: Strategic Market Intelligence -->
        <div class="card">
          <div class="card-header">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>💡 Strategic Market Intelligence</span>
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            <p style="margin: 0 0 10px 0;">
              <strong>Analyst Briefing:</strong> The personal computer market is transitioning rapidly towards AI-accelerated workloads and unibody metal chassis. 
              <strong>Apex Corp</strong> is capturing budget volume but suffering from elevated defect return rates due to inferior plastic tooling. 
              <strong>OmniTech</strong> holds a premium enterprise lock with 65%+ gross margins.
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <span class="badge badge-green">Recommendation: Target DDR5 + 16-Core Zenith CPU</span>
              <span class="badge badge-blue">Target Retail Sweet Spot: $899 - $1,299</span>
              <span class="badge badge-yellow">Avoid sub-$400 plastic chassis configurations</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ─── SCREEN 5: FINANCE SCREEN (#screen-finance) ────────────────────────────

  function renderFinance() {
    const el = document.getElementById('screen-finance');
    if (!el) return;

    const gs = getGS();
    const cash = gs.company.money || 0;
    const weeklyIncome = calcWeeklyIncome(gs);
    const weeklyExpenses = calcWeeklyExpenses(gs);
    const netProfit = calcWeeklyProfit(gs);

    const emp = gs.company.employees || {};
    const salaries = ((emp.engineers || 0) * 8000) +
                     ((emp.designers || 0) * 6000) +
                     ((emp.marketers || 0) * 5000) +
                     ((emp.researchers || 0) * 7000);

    const factoryCosts = (gs.company.factories || []).reduce((acc, f) => {
      return acc + ((f.capacity || 2000) * 3) + ((f.automation || 1) * 2500);
    }, 0);

    const rndInvestment = (gs.company.assignedEngineers ? gs.company.assignedEngineers.rnd || 0 : 1) * 2000;

    const marketingTotal = (gs.products || []).reduce((acc, p) => {
      return p.stage !== 'discontinued' ? acc + (p.marketingBudget || 0) : acc;
    }, 0);

    const expensesTotal = Math.max(1, salaries + factoryCosts + rndInvestment + marketingTotal);

    const expenseBreakdown = [
      { label: 'Payroll & Salaries', amount: salaries, color: '#3b82f6', percent: Math.round((salaries / expensesTotal) * 100) },
      { label: 'Factory Operations', amount: factoryCosts, color: '#f59e0b', percent: Math.round((factoryCosts / expensesTotal) * 100) },
      { label: 'R&D Lab Investment', amount: rndInvestment, color: '#00d4ff', percent: Math.round((rndInvestment / expensesTotal) * 100) },
      { label: 'Marketing Campaigns', amount: marketingTotal, color: '#ec4899', percent: Math.round((marketingTotal / expensesTotal) * 100) },
    ];

    // Profit / Loss History (Last 12 weeks)
    let history = gs.finances.history || [];
    if (!Array.isArray(history) || history.length === 0) {
      history = [
        { week: 1, profit: -12000, income: 15000, expenses: 27000 },
        { week: 2, profit: -8000, income: 22000, expenses: 30000 },
        { week: 3, profit: 5000, income: 38000, expenses: 33000 },
        { week: 4, profit: 18000, income: 52000, expenses: 34000 },
        { week: 5, profit: 24000, income: 61000, expenses: 37000 },
        { week: 6, profit: 32000, income: 72000, expenses: 40000 },
        { week: 7, profit: 28000, income: 70000, expenses: 42000 },
        { week: 8, profit: 39000, income: 84000, expenses: 45000 },
        { week: 9, profit: 46000, income: 94000, expenses: 48000 },
        { week: 10, profit: 55000, income: 105000, expenses: 50000 },
        { week: 11, profit: 62000, income: 114000, expenses: 52000 },
        { week: 12, profit: netProfit, income: weeklyIncome, expenses: weeklyExpenses },
      ];
      gs.finances.history = history;
    }

    const maxProfitAbs = Math.max(10000, ...history.map(h => Math.abs(h.profit || 0)));

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Row: 4 Stat Cards -->
        <div class="grid-3" style="grid-template-columns: repeat(4, 1fr);">
          <div class="card">
            <div class="card-body">
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Cash on Hand</div>
              <div style="font-size: 26px; font-weight: 700; color: #10b981; margin: 6px 0;">${formatMoney(cash)}</div>
              <div style="font-size: 12px; color: #94a3b8;">Liquid operating reserves</div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Weekly Income</div>
              <div style="font-size: 26px; font-weight: 700; color: #fff; margin: 6px 0;">${formatMoney(weeklyIncome)}</div>
              <div style="font-size: 12px; color: #10b981;">Hardware retail revenue</div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Weekly Expenses</div>
              <div style="font-size: 26px; font-weight: 700; color: #ef4444; margin: 6px 0;">${formatMoney(weeklyExpenses)}</div>
              <div style="font-size: 12px; color: #94a3b8;">Salaries, factories, R&D, ads</div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Net Profit / Loss</div>
              <div style="font-size: 26px; font-weight: 700; color: ${netProfit >= 0 ? '#10b981' : '#ef4444'}; margin: 6px 0;">
                ${formatMoney(netProfit)}
              </div>
              <div style="font-size: 12px; color: ${netProfit >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                ${netProfit >= 0 ? '▲ Net Cashflow Positive' : '▼ Burning Capital'}
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Row: Income Breakdown & Expenses Breakdown -->
        <div class="grid-2">
          <!-- Income Breakdown (by product) -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>📈 Income Breakdown by Product</span>
              </div>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 14px;">
              ${(gs.products || []).filter(p => p.stage !== 'discontinued').length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">💸</div>
                  <div style="font-weight: 600; color: #fff;">No revenue streams</div>
                  <div style="font-size: 13px;">Launch devices to generate weekly product revenues.</div>
                </div>
              ` : (gs.products || []).filter(p => p.stage !== 'discontinued').map(p => {
                const rev = p.weeklyRevenue || ((p.weeklySales || 0) * (p.price || 0));
                const pct = weeklyIncome > 0 ? Math.round((rev / weeklyIncome) * 100) : 0;

                return `
                  <div>
                    <div class="stat-row" style="font-size: 13px; margin-bottom: 4px;">
                      <span style="color: #fff; font-weight: 600;">💻 ${escapeHtml(p.name)}</span>
                      <span style="color: #10b981; font-weight: 700;">${formatMoney(rev)} (${pct}%)</span>
                    </div>
                    <div class="progress-bar-wrap" style="height: 8px;">
                      <div class="progress-bar-fill" style="width: ${pct}%; background: #10b981;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Expenses Breakdown (horizontal bars) -->
          <div class="card">
            <div class="card-header">
              <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>📉 Expense Categories</span>
              </div>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 14px;">
              ${expenseBreakdown.map(item => `
                <div>
                  <div class="stat-row" style="font-size: 13px; margin-bottom: 4px;">
                    <span style="color: #cbd5e1;">${item.label}</span>
                    <span style="color: #fff; font-weight: 700;">${formatMoney(item.amount)} (${item.percent}%)</span>
                  </div>
                  <div class="progress-bar-wrap" style="height: 8px;">
                    <div class="progress-bar-fill" style="width: ${item.percent}%; background: ${item.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- History: Last 12 Weeks Profit / Loss Bar Chart -->
        <div class="card">
          <div class="card-header">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>📊 Profit & Loss Trajectory (Last 12 Weeks)</span>
            </div>
            <span style="font-size: 12px; color: #94a3b8;">Green = Profit, Red = Loss</span>
          </div>
          <div class="card-body">
            <div style="display: flex; align-items: center; height: 160px; position: relative; gap: 8px;">
              <!-- Zero Baseline -->
              <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.18); z-index: 1;"></div>
              
              ${history.slice(-12).map(h => {
                const isPos = (h.profit || 0) >= 0;
                const hPct = Math.max(8, Math.min(48, Math.round((Math.abs(h.profit || 0) / maxProfitAbs) * 48)));

                return `
                  <div style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; position: relative; justify-content: center;">
                    ${isPos ? `
                      <div class="chart-bar" style="position: absolute; bottom: 50%; width: 75%; height: ${hPct}%; background: #10b981; border-radius: 4px 4px 0 0;" title="Week ${h.week}: Profit +${formatMoney(h.profit)}"></div>
                    ` : `
                      <div class="chart-bar" style="position: absolute; top: 50%; width: 75%; height: ${hPct}%; background: #ef4444; border-radius: 0 0 4px 4px;" title="Week ${h.week}: Loss ${formatMoney(h.profit)}"></div>
                    `}
                    <span style="position: absolute; bottom: 2px; font-size: 10px; color: #64748b;">W${h.week}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ─── SCREEN 6: HR SCREEN (#screen-hr) ──────────────────────────────────────

  function renderHR() {
    const el = document.getElementById('screen-hr');
    if (!el) return;

    const gs = getGS();
    const emp = gs.company.employees || { engineers: 4, designers: 2, marketers: 2 };
    const factories = gs.company.factories || [];

    el.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Employee Summary Cards (Engineers, Designers, Marketers) -->
        <div>
          <div class="section-title">
            <span>👥 Workforce Management</span>
          </div>

          <div class="grid-3">
            <!-- Engineers Card -->
            <div class="card">
              <div class="card-header">
                <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>🛠️ Systems Engineers</span>
                </div>
                <span class="badge badge-blue">${emp.engineers || 0} Staff</span>
              </div>
              <div class="card-body" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="font-size: 13px; color: #94a3b8;">
                  Weekly Salary: <strong style="color: #fff;">$8,000 / engineer</strong><br>
                  Total: <strong style="color: #ef4444;">${formatMoney((emp.engineers || 0) * 8000)}/week</strong>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; font-size: 12px; color: #cbd5e1;">
                  ⭐ <strong>Effects:</strong> Generates +10 R&D points/week in laboratory & boosts factory quality control (reducing defect rate).
                </div>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                  <button class="btn-success btn-hire-employee" data-role="engineers" data-cost="50000" style="flex: 2; padding: 8px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">
                    + Hire ($50k)
                  </button>
                  <button class="btn-danger btn-fire-employee" data-role="engineers" style="flex: 1; padding: 8px 12px; font-size: 12px; cursor: pointer;" ${(emp.engineers || 0) <= 1 ? 'disabled' : ''}>
                    - Fire
                  </button>
                </div>
              </div>
            </div>

            <!-- Designers Card -->
            <div class="card">
              <div class="card-header">
                <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>🎨 Industrial Designers</span>
                </div>
                <span class="badge badge-yellow">${emp.designers || 0} Staff</span>
              </div>
              <div class="card-body" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="font-size: 13px; color: #94a3b8;">
                  Weekly Salary: <strong style="color: #fff;">$6,000 / designer</strong><br>
                  Total: <strong style="color: #ef4444;">${formatMoney((emp.designers || 0) * 6000)}/week</strong>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; font-size: 12px; color: #cbd5e1;">
                  ⭐ <strong>Effects:</strong> Elevates aesthetics score of all constructed computers & increases customer emotional desirability.
                </div>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                  <button class="btn-success btn-hire-employee" data-role="designers" data-cost="40000" style="flex: 2; padding: 8px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">
                    + Hire ($40k)
                  </button>
                  <button class="btn-danger btn-fire-employee" data-role="designers" style="flex: 1; padding: 8px 12px; font-size: 12px; cursor: pointer;" ${(emp.designers || 0) <= 0 ? 'disabled' : ''}>
                    - Fire
                  </button>
                </div>
              </div>
            </div>

            <!-- Marketers Card -->
            <div class="card">
              <div class="card-header">
                <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>📢 Marketing Specialists</span>
                </div>
                <span class="badge badge-green">${emp.marketers || 0} Staff</span>
              </div>
              <div class="card-body" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="font-size: 13px; color: #94a3b8;">
                  Weekly Salary: <strong style="color: #fff;">$5,000 / marketer</strong><br>
                  Total: <strong style="color: #ef4444;">${formatMoney((emp.marketers || 0) * 5000)}/week</strong>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; font-size: 12px; color: #cbd5e1;">
                  ⭐ <strong>Effects:</strong> Drives continuous weekly brand awareness expansion & amplifies marketing campaign conversions by 25%.
                </div>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                  <button class="btn-success btn-hire-employee" data-role="marketers" data-cost="30000" style="flex: 2; padding: 8px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">
                    + Hire ($30k)
                  </button>
                  <button class="btn-danger btn-fire-employee" data-role="marketers" style="flex: 1; padding: 8px 12px; font-size: 12px; cursor: pointer;" ${(emp.marketers || 0) <= 0 ? 'disabled' : ''}>
                    - Fire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Manufacturing & Automation Section -->
        <div>
          <div class="section-title">
            <span>🏭 Manufacturing Facilities</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${factories.map((fac, idx) => `
              <div class="card">
                <div class="card-body stat-row" style="flex-wrap: wrap; gap: 16px;">
                  <div>
                    <div style="font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                      <span>🏭</span>
                      <span>${escapeHtml(fac.name || 'GigaAssembly Alpha')}</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                      High-precision automated assembly lines
                    </div>
                  </div>

                  <!-- Factory Metrics -->
                  <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                    <div>
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Weekly Capacity</div>
                      <div style="font-size: 18px; font-weight: 700; color: #00d4ff;">
                        ${(fac.capacity || 2500).toLocaleString()} units/wk
                      </div>
                    </div>

                    <div>
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Automation Level</div>
                      <div style="font-size: 18px; font-weight: 700; color: #fbbf24;">
                        Level ${fac.automation || 1}
                      </div>
                    </div>

                    <div>
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Defect Rate</div>
                      <div style="font-size: 18px; font-weight: 700; color: ${(fac.defectRate || 2.5) <= 1.0 ? '#10b981' : '#f59e0b'};">
                        ${(fac.defectRate !== undefined ? fac.defectRate : 2.2).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <!-- Upgrade Automation Button -->
                  <div>
                    <button class="btn-primary btn-upgrade-factory" data-factory-idx="${idx}" style="padding: 10px 18px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                      <span>⚡ Upgrade Automation</span>
                      <span class="badge" style="background: rgba(0,0,0,0.3);">$200,000</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Attach HR Listeners
    el.querySelectorAll('.btn-hire-employee').forEach(btn => {
      btn.addEventListener('click', function () {
        const role = this.getAttribute('data-role');
        const cost = Number(this.getAttribute('data-cost')) || 40000;
        hireEmployee(role, cost);
      });
    });

    el.querySelectorAll('.btn-fire-employee').forEach(btn => {
      btn.addEventListener('click', function () {
        const role = this.getAttribute('data-role');
        fireEmployee(role);
      });
    });

    el.querySelectorAll('.btn-upgrade-factory').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = Number(this.getAttribute('data-factory-idx')) || 0;
        upgradeFactory(idx);
      });
    });
  }

  function hireEmployee(role, upfrontCost) {
    const gs = getGS();
    if (gs.company.money < upfrontCost) {
      showToast(`Insufficient capital! Hiring requires ${formatMoney(upfrontCost)} upfront.`, 'error');
      return;
    }

    gs.company.money -= upfrontCost;
    gs.company.employees[role] = (gs.company.employees[role] || 0) + 1;

    // If engineer, allocate to production
    if (role === 'engineers') {
      gs.company.assignedEngineers.production = (gs.company.assignedEngineers.production || 0) + 1;
    }

    const titleMap = { engineers: 'Systems Engineer', designers: 'Industrial Designer', marketers: 'Marketing Specialist' };
    showToast(`Hired 1 ${titleMap[role] || role} (-${formatMoney(upfrontCost)}).`, 'success');
    updateHUD();
    window.ITG.UI.refreshAll();
  }

  function fireEmployee(role) {
    const gs = getGS();
    if ((gs.company.employees[role] || 0) <= 0) return;

    gs.company.employees[role] -= 1;

    if (role === 'engineers') {
      if (gs.company.assignedEngineers.production > 0) {
        gs.company.assignedEngineers.production -= 1;
      } else if (gs.company.assignedEngineers.rnd > 0) {
        gs.company.assignedEngineers.rnd -= 1;
      }
    }

    const titleMap = { engineers: 'Systems Engineer', designers: 'Industrial Designer', marketers: 'Marketing Specialist' };
    showToast(`Fired 1 ${titleMap[role] || role}. Saved weekly salary expense.`, 'warning');
    updateHUD();
    window.ITG.UI.refreshAll();
  }

  function upgradeFactory(factoryIndex) {
    const gs = getGS();
    const fac = (gs.company.factories || [])[factoryIndex];
    if (!fac) return;

    const COST = 200000;
    if (gs.company.money < COST) {
      showToast(`Insufficient capital! Automation upgrade requires ${formatMoney(COST)}.`, 'error');
      return;
    }

    gs.company.money -= COST;
    fac.automation = (fac.automation || 1) + 1;
    fac.capacity = Math.round((fac.capacity || 2500) * 1.3);
    fac.defectRate = Math.max(0.1, Number(((fac.defectRate || 2.2) * 0.75).toFixed(1)));

    showToast(`Factory automation upgraded to Level ${fac.automation}! (+30% capacity, lower defect rate).`, 'success');
    updateHUD();
    window.ITG.UI.refreshAll();
  }

  // ─── SCREEN NAVIGATION & REFRESH ───────────────────────────────────────────

  function renderAchievements() {
    const el = document.getElementById('screen-achievements');
    if (!el) return;
    const list = (window.ITG.Achievements) ? ITG.Achievements.getList() : [];
    const unlocked = (window.ITG.Achievements) ? ITG.Achievements.getUnlockedCount() : 0;
    const total = (window.ITG.Achievements) ? ITG.Achievements.getTotalCount() : 0;
    el.innerHTML = `
      <div style="padding:20px;max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#141726;padding:16px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size:20px;font-weight:700;color:#fff;">🏆 Achievements</div>
            <div style="font-size:13px;color:#94a3b8;">${unlocked} / ${total} unlocked</div>
          </div>
          <div class="progress-bar-wrap" style="width:200px;height:8px;">
            <div class="progress-bar-fill" style="width:${total>0?Math.round(unlocked/total*100):0}%;background:linear-gradient(90deg,#f59e0b,#fbbf24);"></div>
          </div>
        </div>
        <div class="grid-3">
          ${list.map(a => `
            <div class="card ${a.unlocked?'':'dimmed-card'}" style="display:flex;flex-direction:column;">
              <div class="card-header">
                <span style="font-size:28px;">${a.icon}</span>
                ${a.unlocked?'<span class="badge badge-green">✅ Unlocked</span>':'<span class="badge badge-yellow">🔒 Locked</span>'}
              </div>
              <div class="card-body" style="display:flex;flex-direction:column;gap:8px;">
                <div style="font-size:15px;font-weight:700;color:#fff;">${escapeHtml(a.name)}</div>
                <div style="font-size:12px;color:#94a3b8;">${escapeHtml(a.desc)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const body = document.getElementById('settings-body');
    const titleEl = document.getElementById('settings-title');
    if (!modal || !body) return;
    const t = window.ITG.I18n ? ITG.I18n.t.bind(ITG.I18n) : (k => k);
    if (titleEl) titleEl.textContent = t('settings.title');
    const snd = window.ITG.Sound ? ITG.Sound.getSettings() : {enabled:true,musicEnabled:true,vol:0.3};
    const langs = window.ITG.I18n ? ITG.I18n.getAvailableLanguages() : ['en','ru'];
    const curLang = window.ITG.I18n ? ITG.I18n.getLanguage() : 'en';
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div>
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="set-sound" ${snd.enabled?'checked':''}>
            <span>${t('settings.sound')}</span>
          </label>
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="set-music" ${snd.musicEnabled?'checked':''}>
            <span>${t('settings.music')}</span>
          </label>
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:8px;">${t('settings.volume')}</label>
          <input type="range" id="set-vol" min="0" max="1" step="0.1" value="${snd.vol}" style="width:100%;">
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:8px;">${t('settings.language')}</label>
          <select id="set-lang" style="width:100%;background:#0b0d18;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:10px;color:#fff;">
            ${langs.map(l => `<option value="${l}" ${l===curLang?'selected':''}>${l==='ru'?'Русский':'English'}</option>`).join('')}
          </select>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
          <button id="set-save" class="btn-primary" style="padding:10px 18px;cursor:pointer;font-weight:600;">${t('settings.saveNow')}</button>
          <button id="set-reset" class="btn-danger" style="padding:10px 18px;cursor:pointer;">${t('settings.resetGame')}</button>
        </div>
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:14px;">
          <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px;">${t('settings.howToPlay')}</div>
          <div style="font-size:12px;color:#94a3b8;display:flex;flex-direction:column;gap:4px;">
            <div>${t('howto.step1')}</div><div>${t('howto.step2')}</div><div>${t('howto.step3')}</div>
            <div>${t('howto.step4')}</div><div>${t('howto.step5')}</div><div>${t('howto.step6')}</div>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    const cbSound = body.querySelector('#set-sound');
    const cbMusic = body.querySelector('#set-music');
    const rngVol = body.querySelector('#set-vol');
    const selLang = body.querySelector('#set-lang');
    if (cbSound) cbSound.addEventListener('change', e => { if (window.ITG.Sound) ITG.Sound.setEnabled(e.target.checked); });
    if (cbMusic) cbMusic.addEventListener('change', e => { if (window.ITG.Sound) ITG.Sound.setMusicEnabled(e.target.checked); });
    if (rngVol) rngVol.addEventListener('input', e => { if (window.ITG.Sound) ITG.Sound.setVolume(Number(e.target.value)); });
    if (selLang) selLang.addEventListener('change', e => { if (window.ITG.I18n) ITG.I18n.setLanguage(e.target.value); });
    const btnSave = body.querySelector('#set-save');
    if (btnSave) btnSave.addEventListener('click', () => {
      if (window.ITG.GameState) ITG.GameState.save();
      if (window.ITG.Sound) ITG.Sound.play('save');
      ITG.UI.showToast(t('settings.saved'), 'success');
    });
    const btnReset = body.querySelector('#set-reset');
    if (btnReset) btnReset.addEventListener('click', () => {
      if (confirm(t('settings.confirmReset'))) {
        if (window.ITG.GameState && ITG.GameState.newGame) ITG.GameState.newGame();
        if (window.ITG.Achievements) ITG.Achievements.reset();
        updateHUD();
        ITG.UI.refreshAll();
        ITG.UI.showScreen('dashboard');
        modal.style.display = 'none';
        ITG.UI.showToast(t('settings.reset'), 'info');
      }
    });
  }

  function showGameStateOverlay(type) {
    const overlay = document.getElementById('game-state-overlay');
    if (!overlay) return;
    const t = window.ITG.I18n ? ITG.I18n.t.bind(ITG.I18n) : (k => k);
    const iconEl = document.getElementById('game-state-icon');
    const titleEl = document.getElementById('game-state-title');
    const descEl = document.getElementById('game-state-desc');
    if (type === 'victory') {
      if (iconEl) iconEl.textContent = '🏆';
      if (titleEl) { titleEl.textContent = t('game.victory'); titleEl.style.color = '#10b981'; }
      if (descEl) descEl.textContent = t('game.victoryDesc');
    } else {
      if (iconEl) iconEl.textContent = '💀';
      if (titleEl) { titleEl.textContent = t('game.defeat'); titleEl.style.color = '#ef4444'; }
      if (descEl) descEl.textContent = t('game.defeatDesc');
    }
    overlay.style.display = 'flex';
  }

  function showScreen(name) {
    currentScreen = name || 'dashboard';

    const screens = ['dashboard', 'products', 'rnd', 'market', 'finance', 'hr', 'achievements'];
    screens.forEach(s => {
      const el = document.getElementById(`screen-${s}`);
      if (el) {
        if (s === currentScreen) {
          el.style.display = 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    });

    // Update sidebar navigation active highlight
    document.querySelectorAll('#sidebar .nav-item, [data-screen]').forEach(item => {
      if (item.getAttribute('data-screen') === currentScreen) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Render screen contents
    renderActiveScreen();
  }

  function renderActiveScreen() {
    switch (currentScreen) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'products':
        renderProducts();
        break;
      case 'rnd':
        renderRnd();
        break;
      case 'market':
        renderMarket();
        break;
      case 'finance':
        renderFinance();
        break;
      case 'hr':
        renderHR();
        break;
      case 'achievements':
        renderAchievements();
        break;
      default:
        renderDashboard();
        break;
    }
  }

  function refreshAll() {
    updateHUD();
    renderActiveScreen();
  }

  // ─── EDITOR INTEGRATION CONTRACT ───────────────────────────────────────────

  function openDeviceEditor(blueprint) {
    if (window.ITG.EventBus) {
      window.ITG.EventBus.emit('editor:open', blueprint || { category: 'PC', name: 'NovaBlade Pro' });
    }
  }

  function closeDeviceEditor() {
    if (window.ITG.Editor && typeof window.ITG.Editor.close === 'function') {
      window.ITG.Editor.close();
    } else if (window.ITG.EventBus) {
      window.ITG.EventBus.emit('editor:close');
    }
  }

  // ─── INITIALIZATION ────────────────────────────────────────────────────────

  function init() {
    injectManagerStyles();
    getModalRoot();

    // Wire up week advancement listener
    if (window.ITG.EventBus) {
      window.ITG.EventBus.on('week:advance', function () {
        refreshAll();
      });

      window.ITG.EventBus.on('product:launched', function (data) {
        showToast(`🚀 New device "${data && data.name ? data.name : 'Computer'}" has officially hit retail shelves!`, 'success');
        refreshAll();
      });

      window.ITG.EventBus.on('screen:change', function (data) {
        if (data && data.screen) {
          showScreen(data.screen);
        }
      });
    }

    // Render initial screen
    showScreen('dashboard');
    updateHUD();
  }

  // ─── PUBLIC API CONTRACT ───────────────────────────────────────────────────

  window.ITG.UI = {
    init: init,
    showScreen: showScreen,
    refreshAll: refreshAll,
    showToast: showToast,
    openNewProductModal: openNewProductModal,
    openDeviceEditor: openDeviceEditor,
    closeDeviceEditor: closeDeviceEditor,
    openSettingsModal: openSettingsModal,
    showGameStateOverlay: showGameStateOverlay,
  };

})();
