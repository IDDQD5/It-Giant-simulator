/**
 * IT Giant Simulator — Game Engine
 * EventBus, GameState, Calculator, Market systems
 */
window.ITG = window.ITG || {};

/* ═══════════════════════════════════════════════════════════
   EVENT BUS
═══════════════════════════════════════════════════════════ */
ITG.EventBus = (function () {
  const _listeners = {};
  return {
    on(event, cb) {
      if (!_listeners[event]) _listeners[event] = [];
      _listeners[event].push(cb);
    },
    off(event, cb) {
      if (!_listeners[event]) return;
      _listeners[event] = _listeners[event].filter(fn => fn !== cb);
    },
    emit(event, data) {
      if (!_listeners[event]) return;
      _listeners[event].forEach(fn => { try { fn(data); } catch(e) { console.error('[EventBus]', event, e); } });
    }
  };
})();

/* ═══════════════════════════════════════════════════════════
   CALCULATOR — Score & Cost Formulas
═══════════════════════════════════════════════════════════ */
ITG.Calculator = (function () {

  function findComp(id) {
    return ITG.Data.components.find(c => c.id === id) || null;
  }

  function getInstalledComps(device) {
    return (device.components || []).map(ic => findComp(ic.componentId)).filter(Boolean);
  }

  // ── Performance Score (0–100) ──────────────────────────────
  function calcPerformanceScore(installed) {
    const cpu  = installed.find(c => c.type === 'CPU');
    const gpu  = installed.find(c => c.type === 'GPU');
    const ram  = installed.find(c => c.type === 'RAM');
    const stor = installed.find(c => c.type === 'Storage');
    const mb   = installed.find(c => c.type === 'Motherboard');

    if (!cpu) return 0;

    const cpuScore  = (cpu.performanceTier / 10) * 100;
    const gpuScore  = gpu ? (gpu.performanceTier / 10) * 100 : 20;
    const ramScore  = ram ? Math.min(100, Math.log2((ram.capacityGB || 8)) * 15) : 20;
    const storScore = stor ? Math.min(100, (stor.readSpeedMBs || 180) / 100) : 15;
    const mbBonus   = mb ? (mb.performanceTier / 10) * 10 : 0;

    // Bottleneck penalty
    const maxComp  = Math.max(cpuScore, gpuScore);
    const minComp  = Math.min(cpuScore, gpuScore);
    const ratio    = maxComp / Math.max(minComp, 1);
    const bnPenalty = ratio > 1.8 ? 0.85 : ratio > 1.4 ? 0.93 : 1.0;

    const raw = cpuScore * 0.35 + gpuScore * 0.35 + ramScore * 0.15 + storScore * 0.1 + mbBonus * 0.05;
    return Math.max(0, Math.min(100, raw * bnPenalty));
  }

  // ── Thermal Score (0–100) ─────────────────────────────────
  function calcThermalScore(installed) {
    const cooling  = installed.find(c => c.type === 'Cooling');
    const totalTDP = installed.reduce((s, c) => s + (c.tdpWatts || 0), 0);
    if (!cooling || !totalTDP) return 50;

    const headroom    = cooling.maxTDP - totalTDP;
    const thermalBase = Math.max(0, Math.min(100, (headroom / cooling.maxTDP) * 100 + 50));
    const noiseScore  = Math.max(0, 100 - (cooling.noiseDB || 35));
    return thermalBase * 0.7 + noiseScore * 0.3;
  }

  // ── Build Quality Score (0–100) ───────────────────────────
  function calcBuildQuality(device, installed) {
    const MAT_QUALITY = {
      budget_plastic:  20,
      premium_plastic: 45,
      aluminum:        75,
      carbon_fiber:    95,
      titanium:        100,
    };
    const cs = installed.find(c => c.type === 'Case');
    const materialScore = MAT_QUALITY[device.housing?.material || 'premium_plastic'] || 45;
    const avgQuality = installed.length
      ? installed.reduce((s, c) => s + (c.qualityMultiplier || 1.0) * 50, 0) / installed.length
      : 50;
    const hasAllEssentials = ['CPU','Motherboard','RAM','Storage','Cooling','PSU','Case']
      .every(t => installed.some(c => c.type === t));

    return materialScore * 0.4 + avgQuality * 0.4 + (hasAllEssentials ? 20 : 0) * 0.2;
  }

  // ── Main Device Stats ─────────────────────────────────────
  function calcDeviceStats(device) {
    const installed = getInstalledComps(device);
    const totalTDP  = installed.reduce((s, c) => s + (c.tdpWatts || 0), 0);
    const totalWt   = installed.reduce((s, c) => s + (c.weightGrams || 0), 0);

    return {
      performanceScore: Math.round(calcPerformanceScore(installed)),
      thermalScore:     Math.round(calcThermalScore(installed)),
      buildQualityScore:Math.round(calcBuildQuality(device, installed)),
      totalTDP,
      totalWeightGrams: totalWt,
    };
  }

  // ── COGS (Cost of Goods Sold) per unit ────────────────────
  function calcCOGS(device) {
    const installed = getInstalledComps(device);
    const MAT_COST  = { budget_plastic:20, premium_plastic:45, aluminum:90, carbon_fiber:160, titanium:280 };

    const compCost    = installed.reduce((s, c) => s + (c.baseCostUSD * (c.qualityMultiplier || 1.0)), 0);
    const housingCost = MAT_COST[device.housing?.material || 'premium_plastic'] || 45;
    const laborCost   = 25; // base assembly labor
    const costMult    = (ITG.GameState.market._costMultiplier) || 1.0;

    return Math.round((compCost + housingCost + laborCost) * costMult);
  }

  // ── Defect Rate ───────────────────────────────────────────
  function calcDefectRate(device, company) {
    const installed = getInstalledComps(device);
    const totalTDP  = installed.reduce((s, c) => s + (c.tdpWatts || 0), 0);
    const cooling   = installed.find(c => c.type === 'Cooling');

    const thermalRisk = cooling ? Math.max(1, totalTDP / Math.max(cooling.maxTDP, 1)) : 2.0;
    const engSkill    = Math.min(5, (company.employees?.engineers || 1));
    const automation  = (company.factories?.[0]?.automationLevel || 1);

    // Check compatibility issues
    const cpu = installed.find(c => c.type === 'CPU');
    const mb  = installed.find(c => c.type === 'Motherboard');
    const compatPenalty = (cpu && mb && cpu.socketType !== mb.socketType) ? 1.5 : 1.0;

    // Passive R&D effect
    const qcBonus = (company.unlockedTechs || []).includes('rnd_quality_control') ? 0.7 : 1.0;

    const base = 0.12;
    const rate = base * (1 / engSkill) * Math.pow(thermalRisk, 1.3) * (1 / automation) * compatPenalty * qcBonus;
    return Math.max(0.005, Math.min(0.35, rate));
  }

  // ── Press Score (0–100) ───────────────────────────────────
  function calcPressScore(device, market) {
    const stats    = device.stats || calcDeviceStats(device);
    const cogs     = device.cogs || calcCOGS(device);
    const price    = device.targetRetailPrice || cogs * 2;
    const valueRaw = Math.max(0, 100 - ((price - cogs) / Math.max(cogs, 1)) * 30);
    const value    = Math.min(100, Math.max(0, valueRaw));

    // Category weights
    const W = { performance: 0.40, thermal: 0.25, buildQuality: 0.20, value: 0.15 };

    let base = stats.performanceScore * W.performance
             + stats.thermalScore     * W.thermal
             + stats.buildQualityScore * W.buildQuality
             + value                  * W.value;

    // Trend modifiers
    const activeTrends = (market && market.activeTrends) ? market.activeTrends : [];
    let trendBonus = 0;
    const deviceTags = getAllTags(device);
    activeTrends.forEach(t => {
      t.boostedTags.forEach(bt => { if (deviceTags.includes(bt)) trendBonus += 8 * (t.intensity || 0.5); });
      t.penalizedTags.forEach(pt => { if (deviceTags.includes(pt)) trendBonus -= 6 * (t.intensity || 0.5); });
    });

    // Innovation bonus (flagship components)
    const installed = getInstalledComps(device);
    const hasFlag   = installed.some(c => c.tier === 5);
    const innovBonus = hasFlag ? 5 : 0;

    // Defect penalty
    const defectPenalty = (device.defectRate || 0) > 0.10 ? -15 : 0;

    return Math.max(0, Math.min(100, Math.round(base + trendBonus + innovBonus + defectPenalty)));
  }

  function getAllTags(device) {
    const installed = getInstalledComps(device);
    const compTags  = installed.flatMap(c => c.tags || []);
    const housingTags = device.housing?.material === 'aluminum' ? ['premium'] :
                        device.housing?.material === 'carbon_fiber' ? ['premium','flagship'] : [];
    const rgbTags   = device.housing?.hasRGB ? ['rgb'] : [];
    return [...new Set([...compTags, ...housingTags, ...rgbTags])];
  }

  // ── Suggested Retail Price ─────────────────────────────────
  function suggestPrice(device) {
    const cogs = calcCOGS(device);
    return {
      budget:   Math.round(cogs * 1.25),
      standard: Math.round(cogs * 1.65),
      premium:  Math.round(cogs * 2.30),
    };
  }

  return { calcDeviceStats, calcCOGS, calcDefectRate, calcPressScore, suggestPrice, getAllTags };
})();

/* ═══════════════════════════════════════════════════════════
   MARKET SYSTEM
═══════════════════════════════════════════════════════════ */
ITG.Market = (function () {

  function init(state) {
    // Initialize competitors from Data
    state.market.competitors = ITG.Data.brands.map(b => Object.assign({}, b, {
      products: [_genCompetitorProduct(b, state.meta.week)],
      nextProductWeek: state.meta.week + Math.floor(Math.random() * 12) + 8,
    }));
    state.market.activeTrends = [];
    state.market.recentEvents = [];
  }

  function _genCompetitorProduct(brand, week) {
    const names = {
      budget:  ['ValueBox',  'BudgetCore', 'SmartPC',   'EcoRig'],
      premium: ['PrimeTower','EliteDesk',  'ProSystem',  'MaxStudio'],
      gaming:  ['GameBeast', 'StrikeFire', 'BladeRig',  'NexPC'],
      eco:     ['GreenMind', 'EcoTower',   'NaturePro', 'CleanBuild'],
    };
    const pool = names[brand.strategy] || names.budget;
    const name = brand.name + ' ' + pool[Math.floor(Math.random() * pool.length)];
    const tier = { budget: 2, premium: 4, gaming: 3, eco: 2 }[brand.strategy] || 2;
    return {
      id: brand.id + '_prod_' + week,
      name, tier,
      pressScore: 45 + tier * 8 + Math.random() * 15,
      retailPrice: 400 + tier * 180 + Math.random() * 200,
      weeklySales: Math.floor(50 + tier * 40 + Math.random() * 80),
      weekLaunched: week,
      brand: brand.id,
    };
  }

  function _applyTrendDecay(state) {
    state.market.activeTrends = state.market.activeTrends.filter(t => {
      t.weeksActive = (t.weeksActive || 0) + 1;
      if (t.weeksActive >= t.durationWeeks) return false;
      // Update intensity based on curve
      const progress = t.weeksActive / t.durationWeeks;
      if (t.intensityCurve === 'bell') {
        t.intensity = Math.sin(progress * Math.PI);
      } else if (t.intensityCurve === 'spike') {
        t.intensity = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      } else {
        t.intensity = progress < 0.5 ? progress * 2 : 1; // gradual
      }
      return true;
    });
  }

  function _maybeStartTrend(state) {
    if (Math.random() > 0.05) return null; // 5% per week
    if (state.market.activeTrends.length >= 3) return null;

    const usedIds = state.market.activeTrends.map(t => t.id);
    const available = ITG.Data.trends.filter(t => !usedIds.includes(t.id));
    if (!available.length) return null;

    const trend = Object.assign({}, available[Math.floor(Math.random() * available.length)], {
      weeksActive: 0, intensity: 0.1,
    });
    state.market.activeTrends.push(trend);
    return trend;
  }

  function _maybeFireEvent(state) {
    for (const ev of ITG.Data.randomEvents) {
      if (Math.random() < (ev.probability || 0.03)) {
        const result = ev.effect(state);
        if (result !== null && result !== undefined) {
          const entry = { icon: ev.icon, title: ev.title, detail: result, week: state.meta.week, year: state.meta.year };
          state.market.recentEvents.unshift(entry);
          if (state.market.recentEvents.length > 20) state.market.recentEvents.pop();
          return entry;
        }
      }
    }
    return null;
  }

  function _decayMultipliers(state) {
    if (state.market._costMultiplierWeeks > 0) {
      state.market._costMultiplierWeeks--;
      if (state.market._costMultiplierWeeks <= 0) {
        state.market._costMultiplier = 1.0;
      }
    }
    if (state.market._demandMultiplierWeeks > 0) {
      state.market._demandMultiplierWeeks--;
      if (state.market._demandMultiplierWeeks <= 0) {
        state.market._demandMultiplier = 1.0;
      }
    }
  }

  function simulateWeeklySales(product, state) {
    if (product.lifecycle !== 'launched') return 0;

    const market = state.market;
    const company = state.company;

    // Base demand from press score
    const pressBase = (product.pressScore || 50) / 100;
    const baseDemand = 80 * pressBase;

    // Lifecycle curve: weeks since launch
    const age = (state.meta.year - 1) * 52 + state.meta.week - (product.weekLaunched || 1);
    let lifeMult;
    if (age < 4)       lifeMult = 0.5 + age * 0.15;  // ramp-up
    else if (age < 20) lifeMult = 1.0;                // peak
    else if (age < 40) lifeMult = 1.0 - (age - 20) / 30; // decline
    else               lifeMult = 0.1;                // long tail

    // Brand awareness boost
    const awaMult = 0.7 + (company.brandAwareness / 100) * 0.5;

    // Trend multiplier
    const trendMult = ITG.Calculator.getAllTags ? _getTrendMultiplier(product, market) : 1.0;

    // Market demand global modifier
    const globalDemand = market._demandMultiplier || 1.0;

    // Price competitiveness vs competitors
    const avgCompPrice = market.competitors.reduce((s, c) =>
      s + (c.products[0]?.retailPrice || 800), 0) / Math.max(market.competitors.length, 1);
    const priceMult = avgCompPrice > 0
      ? Math.max(0.5, Math.min(1.3, avgCompPrice / Math.max(product.targetRetailPrice || 800, 1)))
      : 1.0;

    // Bonus sales from viral events
    const bonus = product.weeklyBonusSales || 0;
    if (product.weeklyBonusSales > 0) product.weeklyBonusSales = Math.max(0, product.weeklyBonusSales - 20);

    const rawSales = (baseDemand * lifeMult * awaMult * trendMult * globalDemand * priceMult) + bonus;
    const defectReturns = rawSales * (product.defectRate || 0.05);
    const netSales = Math.max(0, Math.floor(rawSales - defectReturns));

    return netSales;
  }

  function _getTrendMultiplier(product, market) {
    let mult = 1.0;
    const tags = (product.tags || []).concat(product.housingTags || []);
    (market.activeTrends || []).forEach(t => {
      t.boostedTags.forEach(bt => { if (tags.includes(bt)) mult += 0.15 * (t.intensity || 0.5); });
      t.penalizedTags.forEach(pt => { if (tags.includes(pt)) mult -= 0.10 * (t.intensity || 0.5); });
    });
    return Math.max(0.3, Math.min(2.0, mult));
  }

  function _updateCompetitors(state) {
    state.market.competitors.forEach(comp => {
      // Check if competitor releases new product
      if (state.meta.week >= (comp.nextProductWeek || 9999)) {
        const newProd = _genCompetitorProduct(comp, state.meta.week);
        comp.products.unshift(newProd);
        if (comp.products.length > 3) comp.products.pop();
        comp.nextProductWeek = state.meta.week + Math.floor(Math.random() * 16) + 8;
        state.market.recentEvents.unshift({
          icon: '🏭',
          title: `${comp.name} launched ${newProd.name}`,
          detail: `Press score: ${Math.round(newProd.pressScore)}/100, Price: $${Math.round(newProd.retailPrice)}`,
          week: state.meta.week, year: state.meta.year,
        });
      }
    });
  }

  function _updateMarketShare(state) {
    // Simple market share model: based on total weekly revenue
    const playerRevenue = state.products.filter(p => p.lifecycle === 'launched')
      .reduce((s, p) => s + (p.lastWeekRevenue || 0), 0);

    const total = playerRevenue + state.market.competitors.reduce((s, c) => {
      return s + c.products.reduce((ps, p) => ps + p.weeklySales * (p.retailPrice || 800), 0);
    }, 0);

    if (total > 0) {
      state.company._marketShare = Math.round((playerRevenue / total) * 100);
    } else {
      state.company._marketShare = 0;
    }
  }

  function tick(state) {
    const results = { salesByProduct: {}, newTrend: null, newEvent: null };

    _decayMultipliers(state);
    _applyTrendDecay(state);
    results.newTrend = _maybeStartTrend(state);
    results.newEvent = _maybeFireEvent(state);
    _updateCompetitors(state);

    // Simulate sales for each launched product
    let totalIncome = 0;
    state.products.forEach(product => {
      const units = simulateWeeklySales(product, state);
      const revenue = units * (product.targetRetailPrice || 0);
      const cogs    = units * (product.cogs || 0);
      const profit  = revenue - cogs;

      product.totalUnitsSold  = (product.totalUnitsSold || 0) + units;
      product.totalRevenue    = (product.totalRevenue || 0) + revenue;
      product.lastWeekSales   = units;
      product.lastWeekRevenue = revenue;
      product.lastWeekProfit  = profit;

      // ── UI-compatibility aliases (ui.js reads these) ──
      product.sales        = product.totalUnitsSold;
      product.revenue      = product.totalRevenue;
      product.weeklySales  = units;
      product.weeklyRevenue= revenue;
      product.score        = product.pressScore;
      product.overallScore = product.pressScore;
      product.price        = product.targetRetailPrice;
      product.stage        = product.lifecycle;

      // Store history for charts
      if (!product.salesHistory) product.salesHistory = [];
      product.salesHistory.push({ week: state.meta.week, year: state.meta.year, units, revenue });
      if (product.salesHistory.length > 52) product.salesHistory.shift();

      results.salesByProduct[product.id] = { units, revenue, profit };
      totalIncome += revenue;
    });

    _updateMarketShare(state);

    return { ...results, totalIncome };
  }

  function getMarketShare(state) {
    return {
      player: state.company._marketShare || 0,
      competitors: state.market.competitors.map(c => ({ name: c.name, share: c.marketShare, color: c.color })),
    };
  }

  return { init, tick, simulateWeeklySales, getMarketShare };
})();

/* ═══════════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════════ */
ITG.GameState = (function () {

  const _SAVE_KEY = 'itg_save_v1';

  const state = {
    meta: { week: 1, year: 1, paused: false, speed: 1, gameOver: false, victory: false, gameEnded: false },
    company: {
      name: 'NovaTech',
      money: 2000000,
      reputation: 30,
      brandAwareness: 20,
      employees: { engineers: 5, designers: 2, marketers: 2 },
      salaryPerWeek: 15000,  // total weekly payroll
      factories: [{ id:'f1', name:'Factory Alpha', automationLevel:1, capacity:500, maintenanceCost:5000 }],
      rndPoints: 0,
      rndPointsPerWeek: 50,  // 10 * engineers
      unlockedTechs: [],
      researchQueue: [],    // [{techId, pointsInvested}]
      _marketShare: 0,
    },
    products: [],
    market: {
      competitors: [],
      activeTrends: [],
      recentEvents: [],
      _costMultiplier: 1.0,
      _costMultiplierWeeks: 0,
      _demandMultiplier: 1.0,
      _demandMultiplierWeeks: 0,
      _negativeEventsSurvived: 0,
    },
    finance: {
      weeklyIncome: 0,
      weeklyExpenses: 0,
      history: [],
      totalRevenue: 0,
      totalExpenses: 0,
      _bankruptWeeks: 0,
      _profitStreak: 0,
      _maxProfitStreak: 0,
    },
  };

  function newGame() {
    Object.assign(state.meta, { week: 1, year: 1, paused: false, speed: 1, gameOver: false, victory: false, gameEnded: false });
    state.company.name = 'NovaTech';
    state.company.money = 2000000;
    state.company.reputation = 30;
    state.company.brandAwareness = 20;
    state.company.employees = { engineers: 5, designers: 2, marketers: 2 };
    state.company.salaryPerWeek = 15000;
    state.company.factories = [{ id:'f1', name:'Factory Alpha', automationLevel:1, capacity:500, maintenanceCost:5000 }];
    state.company.rndPoints = 0;
    state.company.rndPointsPerWeek = 50;
    state.company.unlockedTechs = [];
    state.company.researchQueue = [];
    state.company._marketShare = 0;
    state.products = [];
    state.market.competitors = [];
    state.market.activeTrends = [];
    state.market.recentEvents = [];
    state.market._costMultiplier = 1.0;
    state.market._costMultiplierWeeks = 0;
    state.market._demandMultiplier = 1.0;
    state.market._demandMultiplierWeeks = 0;
    state.market._negativeEventsSurvived = 0;
    state.finance.weeklyIncome = 0;
    state.finance.weeklyExpenses = 0;
    state.finance.history = [];
    state.finance.totalRevenue = 0;
    state.finance.totalExpenses = 0;
    state.finance._bankruptWeeks = 0;
    state.finance._profitStreak = 0;
    state.finance._maxProfitStreak = 0;
    deleteSave();
    ITG.Market.init(state);
    ITG.EventBus.emit('game:newgame');
  }

  function _checkVictoryDefeat() {
    if (state.meta.gameEnded) return;
    const net = state.finance.weeklyIncome - state.finance.weeklyExpenses;
    if (net > 0) {
      state.finance._profitStreak++;
      if (state.finance._profitStreak > state.finance._maxProfitStreak) state.finance._maxProfitStreak = state.finance._profitStreak;
    } else {
      state.finance._profitStreak = 0;
    }
    if (state.company.money < 0) {
      state.finance._bankruptWeeks++;
      if (state.finance._bankruptWeeks >= 4 && state.company.money < -500000) {
        state.meta.gameOver = true;
        state.meta.gameEnded = true;
        ITG.EventBus.emit('game:defeat');
        return;
      }
      if (state.finance._bankruptWeeks === 2) ITG.EventBus.emit('toast:show', { message: ITG.I18n ? ITG.I18n.t('game.bankruptWarn', { weeks: 2 }) : 'Bankruptcy warning!', type: 'warning' });
      if (state.finance._bankruptWeeks === 3) ITG.EventBus.emit('toast:show', { message: ITG.I18n ? ITG.I18n.t('game.bankruptWarnCritical') : 'Critical bankruptcy!', type: 'error' });
    } else {
      state.finance._bankruptWeeks = 0;
    }
    if ((state.company._marketShare || 0) >= 60 && state.company.money >= 50000000) {
      state.meta.victory = true;
      state.meta.gameEnded = true;
      ITG.EventBus.emit('game:victory');
    }
  }

  function _applyDynamicDifficulty() {
    if (state.meta.year < 2) return;
    state.market.competitors.forEach(function(c) {
      c.products.forEach(function(p) {
        if (Math.random() < 0.1) p.pressScore = Math.min(100, (p.pressScore || 50) + 1.5);
        if (Math.random() < 0.08) p.weeklySales = Math.floor((p.weeklySales || 50) * 1.05);
      });
    });
  }

  function getWeekLabel() {
    return `Year ${state.meta.year}, Week ${state.meta.week}`;
  }

  function addProduct(device) {
    // Fill in missing fields
    device.id         = device.id || ('dev_' + Date.now());
    device.lifecycle  = device.lifecycle || 'design';
    device.weekCreated = state.meta.week;
    device.yearCreated = state.meta.year;
    device.tags        = ITG.Calculator.getAllTags(device);
    device.housingTags = device.housing?.hasRGB ? ['rgb'] : [];

    const stats = ITG.Calculator.calcDeviceStats(device);
    device.stats      = stats;
    device.cogs       = ITG.Calculator.calcCOGS(device);
    device.defectRate = ITG.Calculator.calcDefectRate(device, state.company);
    device.pressScore = ITG.Calculator.calcPressScore(device, state.market);

    if (!device.targetRetailPrice) {
      const suggested = ITG.Calculator.suggestPrice(device);
      device.targetRetailPrice = suggested.standard;
    }

    // ── UI-compatibility aliases (ui.js reads these field names) ──
    // ui.js uses: p.stage, p.score, p.price, p.sales, p.revenue,
    //             p.weeklySales, p.weeklyRevenue, p.segment, p.overallScore
    device.stage        = device.lifecycle;          // 'design' | 'launched' | 'discontinued'
    device.score        = device.pressScore;         // 0-100
    device.overallScore = device.pressScore;
    device.price        = device.targetRetailPrice;  // retail price
    device.sales        = 0;                         // total units sold
    device.revenue      = 0;                         // total revenue
    device.weeklySales  = 0;
    device.weeklyRevenue= 0;
    device.segment      = device.category || 'PC';
    device.marketingBudget = 0;

    state.products.push(device);
    ITG.EventBus.emit('product:created', { product: device });
    return device;
  }

  function launchProduct(productId) {
    const p = state.products.find(p => p.id === productId);
    if (!p) return;
    p.lifecycle    = 'launched';
    p.stage        = 'launched';   // ui.js alias
    p.weekLaunched = state.meta.week + (state.meta.year - 1) * 52;
    ITG.EventBus.emit('product:launched', { product: p });
    if (window.ITG.Sound) ITG.Sound.play('productLaunch');
    _addNews('🚀', `${p.name} launched!`, `Retail price: ${p.targetRetailPrice} | Est. press score: ${p.pressScore}`);
  }

  function discontinueProduct(productId) {
    const p = state.products.find(p => p.id === productId);
    if (!p) return;
    p.lifecycle = 'discontinued';
    p.stage     = 'discontinued'; // ui.js alias
    ITG.EventBus.emit('product:discontinued', { product: p });
    _addNews('📦', `${p.name} discontinued`, 'Product removed from market.');
  }

  function hirePerson(role) {
    const COSTS = { engineers: 50000, designers: 40000, marketers: 30000 };
    const SALARY = { engineers: 8000, designers: 6000, marketers: 5000 };
    const cost = COSTS[role];
    if (!cost || state.company.money < cost) {
      ITG.EventBus.emit('toast:show', { message: `Not enough money to hire (need $${cost.toLocaleString()})`, type: 'error' });
      return false;
    }
    state.company.money -= cost;
    state.company.employees[role] = (state.company.employees[role] || 0) + 1;
    state.company.salaryPerWeek += SALARY[role];
    _updateRnDRate();
    if (window.ITG.Sound) ITG.Sound.play('hire');
    _addNews('👥', `New ${role.slice(0,-1)} hired`, `Weekly cost: +${SALARY[role].toLocaleString()}`);
    return true;
  }

  function firePerson(role) {
    const SALARY = { engineers: 8000, designers: 6000, marketers: 5000 };
    if ((state.company.employees[role] || 0) <= 0) return false;
    state.company.employees[role]--;
    state.company.salaryPerWeek -= SALARY[role];
    _updateRnDRate();
    if (window.ITG.Sound) ITG.Sound.play('fire');
    return true;
  }

  function upgradeFactory() {
    const COST = 200000;
    if (state.company.money < COST) {
      ITG.EventBus.emit('toast:show', { message: 'Not enough money to upgrade factory', type: 'error' });
      return false;
    }
    const factory = state.company.factories[0];
    if (!factory) return false;
    state.company.money -= COST;
    factory.automationLevel++;
    factory.capacity = Math.round(factory.capacity * 1.3);
    if (window.ITG.Sound) { ITG.Sound.play('purchase'); ITG.Sound.play('factoryUpgrade'); }
    _addNews('🏭', 'Factory upgraded!', `Automation Level ${factory.automationLevel} | Capacity: ${factory.capacity} units/week`);
    return true;
  }

  function startResearch(techId) {
    const tech = ITG.Data.rndTree.find(t => t.id === techId);
    if (!tech) return false;
    if (state.company.money < tech.cost) {
      ITG.EventBus.emit('toast:show', { message: `Need $${tech.cost.toLocaleString()} to start research`, type: 'error' });
      return false;
    }
    if (state.company.unlockedTechs.includes(techId)) return false;
    if (state.company.researchQueue.find(r => r.techId === techId)) return false;

    // Check prerequisites
    for (const req of (tech.requires || [])) {
      if (!state.company.unlockedTechs.includes(req)) {
        ITG.EventBus.emit('toast:show', { message: `Required: ${req} must be unlocked first`, type: 'error' });
        return false;
      }
    }

    state.company.money -= tech.cost;
    state.company.researchQueue.push({ techId, pointsInvested: 0 });
    if (window.ITG.Sound) ITG.Sound.play('purchase');
    _addNews('🔬', `Research started: ${tech.name}`, `Cost: ${tech.cost.toLocaleString()} | Req: ${tech.pointsRequired} pts`);
    return true;
  }

  function _tickResearch() {
    if (!state.company.researchQueue.length) return;

    const pointsAvail = state.company.rndPointsPerWeek;
    const perItem = Math.floor(pointsAvail / state.company.researchQueue.length);
    state.company.rndPoints += pointsAvail;

    const completed = [];
    state.company.researchQueue.forEach(item => {
      item.pointsInvested += perItem;
      const tech = ITG.Data.rndTree.find(t => t.id === item.techId);
      if (tech && item.pointsInvested >= tech.pointsRequired) {
        completed.push(item.techId);
      }
    });

    completed.forEach(techId => {
      state.company.researchQueue = state.company.researchQueue.filter(r => r.techId !== techId);
      state.company.unlockedTechs.push(techId);
      const tech = ITG.Data.rndTree.find(t => t.id === techId);
      if (tech) {
        // Unlock components
        (tech.unlocks || []).forEach(cid => {
          const comp = ITG.Data.components.find(c => c.id === cid);
          if (comp) comp.unlocked = true;
        });
        _addNews('✅', `Research complete: ${tech.name}`, `Unlocked: ${tech.unlocks.join(', ') || 'passive effect'}`);
        if (window.ITG.Sound) ITG.Sound.play('researchComplete');
        ITG.EventBus.emit('toast:show', { message: `🔬 Research complete: ${tech.name}!`, type: 'success' });
      }
    });
  }

  function _updateRnDRate() {
    state.company.rndPointsPerWeek = 10 * (state.company.employees.engineers || 1);
  }

  function _addNews(icon, title, detail) {
    const entry = { icon, title, detail, week: state.meta.week, year: state.meta.year };
    state.market.recentEvents.unshift(entry);
    if (state.market.recentEvents.length > 30) state.market.recentEvents.pop();
  }

  // ── Main Advance (one week tick) ──────────────────────────
  function advance() {
    // 1. Market tick (sales, trends, events)
    const marketResult = ITG.Market.tick(state);

    // 2. R&D progress
    _tickResearch();

    // 2.5. Dynamic difficulty (year 2+)
    _applyDynamicDifficulty();

    // 3. Calculate expenses
    const factoryMaint = state.company.factories.reduce((s, f) => s + f.maintenanceCost, 0);
    const weeklyExpenses = state.company.salaryPerWeek + factoryMaint;

    // 4. Calculate income from product sales
    const weeklyIncome = marketResult.totalIncome || 0;

    // 5. Update finances
    state.company.money += weeklyIncome - weeklyExpenses;
    state.finance.weeklyIncome   = weeklyIncome;
    state.finance.weeklyExpenses = weeklyExpenses;
    state.finance.totalRevenue   += weeklyIncome;
    state.finance.totalExpenses  += weeklyExpenses;
    state.finance.history.push({
      week: state.meta.week, year: state.meta.year,
      income: weeklyIncome, expenses: weeklyExpenses,
      profit: weeklyIncome - weeklyExpenses,
    });
    if (state.finance.history.length > 52) state.finance.history.shift();

    // 6. Reputation decay / growth from sales
    const launched = state.products.filter(p => p.lifecycle === 'launched');
    if (launched.length > 0) {
      const avgScore = launched.reduce((s, p) => s + (p.pressScore || 50), 0) / launched.length;
      const repDelta = (avgScore - 60) / 200; // slow drift toward press score
      state.company.reputation = Math.max(0, Math.min(100, state.company.reputation + repDelta));
    }

    // 7. Brand awareness from marketers
    state.company.brandAwareness = Math.min(100,
      state.company.brandAwareness + (state.company.employees.marketers || 0) * 0.5);

    // 8. Advance time
    state.meta.week++;
    if (state.meta.week > 52) { state.meta.week = 1; state.meta.year++; }

    // 9. Add news for significant events
    if (marketResult.newTrend) {
      _addNews(marketResult.newTrend.icon, `New Trend: ${marketResult.newTrend.name}`, marketResult.newTrend.description);
      ITG.EventBus.emit('toast:show', { message: `📈 New trend: ${marketResult.newTrend.name}`, type: 'info' });
    }
    if (marketResult.newEvent) {
      ITG.EventBus.emit('toast:show', { message: `${marketResult.newEvent.icon} ${marketResult.newEvent.title}`, type: 'warning' });
    }

    // 10. Auto-save every 4 weeks
    if (state.meta.week % 4 === 0) save();

    // 11. Check victory / defeat
    _checkVictoryDefeat();

    // 12. Check achievements
    if (window.ITG.Achievements) ITG.Achievements.checkAll(state);

    if (window.ITG.Sound) ITG.Sound.play('weekTick');
      if (weeklyIncome > weeklyExpenses && window.ITG.Sound) ITG.Sound.play('money');
  }

  // ── Save / Load ────────────────────────────────────────────
  function save() {
    try {
      // Don't save non-serializable ITG.Data references in components
      const saveState = JSON.parse(JSON.stringify(state));
      localStorage.setItem(_SAVE_KEY, JSON.stringify(saveState));
    } catch(e) { console.warn('[Save] Failed:', e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(_SAVE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      Object.assign(state.meta,    saved.meta    || {});
      Object.assign(state.company, saved.company || {});
      Object.assign(state.finance, saved.finance || {});
      Object.assign(state.market,  saved.market  || {});
      state.products = saved.products || [];

      // Re-unlock components from saved tech list
      (state.company.unlockedTechs || []).forEach(techId => {
        const tech = ITG.Data.rndTree.find(t => t.id === techId);
        if (tech) {
          (tech.unlocks || []).forEach(cid => {
            const comp = ITG.Data.components.find(c => c.id === cid);
            if (comp) comp.unlocked = true;
          });
        }
      });

      console.log('[ITG] Game loaded:', getWeekLabel());
      return true;
    } catch(e) {
      console.warn('[Load] Failed:', e);
      return false;
    }
  }

  function deleteSave() {
    localStorage.removeItem(_SAVE_KEY);
  }

  // Merge state into the exported object for direct access (e.g., GameState.meta.week)
  return Object.assign(state, { advance, save, load, deleteSave, newGame, addProduct, launchProduct, discontinueProduct, hirePerson, firePerson, upgradeFactory, startResearch, getWeekLabel });
})();
