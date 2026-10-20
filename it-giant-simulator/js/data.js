/**
 * IT Giant Simulator — Data Layer
 * All static game data: components, brands, trends, events, R&D tree
 */
window.ITG = window.ITG || {};

window.ITG.Data = (function () {

  // ─── COMPONENTS DATABASE ──────────────────────────────────────────────────
  const components = [
    // ── CPUs ──
    { id:'cpu_duo_e2', name:'DuoCore E2', type:'CPU', tier:1, socketType:'NX3',
      tdpWatts:35, performanceTier:2, baseCostUSD:80, qualityMultiplier:1.0,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:38,
      tags:['budget','efficient'], color:0x1a3a6a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'cpu_quad_m4', name:'QuadFlow M4', type:'CPU', tier:2, socketType:'NX3',
      tdpWatts:65, performanceTier:4, baseCostUSD:160, qualityMultiplier:1.05,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:40,
      tags:['mid-range','balanced'], color:0x1a4a8a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'cpu_octa_g8', name:'OctaStrike G8', type:'CPU', tier:3, socketType:'NX5',
      tdpWatts:105, performanceTier:6, baseCostUSD:280, qualityMultiplier:1.15,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:42,
      tags:['gaming','high-performance'], color:0x1a5aaa, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'cpu_apex_x12', name:'Apex X12 Pro', type:'CPU', tier:4, socketType:'NX5',
      tdpWatts:125, performanceTier:8, baseCostUSD:420, qualityMultiplier:1.3,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:45,
      tags:['enthusiast','gaming','workstation'], color:0x2a5acc, unlocked:false,
      researchRequired:'rnd_advanced_cpu', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'cpu_titan_x16', name:'Titan X16 WS', type:'CPU', tier:5, socketType:'NX5',
      tdpWatts:165, performanceTier:9, baseCostUSD:680, qualityMultiplier:1.5,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:50,
      tags:['workstation','flagship','professional'], color:0x3a6aee, unlocked:false,
      researchRequired:'rnd_advanced_cpu', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'cpu_nova_24', name:'Nova Ultra 24K', type:'CPU', tier:5, socketType:'NX5',
      tdpWatts:200, performanceTier:10, baseCostUSD:980, qualityMultiplier:1.7,
      widthMm:37.5, heightMm:37.5, depthMm:4, weightGrams:55,
      tags:['flagship','ai_accel','extreme'], color:0x4a7aff, unlocked:false,
      researchRequired:'rnd_ai_chip', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    // ── GPUs ──
    { id:'gpu_integrated', name:'UltraHD Integrated', type:'GPU', tier:1, socketType:null,
      tdpWatts:15, performanceTier:1, baseCostUSD:0, qualityMultiplier:1.0,
      widthMm:0, heightMm:0, depthMm:0, weightGrams:0,
      tags:['budget','integrated'], color:0x2a5a2a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'gpu_rx260', name:'RadVolt RX-260', type:'GPU', tier:2, socketType:'PCIe_x16',
      tdpWatts:75, performanceTier:3, baseCostUSD:180, qualityMultiplier:1.0,
      widthMm:230, heightMm:130, depthMm:40, weightGrams:680,
      tags:['budget','gaming'], color:0x1a6a3a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'gpu_rx480', name:'RadVolt RX-480 XT', type:'GPU', tier:3, socketType:'PCIe_x16',
      tdpWatts:150, performanceTier:6, baseCostUSD:380, qualityMultiplier:1.15,
      widthMm:290, heightMm:135, depthMm:50, weightGrams:980,
      tags:['gaming','mid-range','rgb'], color:0x2a7a4a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'gpu_rx700', name:'RadVolt RX-700 Black', type:'GPU', tier:4, socketType:'PCIe_x16',
      tdpWatts:220, performanceTier:8, baseCostUSD:680, qualityMultiplier:1.35,
      widthMm:320, heightMm:140, depthMm:55, weightGrams:1350,
      tags:['high-end','gaming','rgb'], color:0x3a8a5a, unlocked:false,
      researchRequired:'rnd_gpu_arch', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    { id:'gpu_rx900x', name:'RadVolt RX-900X Titan', type:'GPU', tier:5, socketType:'PCIe_x16',
      tdpWatts:320, performanceTier:10, baseCostUSD:1200, qualityMultiplier:1.6,
      widthMm:340, heightMm:150, depthMm:65, weightGrams:1900,
      tags:['extreme','flagship','4k','rgb'], color:0x4a9a6a, unlocked:false,
      researchRequired:'rnd_gpu_arch', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null },

    // ── RAM ──
    { id:'ram_8gb_ddr5', name:'SwiftMem 8GB DDR5', type:'RAM', tier:1, socketType:'DDR5',
      tdpWatts:5, performanceTier:3, baseCostUSD:35, qualityMultiplier:1.0,
      widthMm:133, heightMm:35, depthMm:8, weightGrams:35,
      tags:['budget'], color:0x4a1a6a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      capacityGB:8, speedMHz:4800 },

    { id:'ram_16gb_ddr5', name:'SwiftMem 16GB DDR5', type:'RAM', tier:2, socketType:'DDR5',
      tdpWatts:6, performanceTier:5, baseCostUSD:65, qualityMultiplier:1.05,
      widthMm:133, heightMm:40, depthMm:8, weightGrams:40,
      tags:['balanced'], color:0x5a2a7a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      capacityGB:16, speedMHz:5600 },

    { id:'ram_32gb_ddr5', name:'SwiftMem 32GB DDR5 Pro', type:'RAM', tier:3, socketType:'DDR5',
      tdpWatts:8, performanceTier:7, baseCostUSD:120, qualityMultiplier:1.15,
      widthMm:133, heightMm:45, depthMm:8, weightGrams:45,
      tags:['high-performance','workstation'], color:0x6a3a8a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      capacityGB:32, speedMHz:6400 },

    { id:'ram_64gb_ddr5', name:'SwiftMem 64GB DDR5 Ultra', type:'RAM', tier:4, socketType:'DDR5',
      tdpWatts:12, performanceTier:9, baseCostUSD:240, qualityMultiplier:1.3,
      widthMm:133, heightMm:50, depthMm:8, weightGrams:50,
      tags:['flagship','workstation','ai_accel'], color:0x7a4a9a, unlocked:false,
      researchRequired:'rnd_hbw_ram', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      capacityGB:64, speedMHz:7200 },

    // ── Motherboards ──
    { id:'mb_budget_atx', name:'CoreBoard B550 ATX', type:'Motherboard', tier:1, socketType:'NX3',
      tdpWatts:8, performanceTier:2, baseCostUSD:90, qualityMultiplier:1.0,
      widthMm:305, heightMm:244, depthMm:3, weightGrams:700,
      tags:['budget'], color:0x1a3a1a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:350, wattage:null,
      formFactor:'ATX', ramTypes:['DDR5'], slots:['CPU_NX3','PCIe_x16','DDR5','M2','SATA'] },

    { id:'mb_gaming_atx', name:'StrikeBrd X670 Gaming', type:'Motherboard', tier:3, socketType:'NX5',
      tdpWatts:12, performanceTier:6, baseCostUSD:220, qualityMultiplier:1.2,
      widthMm:305, heightMm:244, depthMm:3, weightGrams:850,
      tags:['gaming','rgb'], color:0x1a4a2a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:380, wattage:null,
      formFactor:'ATX', ramTypes:['DDR5'], slots:['CPU_NX5','PCIe_x16','PCIe_x4','DDR5','DDR5','M2','M2','SATA'] },

    { id:'mb_premium_atx', name:'PremBrd Z890 Pro', type:'Motherboard', tier:5, socketType:'NX5',
      tdpWatts:15, performanceTier:9, baseCostUSD:420, qualityMultiplier:1.4,
      widthMm:305, heightMm:244, depthMm:3, weightGrams:1000,
      tags:['premium','workstation','overclocking'], color:0x1a5a3a, unlocked:false,
      researchRequired:'rnd_advanced_cpu', maxTDP:null, maxLength:400, wattage:null,
      formFactor:'ATX', ramTypes:['DDR5'], slots:['CPU_NX5','PCIe_x16','PCIe_x16','PCIe_x4','DDR5','DDR5','DDR5','DDR5','M2','M2','M2','SATA'] },

    // ── Storage ──
    { id:'hdd_1tb', name:'VaultDrive 1TB HDD', type:'Storage', tier:1, socketType:'SATA',
      tdpWatts:6, performanceTier:2, baseCostUSD:40, qualityMultiplier:1.0,
      widthMm:101, heightMm:26, depthMm:147, weightGrams:480,
      tags:['budget','mass-storage'], color:0x6a3a1a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      readSpeedMBs:180, writeSpeedMBs:160 },

    { id:'nvme_1tb', name:'BlitzDrive NVMe 1TB', type:'Storage', tier:3, socketType:'M2',
      tdpWatts:7, performanceTier:6, baseCostUSD:90, qualityMultiplier:1.1,
      widthMm:80, heightMm:22, depthMm:3.5, weightGrams:10,
      tags:['gaming','fast'], color:0x8a4a2a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      readSpeedMBs:5000, writeSpeedMBs:4200 },

    { id:'nvme_2tb_pro', name:'BlitzDrive NVMe 2TB Pro', type:'Storage', tier:5, socketType:'M2',
      tdpWatts:9, performanceTier:9, baseCostUSD:200, qualityMultiplier:1.3,
      widthMm:80, heightMm:22, depthMm:3.5, weightGrams:12,
      tags:['flagship','workstation','fast'], color:0xaa5a3a, unlocked:false,
      researchRequired:'rnd_nvme_gen5', maxTDP:null, maxLength:null, wattage:null,
      formFactor:null, ramTypes:null, slots:null,
      readSpeedMBs:10000, writeSpeedMBs:8500 },

    // ── Cooling ──
    { id:'cool_stock', name:'Stock Cooler', type:'Cooling', tier:1, socketType:null,
      tdpWatts:5, performanceTier:1, baseCostUSD:0, qualityMultiplier:1.0,
      widthMm:90, heightMm:60, depthMm:90, weightGrams:280,
      tags:['budget','included'], color:0x4a4a5a, unlocked:true,
      researchRequired:null, maxTDP:65, maxLength:null, wattage:null,
      noiseDB:42, formFactor:null, ramTypes:null, slots:null },

    { id:'cool_tower', name:'IceTower 120 Air', type:'Cooling', tier:2, socketType:null,
      tdpWatts:7, performanceTier:4, baseCostUSD:45, qualityMultiplier:1.05,
      widthMm:120, heightMm:155, depthMm:80, weightGrams:780,
      tags:['air-cooled','silent'], color:0x5a5a6a, unlocked:true,
      researchRequired:null, maxTDP:150, maxLength:null, wattage:null,
      noiseDB:28, formFactor:null, ramTypes:null, slots:null },

    { id:'cool_aio240', name:'ChillMax AIO 240', type:'Cooling', tier:3, socketType:null,
      tdpWatts:10, performanceTier:6, baseCostUSD:95, qualityMultiplier:1.15,
      widthMm:240, heightMm:120, depthMm:27, weightGrams:880,
      tags:['liquid','gaming','rgb'], color:0x2a5a7a, unlocked:true,
      researchRequired:null, maxTDP:220, maxLength:null, wattage:null,
      noiseDB:32, formFactor:null, ramTypes:null, slots:null },

    { id:'cool_aio360', name:'ChillMax AIO 360 Ultra', type:'Cooling', tier:5, socketType:null,
      tdpWatts:12, performanceTier:9, baseCostUSD:180, qualityMultiplier:1.3,
      widthMm:360, heightMm:120, depthMm:27, weightGrams:1100,
      tags:['liquid','flagship','silent'], color:0x3a6a8a, unlocked:false,
      researchRequired:'rnd_silent_fan', maxTDP:380, maxLength:null, wattage:null,
      noiseDB:22, formFactor:null, ramTypes:null, slots:null },

    // ── PSUs ──
    { id:'psu_550w', name:'PowerEdge 550W Bronze', type:'PSU', tier:1, socketType:null,
      tdpWatts:0, performanceTier:2, baseCostUSD:55, qualityMultiplier:1.0,
      widthMm:150, heightMm:86, depthMm:140, weightGrams:1200,
      tags:['budget'], color:0x3a3a3a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:550,
      formFactor:null, ramTypes:null, slots:null },

    { id:'psu_750w', name:'PowerEdge 750W Gold', type:'PSU', tier:3, socketType:null,
      tdpWatts:0, performanceTier:5, baseCostUSD:100, qualityMultiplier:1.1,
      widthMm:150, heightMm:86, depthMm:160, weightGrams:1500,
      tags:['mid-range','efficient'], color:0x4a4a1a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:null, wattage:750,
      formFactor:null, ramTypes:null, slots:null },

    { id:'psu_1000w', name:'PowerEdge 1000W Platinum', type:'PSU', tier:5, socketType:null,
      tdpWatts:0, performanceTier:9, baseCostUSD:180, qualityMultiplier:1.3,
      widthMm:150, heightMm:86, depthMm:180, weightGrams:1800,
      tags:['flagship','efficient','silent'], color:0x5a5a2a, unlocked:false,
      researchRequired:'rnd_efficient_psu', maxTDP:null, maxLength:null, wattage:1000,
      formFactor:null, ramTypes:null, slots:null },

    // ── Cases ──
    { id:'case_budget', name:'AirBox Mid-Tower', type:'Case', tier:1, socketType:null,
      tdpWatts:0, performanceTier:1, baseCostUSD:40, qualityMultiplier:0.9,
      widthMm:200, heightMm:440, depthMm:420, weightGrams:3200,
      tags:['budget','plastic'], color:0x2a2a2a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:310, wattage:null,
      formFactor:'ATX', ramTypes:null, slots:null },

    { id:'case_gaming', name:'Nexus PRO Mid-Tower', type:'Case', tier:3, socketType:null,
      tdpWatts:0, performanceTier:5, baseCostUSD:90, qualityMultiplier:1.1,
      widthMm:215, heightMm:465, depthMm:450, weightGrams:5800,
      tags:['gaming','rgb','tempered-glass'], color:0x1a1a2a, unlocked:true,
      researchRequired:null, maxTDP:null, maxLength:370, wattage:null,
      formFactor:'ATX', ramTypes:null, slots:null },

    { id:'case_premium', name:'Monolith Full-Tower', type:'Case', tier:5, socketType:null,
      tdpWatts:0, performanceTier:9, baseCostUSD:200, qualityMultiplier:1.4,
      widthMm:240, heightMm:530, depthMm:520, weightGrams:9500,
      tags:['premium','aluminum','silent'], color:0x111820, unlocked:false,
      researchRequired:'rnd_premium_materials', maxTDP:null, maxLength:420, wattage:null,
      formFactor:'ATX', ramTypes:null, slots:null },
  ];

  // ─── AI COMPETITOR BRANDS ────────────────────────────────────────────────
  const brands = [
    { id:'nexcore',   name:'NexCore',   strategy:'budget',   reputation:55, money:5000000,  marketShare:25, color:'#ff8c00' },
    { id:'alphatech', name:'AlphaTech', strategy:'premium',  reputation:80, money:20000000, marketShare:35, color:'#a855f7' },
    { id:'bytestorm', name:'ByteStorm', strategy:'gaming',   reputation:70, money:12000000, marketShare:30, color:'#ff4455' },
    { id:'ecobit',    name:'EcoBit',    strategy:'eco',      reputation:60, money:8000000,  marketShare:10, color:'#00ff88' },
  ];

  // ─── MARKET TRENDS ───────────────────────────────────────────────────────
  const trends = [
    {
      id:'rgb_revolution', name:'RGB Revolution',
      description:'Consumers love glowing PCs. RGB products sell 15% better.',
      boostedTags:['rgb','gaming'], penalizedTags:['silent','minimalist'],
      durationWeeks:14, intensityCurve:'bell', icon:'🌈'
    },
    {
      id:'silent_computing', name:'Silent Computing',
      description:'Noise-conscious buyers reward quiet systems with premium prices.',
      boostedTags:['silent'], penalizedTags:['rgb','gaming'],
      durationWeeks:10, intensityCurve:'bell', icon:'🔇'
    },
    {
      id:'eco_tech', name:'Eco Friendly Tech',
      description:'Environmental concerns push consumers toward efficient hardware.',
      boostedTags:['eco','efficient','low_power'], penalizedTags:['extreme','high-end'],
      durationWeeks:20, intensityCurve:'gradual', icon:'♻️'
    },
    {
      id:'ai_workloads', name:'AI Workloads Surge',
      description:'AI demand skyrockets. High-memory, high-performance systems are hot.',
      boostedTags:['ai_accel','workstation','flagship'], penalizedTags:['budget','integrated'],
      durationWeeks:24, intensityCurve:'gradual', icon:'🤖'
    },
    {
      id:'budget_gaming', name:'Budget Gaming Boom',
      description:'Mid-range gaming PCs dominate. Great price-to-performance wins.',
      boostedTags:['budget','gaming','mid-range'], penalizedTags:['flagship','extreme'],
      durationWeeks:12, intensityCurve:'bell', icon:'🎮'
    },
    {
      id:'premium_minimalist', name:'Premium Minimalism',
      description:'Luxury buyers want understated elegance. Premium builds with clean aesthetics.',
      boostedTags:['premium','aluminum'], penalizedTags:['rgb','plastic'],
      durationWeeks:16, intensityCurve:'bell', icon:'💎'
    },
    {
      id:'overclocking', name:'Overclocking Craze',
      description:'Enthusiasts are pushing hardware to limits. Enthusiast-tier parts sell out.',
      boostedTags:['enthusiast','overclocking','high-performance'], penalizedTags:['efficient','eco'],
      durationWeeks:8, intensityCurve:'spike', icon:'⚡'
    },
    {
      id:'portable_power', name:'Portable Power',
      description:'Compact form factors gain popularity. Smaller, powerful builds are trending.',
      boostedTags:['laptop','handheld','compact'], penalizedTags:['desktop','heavy'],
      durationWeeks:18, intensityCurve:'gradual', icon:'💻'
    },
  ];

  // ─── RANDOM EVENTS ───────────────────────────────────────────────────────
  const randomEvents = [
    {
      id:'supply_shortage', title:'Component Supply Shortage',
      icon:'📦', probability:0.04, type:'negative',
      description:'Global supply constraints hit key components. Costs rise 30% for 4 weeks.',
      effect: function(state) {
        state.market._costMultiplier = (state.market._costMultiplier || 1) * 1.3;
        state.market._costMultiplierWeeks = 4;
        return 'Component costs increased by 30% for 4 weeks.';
      }
    },
    {
      id:'viral_positive', title:'Your Product Goes Viral!',
      icon:'📱', probability:0.03, type:'positive',
      description:'A major influencer reviewed your top product and loved it.',
      effect: function(state) {
        const launched = state.products.filter(p => p.lifecycle === 'launched');
        if (!launched.length) return null;
        const p = launched[Math.floor(Math.random() * launched.length)];
        p.pressScore = Math.min(100, (p.pressScore || 60) + 18);
        p.weeklyBonusSales = (p.weeklyBonusSales || 0) + 200;
        state.company.brandAwareness = Math.min(100, state.company.brandAwareness + 10);
        return `${p.name} went viral! Press score +18, brand awareness +10.`;
      }
    },
    {
      id:'viral_negative', title:'Bad Review Goes Viral',
      icon:'💥', probability:0.025, type:'negative',
      description:'A popular tech critic tore apart one of your products online.',
      effect: function(state) {
        const launched = state.products.filter(p => p.lifecycle === 'launched');
        if (!launched.length) return null;
        const p = launched[Math.floor(Math.random() * launched.length)];
        p.pressScore = Math.max(0, (p.pressScore || 60) - 20);
        state.company.reputation = Math.max(0, state.company.reputation - 8);
        return `${p.name} got a brutal review. Press score -20, reputation -8.`;
      }
    },
    {
      id:'tech_breakthrough', title:'Competitor Tech Breakthrough',
      icon:'🔬', probability:0.03, type:'negative',
      description:'A rival company releases a revolutionary product. Market shifts.',
      effect: function(state) {
        const competitor = state.market.competitors[Math.floor(Math.random() * state.market.competitors.length)];
        competitor.marketShare = Math.min(50, competitor.marketShare + 5);
        competitor.reputation = Math.min(100, competitor.reputation + 8);
        return `${competitor.name} launched a breakthrough product. Their market share grew +5%.`;
      }
    },
    {
      id:'engineer_talent', title:'Talent Pool Opportunity',
      icon:'🧑‍💻', probability:0.04, type:'positive',
      description:'A team of top engineers is available for hiring at reduced cost.',
      effect: function(state) {
        state.market._hireCostDiscount = 0.5; // 50% off next hire
        state.market._hireCostDiscountExpiry = state.meta.week + 3;
        return 'Engineer hiring costs reduced by 50% for the next 3 weeks!';
      }
    },
    {
      id:'recession', title:'Consumer Spending Downturn',
      icon:'📉', probability:0.025, type:'negative',
      description:'Economic headwinds cause consumers to tighten belts. Demand drops.',
      effect: function(state) {
        state.market._demandMultiplier = (state.market._demandMultiplier || 1) * 0.8;
        state.market._demandMultiplierWeeks = 6;
        return 'Consumer demand reduced by 20% for 6 weeks.';
      }
    },
    {
      id:'new_segment', title:'New Market Segment Emerges',
      icon:'🌐', probability:0.03, type:'positive',
      description:'A new buyer demographic emerges, increasing total market size.',
      effect: function(state) {
        state.market._demandMultiplier = (state.market._demandMultiplier || 1) * 1.15;
        state.market._demandMultiplierWeeks = 8;
        state.company.brandAwareness = Math.min(100, state.company.brandAwareness + 5);
        return 'Market expanded! Total demand +15% for 8 weeks.';
      }
    },
    {
      id:'component_crash', title:'Component Price Crash',
      icon:'💸', probability:0.03, type:'positive',
      description:'Oversupply of components drives prices way down.',
      effect: function(state) {
        state.market._costMultiplier = (state.market._costMultiplier || 1) * 0.7;
        state.market._costMultiplierWeeks = 5;
        return 'Component costs reduced by 30% for 5 weeks!';
      }
    },
    {
      id:'factory_accident', title:'Factory Incident',
      icon:'🔥', probability:0.02, type:'negative',
      description:'An accident at one of your factories causes production delays.',
      effect: function(state) {
        if (state.company.factories.length > 0) {
          state.company.factories[0].capacity = Math.max(50, state.company.factories[0].capacity * 0.6);
          return 'Factory capacity reduced by 40% for 3 weeks due to incident.';
        }
        return null;
      }
    },
    {
      id:'influencer', title:'Influencer Partnership',
      icon:'⭐', probability:0.04, type:'positive',
      description:'A top gaming influencer reaches out to review your products.',
      effect: function(state) {
        state.company.brandAwareness = Math.min(100, state.company.brandAwareness + 15);
        state.company.reputation = Math.min(100, state.company.reputation + 5);
        return 'Brand awareness +15, reputation +5 from influencer campaign!';
      }
    },
    {
      id:'chip_fab_fire', title:'Major Chip Fab Disruption',
      icon:'🏭', probability:0.015, type:'negative',
      description:'A major semiconductor fab suffers a disaster. Chip supplies severely limited.',
      effect: function(state) {
        state.market._costMultiplier = (state.market._costMultiplier || 1) * 1.6;
        state.market._costMultiplierWeeks = 8;
        return 'Chip shortage crisis! Component costs +60% for 8 weeks!';
      }
    },
    {
      id:'investment', title:'Investment Opportunity',
      icon:'💼', probability:0.03, type:'positive',
      description:'An investor is impressed by your company and offers capital.',
      effect: function(state) {
        const amount = 500000 + Math.random() * 1000000;
        state.company.money += amount;
        return `Investor injected $${(amount/1000).toFixed(0)}K into your company!`;
      }
    },
  ];

  // ─── R&D TECHNOLOGY TREE ─────────────────────────────────────────────────
  const rndTree = [
    {
      id:'rnd_advanced_cpu', name:'Advanced CPU Architecture',
      description:'Unlocks Apex X12 Pro and Titan X16 WS CPUs.',
      cost:80000, pointsRequired:300,
      unlocks:['cpu_apex_x12','cpu_titan_x16','mb_premium_atx'],
      requires:[], weeks:6, icon:'🔧'
    },
    {
      id:'rnd_ai_chip', name:'Neural Processing Unit',
      description:'Unlocks Nova Ultra 24K with integrated AI accelerator.',
      cost:200000, pointsRequired:800,
      unlocks:['cpu_nova_24'],
      requires:['rnd_advanced_cpu'], weeks:12, icon:'🤖'
    },
    {
      id:'rnd_gpu_arch', name:'Next-Gen GPU Architecture',
      description:'Unlocks RX-700 Black and RX-900X Titan GPUs.',
      cost:150000, pointsRequired:500,
      unlocks:['gpu_rx700','gpu_rx900x'],
      requires:[], weeks:8, icon:'🎮'
    },
    {
      id:'rnd_hbw_ram', name:'High-Bandwidth Memory',
      description:'Unlocks 64GB DDR5 Ultra RAM modules.',
      cost:60000, pointsRequired:200,
      unlocks:['ram_64gb_ddr5'],
      requires:[], weeks:4, icon:'💾'
    },
    {
      id:'rnd_nvme_gen5', name:'NVMe Gen 5 Storage',
      description:'Unlocks BlitzDrive NVMe 2TB Pro with 10GB/s speeds.',
      cost:50000, pointsRequired:180,
      unlocks:['nvme_2tb_pro'],
      requires:[], weeks:4, icon:'💽'
    },
    {
      id:'rnd_silent_fan', name:'Ultra-Silent Fan Technology',
      description:'Unlocks ChillMax AIO 360 Ultra. Also reduces noise ratings across all cooling.',
      cost:70000, pointsRequired:250,
      unlocks:['cool_aio360'],
      requires:[], weeks:5, icon:'🔇'
    },
    {
      id:'rnd_premium_materials', name:'Premium Housing Materials',
      description:'Unlocks Monolith Full-Tower case and carbon fiber housing options.',
      cost:90000, pointsRequired:320,
      unlocks:['case_premium'],
      requires:[], weeks:7, icon:'🏆'
    },
    {
      id:'rnd_efficient_psu', name:'Efficient Power Delivery',
      description:'Unlocks 1000W Platinum PSU. Reduces power consumption across all builds.',
      cost:55000, pointsRequired:190,
      unlocks:['psu_1000w'],
      requires:[], weeks:4, icon:'⚡'
    },
    {
      id:'rnd_overclocking', name:'Overclocking Suite',
      description:'Premium motherboards support 15% higher boost clocks. Increases performance scores.',
      cost:45000, pointsRequired:150,
      unlocks:[],
      requires:['rnd_advanced_cpu'], weeks:3, icon:'🚀',
      passiveEffect:'overclock_boost'
    },
    {
      id:'rnd_quality_control', name:'Advanced Quality Control',
      description:'AI-assisted QC reduces defect rate by 30% across all products.',
      cost:120000, pointsRequired:400,
      unlocks:[],
      requires:[], weeks:8, icon:'✅',
      passiveEffect:'defect_reduction'
    },
  ];

  return { components, brands, trends, randomEvents, rndTree };
})();
