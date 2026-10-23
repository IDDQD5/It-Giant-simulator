/**
 * IT Giant Simulator — 3D Device Constructor / Editor
 * Three.js-based 3D assembly editor where players design & assemble PCs
 * by installing components onto a motherboard inside a customizable chassis.
 */

(function () {
  'use strict';

  window.ITG = window.ITG || {};

  // ─── CONSTANTS & CONFIGURATION ──────────────────────────────────────────

  const SNAP_SLOTS = [
    { id: 'cpu_socket',    label: 'CPU Socket',    position: [ -1.5,  0.5,  0.0 ], type: 'CPU',         size: [2.0, 0.3, 2.0] },
    { id: 'gpu_slot',      label: 'PCIe x16',      position: [  0.0, -0.5,  0.5 ], type: 'GPU',         size: [4.0, 0.6, 1.2] },
    { id: 'ram_slot_1',    label: 'DDR5 Slot 1',   position: [ -0.5,  0.5,  1.2 ], type: 'RAM',         size: [0.4, 0.3, 1.5] },
    { id: 'ram_slot_2',    label: 'DDR5 Slot 2',   position: [  0.1,  0.5,  1.2 ], type: 'RAM',         size: [0.4, 0.3, 1.5] },
    { id: 'storage_slot',  label: 'M.2 NVMe',      position: [  1.5,  0.5,  0.5 ], type: 'Storage',     size: [1.0, 0.1, 0.3] },
    { id: 'cooling_mount', label: 'CPU Cooler',     position: [ -1.5,  1.5,  0.0 ], type: 'Cooling',     size: [2.0, 1.0, 2.0] },
    { id: 'psu_bay',       label: 'PSU Bay',        position: [  2.5, -1.0,  0.0 ], type: 'PSU',         size: [2.5, 1.0, 1.5] },
    { id: 'motherboard',   label: 'Motherboard',    position: [  0.0,  0.0,  0.0 ], type: 'Motherboard', size: [4.0, 0.2, 3.5] },
  ];

  const HOUSING_PRESETS = {
    aluminum: {
      label: 'Aluminum',
      metalness: 0.8,
      roughness: 0.3,
      color: '#1a1a2e',
      cost: 120,
      quality: 88,
      defectDelta: -0.5,
    },
    carbon_fiber: {
      label: 'Carbon Fiber',
      metalness: 0.4,
      roughness: 0.5,
      color: '#121216',
      cost: 220,
      quality: 98,
      defectDelta: -1.0,
    },
    premium_plastic: {
      label: 'Matte Plastic',
      metalness: 0.1,
      roughness: 0.6,
      color: '#222230',
      cost: 60,
      quality: 72,
      defectDelta: 0.5,
    },
    budget_plastic: {
      label: 'Budget Plastic',
      metalness: 0.05,
      roughness: 0.85,
      color: '#2d2d34',
      cost: 25,
      quality: 50,
      defectDelta: 2.0,
    },
  };

  const DEFAULT_COMPONENTS = [
    // Motherboards
    { id: 'mb_nexus_b550', name: 'Nexus B550', type: 'Motherboard', tier: 1, cost: 90, socketType: 'NX5', formFactor: 'ATX', tdpWatts: 15, performance: 6, color: '#1a3a1a', defectRate: 1.2 },
    { id: 'mb_prime_z790', name: 'Prime Z790 Pro', type: 'Motherboard', tier: 2, cost: 175, socketType: 'NX5', formFactor: 'ATX', tdpWatts: 20, performance: 8, color: '#1f4422', defectRate: 0.9 },
    { id: 'mb_rog_maximus', name: 'Quantum ROG Ultra', type: 'Motherboard', tier: 3, cost: 290, socketType: 'NX5', formFactor: 'ATX', tdpWatts: 25, performance: 10, color: '#25552b', defectRate: 0.6 },

    // CPUs
    { id: 'cpu_core_v1', name: 'Core V1 Quad', type: 'CPU', tier: 1, cost: 95, socketType: 'NX5', tdpWatts: 45, performance: 5, color: '#1a4a7a', defectRate: 1.5 },
    { id: 'cpu_titan_x1', name: 'Titan X1', type: 'CPU', tier: 2, cost: 180, socketType: 'NX5', tdpWatts: 65, performance: 8, color: '#1e5a96', defectRate: 1.1 },
    { id: 'cpu_zenith_12', name: 'Zenith 12-Core', type: 'CPU', tier: 3, cost: 340, socketType: 'NX5', tdpWatts: 125, performance: 10, color: '#246cb5', defectRate: 0.8 },

    // Cooling
    { id: 'cool_stock_fan', name: 'Stealth Air Cooler', type: 'Cooling', tier: 1, cost: 25, maxTDP: 75, performance: 4, color: '#4a4a6a', defectRate: 1.0 },
    { id: 'cool_tower_rgb', name: 'FrostTower Pro', type: 'Cooling', tier: 2, cost: 60, maxTDP: 160, performance: 7, color: '#56567c', defectRate: 0.7 },
    { id: 'cool_aio_240', name: 'LiquidFlow 240 AIO', type: 'Cooling', tier: 3, cost: 120, maxTDP: 260, performance: 10, color: '#656592', defectRate: 0.5 },

    // RAM
    { id: 'ram_ddr5_8gb', name: 'HyperMem 8GB DDR5', type: 'RAM', tier: 1, cost: 40, tdpWatts: 5, performance: 4, color: '#4a1a6a', defectRate: 0.8 },
    { id: 'ram_ddr5_16gb', name: 'HyperMem 16GB RGB', type: 'RAM', tier: 2, cost: 75, tdpWatts: 8, performance: 8, color: '#5e2187', defectRate: 0.5 },
    { id: 'ram_ddr5_32gb', name: 'FuryDominator 32GB', type: 'RAM', tier: 3, cost: 140, tdpWatts: 12, performance: 10, color: '#762aa8', defectRate: 0.3 },

    // GPUs
    { id: 'gpu_gtx_starter', name: 'Pulsar GT 4GB', type: 'GPU', tier: 1, cost: 140, tdpWatts: 75, performance: 4, color: '#1a6a3a', defectRate: 1.8 },
    { id: 'gpu_rtx_blade', name: 'Apex Blade RTX 8GB', type: 'GPU', tier: 2, cost: 360, tdpWatts: 180, performance: 8, color: '#208548', defectRate: 1.2 },
    { id: 'gpu_vortex_ultra', name: 'Vortex 4090 Ultra 16GB', type: 'GPU', tier: 3, cost: 820, tdpWatts: 350, performance: 10, color: '#27a659', defectRate: 0.9 },

    // Storage
    { id: 'ssd_nvme_500gb', name: 'SpeedCore 500GB NVMe', type: 'Storage', tier: 1, cost: 45, tdpWatts: 4, performance: 5, color: '#6a3a1a', defectRate: 0.9 },
    { id: 'ssd_nvme_1tb', name: 'FlashForce 1TB Gen4', type: 'Storage', tier: 2, cost: 85, tdpWatts: 6, performance: 8, color: '#854820', defectRate: 0.6 },
    { id: 'ssd_nvme_2tb', name: 'TeraSpeed 2TB Gen5', type: 'Storage', tier: 3, cost: 160, tdpWatts: 9, performance: 10, color: '#a65927', defectRate: 0.4 },

    // PSUs
    { id: 'psu_bronze_450', name: 'EcoPower 450W Bronze', type: 'PSU', tier: 1, cost: 50, wattage: 450, performance: 5, color: '#3a3a3a', defectRate: 1.3 },
    { id: 'psu_gold_650', name: 'VoltMax 650W Gold', type: 'PSU', tier: 2, cost: 95, wattage: 650, performance: 8, color: '#4a4a4a', defectRate: 0.8 },
    { id: 'psu_plat_850', name: 'Thor 850W Platinum', type: 'PSU', tier: 3, cost: 165, wattage: 850, performance: 10, color: '#5c5c5c', defectRate: 0.4 },
  ];

  // ─── RUNTIME STATE ────────────────────────────────────────────────────────

  let currentDevice = null;
  let isOpen = false;

  // Three.js instances
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let raycaster = null;
  const mouse = { x: 0, y: 0 };

  // Scene objects
  let caseObject = null;
  let caseMaterial = null;
  let rgbLight = null;
  let rgbPhase = 0;
  let slotObjects = {};     // { [slotId]: { slotMesh, wireframe, wireframeMat, fillMat, def } }
  let installedMeshes = {}; // { [slotId]: THREE.Group or THREE.Mesh }

  // Interaction state
  let selectedSlotId = null;
  let selectedComponentId = null;
  let draggedComponent = null;
  let animFrameId = null;
  let lastTime = 0;
  let pointerDownPos = { x: 0, y: 0 };
  let isDraggingOrbit = false;

  // ─── COMPONENT PBR MAPPINGS ───────────────────────────────────────────────

  function getMetalness(type) {
    const map = { CPU: 0.6, GPU: 0.5, RAM: 0.4, Motherboard: 0.2, PSU: 0.7, Storage: 0.8, Cooling: 0.9 };
    return map[type] !== undefined ? map[type] : 0.5;
  }

  function getRoughness(type) {
    const map = { CPU: 0.3, GPU: 0.4, RAM: 0.5, Motherboard: 0.7, PSU: 0.4, Storage: 0.3, Cooling: 0.2 };
    return map[type] !== undefined ? map[type] : 0.4;
  }

  function getEmissive(type) {
    const map = { CPU: 0x0a1a2a, GPU: 0x0a2a1a, RAM: 0x1a0a2a, Motherboard: 0x051005, PSU: 0x111111, Storage: 0x1a1005, Cooling: 0x10101a };
    return map[type] !== undefined ? map[type] : 0x000000;
  }

  function getDefaultColor(type) {
    const map = {
      CPU: 0x1a4a7a,
      GPU: 0x1a6a3a,
      RAM: 0x4a1a6a,
      Motherboard: 0x1a3a1a,
      PSU: 0x3a3a3a,
      Storage: 0x6a3a1a,
      Cooling: 0x4a4a6a,
    };
    return map[type] || 0x334466;
  }

  function makeMaterial(color, options) {
    const settings = options || {};
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: settings.metalness === undefined ? 0.35 : settings.metalness,
      roughness: settings.roughness === undefined ? 0.42 : settings.roughness,
      clearcoat: settings.clearcoat === undefined ? 0.15 : settings.clearcoat,
      clearcoatRoughness: settings.clearcoatRoughness === undefined ? 0.2 : settings.clearcoatRoughness,
      transparent: Boolean(settings.transparent),
      opacity: settings.opacity === undefined ? 1 : settings.opacity,
      side: settings.side || THREE.FrontSide,
    });
  }

  function addCylinder(sceneRoot, radius, depth, position, material, segments) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, depth, segments || 24),
      material
    );
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRoot.add(mesh);
    return mesh;
  }

  function addCaseDetails() {
    const frameMaterial = makeMaterial(0x202733, { metalness: 0.72, roughness: 0.25, clearcoat: 0.35 });
    const darkMaterial = makeMaterial(0x080b10, { metalness: 0.35, roughness: 0.62 });
    const rubberMaterial = makeMaterial(0x050608, { metalness: 0.05, roughness: 0.9 });

    const beams = [
      [7.9, 0.16, 0.16, [0, 1.92, 2.42]], [7.9, 0.16, 0.16, [0, -1.92, 2.42]],
      [0.16, 3.7, 0.16, [-3.86, 0, 2.42]], [0.16, 3.7, 0.16, [3.86, 0, 2.42]],
      [7.8, 0.12, 0.12, [0, 1.82, -2.42]], [7.8, 0.12, 0.12, [0, -1.82, -2.42]],
    ];
    beams.forEach(item => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(item[0], item[1], item[2]), frameMaterial);
      mesh.position.set(item[3][0], item[3][1], item[3][2]);
      mesh.castShadow = true;
      scene.add(mesh);
    });

    [-3.15, 3.15].forEach(x => [-1.65, 1.65].forEach(z => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.18, 24), rubberMaterial);
      foot.position.set(x, -2.12, z);
      foot.castShadow = true;
      scene.add(foot);
    }));

    const rearFan = new THREE.Group();
    rearFan.position.set(-2.65, 0.25, -2.38);
    rearFan.rotation.x = Math.PI / 2;
    addCylinder(rearFan, 0.72, 0.08, [0, 0, 0], darkMaterial, 32);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.055, 8, 32), makeMaterial(0x334455, { metalness: 0.7, roughness: 0.3 }));
    ring.position.z = 0.06;
    rearFan.add(ring);
    for (let i = 0; i < 7; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.035), makeMaterial(0x29313c, { metalness: 0.3, roughness: 0.5 }));
      blade.position.z = 0.08;
      blade.rotation.z = (Math.PI * 2 * i) / 7;
      rearFan.add(blade);
    }
    scene.add(rearFan);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 16; col++) {
        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.5), darkMaterial);
        vent.position.set(-3.2 + col * 0.42, 1.5 - row * 0.28, 2.48);
        scene.add(vent);
      }
    }
  }

  function getComponents() {
    if (window.ITG && window.ITG.Data && Array.isArray(window.ITG.Data.components) && window.ITG.Data.components.length > 0) {
      return window.ITG.Data.components;
    }
    return DEFAULT_COMPONENTS;
  }

  function findComponent(id) {
    if (!id) return null;
    const all = getComponents();
    let found = all.find(c => c.id === id);
    if (!found) {
      found = DEFAULT_COMPONENTS.find(c => c.id === id);
    }
    return found || null;
  }

  function isComponentUnlocked(comp) {
    if (!comp) return false;
    if (window.ITG && window.ITG.GameState) {
      const gs = window.ITG.GameState;
      if (typeof gs.isComponentUnlocked === 'function') {
        return gs.isComponentUnlocked(comp.id);
      }
      if (Array.isArray(gs.unlockedComponents)) {
        return gs.unlockedComponents.includes(comp.id);
      }
      if (gs.tech && typeof gs.tech.isUnlocked === 'function') {
        return gs.tech.isUnlocked(comp.id);
      }
      if (gs.meta && gs.meta.unlockedTiers) {
        return comp.tier <= gs.meta.unlockedTiers;
      }
    }
    return comp.unlocked !== false;
  }

  // ─── CSS STYLE INJECTION ──────────────────────────────────────────────────

  function injectEditorStyles() {
    if (document.getElementById('itg-editor-styles')) return;

    const style = document.createElement('style');
    style.id = 'itg-editor-styles';
    style.textContent = `
      #editor-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        flex-direction: column;
        background: #0a0c13;
        color: #e2e8f0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        user-select: none;
        overflow: hidden;
      }
      #editor-modal.active {
        display: flex !important;
      }
      .editor-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        background: #111420;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .editor-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .editor-modal-title {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .editor-badge {
        font-size: 11px;
        background: rgba(0, 212, 255, 0.15);
        color: #00d4ff;
        border: 1px solid rgba(0, 212, 255, 0.3);
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
      }
      .editor-btn-close {
        background: transparent;
        border: none;
        color: #8892b0;
        font-size: 22px;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
        line-height: 1;
        transition: color 0.15s, background 0.15s;
      }
      .editor-btn-close:hover {
        color: #ff4455;
        background: rgba(255, 68, 85, 0.1);
      }
      .editor-main-layout {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      #editor-comp-list {
        width: 320px;
        min-width: 300px;
        max-width: 340px;
        background: #10131d;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .comp-category {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .comp-cat-title {
        font-size: 12px;
        font-weight: 700;
        color: #00d4ff;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        display: flex;
        justify-content: space-between;
      }
      .comp-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: #171b29;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        cursor: grab;
        transition: transform 0.15s, border-color 0.15s, background 0.15s;
      }
      .comp-item:hover {
        background: #1d2234;
        border-color: rgba(0, 212, 255, 0.4);
        transform: translateX(2px);
      }
      .comp-item.selected {
        border-color: #00d4ff;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
      }
      .comp-item.installed {
        border-left: 3px solid #00ff88;
      }
      .comp-color-swatch {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .comp-info {
        flex: 1;
        min-width: 0;
      }
      .comp-name {
        font-size: 13px;
        font-weight: 600;
        color: #f1f5f9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .comp-stats {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 2px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .comp-install-btn {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        background: #1e293b;
        color: #00d4ff;
        border: 1px solid rgba(0, 212, 255, 0.4);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .comp-install-btn:hover {
        background: #00d4ff;
        color: #0a0c13;
      }
      .comp-install-btn.installed {
        background: rgba(0, 255, 136, 0.15);
        color: #00ff88;
        border-color: rgba(0, 255, 136, 0.4);
      }
      .comp-install-btn.installed:hover {
        background: #ff4455;
        color: #fff;
        border-color: #ff4455;
      }
      .editor-canvas-container {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at center, #151a2d 0%, #0a0c13 85%);
      }
      #editor-canvas {
        width: 100% !important;
        height: 100% !important;
        display: block;
        outline: none;
      }
      .canvas-overlay-hints {
        position: absolute;
        bottom: 12px;
        left: 14px;
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: #64748b;
        background: rgba(10, 12, 19, 0.7);
        padding: 6px 12px;
        border-radius: 6px;
        pointer-events: none;
        backdrop-filter: blur(4px);
      }
      .editor-right-panels {
        width: 340px;
        min-width: 320px;
        max-width: 360px;
        background: #10131d;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      #editor-info-panel, #editor-material-panel, #editor-scores {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .info-title, .mat-title, .score-title {
        font-size: 13px;
        font-weight: 700;
        color: #f1f5f9;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 6px;
      }
      .stat-row span.mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #e2e8f0;
        font-weight: 600;
      }
      .compatibility {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mat-options {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .mat-preset {
        padding: 5px 9px;
        font-size: 11px;
        font-weight: 600;
        background: #171b29;
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .mat-preset:hover {
        background: #20273a;
        color: #f1f5f9;
      }
      .mat-preset.active {
        background: rgba(0, 212, 255, 0.15);
        color: #00d4ff;
        border-color: #00d4ff;
      }
      .color-row, .slider-row, .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 12px;
        color: #94a3b8;
      }
      .color-row input[type="color"], .toggle-row input[type="color"] {
        width: 32px;
        height: 24px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        background: none;
        cursor: pointer;
      }
      .slider-row input[type="range"] {
        width: 140px;
        accent-color: #00d4ff;
        cursor: pointer;
      }
      .score-item {
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #94a3b8;
      }
      .score-item-top {
        display: flex;
        justify-content: space-between;
      }
      .score-bar {
        width: 100%;
        height: 6px;
        background: #1a2030;
        border-radius: 3px;
        overflow: hidden;
      }
      .score-bar > div {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .cogs-row, .defect-row, .press-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #94a3b8;
        margin-top: 6px;
      }
      .cogs-row .mono, .defect-row .mono, .press-row .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        font-size: 13px;
      }
      .mono.green { color: #00ff88; }
      .mono.yellow { color: #ffaa00; }
      .mono.red { color: #ff4455; }
      .editor-footer-actions {
        padding: 16px;
        margin-top: auto;
        background: #0d1018;
      }
      #editor-launch-btn {
        width: 100%;
        padding: 12px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, #00d4ff, #0088cc);
        color: #050810;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 212, 255, 0.3);
        transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
      }
      #editor-launch-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 212, 255, 0.45);
        filter: brightness(1.1);
      }
      #editor-launch-btn:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }

  // ─── DOM INJECTION & INITIALIZATION ───────────────────────────────────────

  function ensureEditorDOM() {
    injectEditorStyles();

    let modal = document.getElementById('editor-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'editor-modal';
      document.body.appendChild(modal);
    }

    // Verify or inject full inner layout
    if (!modal.querySelector('.editor-main-layout') || !modal.querySelector('#editor-canvas') || !modal.querySelector('#editor-comp-list')) {
      modal.innerHTML = `
        <div class="editor-modal-header">
          <div class="editor-title-group">
            <span class="editor-modal-title">🛠️ 3D Device Architect</span>
            <span class="editor-badge" id="editor-device-badge">PC Build</span>
          </div>
          <button id="editor-close-btn" class="editor-btn-close" title="Close Editor">&times;</button>
        </div>
        <div class="editor-main-layout">
          <div id="editor-comp-list"></div>
          <div class="editor-canvas-container">
            <canvas id="editor-canvas"></canvas>
            <div class="canvas-overlay-hints">
              <span>🖱️ Drag: Rotate</span>
              <span>🖱️ Right-drag: Pan</span>
              <span>⚙️ Scroll: Zoom</span>
              <span>📦 Click or Drag parts to slots</span>
            </div>
          </div>
          <div class="editor-right-panels">
            <div id="editor-info-panel"></div>
            <div id="editor-material-panel"></div>
            <div id="editor-scores"></div>
            <div class="editor-footer-actions">
              <button id="editor-launch-btn">Save & Launch Device</button>
            </div>
          </div>
        </div>
      `;
    }

    return modal;
  }

  // ─── THREE.JS INITIALIZATION ──────────────────────────────────────────────

  function initThree() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) {
      console.error('[ITG.Editor] #editor-canvas not found');
      return false;
    }

    const container = canvas.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d14);
    scene.fog = new THREE.Fog(0x090d14, 18, 34);

    // Camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 8, 12);

    // Orbit Controls
    const ControlsClass = THREE.OrbitControls || window.OrbitControls;
    if (ControlsClass) {
      controls = new ControlsClass(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 4;
      controls.maxDistance = 25;
      controls.target.set(0, 0, 0);
    }

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Studio Lighting
    const ambient = new THREE.HemisphereLight(0xb9d4ee, 0x101722, 1.05);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff4df, 2.2);
    keyLight.position.set(6, 11, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1536;
    keyLight.shadow.mapSize.height = 1536;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8db9e8, 0.8);
    fillLight.position.set(-8, 4, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8eeaff, 1.1);
    rimLight.position.set(2, 6, -10);
    scene.add(rimLight);

    // RGB Accent PointLight
    rgbLight = new THREE.PointLight(
      (currentDevice && currentDevice.housing && currentDevice.housing.rgbColor) || 0x00d4ff,
      1.5,
      12
    );
    rgbLight.position.set(0, 0.5, 0);
    rgbLight.visible = Boolean(currentDevice && currentDevice.housing && currentDevice.housing.hasRGB);
    scene.add(rgbLight);

    // Grid Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 64),
      makeMaterial(0x111923, { metalness: 0.18, roughness: 0.72 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.08;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 20, 0x29485d, 0x182633);
    gridHelper.position.y = -2.06;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // ─── PC CASE SETUP ──────────────────────────────────────────────────────
    const caseGeometry = new THREE.BoxGeometry(8, 4, 5);
    caseMaterial = makeMaterial(new THREE.Color(currentDevice.housing.color || '#1a1a2e'), {
      metalness: currentDevice.housing.metalness !== undefined ? currentDevice.housing.metalness : 0.72,
      roughness: currentDevice.housing.roughness !== undefined ? currentDevice.housing.roughness : 0.32,
      clearcoat: 0.42,
      clearcoatRoughness: 0.18,
      side: THREE.BackSide,
    });
    caseObject = new THREE.Mesh(caseGeometry, caseMaterial);
    caseObject.receiveShadow = true;
    caseObject.userData = { isCase: true };
    scene.add(caseObject);

    // Outer Edge Frame
    const edges = new THREE.EdgesGeometry(caseGeometry);
    const edgeLines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 })
    );
    caseObject.add(edgeLines);
    addCaseDetails();

    // Motherboard Tray Floor Plate
    const trayGeo = new THREE.BoxGeometry(7.8, 0.1, 4.8);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x121420,
      metalness: 0.7,
      roughness: 0.4,
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, -1.95, 0);
    trayMesh.receiveShadow = true;
    scene.add(trayMesh);

    // PSU Shroud compartment
    const shroudGeo = new THREE.BoxGeometry(3.2, 1.4, 2.2);
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      metalness: 0.8,
      roughness: 0.3,
    });
    const shroud = new THREE.Mesh(shroudGeo, shroudMat);
    shroud.position.set(2.3, -1.25, 0);
    shroud.receiveShadow = true;
    scene.add(shroud);

    // Tempered Glass Front Side Window (non-blocking for raycasting)
    const glassGeo = new THREE.PlaneGeometry(8, 4);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.1,
      metalness: 0.1,
    });
    const glassPanel = new THREE.Mesh(glassGeo, glassMat);
    glassPanel.position.set(0, 0, 2.5);
    glassPanel.raycast = function () {}; // Do not intercept clicks
    scene.add(glassPanel);

    // ─── SNAP SLOTS CREATION ────────────────────────────────────────────────
    slotObjects = {};
    installedMeshes = {};

    SNAP_SLOTS.forEach(slot => {
      const geo = new THREE.BoxGeometry(slot.size[0], slot.size[1], slot.size[2]);

      // Wireframe outlines
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const wireframeMat = new THREE.LineBasicMaterial({
        color: 0x00a8cc,
        transparent: true,
        opacity: 0.4,
      });
      const wireframe = new THREE.LineSegments(edgeGeo, wireframeMat);

      // Faint clickable volume
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0x00a8cc,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
      });
      const slotMesh = new THREE.Mesh(geo, fillMat);
      slotMesh.position.set(slot.position[0], slot.position[1], slot.position[2]);
      slotMesh.userData = { slotId: slot.id, isSlot: true };
      slotMesh.add(wireframe);

      scene.add(slotMesh);

      slotObjects[slot.id] = {
        slotMesh,
        wireframe,
        wireframeMat,
        fillMat,
        def: slot,
      };
    });

    // Populate existing installed components if reopening
    if (currentDevice && currentDevice.components) {
      currentDevice.components.forEach(inst => {
        const comp = findComponent(inst.componentId);
        const slot = SNAP_SLOTS.find(s => s.id === inst.snapSlot);
        if (comp && slot) {
          attachComponentMesh(comp, slot);
        }
      });
    }

    // Attach canvas event listeners
    bindCanvasEvents();

    return true;
  }

  // ─── 3D COMPONENT MESH BUILDER ────────────────────────────────────────────

  function createComponentMesh(component, slot) {
    const group = new THREE.Group();

    const w = slot.size[0] * 0.9;
    const h = slot.size[1] * 0.9;
    const d = slot.size[2] * 0.9;

    const baseGeo = new THREE.BoxGeometry(w, h, d);
    const color = component.color ? new THREE.Color(component.color) : new THREE.Color(getDefaultColor(component.type));
    const baseMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: getMetalness(component.type),
      roughness: getRoughness(component.type),
      emissive: getEmissive(component.type),
      emissiveIntensity: 0.15,
    });

    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseMesh.userData = { componentId: component.id, slotId: slot.id };
    group.add(baseMesh);

    // Decorative subtype styling
    if (component.type === 'CPU') {
      const ihsGeo = new THREE.BoxGeometry(w * 0.75, h * 0.35, d * 0.75);
      const ihsMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
      const ihs = new THREE.Mesh(ihsGeo, ihsMat);
      ihs.position.y = h * 0.45;
      ihs.userData = { componentId: component.id, slotId: slot.id };
      group.add(ihs);
    } else if (component.type === 'Motherboard') {
      const chipGeo = new THREE.BoxGeometry(w * 0.22, h * 1.4, d * 0.22);
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(w * 0.2, h * 0.6, -d * 0.2);
      chip.userData = { componentId: component.id, slotId: slot.id };
      group.add(chip);
    } else if (component.type === 'GPU') {
      const fanGeo = new THREE.CylinderGeometry(d * 0.32, d * 0.32, h * 0.15, 16);
      const fanMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 });
      const fan1 = new THREE.Mesh(fanGeo, fanMat);
      fan1.position.set(-w * 0.22, h * 0.45, 0);
      fan1.userData = { componentId: component.id, slotId: slot.id };
      const fan2 = fan1.clone();
      fan2.position.set(w * 0.22, h * 0.45, 0);
      fan2.userData = { componentId: component.id, slotId: slot.id };
      group.add(fan1);
      group.add(fan2);
    } else if (component.type === 'RAM') {
      const ridgeGeo = new THREE.BoxGeometry(w * 0.9, h * 0.3, d * 0.95);
      const ridgeMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x00a8cc,
        emissiveIntensity: 0.4,
        metalness: 0.2,
        roughness: 0.3,
      });
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.y = h * 0.45;
      ridge.userData = { componentId: component.id, slotId: slot.id };
      group.add(ridge);
    } else if (component.type === 'Cooling') {
      const fanGeo = new THREE.CylinderGeometry(w * 0.38, w * 0.38, h * 0.3, 16);
      const fanMat = new THREE.MeshStandardMaterial({
        color: 0x223344,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x004466,
        emissiveIntensity: 0.2,
      });
      const fan = new THREE.Mesh(fanGeo, fanMat);
      fan.position.y = h * 0.35;
      fan.userData = { componentId: component.id, slotId: slot.id };
      group.add(fan);
    } else if (component.type === 'Storage') {
      const chipGeo = new THREE.BoxGeometry(w * 0.25, h * 0.6, d * 0.6);
      const chipMat = makeMaterial(0x11151c, { metalness: 0.35, roughness: 0.48 });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(-w * 0.2, h * 0.4, 0);
      chip.userData = { componentId: component.id, slotId: slot.id };
      group.add(chip);
    }

    const detailMaterial = makeMaterial(0x26313b, { metalness: 0.65, roughness: 0.3 });
    const darkDetail = makeMaterial(0x0a0d12, { metalness: 0.45, roughness: 0.55 });
    if (component.type === 'Motherboard') {
      for (let i = -2; i <= 2; i++) {
        const trace = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 2.2), makeMaterial(0x4d8c68, { metalness: 0.3, roughness: 0.5 }));
        trace.position.set(i * 0.35, h * 0.58, 0.25);
        group.add(trace);
      }
      for (let i = 0; i < 4; i++) {
        const slotBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.25), darkDetail);
        slotBar.position.set(-w * 0.28 + i * 0.22, h * 0.62, d * 0.18);
        group.add(slotBar);
      }
      const heatsink = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, h * 1.3, d * 0.42), detailMaterial);
      heatsink.position.set(-w * 0.28, h * 0.72, -d * 0.18);
      group.add(heatsink);
    }
    if (component.type === 'CPU') {
      for (let i = -2; i <= 2; i++) {
        const contact = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, d * 0.08), makeMaterial(0xc8a84a, { metalness: 0.85, roughness: 0.22 }));
        contact.position.set(i * w * 0.12, -h * 0.46, d * 0.34);
        group.add(contact);
      }
    }
    if (component.type === 'GPU') {
      const backplate = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, h * 0.12, d * 0.88), makeMaterial(0x151b22, { metalness: 0.75, roughness: 0.28 }));
      backplate.position.y = -h * 0.42;
      group.add(backplate);
      for (let i = -1; i <= 1; i++) {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 12), makeMaterial(0x92a0ae, { metalness: 0.85, roughness: 0.22 }));
        screw.position.set(i * w * 0.32, h * 0.56, d * 0.32);
        group.add(screw);
      }
    }
    if (component.type === 'RAM') {
      for (let i = -3; i <= 3; i++) {
        const contact = new THREE.Mesh(new THREE.BoxGeometry(0.055, h * 0.08, d * 0.28), makeMaterial(0xb58d3d, { metalness: 0.8, roughness: 0.25 }));
        contact.position.set(i * w * 0.11, -h * 0.47, 0);
        group.add(contact);
      }
    }
    if (component.type === 'Cooling') {
      const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.13, w * 0.13, h * 0.34, 24), darkDetail);
      fanHub.position.y = h * 0.48;
      fanHub.userData.isCoolingFan = true;
      group.add(fanHub);
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(w * 0.06, h * 0.07, w * 0.32), detailMaterial);
        blade.position.set(0, h * 0.5, 0);
        blade.rotation.y = (Math.PI * 2 * i) / 7;
        blade.userData.isCoolingFan = true;
        group.add(blade);
      }
    }
    if (component.type === 'PSU') {
      for (let i = -2; i <= 2; i++) {
        const vent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, h * 0.045, 0.06), darkDetail);
        vent.position.set(0, h * 0.38, i * d * 0.13);
        group.add(vent);
      }
    }

    group.position.set(slot.position[0], slot.position[1], slot.position[2]);
    group.userData = { componentId: component.id, slotId: slot.id };

    return group;
  }

  function attachComponentMesh(component, slot) {
    if (installedMeshes[slot.id]) {
      scene.remove(installedMeshes[slot.id]);
      disposeHierarchy(installedMeshes[slot.id]);
      delete installedMeshes[slot.id];
    }

    const mesh = createComponentMesh(component, slot);
    scene.add(mesh);
    installedMeshes[slot.id] = mesh;

    // Hide wireframe box
    if (slotObjects[slot.id]) {
      slotObjects[slot.id].slotMesh.visible = false;
    }
  }

  function detachComponentMesh(slotId) {
    if (installedMeshes[slotId]) {
      scene.remove(installedMeshes[slotId]);
      disposeHierarchy(installedMeshes[slotId]);
      delete installedMeshes[slotId];
    }
    if (slotObjects[slotId]) {
      slotObjects[slotId].slotMesh.visible = true;
      resetSlotVisual(slotId);
    }
  }

  // ─── WIREFRAME HIGHLIGHTING ───────────────────────────────────────────────

  function resetSlotVisual(slotId) {
    const slotObj = slotObjects[slotId];
    if (!slotObj) return;
    slotObj.wireframeMat.color.setHex(0x00a8cc);
    slotObj.wireframeMat.opacity = 0.4;
    slotObj.fillMat.color.setHex(0x00a8cc);
    slotObj.fillMat.opacity = 0.05;
  }

  function updateSlotHighlights(activeComp) {
    SNAP_SLOTS.forEach(slot => {
      const slotObj = slotObjects[slot.id];
      if (!slotObj) return;

      const isOccupied = currentDevice.components.some(c => c.snapSlot === slot.id);
      if (isOccupied) {
        slotObj.slotMesh.visible = false;
        return;
      }

      slotObj.slotMesh.visible = true;

      if (!activeComp) {
        resetSlotVisual(slot.id);
      } else if (slot.type === activeComp.type) {
        // Bright cyan glow on compatible empty slots
        slotObj.wireframeMat.color.setHex(0x00ffff);
        slotObj.wireframeMat.opacity = 0.95;
        slotObj.fillMat.color.setHex(0x00ffff);
        slotObj.fillMat.opacity = 0.25;
      } else {
        // Red wireframe on incompatible slots
        slotObj.wireframeMat.color.setHex(0xff3344);
        slotObj.wireframeMat.opacity = 0.55;
        slotObj.fillMat.color.setHex(0xff3344);
        slotObj.fillMat.opacity = 0.08;
      }
    });
  }

  // ─── COMPONENT INSTALL / UNINSTALL ────────────────────────────────────────

  function installComponent(comp, targetSlot) {
    if (!currentDevice || !comp) return;

    if (!targetSlot) {
      // Find matching slots
      const matchingSlots = SNAP_SLOTS.filter(s => s.type === comp.type);
      if (matchingSlots.length === 0) return;

      // Prefer currently selected slot if matching
      if (selectedSlotId && matchingSlots.some(s => s.id === selectedSlotId)) {
        targetSlot = SNAP_SLOTS.find(s => s.id === selectedSlotId);
      } else {
        // Find first empty matching slot
        const emptySlot = matchingSlots.find(s => !currentDevice.components.some(c => c.snapSlot === s.id));
        targetSlot = emptySlot || matchingSlots[0];
      }
    }

    if (!targetSlot) return;

    // Remove any previous component from this slot
    currentDevice.components = currentDevice.components.filter(c => c.snapSlot !== targetSlot.id);

    // Register into currentDevice
    currentDevice.components.push({
      componentId: comp.id,
      snapSlot: targetSlot.id,
      position: [targetSlot.position[0], targetSlot.position[1], targetSlot.position[2]],
    });

    // Update 3D scene
    attachComponentMesh(comp, targetSlot);

    selectedSlotId = targetSlot.id;
    selectedComponentId = comp.id;

    renderCatalog();
    renderInfoPanel(comp, targetSlot);
    updateScores();
    updateSlotHighlights(null);
  }

  function uninstallComponent(compIdOrSlotId) {
    if (!currentDevice) return;

    const entry = currentDevice.components.find(
      c => c.componentId === compIdOrSlotId || c.snapSlot === compIdOrSlotId
    );
    if (!entry) return;

    const slotId = entry.snapSlot;
    currentDevice.components = currentDevice.components.filter(c => c.snapSlot !== slotId);

    detachComponentMesh(slotId);

    selectedComponentId = null;
    renderCatalog();
    renderInfoPanel(null, slotObjects[slotId] ? slotObjects[slotId].def : null);
    updateScores();
    updateSlotHighlights(null);
  }

  // ─── SELECTION LOGIC ──────────────────────────────────────────────────────

  function selectSlot(slotId) {
    selectedSlotId = slotId;
    const slotDef = SNAP_SLOTS.find(s => s.id === slotId);
    const installed = currentDevice.components.find(c => c.snapSlot === slotId);

    if (installed) {
      selectedComponentId = installed.componentId;
      const comp = findComponent(installed.componentId);
      renderInfoPanel(comp, slotDef);
    } else {
      selectedComponentId = null;
      renderInfoPanel(null, slotDef);
      if (slotDef) {
        updateSlotHighlights({ type: slotDef.type });
      }
    }

    renderCatalog();
  }

  function selectInstalledComponent(componentId) {
    selectedComponentId = componentId;
    const installed = currentDevice.components.find(c => c.componentId === componentId);
    if (installed) {
      selectedSlotId = installed.snapSlot;
      const comp = findComponent(componentId);
      const slotDef = SNAP_SLOTS.find(s => s.id === installed.snapSlot);
      renderInfoPanel(comp, slotDef);
    }
    renderCatalog();
  }

  // ─── CANVAS EVENT LISTENERS ───────────────────────────────────────────────

  function bindCanvasEvents() {
    const canvas = renderer.domElement;

    // Detect click vs camera orbit
    canvas.addEventListener('pointerdown', e => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      isDraggingOrbit = false;
    });

    canvas.addEventListener('pointermove', e => {
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) {
        isDraggingOrbit = true;
      }
    });

    canvas.addEventListener('pointerup', e => {
      if (isDraggingOrbit) return;
      handleRaycastClick(e);
    });

    // Drag & Drop handling from Left Catalog
    canvas.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.userData && i.object.userData.slotId);

      if (hit && draggedComponent) {
        const slot = SNAP_SLOTS.find(s => s.id === hit.object.userData.slotId);
        if (slot && slot.type === draggedComponent.type) {
          const slotObj = slotObjects[slot.id];
          if (slotObj) {
            slotObj.wireframeMat.color.setHex(0x00ffff);
            slotObj.wireframeMat.opacity = 1.0;
            slotObj.fillMat.opacity = 0.4;
          }
        }
      }
    });

    canvas.addEventListener('drop', e => {
      e.preventDefault();
      const compId = e.dataTransfer.getData('text/plain') || (draggedComponent && draggedComponent.id);
      const comp = findComponent(compId);
      if (!comp) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.userData && i.object.userData.slotId);

      if (hit) {
        const slot = SNAP_SLOTS.find(s => s.id === hit.object.userData.slotId);
        if (slot && slot.type === comp.type) {
          installComponent(comp, slot);
        } else {
          installComponent(comp);
        }
      } else {
        installComponent(comp);
      }
      updateSlotHighlights(null);
    });
  }

  function handleRaycastClick(e) {
    if (!renderer || !camera || !scene) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const hit = intersects.find(
      i => i.object.userData && (i.object.userData.slotId || i.object.userData.componentId)
    );

    if (hit) {
      const obj = hit.object;
      if (obj.userData.componentId) {
        selectInstalledComponent(obj.userData.componentId);
      } else if (obj.userData.slotId) {
        selectSlot(obj.userData.slotId);
      }
    }
  }

  // ─── LEFT PANEL: COMPONENT CATALOG ────────────────────────────────────────

  function renderCatalog() {
    const listEl = document.getElementById('editor-comp-list');
    if (!listEl) return;

    const all = getComponents();
    const categories = ['Motherboard', 'CPU', 'Cooling', 'RAM', 'GPU', 'Storage', 'PSU'];

    let html = '';

    categories.forEach(cat => {
      const catComps = all.filter(c => c.type === cat && isComponentUnlocked(c));
      if (catComps.length === 0) return;

      html += `<div class='comp-category'>`;
      html += `<div class='comp-cat-title'><span>${cat}</span><span style="font-size:10px;color:#64748b;">${catComps.length}</span></div>`;

      catComps.forEach(comp => {
        const isInstalled = currentDevice.components.some(c => c.componentId === comp.id);
        const isSelected = selectedComponentId === comp.id;
        const swatchColor = comp.color || '#' + getDefaultColor(comp.type).toString(16).padStart(6, '0');
        const costStr = (window.ITG && window.ITG.formatMoney)
          ? window.ITG.formatMoney(comp.cost || comp.price || 0)
          : '$' + (comp.cost || comp.price || 0);

        html += `
          <div class='comp-item ${isInstalled ? 'installed' : ''} ${isSelected ? 'selected' : ''}'
               data-comp-id='${comp.id}'
               draggable='true'>
            <div class='comp-color-swatch' style='background:${swatchColor}'></div>
            <div class='comp-info'>
              <div class='comp-name' title='${escapeHtml(comp.name)}'>${escapeHtml(comp.name)}</div>
              <div class='comp-stats'>Tier ${comp.tier || 1} · ${comp.tdpWatts || comp.tdp || 0}W · ${costStr}</div>
            </div>
            <button class='comp-install-btn ${isInstalled ? 'installed' : ''}' data-comp-id='${comp.id}'>
              ${isInstalled ? 'Installed' : 'Install'}
            </button>
          </div>
        `;
      });

      html += `</div>`;
    });

    listEl.innerHTML = html;

    // Attach listeners
    listEl.querySelectorAll('.comp-item').forEach(item => {
      const compId = item.getAttribute('data-comp-id');
      const comp = findComponent(compId);

      item.addEventListener('click', e => {
        if (e.target.classList.contains('comp-install-btn')) return;
        selectInstalledComponent(compId);
        updateSlotHighlights(comp);
      });

      item.addEventListener('mouseenter', () => {
        updateSlotHighlights(comp);
      });

      item.addEventListener('mouseleave', () => {
        if (!selectedSlotId) updateSlotHighlights(null);
      });

      item.addEventListener('dragstart', e => {
        draggedComponent = comp;
        e.dataTransfer.setData('text/plain', compId);
        updateSlotHighlights(comp);
      });

      item.addEventListener('dragend', () => {
        draggedComponent = null;
        updateSlotHighlights(null);
      });
    });

    listEl.querySelectorAll('.comp-install-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const compId = btn.getAttribute('data-comp-id');
        const comp = findComponent(compId);
        const isInstalled = currentDevice.components.some(c => c.componentId === compId);

        if (isInstalled) {
          uninstallComponent(compId);
        } else {
          installComponent(comp);
        }
      });
    });
  }

  // ─── RIGHT TOP PANEL: SELECTED COMPONENT INFO & COMPATIBILITY ─────────────

  function checkCompatibility(device) {
    const issues = [];
    if (!device) return issues;

    const installed = device.components.map(c => findComponent(c.componentId)).filter(Boolean);

    const cpu = installed.find(c => c.type === 'CPU');
    const mb = installed.find(c => c.type === 'Motherboard');
    const cooling = installed.find(c => c.type === 'Cooling');
    const psu = installed.find(c => c.type === 'PSU');
    const ram = installed.find(c => c.type === 'RAM');

    // CPU + Motherboard Socket Check
    if (cpu && mb) {
      if (cpu.socketType && mb.socketType && cpu.socketType !== mb.socketType) {
        issues.push({
          type: 'error',
          msg: `CPU socket (${cpu.socketType}) ≠ Motherboard (${mb.socketType})`,
        });
      } else {
        issues.push({
          type: 'ok',
          msg: `Socket ${cpu.socketType || mb.socketType || 'Standard'}: Compatible`,
        });
      }
    }

    // TDP vs Cooling Capacity
    const totalTDP = installed.reduce((sum, c) => sum + (c.tdpWatts || c.tdp || 0), 0);
    if (cooling) {
      const maxTDP = cooling.maxTDP || cooling.coolingCapacity || 100;
      if (totalTDP > maxTDP) {
        issues.push({
          type: 'error',
          msg: `Total TDP ${totalTDP}W exceeds cooler capacity ${maxTDP}W`,
        });
      } else if (totalTDP > maxTDP * 0.85) {
        issues.push({
          type: 'warning',
          msg: `Cooling near limit (${Math.round((totalTDP / maxTDP) * 100)}%)`,
        });
      } else {
        issues.push({
          type: 'ok',
          msg: `TDP: Within cooling capacity (${totalTDP}W / ${maxTDP}W)`,
        });
      }
    }

    // PSU Wattage Check
    if (psu) {
      const wattage = psu.wattage || psu.power || 400;
      if (totalTDP > wattage * 0.8) {
        issues.push({
          type: 'error',
          msg: `PSU ${wattage}W insufficient for system TDP ${totalTDP}W`,
        });
      } else {
        issues.push({
          type: 'ok',
          msg: `PSU ${wattage}W (Est. Load: ${Math.round((totalTDP / wattage) * 100)}%)`,
        });
      }
    }

    // Missing Critical Components
    if (!mb) {
      issues.push({ type: 'error', msg: 'Motherboard: No motherboard installed' });
    }
    if (!cpu) {
      issues.push({ type: 'error', msg: 'CPU: No CPU installed' });
    }
    if (!ram) {
      issues.push({ type: 'warning', msg: 'RAM: No RAM installed yet' });
    }

    return issues;
  }

  function renderInfoPanel(selectedComp, selectedSlot) {
    const panel = document.getElementById('editor-info-panel');
    if (!panel) return;

    let compHtml = '';
    const issues = checkCompatibility(currentDevice);

    if (selectedComp) {
      const isInstalled = currentDevice.components.some(c => c.componentId === selectedComp.id);
      const perf = selectedComp.performance || selectedComp.perf || 5;
      const tdp = (selectedComp.tdpWatts || selectedComp.tdp || 0) + 'W';
      const costStr = (window.ITG && window.ITG.formatMoney)
        ? window.ITG.formatMoney(selectedComp.cost || selectedComp.price || 0)
        : '$' + (selectedComp.cost || selectedComp.price || 0);

      compHtml = `
        <div class='info-title'>
          <span>${escapeHtml(selectedComp.name)}</span>
          ${isInstalled ? `<button id='btn-uninstall-part' style='font-size:11px;background:#ff4455;color:#fff;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;'>Uninstall</button>` : ''}
        </div>
        <div class='stat-row'><span>Type</span><span class='mono'>${selectedComp.type}</span></div>
        <div class='stat-row'><span>Performance</span><span class='mono'>${perf}/10</span></div>
        <div class='stat-row'><span>TDP</span><span class='mono'>${tdp}</span></div>
        <div class='stat-row'><span>Cost</span><span class='mono'>${costStr}</span></div>
        ${selectedComp.socketType ? `<div class='stat-row'><span>Socket</span><span class='mono'>${selectedComp.socketType}</span></div>` : ''}
        ${selectedComp.maxTDP ? `<div class='stat-row'><span>Cooler Rating</span><span class='mono'>${selectedComp.maxTDP}W</span></div>` : ''}
        ${selectedComp.wattage ? `<div class='stat-row'><span>PSU Capacity</span><span class='mono'>${selectedComp.wattage}W</span></div>` : ''}
      `;
    } else if (selectedSlot) {
      compHtml = `
        <div class='info-title'><span>${escapeHtml(selectedSlot.label || selectedSlot.id)}</span></div>
        <div class='stat-row'><span>Slot Type</span><span class='mono'>${selectedSlot.type}</span></div>
        <div style='font-size:12px;color:#64748b;margin:8px 0;'>Empty slot. Click an item in the catalog to install it here.</div>
      `;
    } else {
      const count = currentDevice ? currentDevice.components.length : 0;
      compHtml = `
        <div class='info-title'><span>System Architecture</span></div>
        <div class='stat-row'><span>Parts Installed</span><span class='mono'>${count} / ${SNAP_SLOTS.length}</span></div>
        <div style='font-size:12px;color:#64748b;margin:8px 0;'>Click any 3D component or snap slot to inspect specifications.</div>
      `;
    }

    // Render compatibility list
    let compatHtml = `<div class='compatibility'>`;
    if (issues.length === 0) {
      compatHtml += `<div style='color:#00ff88;'>✅ All components compatible</div>`;
    } else {
      issues.forEach(item => {
        const icon = item.type === 'error' ? '❌' : (item.type === 'warning' ? '⚠️' : '✅');
        const color = item.type === 'error' ? '#ff4455' : (item.type === 'warning' ? '#ffaa00' : '#00ff88');
        compatHtml += `<div style='color:${color};'>${icon} ${escapeHtml(item.msg)}</div>`;
      });
    }
    compatHtml += `</div>`;

    panel.innerHTML = compHtml + compatHtml;

    const unBtn = document.getElementById('btn-uninstall-part');
    if (unBtn && selectedComp) {
      unBtn.addEventListener('click', () => {
        uninstallComponent(selectedComp.id);
      });
    }
  }

  // ─── RIGHT MIDDLE PANEL: HOUSING MATERIAL EDITOR ──────────────────────────

  function renderMaterialPanel() {
    const panel = document.getElementById('editor-material-panel');
    if (!panel) return;

    const h = currentDevice.housing;

    panel.innerHTML = `
      <div class='mat-title'>Housing</div>
      <div class='mat-options'>
        <button class='mat-preset ${h.material === 'aluminum' ? 'active' : ''}' data-mat='aluminum'>Aluminum</button>
        <button class='mat-preset ${h.material === 'carbon_fiber' ? 'active' : ''}' data-mat='carbon_fiber'>Carbon Fiber</button>
        <button class='mat-preset ${h.material === 'premium_plastic' ? 'active' : ''}' data-mat='premium_plastic'>Matte Plastic</button>
      </div>
      <div class='color-row'>
        <label>Color</label>
        <input type='color' id='housing-color' value='${h.color || '#1a1a2e'}'>
      </div>
      <div class='slider-row'>
        <label>Metalness</label>
        <input type='range' id='metalness-slider' min='0' max='100' value='${Math.round(h.metalness * 100)}'>
      </div>
      <div class='slider-row'>
        <label>Roughness</label>
        <input type='range' id='roughness-slider' min='0' max='100' value='${Math.round(h.roughness * 100)}'>
      </div>
      <div class='toggle-row'>
        <label>RGB Lighting</label>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type='checkbox' id='rgb-toggle' ${h.hasRGB ? 'checked' : ''}>
          <input type='color' id='rgb-color' value='${h.rgbColor || '#00d4ff'}' style='display:${h.hasRGB ? 'inline-block' : 'none'}'>
        </div>
      </div>
    `;

    // Presets click listeners
    panel.querySelectorAll('.mat-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const matKey = btn.getAttribute('data-mat');
        const preset = HOUSING_PRESETS[matKey];
        if (!preset) return;

        panel.querySelectorAll('.mat-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        h.material = matKey;
        h.metalness = preset.metalness;
        h.roughness = preset.roughness;

        const metalSlider = document.getElementById('metalness-slider');
        const roughSlider = document.getElementById('roughness-slider');
        if (metalSlider) metalSlider.value = Math.round(preset.metalness * 100);
        if (roughSlider) roughSlider.value = Math.round(preset.roughness * 100);

        if (caseMaterial) {
          caseMaterial.metalness = h.metalness;
          caseMaterial.roughness = h.roughness;
          caseMaterial.needsUpdate = true;
        }

        updateScores();
      });
    });

    // Housing Color
    const colorInput = document.getElementById('housing-color');
    if (colorInput) {
      colorInput.addEventListener('input', e => {
        h.color = e.target.value;
        if (caseMaterial) {
          caseMaterial.color.set(h.color);
        }
      });
    }

    // Metalness Slider
    const metalSlider = document.getElementById('metalness-slider');
    if (metalSlider) {
      metalSlider.addEventListener('input', e => {
        h.metalness = parseFloat(e.target.value) / 100;
        if (caseMaterial) {
          caseMaterial.metalness = h.metalness;
        }
        updateScores();
      });
    }

    // Roughness Slider
    const roughSlider = document.getElementById('roughness-slider');
    if (roughSlider) {
      roughSlider.addEventListener('input', e => {
        h.roughness = parseFloat(e.target.value) / 100;
        if (caseMaterial) {
          caseMaterial.roughness = h.roughness;
        }
        updateScores();
      });
    }

    // RGB Toggle & Color
    const rgbToggle = document.getElementById('rgb-toggle');
    const rgbColor = document.getElementById('rgb-color');

    if (rgbToggle && rgbColor) {
      rgbToggle.addEventListener('change', e => {
        h.hasRGB = e.target.checked;
        rgbColor.style.display = h.hasRGB ? 'inline-block' : 'none';
        if (rgbLight) {
          rgbLight.visible = h.hasRGB;
        }
        updateScores();
      });

      rgbColor.addEventListener('input', e => {
        h.rgbColor = e.target.value;
        if (rgbLight) {
          rgbLight.color.set(h.rgbColor);
        }
      });
    }
  }

  // ─── RIGHT BOTTOM PANEL: ASSEMBLY SCORES ──────────────────────────────────

  function updateScores() {
    if (!currentDevice) return;

    let stats = null;
    if (window.ITG && window.ITG.Calculator && typeof window.ITG.Calculator.calcDeviceStats === 'function') {
      try {
        stats = window.ITG.Calculator.calcDeviceStats(currentDevice);
      } catch (err) {
        console.warn('[ITG.Editor] Error calling ITG.Calculator.calcDeviceStats:', err);
      }
    }

    const installed = currentDevice.components.map(c => findComponent(c.componentId)).filter(Boolean);

    // COGS
    let baseCogs = installed.reduce((sum, c) => sum + (c.cost || c.price || 0), 0);
    const preset = HOUSING_PRESETS[currentDevice.housing.material] || HOUSING_PRESETS.aluminum;
    baseCogs += preset.cost || 80;
    if (currentDevice.housing.hasRGB) baseCogs += 25;
    const cogs = (stats && stats.cogs !== undefined) ? stats.cogs : baseCogs;

    // Performance (0-100)
    let perfScore = 0;
    if (stats && stats.performance !== undefined) {
      perfScore = Math.min(100, Math.max(0, Math.round(stats.performance)));
    } else if (stats && stats.perfScore !== undefined) {
      perfScore = Math.min(100, Math.max(0, Math.round(stats.perfScore)));
    } else {
      const cpu = installed.find(c => c.type === 'CPU');
      const gpu = installed.find(c => c.type === 'GPU');
      const ram = installed.find(c => c.type === 'RAM');
      const sto = installed.find(c => c.type === 'Storage');

      const cpuP = cpu ? (cpu.performance || cpu.perf || 5) * 10 : 0;
      const gpuP = gpu ? (gpu.performance || gpu.perf || 5) * 10 : 0;
      const ramP = ram ? (ram.performance || ram.perf || 5) * 10 : 0;
      const stoP = sto ? (sto.performance || sto.perf || 5) * 10 : 0;

      perfScore = Math.round(cpuP * 0.35 + gpuP * 0.45 + ramP * 0.10 + stoP * 0.10);
      perfScore = Math.min(100, Math.max(0, perfScore));
    }

    // Thermal Score (0-100)
    let thermalScore = 50;
    const cooler = installed.find(c => c.type === 'Cooling');
    const totalTDP = installed.reduce((sum, c) => sum + (c.tdpWatts || c.tdp || 0), 0);

    if (stats && stats.thermalScore !== undefined) {
      thermalScore = Math.round(stats.thermalScore);
    } else if (cooler) {
      const cap = cooler.maxTDP || cooler.coolingCapacity || 120;
      if (totalTDP === 0) thermalScore = 100;
      else if (totalTDP > cap) {
        thermalScore = Math.max(10, Math.round(100 - (totalTDP - cap) * 1.5));
      } else {
        const headroom = (cap - totalTDP) / cap;
        thermalScore = Math.min(100, Math.round(60 + headroom * 40));
      }
    } else {
      thermalScore = totalTDP > 50 ? 20 : 40;
    }

    // Build Quality (0-100)
    let buildQuality = preset.quality || 75;
    if (currentDevice.housing.hasRGB) buildQuality = Math.min(100, buildQuality + 3);
    if (stats && stats.buildQuality !== undefined) {
      buildQuality = Math.round(stats.buildQuality);
    }

    // Defect Rate (%)
    let defectRate = 2.5;
    if (stats && stats.defectRate !== undefined) {
      defectRate = stats.defectRate;
    } else {
      defectRate = Math.max(0.5, 2.5 + (preset.defectDelta || 0));
    }

    // Estimated Press Score (0-100)
    let pressScore = 0;
    if (stats && stats.pressScore !== undefined) {
      pressScore = Math.round(stats.pressScore);
    } else {
      pressScore = Math.round(perfScore * 0.45 + thermalScore * 0.25 + buildQuality * 0.30 - (defectRate * 2));
      pressScore = Math.max(5, Math.min(100, pressScore));
    }

    // Persist to currentDevice
    currentDevice.cogs = cogs;
    currentDevice.pressScore = pressScore;
    currentDevice.defectRate = parseFloat(defectRate.toFixed(1));
    currentDevice.stats = stats || {
      performance: perfScore,
      thermalScore,
      buildQuality,
      cogs,
      defectRate: currentDevice.defectRate,
      pressScore,
    };

    // Render HTML in #editor-scores
    const scoresEl = document.getElementById('editor-scores');
    if (scoresEl) {
      const formatMoney = (window.ITG && window.ITG.formatMoney)
        ? window.ITG.formatMoney
        : (n => '$' + Math.round(n).toLocaleString());

      const defectColorClass = defectRate > 4 ? 'red' : (defectRate > 2.2 ? 'yellow' : 'green');

      scoresEl.innerHTML = `
        <div class='score-title'>Assembly Analysis</div>
        <div class='score-item'>
          <div class='score-item-top'>
            <span>Performance</span>
            <span class='mono'>${perfScore}/100</span>
          </div>
          <div class='score-bar'><div style='width:${perfScore}%;background:var(--accent, #00d4ff);'></div></div>
        </div>
        <div class='score-item'>
          <div class='score-item-top'>
            <span>Thermal</span>
            <span class='mono'>${thermalScore}/100</span>
          </div>
          <div class='score-bar'><div style='width:${thermalScore}%;background:${thermalScore > 70 ? '#00ff88' : (thermalScore > 40 ? '#ffaa00' : '#ff4455')};'></div></div>
        </div>
        <div class='score-item'>
          <div class='score-item-top'>
            <span>Build Quality</span>
            <span class='mono'>${buildQuality}/100</span>
          </div>
          <div class='score-bar'><div style='width:${buildQuality}%;background:#bd93f9;'></div></div>
        </div>
        <div class='cogs-row'>COGS: <span class='mono green'>${formatMoney(cogs)}</span></div>
        <div class='defect-row'>Defect Rate: <span class='mono ${defectColorClass}'>${currentDevice.defectRate}%</span></div>
        <div class='press-row'>Est. Press Score: <span class='mono'>${pressScore}/100</span></div>
      `;
    }
  }

  // ─── SAVE / LAUNCH DESIGN ─────────────────────────────────────────────────

  function saveAndLaunchDevice() {
    if (!currentDevice) return;

    const installed = currentDevice.components.map(c => findComponent(c.componentId)).filter(Boolean);

    const hasCPU = installed.some(c => c.type === 'CPU');
    const hasMB = installed.some(c => c.type === 'Motherboard');
    const hasRAM = installed.some(c => c.type === 'RAM');

    const missing = [];
    if (!hasMB) missing.push('Motherboard');
    if (!hasCPU) missing.push('CPU');
    if (!hasRAM) missing.push('RAM');

    if (missing.length > 0) {
      const msg = 'Missing essential components: ' + missing.join(', ') + ' must be installed!';
      if (window.ITG && window.ITG.UI && typeof window.ITG.UI.showToast === 'function') {
        window.ITG.UI.showToast('⚠️ ' + msg, 'error');
      } else {
        alert(msg);
      }
      return;
    }

    // Recalculate stats
    updateScores();

    const deviceToSave = currentDevice;

    // 4. Emit 'editor:save' with { device: currentDevice }
    if (window.ITG && window.ITG.EventBus && typeof window.ITG.EventBus.emit === 'function') {
      window.ITG.EventBus.emit('editor:save', { device: deviceToSave });
    }

    // 5. Close editor
    closeEditor();

    // 6. ITG.GameState.addProduct(currentDevice)
    if (window.ITG && window.ITG.GameState && typeof window.ITG.GameState.addProduct === 'function') {
      const alreadyHas = window.ITG.GameState.products && window.ITG.GameState.products.some(p => p.id === deviceToSave.id);
      if (!alreadyHas) {
        window.ITG.GameState.addProduct(deviceToSave);
      }
    }
  }

  // ─── ANIMATION LOOP ───────────────────────────────────────────────────────

  function updateRGB(delta) {
    if (!currentDevice || !currentDevice.housing || !currentDevice.housing.hasRGB) {
      if (rgbLight) rgbLight.visible = false;
      return;
    }
    if (rgbLight) {
      rgbLight.visible = true;
      rgbPhase += delta * 2.5;
      const intensity = 0.5 + 0.5 * Math.sin(rgbPhase);
      rgbLight.intensity = intensity * 2.2;
    }
  }

  function animate(currentTime) {
    if (!isOpen) return;

    animFrameId = requestAnimationFrame(animate);

    const delta = lastTime ? (currentTime - lastTime) / 1000 : 0.016;
    lastTime = currentTime;

    if (controls && typeof controls.update === 'function') {
      controls.update();
    }

    updateRGB(delta);
    Object.values(installedMeshes).forEach(mesh => {
      mesh.traverse(child => {
        if (child.userData && child.userData.isCoolingFan) child.rotation.y += delta * 4.5;
      });
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // ─── RESIZING ─────────────────────────────────────────────────────────────

  function resizeCanvas() {
    if (!renderer || !camera) return;
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ─── RESOURCE DISPOSAL ────────────────────────────────────────────────────

  function disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  // ─── PUBLIC API IMPLEMENTATION ────────────────────────────────────────────

  function openEditor(options) {
    ensureEditorDOM();

    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      modal.classList.remove('hidden');
    }

    const category = (options && options.category) || 'PC';
    const defaultName = (options && options.name) || (category + ' Model ' + Math.floor(100 + Math.random() * 900));

    currentDevice = {
      id: 'device_' + Date.now(),
      name: defaultName,
      category: category,
      components: [],
      housing: {
        material: 'aluminum',
        color: '#1a1a2e',
        metalness: 0.8,
        roughness: 0.3,
        hasRGB: false,
        rgbColor: '#00d4ff',
        hasBrandLogo: true,
      },
      stats: null,
      pressScore: 0,
      cogs: 0,
      defectRate: 0,
      lifecycle: 'design',
      weekCreated: (window.ITG && window.ITG.GameState && window.ITG.GameState.meta && window.ITG.GameState.meta.week) || 1,
    };

    window.ITG.Editor.currentDevice = currentDevice;

    const badge = document.getElementById('editor-device-badge');
    if (badge) badge.textContent = `${currentDevice.category} Architecture`;

    // Initialize 3D Engine
    initThree();

    // Render Panels
    renderCatalog();
    renderMaterialPanel();
    renderInfoPanel(null, null);
    updateScores();

    // Wire Save and Close buttons
    const launchBtn = document.getElementById('editor-launch-btn');
    if (launchBtn) {
      launchBtn.onclick = saveAndLaunchDevice;
    }

    const closeBtn = document.getElementById('editor-close-btn');
    if (closeBtn) {
      closeBtn.onclick = closeEditor;
    }

    // Attach resize listener
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 50);

    isOpen = true;
    lastTime = 0;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(animate);
  }

  function closeEditor() {
    isOpen = false;

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    window.removeEventListener('resize', resizeCanvas);

    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
      modal.classList.add('hidden');
    }

    // Clean up Three.js objects
    if (scene) {
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      scene.clear();
      scene = null;
    }

    if (renderer) {
      renderer.dispose();
      renderer = null;
    }

    camera = null;
    controls = null;
    caseObject = null;
    caseMaterial = null;
    rgbLight = null;
    slotObjects = {};
    installedMeshes = {};
    selectedSlotId = null;
    selectedComponentId = null;
    draggedComponent = null;
    currentDevice = null;
    window.ITG.Editor.currentDevice = null;
  }

  function getDevice() {
    return currentDevice;
  }

  // ─── UTILITIES ────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── EXPOSE GLOBAL API ────────────────────────────────────────────────────

  window.ITG.Editor = {
    currentDevice: null,
    open: openEditor,
    close: closeEditor,
    getDevice: getDevice,
    updateScores: updateScores,

    // Additional accessible helpers
    installComponent: installComponent,
    uninstallComponent: uninstallComponent,
    selectSlot: selectSlot,
    selectInstalledComponent: selectInstalledComponent,
    checkCompatibility: checkCompatibility,
  };

})();
