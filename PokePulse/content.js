(() => {
  "use strict";

  if (window.__POKEPULSE_CONTENT_V30__) return;
  window.__POKEPULSE_CONTENT_V30__ = true;

  const DEFAULT_SETTINGS = {
    hudEnabled: true,
    compactMode: false,
    typeChartOpen: false,
    communityOpen: false,
    keysEnabled: true,
    keysMode: "wasd_skills",
    keysMouse: true,
    keysKps: true,
    keysScale: 100,
    uiTheme: "cyber",
    uiOpacity: 88,
    streamLock: false,
    milestoneAlerts: true,
    hudPos: { top: 56, right: 14 },
    keysPos: { bottom: 16, right: 16 }
  };

  const THEMES = {
    cyber:   { accent: "#38bdf8", accent2: "#0284c7", glow: "rgba(56,189,248,0.72)", border: "rgba(56,189,248,0.38)" },
    shiny:   { accent: "#f472b6", accent2: "#db2777", glow: "rgba(244,114,182,0.75)", border: "rgba(244,114,182,0.40)" },
    amber:   { accent: "#fbbf24", accent2: "#d97706", glow: "rgba(251,191,36,0.72)", border: "rgba(251,191,36,0.38)" },
    emerald: { accent: "#34d399", accent2: "#059669", glow: "rgba(52,211,153,0.72)", border: "rgba(52,211,153,0.38)" },
    clean:   { accent: "#f8fafc", accent2: "#94a3b8", glow: "rgba(248,250,252,0.65)", border: "rgba(248,250,252,0.36)" }
  };

  const TYPES = [
    "Normal", "Fuego", "Agua", "Planta", "Eléctrico", "Hielo",
    "Lucha", "Veneno", "Tierra", "Volador", "Psíquico", "Bicho",
    "Roca", "Fantasma", "Dragón", "Siniestro", "Acero", "Hada"
  ];

  // Tabla suavizada survivor: muy eficaz = 1.6, poco eficaz = 0.6, inmunidad = 0.3 (tope doble = 2.4)
  const CHART = {
    Normal:    { Roca: 0.6, Acero: 0.6, Fantasma: 0.3 },
    Fuego:     { Planta: 1.6, Hielo: 1.6, Bicho: 1.6, Acero: 1.6, Fuego: 0.6, Agua: 0.6, Roca: 0.6, Dragón: 0.6 },
    Agua:      { Fuego: 1.6, Tierra: 1.6, Roca: 1.6, Agua: 0.6, Planta: 0.6, Dragón: 0.6 },
    Planta:    { Agua: 1.6, Tierra: 1.6, Roca: 1.6, Fuego: 0.6, Planta: 0.6, Veneno: 0.6, Volador: 0.6, Bicho: 0.6, Dragón: 0.6, Acero: 0.6 },
    Eléctrico: { Agua: 1.6, Volador: 1.6, Planta: 0.6, Eléctrico: 0.6, Dragón: 0.6, Tierra: 0.3 },
    Hielo:     { Planta: 1.6, Tierra: 1.6, Volador: 1.6, Dragón: 1.6, Fuego: 0.6, Agua: 0.6, Hielo: 0.6, Acero: 0.6 },
    Lucha:     { Normal: 1.6, Hielo: 1.6, Roca: 1.6, Siniestro: 1.6, Acero: 1.6, Veneno: 0.6, Volador: 0.6, Psíquico: 0.6, Bicho: 0.6, Hada: 0.6, Fantasma: 0.3 },
    Veneno:    { Planta: 1.6, Hada: 1.6, Veneno: 0.6, Tierra: 0.6, Roca: 0.6, Fantasma: 0.6, Acero: 0.3 },
    Tierra:    { Fuego: 1.6, Eléctrico: 1.6, Veneno: 1.6, Roca: 1.6, Acero: 1.6, Planta: 0.6, Bicho: 0.6, Volador: 0.3 },
    Volador:   { Planta: 1.6, Lucha: 1.6, Bicho: 1.6, Eléctrico: 0.6, Roca: 0.6, Acero: 0.6 },
    Psíquico:  { Lucha: 1.6, Veneno: 1.6, Psíquico: 0.6, Acero: 0.6, Siniestro: 0.3 },
    Bicho:     { Planta: 1.6, Psíquico: 1.6, Siniestro: 1.6, Fuego: 0.6, Lucha: 0.6, Veneno: 0.6, Volador: 0.6, Fantasma: 0.6, Acero: 0.6, Hada: 0.6 },
    Roca:      { Fuego: 1.6, Hielo: 1.6, Volador: 1.6, Bicho: 1.6, Lucha: 0.6, Tierra: 0.6, Acero: 0.6 },
    Fantasma:  { Psíquico: 1.6, Fantasma: 1.6, Siniestro: 0.6, Normal: 0.3 },
    Dragón:    { Dragón: 1.6, Acero: 0.6, Hada: 0.3 },
    Siniestro: { Psíquico: 1.6, Fantasma: 1.6, Lucha: 0.6, Siniestro: 0.6, Hada: 0.6 },
    Acero:     { Hielo: 1.6, Roca: 1.6, Hada: 1.6, Fuego: 0.6, Agua: 0.6, Eléctrico: 0.6, Acero: 0.6 },
    Hada:      { Lucha: 1.6, Dragón: 1.6, Siniestro: 1.6, Fuego: 0.6, Veneno: 0.6, Acero: 0.6 }
  };

  const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"];
  const KEY_LABELS = {
    KeyW: "W", KeyA: "A", KeyS: "S", KeyD: "D",
    ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
    Space: "␣", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4",
    Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Mouse0: "LMB", Mouse2: "RMB"
  };

  let settings = structuredClone(DEFAULT_SETTINGS);
  let favorites = [];
  let pityMap = {};
  let armorState = { base: 0, cards: 0, melee: false };

  // Estado local del Cronómetro de Run
  let timerRunning = false;
  let timerElapsedMs = 0;
  let timerLastTick = 0;
  const triggeredMilestones = new Set();

  // Host Shadow DOM
  const host = document.createElement("div");
  host.id = "pokepulse-hud-host";
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";

  function mountHost() {
    const target = document.fullscreenElement || document.body || document.documentElement;
    if (target && host.parentNode !== target) target.appendChild(host);
  }
  mountHost();
  document.addEventListener("fullscreenchange", mountHost);

  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      --pp-accent: #38bdf8;
      --pp-accent2: #0284c7;
      --pp-glow: rgba(56,189,248,0.72);
      --pp-border: rgba(56,189,248,0.38);
      --pp-alpha: 0.88;
      --pp-kscale: 1;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #f3f4f6;
      box-sizing: border-box;
    }
    * { box-sizing: border-box; }
    .root.stream-lock .drag-bar,
    .root.stream-lock .footer-hint,
    .root.stream-lock .hud-btns { display: none !important; }
    .root.stream-lock .hud,
    .root.stream-lock .keys-panel { pointer-events: none !important; }

    /* HUD */
    .hud {
      position: fixed; width: 256px;
      background: rgba(10,16,30,var(--pp-alpha));
      backdrop-filter: blur(10px);
      border: 1px solid var(--pp-border);
      border-radius: 12px; padding: 10px 12px;
      font-size: 12px; line-height: 1.35;
      box-shadow: 0 12px 30px rgba(0,0,0,0.55);
      pointer-events: auto; user-select: none;
    }
    .hud.hidden { display: none; }
    .hud.compact { width: 196px; padding: 8px 10px; }
    .hud-header {
      display: flex; align-items: center; justify-content: space-between;
      cursor: grab; padding-bottom: 6px; margin-bottom: 7px;
      border-bottom: 1px solid rgba(148,163,184,0.18);
      font-weight: 800; font-size: 11px; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--pp-accent);
    }
    .hud-header:active { cursor: grabbing; }
    .fps-pill { font-size: 10px; color: #94a3b8; font-variant-numeric: tabular-nums; }

    .timer-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 8px;
    }
    .timer-val {
      font-size: 20px; font-weight: 800; color: #f8fafc;
      font-variant-numeric: tabular-nums; letter-spacing: 0.03em;
    }
    .hud-btns { display: flex; gap: 4px; }
    .mini-btn {
      background: rgba(30,41,59,0.92); color: #e2e8f0;
      border: 1px solid rgba(148,163,184,0.28); border-radius: 5px;
      padding: 3px 7px; font-size: 10px; font-weight: 700; cursor: pointer;
    }
    .mini-btn:hover { border-color: var(--pp-accent); color: var(--pp-accent); }
    .mini-btn.active { background: var(--pp-accent); color: #061322; border-color: #fff; }

    .pinned-box {
      padding: 6px 8px; border-radius: 7px;
      background: rgba(15,23,42,0.8);
      border: 1px solid rgba(148,163,184,0.2);
      margin-bottom: 7px;
    }
    .hud.compact .pinned-box,
    .hud.compact .quick-toggles,
    .hud.compact .footer-hint { display: none; }
    .pinned-title { font-size: 10.5px; font-weight: 700; color: var(--pp-accent); margin-bottom: 3px; }
    .pinned-moves { font-size: 10px; color: #cbd5e1; line-height: 1.4; }

    .quick-toggles { display: flex; gap: 5px; margin-bottom: 6px; }
    .quick-toggles .mini-btn { flex: 1; text-align: center; }

    .footer-hint {
      padding-top: 5px; border-top: 1px solid rgba(148,163,184,0.14);
      font-size: 9.5px; color: #94a3b8; text-align: center;
    }

    /* Paneles flotantes: Calculadora Tipos (Alt+T) y Centro Comunidad (Alt+B) */
    .drawer {
      position: fixed; left: 16px; top: 56px; width: 350px; max-height: 78vh;
      overflow-y: auto; background: rgba(10,16,30,0.95);
      backdrop-filter: blur(10px); border: 1px solid var(--pp-border);
      border-radius: 12px; padding: 12px; font-size: 11.5px;
      pointer-events: auto; box-shadow: 0 14px 36px rgba(0,0,0,0.6);
    }
    .drawer.community { left: 380px; width: 360px; }
    .drawer.hidden { display: none; }
    @media (max-width: 780px) { .drawer.community { left: 16px; } }

    .drawer-head {
      display: flex; justify-content: space-between; align-items: center;
      font-weight: 800; font-size: 12px; color: var(--pp-accent);
      padding-bottom: 7px; margin-bottom: 9px;
      border-bottom: 1px solid rgba(148,163,184,0.2);
    }
    .close-btn {
      background: transparent; border: none; color: #94a3b8;
      font-size: 14px; cursor: pointer; font-weight: 700;
    }
    .close-btn:hover { color: #fff; }

    .type-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    select, input[type="text"], input[type="number"] {
      width: 100%; background: #0f172a; color: #f1f5f9;
      border: 1px solid rgba(148,163,184,0.3); border-radius: 6px;
      padding: 5px 7px; font-size: 11px;
    }
    .mul-group { margin-bottom: 8px; }
    .mul-label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
    .mul-24 { color: #f87171; }
    .mul-16 { color: #fb923c; }
    .mul-06 { color: #60a5fa; }
    .mul-03 { color: #34d399; }
    .chip-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .t-chip {
      font-size: 10px; font-weight: 700; padding: 2px 7px;
      border-radius: 999px; background: rgba(30,41,59,0.9);
      border: 1px solid currentColor;
    }

    .tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .tab-btn {
      flex: 1; padding: 5px; border-radius: 6px; font-size: 10.5px; font-weight: 700;
      background: #1e293b; color: #94a3b8; border: 1px solid transparent; cursor: pointer;
    }
    .tab-btn.active { background: rgba(56,189,248,0.16); color: var(--pp-accent); border-color: var(--pp-border); }
    .tab-pane.hidden { display: none; }

    .form-grid { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .fav-item {
      display: flex; justify-content: space-between; align-items: center; gap: 6px;
      padding: 7px 8px; border-radius: 7px; background: rgba(15,23,42,0.85);
      border: 1px solid rgba(148,163,184,0.2); margin-bottom: 6px;
    }
    .fav-item.pinned { border-color: var(--pp-accent); }
    .fav-name { font-weight: 700; font-size: 11.5px; color: #f8fafc; }
    .fav-sub { font-size: 10px; color: #94a3b8; }

    .pity-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 0; border-bottom: 1px solid rgba(148,163,184,0.14);
    }
    .pity-count { font-weight: 800; color: var(--pp-accent); min-width: 42px; text-align: center; }

    .armor-res {
      margin-top: 8px; padding: 8px 10px; border-radius: 8px;
      background: rgba(15,23,42,0.9); border: 1px solid var(--pp-border);
      font-size: 11px; line-height: 1.45;
    }
    .warn-cap { color: #fbbf24; font-weight: 700; }

    /* Teclado Mecánico 3D */
    .keys-panel {
      position: fixed;
      transform: scale(var(--pp-kscale));
      transform-origin: bottom right;
      background: rgba(10,16,30,var(--pp-alpha));
      backdrop-filter: blur(10px);
      border: 1px solid var(--pp-border);
      border-radius: 14px; padding: 9px 11px 11px 11px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
      pointer-events: auto; user-select: none;
    }
    .keys-panel.hidden { display: none; }
    .keys-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 7px; }
    .keys-drag {
      font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--pp-accent); cursor: grab;
    }
    .keys-drag:active { cursor: grabbing; }
    .kps-badge {
      font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
      padding: 1px 7px; border-radius: 999px;
      background: rgba(15,23,42,0.85); border: 1px solid var(--pp-border); color: var(--pp-accent);
    }
    .kps-badge.hidden { display: none; }
    .keys-body { display: flex; align-items: flex-end; gap: 10px; }
    .pad-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .pad-block.hidden { display: none; }
    .key-row { display: flex; gap: 4px; justify-content: center; }
    .keycap {
      min-width: 31px; height: 30px; padding: 0 6px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 7px; font-size: 11.5px; font-weight: 800; color: #cbd5e1;
      background: linear-gradient(180deg, #273449 0%, #172033 100%);
      border: 1px solid rgba(148,163,184,0.32);
      border-bottom: 4px solid #090e1a;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 3px 6px rgba(0,0,0,0.45);
      transition: transform 0.05s ease, border-bottom-width 0.05s ease, background 0.06s ease, box-shadow 0.06s ease, color 0.06s ease;
    }
    .keycap.wide { width: 101px; height: 25px; font-size: 9.5px; letter-spacing: 0.08em; }
    .keycap.sm { min-width: 23px; height: 23px; padding: 0 4px; font-size: 10px; border-radius: 6px; }
    .keycap.mouse { min-width: 44px; height: 26px; font-size: 9.5px; }
    .keycap.active {
      background: linear-gradient(180deg, var(--pp-accent) 0%, var(--pp-accent2) 100%);
      color: #061322; border-color: #ffffff; border-bottom-width: 1.5px;
      transform: translateY(2.5px);
      box-shadow: 0 0 14px var(--pp-glow), inset 0 1px 0 rgba(255,255,255,0.55);
    }
    .trail-row {
      margin-top: 7px; padding-top: 6px; border-top: 1px solid rgba(148,163,184,0.15);
      display: flex; align-items: center; gap: 4px; min-height: 22px; overflow: hidden;
    }
    .trail-row.hidden { display: none; }
    .trail-label { font-size: 9px; color: #64748b; text-transform: uppercase; margin-right: 2px; }
    .trail-chip {
      font-size: 9.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px;
      background: rgba(30,41,59,0.88); border: 1px solid var(--pp-border); color: var(--pp-accent);
    }

    .toast-box {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; gap: 6px; align-items: center; pointer-events: none;
    }
    .toast {
      background: rgba(15,23,42,0.95); border: 1px solid var(--pp-accent);
      color: #f8fafc; padding: 7px 15px; border-radius: 999px;
      font-size: 12px; font-weight: 700; box-shadow: 0 6px 22px rgba(0,0,0,0.45);
    }
  `;
  shadow.appendChild(style);

  const root = document.createElement("div");
  root.className = "root";
  const toastBox = document.createElement("div");
  toastBox.className = "toast-box";

  function showToast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastBox.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  // === 1. HUD PRINCIPAL + CRONÓMETRO + BUILD FIJADA ===
  const hud = document.createElement("div");
  hud.className = "hud";
  const hudHead = document.createElement("div");
  hudHead.className = "hud-header drag-bar";
  const hudTitle = document.createElement("span");
  hudTitle.textContent = "PokéPulse HUD";
  const fpsPill = document.createElement("span");
  fpsPill.className = "fps-pill";
  fpsPill.textContent = "60 FPS";
  hudHead.append(hudTitle, fpsPill);

  const timerRow = document.createElement("div");
  timerRow.className = "timer-row";
  const timerVal = document.createElement("span");
  timerVal.className = "timer-val";
  timerVal.textContent = "00:00";
  const timerBtns = document.createElement("div");
  timerBtns.className = "hud-btns";
  const btnPlay = document.createElement("button");
  btnPlay.className = "mini-btn";
  btnPlay.textContent = "▶";
  btnPlay.title = "Iniciar/Pausar cronómetro (Alt+S)";
  const btnReset = document.createElement("button");
  btnReset.className = "mini-btn";
  btnReset.textContent = "↺";
  btnReset.title = "Reiniciar cronómetro (Alt+Shift+S)";
  timerBtns.append(btnPlay, btnReset);
  timerRow.append(timerVal, timerBtns);

  const pinnedBox = document.createElement("div");
  pinnedBox.className = "pinned-box";
  const pinnedTitle = document.createElement("div");
  pinnedTitle.className = "pinned-title";
  const pinnedMoves = document.createElement("div");
  pinnedMoves.className = "pinned-moves";
  pinnedBox.append(pinnedTitle, pinnedMoves);

  const quickToggles = document.createElement("div");
  quickToggles.className = "quick-toggles";
  const btnTypes = document.createElement("button");
  btnTypes.className = "mini-btn";
  btnTypes.textContent = "Tipos (Alt+T)";
  const btnComm = document.createElement("button");
  btnComm.className = "mini-btn";
  btnComm.textContent = "Build / Pity (Alt+B)";
  quickToggles.append(btnTypes, btnComm);

  const hudFoot = document.createElement("div");
  hudFoot.className = "footer-hint";
  hudFoot.textContent = "Alt+H HUD · Alt+K Teclas · Alt+L Grabar";
  hud.append(hudHead, timerRow, pinnedBox, quickToggles, hudFoot);

  // === 2. CALCULADORA INTERACTIVA DE TABLA DE TIPOS (Alt+T) ===
  const typeDrawer = document.createElement("div");
  typeDrawer.className = "drawer hidden";
  const typeHead = document.createElement("div");
  typeHead.className = "drawer-head";
  const typeHeadTxt = document.createElement("span");
  typeHeadTxt.textContent = "Calculadora de Tipos (×1.6 / ×0.6 / ×0.3)";
  const typeClose = document.createElement("button");
  typeClose.className = "close-btn";
  typeClose.textContent = "✕";
  typeHead.append(typeHeadTxt, typeClose);

  const typeSelects = document.createElement("div");
  typeSelects.className = "type-selects";
  const selT1 = document.createElement("select");
  const selT2 = document.createElement("select");
  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.textContent = "— Sin 2º tipo —";
  selT2.appendChild(optNone);
  for (const t of TYPES) {
    const o1 = document.createElement("option");
    o1.value = t; o1.textContent = t;
    const o2 = document.createElement("option");
    o2.value = t; o2.textContent = t;
    selT1.appendChild(o1);
    selT2.appendChild(o2);
  }
  selT1.value = "Fuego";
  typeSelects.append(selT1, selT2);

  const typeResults = document.createElement("div");
  const typeNote = document.createElement("div");
  typeNote.style.cssText = "margin-top:8px;font-size:10px;color:#94a3b8;line-height:1.4;";
  typeNote.textContent = "Aplica en ambos sentidos: ataques contra ese Pokémon o daño que recibes llevando esos tipos (tope ×2.4).";
  typeDrawer.append(typeHead, typeSelects, typeResults, typeNote);

  function renderTypeCalc() {
    const t1 = selT1.value;
    const t2 = selT2.value === t1 ? "" : selT2.value;
    const buckets = { "2.4": [], "1.6": [], "0.6": [], "0.3": [] };

    for (const atk of TYPES) {
      const m1 = CHART[atk]?.[t1] ?? 1;
      const m2 = t2 ? (CHART[atk]?.[t2] ?? 1) : 1;
      const total = Math.min(2.4, Number((m1 * m2).toFixed(2)));
      if (total >= 2.2) buckets["2.4"].push(`${atk}`);
      else if (total > 1.05) buckets["1.6"].push(`${atk} (×${total})`);
      else if (total <= 0.36) buckets["0.3"].push(`${atk} (×${total})`);
      else if (total < 0.95) buckets["0.6"].push(`${atk} (×${total})`);
    }

    typeResults.textContent = "";
    const defs = [
      ["2.4", "Debilidad Doble (×2.4)", "mul-24"],
      ["1.6", "Muy Eficaz (>×1)", "mul-16"],
      ["0.6", "Resiste (<×1)", "mul-06"],
      ["0.3", "Inmunidad / Ultra-resiste", "mul-03"]
    ];
    for (const [k, label, cls] of defs) {
      if (buckets[k].length === 0) continue;
      const grp = document.createElement("div");
      grp.className = "mul-group";
      const lbl = document.createElement("div");
      lbl.className = `mul-label ${cls}`;
      lbl.textContent = label;
      const list = document.createElement("div");
      list.className = "chip-list";
      for (const txt of buckets[k]) {
        const ch = document.createElement("span");
        ch.className = `t-chip ${cls}`;
        ch.textContent = txt;
        list.appendChild(ch);
      }
      grp.append(lbl, list);
      typeResults.appendChild(grp);
    }
  }
  selT1.addEventListener("change", renderTypeCalc);
  selT2.addEventListener("change", renderTypeCalc);
  renderTypeCalc();

  // === 3. CENTRO COMUNIDAD: FAVORITOS, PITY 0/70 Y CORAZA 70% (Alt+B) ===
  const commDrawer = document.createElement("div");
  commDrawer.className = "drawer community hidden";
  const commHead = document.createElement("div");
  commHead.className = "drawer-head";
  const commHeadTxt = document.createElement("span");
  commHeadTxt.textContent = "Centro Comunidad (Alt+B)";
  const commClose = document.createElement("button");
  commClose.className = "close-btn";
  commClose.textContent = "✕";
  commHead.append(commHeadTxt, commClose);

  const tabsRow = document.createElement("div");
  tabsRow.className = "tabs";
  const tabBtns = {};
  const tabPanes = {};
  for (const [id, lbl] of [["favs", "Favoritos"], ["pity", "Pity 0/70"], ["armor", "Coraza 70%"]]) {
    const b = document.createElement("button");
    b.className = `tab-btn${id === "favs" ? " active" : ""}`;
    b.textContent = lbl;
    const p = document.createElement("div");
    p.className = `tab-pane${id === "favs" ? "" : " hidden"}`;
    tabBtns[id] = b;
    tabPanes[id] = p;
    tabsRow.appendChild(b);
    b.addEventListener("click", () => {
      for (const k of Object.keys(tabBtns)) {
        tabBtns[k].classList.toggle("active", k === id);
        tabPanes[k].classList.toggle("hidden", k !== id);
      }
    });
  }

  // Tab 1: Favoritos y Builds
  const favForm = document.createElement("div");
  favForm.className = "form-grid";
  const inpFavName = document.createElement("input");
  inpFavName.type = "text"; inpFavName.placeholder = "Pokémon favorito (ej: Slaking, Mega Rayquaza)";
  const inpFavMoves = document.createElement("input");
  inpFavMoves.type = "text"; inpFavMoves.placeholder = "4 movimientos clave (ej: Body Slam, Harden...)";
  const btnAddFav = document.createElement("button");
  btnAddFav.className = "mini-btn active";
  btnAddFav.textContent = "+ Guardar en Favoritos";
  favForm.append(inpFavName, inpFavMoves, btnAddFav);
  const favListEl = document.createElement("div");
  tabPanes.favs.append(favForm, favListEl);

  function renderFavorites() {
    favListEl.textContent = "";
    const pinned = favorites.find((f) => f.pinned) || favorites[0];
    if (pinned) {
      pinnedTitle.textContent = `⭐ ${pinned.name}`;
      pinnedMoves.textContent = pinned.moves || "Sin movimientos anotados";
    } else {
      pinnedTitle.textContent = "⭐ Sin build fijada";
      pinnedMoves.textContent = "Añade un favorito en Alt+B";
    }

    if (favorites.length === 0) {
      const em = document.createElement("div");
      em.className = "fav-sub";
      em.textContent = "Guarda tus Pokémon favoritos para fijar su build en pantalla.";
      favListEl.appendChild(em);
      return;
    }

    favorites.forEach((f, idx) => {
      const item = document.createElement("div");
      item.className = `fav-item${f.pinned ? " pinned" : ""}`;
      const info = document.createElement("div");
      const nm = document.createElement("div");
      nm.className = "fav-name";
      nm.textContent = `${f.pinned ? "📌 " : ""}${f.name}`;
      const mv = document.createElement("div");
      mv.className = "fav-sub";
      mv.textContent = f.moves || "—";
      info.append(nm, mv);

      const acts = document.createElement("div");
      acts.style.display = "flex"; acts.style.gap = "4px";
      const pinB = document.createElement("button");
      pinB.className = "mini-btn";
      pinB.textContent = f.pinned ? "Fijado" : "Fijar";
      pinB.addEventListener("click", () => {
        favorites = favorites.map((x, i) => ({ ...x, pinned: i === idx }));
        chrome.storage.local.set({ ppFavorites: favorites });
        renderFavorites();
      });
      const delB = document.createElement("button");
      delB.className = "mini-btn";
      delB.textContent = "✕";
      delB.addEventListener("click", () => {
        favorites.splice(idx, 1);
        chrome.storage.local.set({ ppFavorites: favorites });
        renderFavorites();
      });
      acts.append(pinB, delB);
      item.append(info, acts);
      favListEl.appendChild(item);
    });
  }

  btnAddFav.addEventListener("click", () => {
    const name = inpFavName.value.trim();
    if (!name) return;
    favorites.unshift({
      name,
      moves: inpFavMoves.value.trim(),
      pinned: favorites.length === 0
    });
    inpFavName.value = "";
    inpFavMoves.value = "";
    chrome.storage.local.set({ ppFavorites: favorites });
    renderFavorites();
  });

  // Tab 2: Pity Tracker (0/70 por banner regional)
  const pityListEl = document.createElement("div");
  tabPanes.pity.appendChild(pityListEl);
  function renderPity() {
    pityListEl.textContent = "";
    for (const reg of REGIONS) {
      const val = Number(pityMap[reg] || 0);
      const row = document.createElement("div");
      row.className = "pity-row";
      const lbl = document.createElement("span");
      lbl.textContent = reg;
      const right = document.createElement("div");
      right.style.cssText = "display:flex;align-items:center;gap:4px;";
      const cnt = document.createElement("span");
      cnt.className = "pity-count";
      cnt.textContent = `${val}/70`;
      const b1 = document.createElement("button"); b1.className = "mini-btn"; b1.textContent = "+1";
      const b10 = document.createElement("button"); b10.className = "mini-btn"; b10.textContent = "+10";
      const bR = document.createElement("button"); bR.className = "mini-btn"; bR.textContent = "5★";

      const updateVal = (next) => {
        pityMap[reg] = Math.max(0, next % 70);
        chrome.storage.local.set({ ppPity: pityMap });
        renderPity();
      };
      b1.addEventListener("click", () => updateVal(val + 1));
      b10.addEventListener("click", () => updateVal(val + 10));
      bR.addEventListener("click", () => updateVal(0));

      right.append(cnt, b1, b10, bR);
      row.append(lbl, right);
      pityListEl.appendChild(row);
    }
  }

  // Tab 3: Calculador de Coraza (Cap 70%) + Melee (-25%)
  const armorBox = document.createElement("div");
  armorBox.className = "form-grid";
  const lblBase = document.createElement("div"); lblBase.textContent = "Coraza de mejoras permanentes (%):";
  const inpBase = document.createElement("input"); inpBase.type = "number"; inpBase.min = "0"; inpBase.max = "100";
  const lblCards = document.createElement("div"); lblCards.textContent = "Coraza de cartas en partida (%):";
  const inpCards = document.createElement("input"); inpCards.type = "number"; inpCards.min = "0"; inpCards.max = "100";
  const lblMelee = document.createElement("label");
  lblMelee.style.cssText = "display:flex;align-items:center;gap:6px;cursor:pointer;margin-top:4px;";
  const chkMelee = document.createElement("input"); chkMelee.type = "checkbox";
  const meleeTxt = document.createElement("span"); meleeTxt.textContent = "Llevo movimiento cuerpo a cuerpo (-25% daño)";
  lblMelee.append(chkMelee, meleeTxt);
  const armorRes = document.createElement("div");
  armorRes.className = "armor-res";
  armorBox.append(lblBase, inpBase, lblCards, inpCards, lblMelee, armorRes);
  tabPanes.armor.appendChild(armorBox);

  function renderArmor() {
    const b = Math.max(0, Number(armorState.base) || 0);
    const c = Math.max(0, Number(armorState.cards) || 0);
    inpBase.value = String(b);
    inpCards.value = String(c);
    chkMelee.checked = Boolean(armorState.melee);

    const rawSum = b + c;
    const cappedArmor = Math.min(70, rawSum);
    const wasted = Math.max(0, rawSum - 70);
    const meleeMult = armorState.melee ? 0.75 : 1;
    const finalDmgTaken = (1 - cappedArmor / 100) * meleeMult;
    const totalMitigation = Math.round((1 - finalDmgTaken) * 1000) / 10;

    armorRes.textContent = "";
    const l1 = document.createElement("div");
    l1.textContent = `Coraza efectiva: ${cappedArmor}% (tope 70%)`;
    const l2 = document.createElement("div");
    l2.textContent = `Mitigación total real: ${totalMitigation}%`;
    armorRes.append(l1, l2);
    if (wasted > 0) {
      const warn = document.createElement("div");
      warn.className = "warn-cap";
      warn.textContent = `⚠️ Desperdicias ${wasted}% de Coraza por encima del tope del 70%.`;
      armorRes.appendChild(warn);
    }
  }
  const saveArmor = () => {
    armorState = { base: Number(inpBase.value) || 0, cards: Number(inpCards.value) || 0, melee: chkMelee.checked };
    chrome.storage.local.set({ ppArmor: armorState });
    renderArmor();
  };
  inpBase.addEventListener("input", saveArmor);
  inpCards.addEventListener("input", saveArmor);
  chkMelee.addEventListener("change", saveArmor);

  commDrawer.append(commHead, tabsRow, tabPanes.favs, tabPanes.pity, tabPanes.armor);

  // === 4. TECLADO MECÁNICO 3D PRO (Alt+K) ===
  const keysPanel = document.createElement("div");
  keysPanel.className = "keys-panel";
  const keysTop = document.createElement("div");
  keysTop.className = "keys-top";
  const keysDrag = document.createElement("div");
  keysDrag.className = "keys-drag drag-bar";
  keysDrag.textContent = "PokéPulse Keys";
  const kpsBadge = document.createElement("span");
  kpsBadge.className = "kps-badge";
  kpsBadge.textContent = "0 KPS";
  keysTop.append(keysDrag, kpsBadge);

  const keysBody = document.createElement("div");
  keysBody.className = "keys-body";
  const keyElements = new Map();
  function makeKey(code, label, extraClass = "") {
    const el = document.createElement("div");
    el.className = `keycap ${extraClass}`.trim();
    el.textContent = label;
    if (!keyElements.has(code)) keyElements.set(code, []);
    keyElements.get(code).push(el);
    return el;
  }

  const wasdBlock = document.createElement("div"); wasdBlock.className = "pad-block";
  const wR1 = document.createElement("div"); wR1.className = "key-row"; wR1.append(makeKey("KeyW", "W"));
  const wR2 = document.createElement("div"); wR2.className = "key-row"; wR2.append(makeKey("KeyA", "A"), makeKey("KeyS", "S"), makeKey("KeyD", "D"));
  const wR3 = document.createElement("div"); wR3.className = "key-row"; wR3.append(makeKey("Space", "ESPACIO", "wide"));
  wasdBlock.append(wR1, wR2, wR3);

  const arrowsBlock = document.createElement("div"); arrowsBlock.className = "pad-block";
  const aR1 = document.createElement("div"); aR1.className = "key-row"; aR1.append(makeKey("ArrowUp", "↑"));
  const aR2 = document.createElement("div"); aR2.className = "key-row"; aR2.append(makeKey("ArrowLeft", "←"), makeKey("ArrowDown", "↓"), makeKey("ArrowRight", "→"));
  const aR3 = document.createElement("div"); aR3.className = "key-row"; aR3.append(makeKey("Space", "ESPACIO", "wide"));
  arrowsBlock.append(aR1, aR2, aR3);

  const skillsBlock = document.createElement("div"); skillsBlock.className = "pad-block";
  const sR1 = document.createElement("div"); sR1.className = "key-row";
  sR1.append(makeKey("Digit1", "1", "sm"), makeKey("Digit2", "2", "sm"), makeKey("Digit3", "3", "sm"), makeKey("Digit4", "4", "sm"));
  const sR2 = document.createElement("div"); sR2.className = "key-row";
  sR2.append(makeKey("Digit5", "5", "sm"), makeKey("Digit6", "6", "sm"), makeKey("Digit7", "7", "sm"), makeKey("Digit8", "8", "sm"));
  skillsBlock.append(sR1, sR2);

  const mouseBlock = document.createElement("div"); mouseBlock.className = "pad-block";
  const mR1 = document.createElement("div"); mR1.className = "key-row"; mR1.append(makeKey("Mouse0", "LMB", "mouse"));
  const mR2 = document.createElement("div"); mR2.className = "key-row"; mR2.append(makeKey("Mouse2", "RMB", "mouse"));
  mouseBlock.append(mR1, mR2);

  keysBody.append(wasdBlock, arrowsBlock, skillsBlock, mouseBlock);

  const trailRow = document.createElement("div"); trailRow.className = "trail-row";
  const trailLbl = document.createElement("span"); trailLbl.className = "trail-label"; trailLbl.textContent = "Historial";
  trailRow.appendChild(trailLbl);
  keysPanel.append(keysTop, keysBody, trailRow);

  root.append(typeDrawer, commDrawer, keysPanel, toastBox, hud);
  shadow.appendChild(root);

  // === BUCLE FPS REALES Y CRONÓMETRO ===
  let frames = 0;
  let lastFpsTs = performance.now();
  function loop(now) {
    frames++;
    if (now - lastFpsTs >= 1000) {
      const fps = Math.round((frames * 1000) / (now - lastFpsTs));
      fpsPill.textContent = `${fps} FPS`;
      frames = 0;
      lastFpsTs = now;
    }
    if (timerRunning) {
      timerElapsedMs += now - timerLastTick;
      timerLastTick = now;
      const totalSec = Math.floor(timerElapsedMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      timerVal.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

      if (settings.milestoneAlerts) {
        for (const min of [5, 10, 15, 20]) {
          if (m >= min && !triggeredMilestones.has(min)) {
            triggeredMilestones.add(min);
            showToast(min === 15
              ? "⚠️ Minuto 15: ¡Escalado fuerte de proyectiles!"
              : `⏱️ Hito alcanzado: ${min}:00`);
          }
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function toggleTimer() {
    if (timerRunning) {
      timerRunning = false;
      btnPlay.textContent = "▶";
      btnPlay.classList.remove("active");
    } else {
      timerRunning = true;
      timerLastTick = performance.now();
      btnPlay.textContent = "❚❚";
      btnPlay.classList.add("active");
    }
  }
  function resetTimer() {
    timerRunning = false;
    timerElapsedMs = 0;
    triggeredMilestones.clear();
    timerVal.textContent = "00:00";
    btnPlay.textContent = "▶";
    btnPlay.classList.remove("active");
  }
  btnPlay.addEventListener("click", toggleTimer);
  btnReset.addEventListener("click", resetTimer);

  btnTypes.addEventListener("click", () => {
    settings.typeChartOpen = !settings.typeChartOpen;
    applyLayout();
    chrome.storage.local.set({ psQolSettings: settings });
  });
  typeClose.addEventListener("click", () => {
    settings.typeChartOpen = false;
    applyLayout();
    chrome.storage.local.set({ psQolSettings: settings });
  });
  btnComm.addEventListener("click", () => {
    settings.communityOpen = !settings.communityOpen;
    applyLayout();
    chrome.storage.local.set({ psQolSettings: settings });
  });
  commClose.addEventListener("click", () => {
    settings.communityOpen = false;
    applyLayout();
    chrome.storage.local.set({ psQolSettings: settings });
  });

  // === REGISTRO PASIVO DE TECLAS Y RATÓN ===
  const pressedCodes = new Set();
  const pressTimestamps = [];
  const recentTrail = [];

  function syncKeyVisuals() {
    for (const [code, elems] of keyElements.entries()) {
      const active = pressedCodes.has(code);
      for (const el of elems) el.classList.toggle("active", active);
    }
  }
  function recordKeyHit(code) {
    pressTimestamps.push(performance.now());
    const label = KEY_LABELS[code];
    if (label) {
      recentTrail.push(label);
      if (recentTrail.length > 7) recentTrail.shift();
      trailRow.textContent = "";
      trailRow.appendChild(trailLbl);
      for (const l of recentTrail) {
        const ch = document.createElement("span");
        ch.className = "trail-chip";
        ch.textContent = l;
        trailRow.appendChild(ch);
      }
    }
  }
  setInterval(() => {
    const cutoff = performance.now() - 1000;
    while (pressTimestamps.length > 0 && pressTimestamps[0] < cutoff) pressTimestamps.shift();
    kpsBadge.textContent = `${pressTimestamps.length} KPS`;
  }, 150);

  window.addEventListener("keydown", (ev) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;

    if (keyElements.has(ev.code)) {
      if (!pressedCodes.has(ev.code)) recordKeyHit(ev.code);
      pressedCodes.add(ev.code);
      syncKeyVisuals();
    }

    if (!ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const key = ev.key.toLowerCase();
    let changed = false;

    if (key === "h") { settings.hudEnabled = !settings.hudEnabled; changed = true; }
    else if (key === "m") { settings.compactMode = !settings.compactMode; changed = true; }
    else if (key === "t") { settings.typeChartOpen = !settings.typeChartOpen; changed = true; }
    else if (key === "b") { settings.communityOpen = !settings.communityOpen; changed = true; }
    else if (key === "k") { settings.keysEnabled = !settings.keysEnabled; changed = true; }
    else if (key === "l") { settings.streamLock = !settings.streamLock; changed = true; }
    else if (key === "s" && ev.shiftKey) { ev.preventDefault(); resetTimer(); return; }
    else if (key === "s") { ev.preventDefault(); toggleTimer(); return; }
    else if (key === "c") {
      settings.hudPos = structuredClone(DEFAULT_SETTINGS.hudPos);
      settings.keysPos = structuredClone(DEFAULT_SETTINGS.keysPos);
      changed = true;
    }

    if (changed) {
      ev.preventDefault();
      applyLayout();
      chrome.storage.local.set({ psQolSettings: settings });
    }
  }, { capture: true });

  window.addEventListener("keyup", (ev) => {
    if (pressedCodes.delete(ev.code)) syncKeyVisuals();
  }, { capture: true });

  window.addEventListener("mousedown", (ev) => {
    if (!settings.keysMouse) return;
    const code = ev.button === 0 ? "Mouse0" : ev.button === 2 ? "Mouse2" : null;
    if (code && keyElements.has(code)) {
      if (!pressedCodes.has(code)) recordKeyHit(code);
      pressedCodes.add(code);
      syncKeyVisuals();
    }
  }, { capture: true });

  window.addEventListener("mouseup", (ev) => {
    const code = ev.button === 0 ? "Mouse0" : ev.button === 2 ? "Mouse2" : null;
    if (code && pressedCodes.delete(code)) syncKeyVisuals();
  }, { capture: true });

  window.addEventListener("contextmenu", () => {
    if (pressedCodes.delete("Mouse2")) syncKeyVisuals();
  }, { capture: true });

  function clearKeys() {
    if (pressedCodes.size > 0) { pressedCodes.clear(); syncKeyVisuals(); }
  }
  window.addEventListener("blur", clearKeys);
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearKeys(); });

  // === POSICIONAMIENTO Y ARRASTRE ===
  function applyBoxPosition(el, pos, fallback, isScaled = false) {
    const p = pos || fallback;
    if (typeof p.left === "number" && typeof p.top === "number") {
      if (isScaled) el.style.transformOrigin = "top left";
      el.style.left = `${p.left}px`; el.style.top = `${p.top}px`;
      el.style.right = "auto"; el.style.bottom = "auto";
    } else {
      if (isScaled) el.style.transformOrigin = "bottom right";
      el.style.left = "auto"; el.style.right = `${p.right ?? 14}px`;
      if (typeof p.bottom === "number") { el.style.bottom = `${p.bottom}px`; el.style.top = "auto"; }
      else { el.style.top = `${p.top ?? 56}px`; el.style.bottom = "auto"; }
    }
  }

  function applyLayout() {
    const th = THEMES[settings.uiTheme] || THEMES.cyber;
    host.style.setProperty("--pp-accent", th.accent);
    host.style.setProperty("--pp-accent2", th.accent2);
    host.style.setProperty("--pp-glow", th.glow);
    host.style.setProperty("--pp-border", th.border);
    host.style.setProperty("--pp-alpha", String((settings.uiOpacity ?? 88) / 100));
    host.style.setProperty("--pp-kscale", String((settings.keysScale ?? 100) / 100));

    root.classList.toggle("stream-lock", Boolean(settings.streamLock));
    hud.classList.toggle("hidden", !settings.hudEnabled);
    hud.classList.toggle("compact", Boolean(settings.compactMode));
    typeDrawer.classList.toggle("hidden", !settings.typeChartOpen);
    commDrawer.classList.toggle("hidden", !settings.communityOpen);
    btnTypes.classList.toggle("active", Boolean(settings.typeChartOpen));
    btnComm.classList.toggle("active", Boolean(settings.communityOpen));

    keysPanel.classList.toggle("hidden", !settings.keysEnabled);
    const mode = settings.keysMode || "wasd_skills";
    wasdBlock.classList.toggle("hidden", mode === "arrows");
    arrowsBlock.classList.toggle("hidden", mode === "wasd" || mode === "wasd_skills");
    skillsBlock.classList.toggle("hidden", mode === "wasd" || mode === "arrows");
    mouseBlock.classList.toggle("hidden", !settings.keysMouse);
    kpsBadge.classList.toggle("hidden", !settings.keysKps);
    trailRow.classList.toggle("hidden", !settings.keysKps);

    applyBoxPosition(hud, settings.hudPos, DEFAULT_SETTINGS.hudPos, false);
    applyBoxPosition(keysPanel, settings.keysPos, DEFAULT_SETTINGS.keysPos, true);
  }

  let dragTarget = null;
  function startDrag(el, posKey, ev) {
    if (settings.streamLock || ev.button !== 0) return;
    const rect = el.getBoundingClientRect();
    dragTarget = { el, posKey, offsetX: ev.clientX - rect.left, offsetY: ev.clientY - rect.top };
    ev.preventDefault();
  }
  hudHead.addEventListener("mousedown", (ev) => startDrag(hud, "hudPos", ev));
  keysDrag.addEventListener("mousedown", (ev) => startDrag(keysPanel, "keysPos", ev));

  window.addEventListener("mousemove", (ev) => {
    if (!dragTarget) return;
    const { el, posKey, offsetX, offsetY } = dragTarget;
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width - 8);
    const maxTop = Math.max(0, window.innerHeight - rect.height - 8);
    settings[posKey] = {
      top: Math.round(Math.min(maxTop, Math.max(8, ev.clientY - offsetY))),
      left: Math.round(Math.min(maxLeft, Math.max(8, ev.clientX - offsetX)))
    };
    applyLayout();
  });
  window.addEventListener("mouseup", () => {
    if (!dragTarget) return;
    dragTarget = null;
    chrome.storage.local.set({ psQolSettings: settings });
  });

  // === CARGA INICIAL Y SINCRONIZACIÓN ===
  chrome.storage.local.get(["psQolSettings", "ppFavorites", "ppPity", "ppArmor"], (res) => {
    if (res.psQolSettings) settings = { ...DEFAULT_SETTINGS, ...res.psQolSettings };
    if (Array.isArray(res.ppFavorites)) favorites = res.ppFavorites;
    if (res.ppPity && typeof res.ppPity === "object") pityMap = res.ppPity;
    if (res.ppArmor && typeof res.ppArmor === "object") armorState = res.ppArmor;
    applyLayout();
    renderFavorites();
    renderPity();
    renderArmor();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.psQolSettings?.newValue) {
      settings = { ...DEFAULT_SETTINGS, ...changes.psQolSettings.newValue };
      applyLayout();
    }
    if (changes.ppFavorites?.newValue) { favorites = changes.ppFavorites.newValue; renderFavorites(); }
    if (changes.ppPity?.newValue) { pityMap = changes.ppPity.newValue; renderPity(); }
    if (changes.ppArmor?.newValue) { armorState = changes.ppArmor.newValue; renderArmor(); }
  });
})();