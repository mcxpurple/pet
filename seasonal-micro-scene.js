/*
 * Violet Hour 紫夜星光｜網頁版季節水彩微景（2026-11-12，GPT-6）
 * © 2026 mcx_purple. All rights reserved.
 * 僅由網頁版 index.html 載入；不修改 pet-engine.js 或擴充功能。
 */
(function () {
  'use strict';

  const MAX_PARTICLES = 6;
  const BOTTOM_ZONE = 125;
  const PARTICLE_MIN_MS = 2700;
  const PARTICLE_MAX_MS = 4100;
  const random = (a, b) => a + Math.random() * (b - a);
  const choose = a => a[Math.floor(Math.random() * a.length)];
  const live = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const requestedSeason = new URLSearchParams(window.location.search).get('season');
  const allowedSeasons = ['spring', 'summer', 'autumn', 'winter', 'firefly'];
  const seasonOverride = allowedSeasons.includes(requestedSeason) ? requestedSeason : null;
  const ROOT = 'assets/seasonal/';

  // group: partial ≈ 75%，full ≈ 25%；ground 為不飄升的蒲公英絨球。
  const sprite = (folder, file, group, weight = 1) => ({
    file: ROOT + folder + '/' + file + '.png', group, weight
  });
  const shared = (file, group) => ({ file: ROOT + file + '.png', group, weight: 1 });
  const dandelion = [
    shared('dandelion-seed', 'partial'),
    shared('dandelion-puff', 'ground')
  ];
  const CAMELLIA = [
    sprite('winter', 'camellia-full', 'full'),
    sprite('winter', 'camellia-petal', 'partial')
  ];
  const CONFIG = {
    plum: [
      sprite('winter', 'plum-full', 'full'),
      sprite('winter', 'plum-petal', 'partial'),
      ...CAMELLIA
    ],
    cherry: [
      sprite('spring', 'taiwan-cherry-full', 'full'),
      sprite('spring', 'taiwan-cherry-petal', 'partial'),
      sprite('spring', 'taiwan-azalea-full', 'full'),
      sprite('spring', 'taiwan-azalea-petal', 'partial'),
      sprite('spring', 'taiwan-lily-full', 'full'),
      sprite('spring', 'taiwan-lily-petal', 'partial'),
      ...dandelion
    ],
    tung: [
      sprite('spring', 'tung-flower-full', 'full', 5),
      sprite('spring', 'tung-flower-petal', 'partial', 5),
      sprite('spring', 'taiwan-lily-full', 'full'),
      sprite('spring', 'taiwan-lily-petal', 'partial'),
      ...dandelion
    ],
    summer: [
      sprite('summer', 'poinciana-full', 'full'),
      sprite('summer', 'poinciana-petal', 'partial'),
      sprite('summer', 'lotus-full', 'full'),
      sprite('summer', 'lotus-petal', 'partial'),
      sprite('summer', 'daylily-full', 'full'),
      sprite('summer', 'daylily-petal', 'partial'),
      sprite('summer', 'hibiscus-full', 'full'),
      sprite('summer', 'hibiscus-petal', 'partial'),
      ...dandelion
    ],
    autumn: [
      sprite('autumn', 'maple-leaf', 'full'),
      sprite('autumn', 'maple-fragment', 'partial'),
      sprite('autumn', 'ginkgo-leaf', 'full'),
      // ginkgo-fragment.png 尚未上傳：不列入 preload，也不發出 404。
      sprite('autumn', 'taiwan-rain-tree-flower', 'full'),
      sprite('autumn', 'taiwan-rain-tree-pod', 'full'),
      sprite('autumn', 'silvergrass-plume', 'full'),
      sprite('autumn', 'silvergrass-fluff', 'partial'),
      ...dandelion
    ],
    snow: [
      sprite('winter', 'snowflake', 'full'),
      sprite('winter', 'snowflake-fragment', 'partial'),
      sprite('winter', 'snowball-small', 'full'),
      ...CAMELLIA
      // snowball.png（大）保留在素材庫，暫不使用。
    ]
  };

  function themeNow() {
    if (seasonOverride) {
      return ({ spring: 'cherry', summer: 'summer', autumn: 'autumn',
        winter: 'snow', firefly: 'firefly' })[seasonOverride];
    }
    const now = new Date(), month = now.getMonth() + 1, h = now.getHours();
    if (month <= 2) return 'plum';
    if (month <= 4) return 'cherry';
    if (month === 5) return 'tung';
    if (month <= 8) return h >= 19 || h < 6 ? 'firefly' : 'summer';
    if (month <= 11) return 'autumn';
    return 'snow';
  }

  let activeTheme = '';
  let loaded = { full: [], partial: [], ground: [] };
  let loadingSerial = 0;
  // 只對當季檔案建立 Image。失敗者不進候選清單；換季後忽略舊 onload。
  function updateSeasonAssets(theme) {
    if (activeTheme === theme) return;
    activeTheme = theme;
    const serial = ++loadingSerial;
    loaded = { full: [], partial: [], ground: [] };
    clearParticles();
    if (theme === 'firefly') return;
    (CONFIG[theme] || []).forEach(item => {
      const preload = new Image();
      preload.onload = () => {
        if (loadingSerial === serial && preload.naturalWidth > 0) {
          loaded[item.group].push(item);
        }
      };
      preload.onerror = () => {
        // 載入失敗時從候選清單自然排除；不回退至 emoji 或其他品種。
        if (loadingSerial === serial) {
          for (const group of Object.keys(loaded)) {
            loaded[group] = loaded[group].filter(candidate => candidate.file !== item.file);
          }
        }
      };
      preload.src = item.file;
    });
  }

  function chooseWeighted(items) {
    const total = items.reduce((n, item) => n + item.weight, 0);
    let roll = random(0, total);
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  // 獨立特效層，只依 DOM 讀取角色尺寸和位置，不讀寫 World / Pet 狀態。
  function spawn(stage, type, pet) {
    const rect = pet.getBoundingClientRect();
    const width = window.innerWidth, height = window.innerHeight;
    if (rect.width <= 0 || rect.bottom < height - BOTTOM_ZONE || rect.top > height) return;
    const petHeight = pet.offsetHeight || rect.height;
    const relativeSize = (low, high, minPx, maxPx) =>
      Math.min(maxPx, Math.max(minPx, petHeight * random(low, high)));

    let el, size, ground = false;
    if (type === 'firefly') {
      el = document.createElement('span');
      el.className = 'qseason-particle qseason-firefly';
      size = random(3, 5.5);
    } else {
      let item = null;
      if (loaded.ground.length && Math.random() < .08) {
        item = chooseWeighted(loaded.ground);
        ground = true;
      } else {
        const preferred = Math.random() < .75 ? 'partial' : 'full';
        const candidates = loaded[preferred].length ? loaded[preferred]
          : loaded[preferred === 'partial' ? 'full' : 'partial'];
        if (!candidates.length) return;
        item = chooseWeighted(candidates);
      }
      el = document.createElement('img');
      el.className = 'qseason-particle qseason-sprite' + (ground ? ' qseason-ground' : '');
      el.alt = '';
      el.draggable = false;
      el.style.pointerEvents = 'none';
      el.src = item.file;
      size = ground ? relativeSize(.11, .15, 19, 32)
        : item.group === 'full' ? relativeSize(.12, .15, 20, 32)
        : relativeSize(.09, .125, 15, 25);
    }

    const x = Math.max(14, Math.min(width - 14, rect.left + rect.width * random(.17, .83)));
    const y = Math.max(height - BOTTOM_ZONE, Math.min(height - 6, rect.bottom - random(8, 20)));
    const duration = random(PARTICLE_MIN_MS, PARTICLE_MAX_MS);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--duration', duration + 'ms');
    el.style.setProperty('--peak-opacity', random(.52, .83).toFixed(2));
    el.style.setProperty('--dx', random(-42, 42).toFixed(1) + 'px');
    const rise = type === 'firefly'
      ? Math.min(270, Math.max(45, petHeight * random(.45, 1.10)))
      : Math.min(285, Math.max(70, petHeight * random(.70, 1.20)));
    el.style.setProperty('--dy', (-rise).toFixed(1) + 'px');
    el.style.setProperty('--rotation', random(-28, 28).toFixed(1) + 'deg');
    // 新 DOM 先插入。z-index 由 CSS 保證：粒子 -1，動物 0，桌寵引擎 1。
    stage.insertBefore(el, stage.firstChild);
    live.add(el);
    window.setTimeout(() => { el.remove(); live.delete(el); }, duration + 100);
  }

  function clearParticles() {
    live.forEach(el => el.remove());
    live.clear();
  }

  function init() {
    const stage = document.getElementById('stage');
    if (!stage) return;

    function tick() {
      const theme = themeNow(); // 每輪重判；開著頁面跨月／跨 19:00 也會切季。
      updateSeasonAssets(theme);
      const picker = document.getElementById('picker');
      const off = document.hidden || reducedMotion.matches || (picker && !picker.hidden);
      if (off) clearParticles();
      if (!off && live.size < MAX_PARTICLES) {
        const pets = Array.from(stage.querySelectorAll('.qpet')).filter(p => {
          const r = p.getBoundingClientRect();
          return r.width > 0 && r.bottom >= window.innerHeight - BOTTOM_ZONE &&
            r.top <= window.innerHeight;
        });
        if (pets.length) spawn(stage, theme, choose(pets));
      }
      window.setTimeout(tick, !off ? random(950, 1650) : 4500);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearParticles();
    });
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', e => { if (e.matches) clearParticles(); });
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else init();
})();
