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

const CHECK_KEYS = [
  "hudEnabled", "compactMode", "typeChartOpen", "communityOpen",
  "keysEnabled", "keysMouse", "keysKps", "streamLock", "milestoneAlerts"
];

let current = structuredClone(DEFAULT_SETTINGS);

function syncUI() {
  for (const k of CHECK_KEYS) {
    const el = document.getElementById(k);
    if (el) el.checked = Boolean(current[k]);
  }
  const modeEl = document.getElementById("keysMode");
  if (modeEl) modeEl.value = current.keysMode || "wasd_skills";
  const themeEl = document.getElementById("uiTheme");
  if (themeEl) themeEl.value = current.uiTheme || "cyber";

  const scaleEl = document.getElementById("keysScale");
  const scaleVal = document.getElementById("keysScaleVal");
  if (scaleEl) scaleEl.value = current.keysScale ?? 100;
  if (scaleVal) scaleVal.textContent = String(current.keysScale ?? 100);

  const opEl = document.getElementById("uiOpacity");
  const opVal = document.getElementById("uiOpacityVal");
  if (opEl) opEl.value = current.uiOpacity ?? 88;
  if (opVal) opVal.textContent = String(current.uiOpacity ?? 88);
}

chrome.storage.local.get("psQolSettings", (res) => {
  if (res.psQolSettings) current = { ...DEFAULT_SETTINGS, ...res.psQolSettings };
  syncUI();
});

for (const k of CHECK_KEYS) {
  document.getElementById(k)?.addEventListener("change", (ev) => {
    current[k] = ev.target.checked;
    chrome.storage.local.set({ psQolSettings: current });
  });
}

document.getElementById("keysMode")?.addEventListener("change", (ev) => {
  current.keysMode = ev.target.value;
  chrome.storage.local.set({ psQolSettings: current });
});

document.getElementById("uiTheme")?.addEventListener("change", (ev) => {
  current.uiTheme = ev.target.value;
  chrome.storage.local.set({ psQolSettings: current });
});

document.getElementById("keysScale")?.addEventListener("input", (ev) => {
  current.keysScale = Number(ev.target.value);
  document.getElementById("keysScaleVal").textContent = ev.target.value;
  chrome.storage.local.set({ psQolSettings: current });
});

document.getElementById("uiOpacity")?.addEventListener("input", (ev) => {
  current.uiOpacity = Number(ev.target.value);
  document.getElementById("uiOpacityVal").textContent = ev.target.value;
  chrome.storage.local.set({ psQolSettings: current });
});

document.getElementById("resetPos")?.addEventListener("click", () => {
  current.hudPos = structuredClone(DEFAULT_SETTINGS.hudPos);
  current.keysPos = structuredClone(DEFAULT_SETTINGS.keysPos);
  chrome.storage.local.set({ psQolSettings: current });
});