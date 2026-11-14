(() => {
  "use strict";

  if (window.__POKEPULSE_BRIDGE_V23__) return;
  window.__POKEPULSE_BRIDGE_V23__ = true;

  const CHANNEL = "POKEPULSE_TELEMETRY_V23";
  const POLL_MS = 200;
  const MAX_ENEMY_SCAN = 500;
  const POI_RADIUS = 2600;

  let capturedG = window.G || null;
  let candidateG = null;
  const installedTraps = [];

  function cleanupTraps() {
    while (installedTraps.length > 0) {
      const prop = installedTraps.pop();
      try {
        delete Object.prototype[prop];
      } catch (_) {}
    }
  }

  function looksLikeGameNamespace(obj) {
    if (!obj || typeof obj !== "object" || obj === window) return false;
    let score = 0;
    if (obj.Game) score++;
    if (obj.Camera || obj.World) score++;
    if (obj.EnemyMgr || obj.Enemies || obj.Player) score++;
    if (obj.DB || obj.Coop || obj.Rift) score++;
    return score >= 2;
  }

  if (!capturedG) {
    const TRAP_PROPS = ["Camera", "Game", "EnemyMgr", "World", "Player", "Enemies"];
    for (const prop of TRAP_PROPS) {
      if (prop in Object.prototype) continue;
      try {
        Object.defineProperty(Object.prototype, prop, {
          configurable: true,
          enumerable: false,
          set(val) {
            try {
              if (!this || this === Object.prototype || !Object.isExtensible(this)) return;
              Object.defineProperty(this, prop, {
                value: val,
                writable: true,
                enumerable: true,
                configurable: true
              });
              if (typeof this === "object" && this !== window) {
                if (looksLikeGameNamespace(this)) {
                  capturedG = this;
                  if (this.Game && (this.EnemyMgr || this.Enemies || this.World)) {
                    cleanupTraps();
                  }
                } else if (prop === "Game" || prop === "Camera") {
                  candidateG = this;
                }
              }
            } catch (_) {}
          }
        });
        installedTraps.push(prop);
      } catch (_) {}
    }

    setTimeout(() => {
      if (!capturedG && candidateG && looksLikeGameNamespace(candidateG)) {
        capturedG = candidateG;
      }
      cleanupTraps();
    }, 10000);
  }

  function getG() {
    if (capturedG) return capturedG;
    if (window.G) {
      capturedG = window.G;
      return capturedG;
    }
    if (candidateG && looksLikeGameNamespace(candidateG)) {
      capturedG = candidateG;
      return capturedG;
    }
    return null;
  }

  function num(v, fallback = null) {
    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
  }

  function classifySpecial(item) {
    const raw = String(
      item?.kind ?? item?.type ?? item?.id ?? item?.name ?? ""
    ).toLowerCase();

    if (raw.includes("chest") || raw.includes("cofre")) return { kind: "chest", label: "Cofre" };
    if (raw.includes("spring") || raw.includes("manantial") || raw.includes("heal")) return { kind: "spring", label: "Manantial" };
    if (raw.includes("altar") || raw.includes("shrine")) return { kind: "altar", label: "Altar" };
    if (raw.includes("rift") || raw.includes("grieta")) return { kind: "rift", label: "Grieta" };
    return null;
  }

  function readMoves(p) {
    try {
      const list = p?.moves;
      if (!Array.isArray(list)) return [];
      return list
        .slice(0, 4)
        .map((m) => {
          if (!m) return null;
          return {
            name: String(m.name ?? m.id ?? "Mov."),
            lv: num(m.level ?? m.lv, 1),
            evolved: Boolean(m.evolved || m.isEvolved),
            bonded: Boolean(m.bonded || (Array.isArray(m.bond) && m.bond.length > 0))
          };
        })
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function readSnapshot() {
    try {
      const G = getG();
      if (!G || !G.Game) return { connected: Boolean(G), inRun: false };

      const game = G.Game;
      const p = game.player;
      const st = game.st || {};

      if (!p || p.dead || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        return { connected: true, inRun: false };
      }

      const hp = num(p.hp, 0);
      const maxHp = num(p.maxHp, 1);
      const shield = num(p.shield ?? p.barrier, 0);
      const spd = num(p.spd, 0);
      const baseSpd = num(p.baseSpd, spd || 1);
      const reduction = num(p.reduction, 0);
      const xpMul = num(p.xpMul, 1);
      const coinMul = num(p.coinMul, 1);
      const time = num(st.time, 0);
      const kills = num(st.kills ?? p.kills, null);
      const dmgTotal = num(
        p.dmgDealt ?? p.totalDamage ?? p.damageDealt ?? st.dmgDealt ?? st.damage,
        null
      );
      const isMega = Boolean(p.mega || p.isMega || p.form === "mega");
      const paused = Boolean(game.paused || st.paused);

      const coopActive = Boolean(G.Coop?.active);
      const allies = [];
      let coopSize = 1;
      if (coopActive && typeof G.Coop?.puppets === "function") {
        const peers = G.Coop.puppets();
        if (Array.isArray(peers)) {
          coopSize = 1 + peers.length;
          for (const ally of peers.slice(0, 4)) {
            if (!ally || !Number.isFinite(ally.x) || !Number.isFinite(ally.y)) continue;
            allies.push({
              name: String(ally.nick ?? ally.name ?? "Aliado"),
              dx: ally.x - p.x,
              dy: ally.y - p.y
            });
          }
        }
      }

      let enemyCount = 0;
      const alerts = [];
      let activeBoss = null;
      let rawEnemies = null;

      if (typeof G.EnemyMgr?.all === "function") {
        rawEnemies = G.EnemyMgr.all();
        enemyCount = num(G.EnemyMgr.count, rawEnemies?.length ?? 0);
      } else if (Array.isArray(G.Enemies?.list)) {
        rawEnemies = G.Enemies.list;
        enemyCount = rawEnemies.length;
      }

      if (Array.isArray(rawEnemies)) {
        const limit = Math.min(rawEnemies.length, MAX_ENEMY_SCAN);
        for (let i = 0; i < limit; i++) {
          const e = rawEnemies[i];
          if (!e || e.dead || !Number.isFinite(e.x) || !Number.isFinite(e.y)) continue;

          const isShiny = Boolean(e.shiny || e.isShiny);
          const isBoss = Boolean(e.boss || e.isBoss || e.legendary || e.isLegendary);
          if (!isShiny && !isBoss) continue;

          const bossName =
            e.name ||
            G.Enemies?.BOSSES?.[e.bossN]?.name ||
            (isShiny ? "Pokémon Shiny" : "Jefe");

          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const dist = Math.round(Math.hypot(dx, dy));
          const hpPct =
            e.maxHp > 0
              ? Math.max(0, Math.min(100, Math.round((e.hp / e.maxHp) * 100)))
              : null;

          if (isBoss && (!activeBoss || dist < activeBoss.dist)) {
            activeBoss = {
              name: String(bossName),
              hp: num(e.hp, 0),
              maxHp: num(e.maxHp, 1),
              hpPct: hpPct ?? 100,
              dist
            };
          }

          alerts.push({
            id: `${isShiny ? "sh" : "bs"}-${e.id ?? e.uid ?? `${Math.round(e.x)}_${Math.round(e.y)}`}`,
            kind: isShiny ? "shiny" : "boss",
            name: String(bossName),
            dx,
            dy,
            dist,
            hpPct
          });
        }
      }

      const pois = [];
      if (typeof G.World?.specialsNear === "function") {
        const near = G.World.specialsNear(p.x, p.y, POI_RADIUS);
        if (Array.isArray(near)) {
          for (let i = 0; i < Math.min(near.length, 35); i++) {
            const item = near[i];
            if (!item || item.used || item.opened || item.broken) continue;
            if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) continue;
            const info = classifySpecial(item);
            if (!info) continue;

            const dx = item.x - p.x;
            const dy = item.y - p.y;
            pois.push({
              kind: info.kind,
              label: info.label,
              dx,
              dy,
              dist: Math.round(Math.hypot(dx, dy))
            });
          }
        }
      }
      pois.sort((a, b) => a.dist - b.dist);

      return {
        connected: true,
        inRun: true,
        paused,
        time,
        kills,
        dmgTotal,
        hp,
        maxHp,
        shield,
        spd,
        baseSpd,
        reduction,
        xpMul,
        coinMul,
        isMega,
        coopActive,
        coopSize,
        allies,
        enemyCount,
        riftActive: Boolean(G.Rift?.active),
        activeBoss,
        moves: readMoves(p),
        alerts: alerts.slice(0, 8),
        pois: pois.slice(0, 6)
      };
    } catch (_) {
      return { connected: false, inRun: false };
    }
  }

  setInterval(() => {
    if (document.hidden) return;
    window.postMessage(
      { channel: CHANNEL, payload: readSnapshot() },
      window.location.origin
    );
  }, POLL_MS);
})();