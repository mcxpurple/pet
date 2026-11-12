/*
 * Violet Hour 紫夜星光｜網頁版季節水彩微景（2026-11-12，GPT-6）
 * © 2026 mcx_purple. All rights reserved.
 * 僅由網頁版 index.html 載入；不修改 pet-engine.js 或擴充功能。
 */
(function () {
  'use strict';

  const BOTTOM_ZONE = 125;
  const PARTICLE_MIN_MS = 4000;
  const PARTICLE_MAX_MS = 5500;
  // Responsive density, recalculated every tick (including when the viewport is resized).
  // The cap is shared by all pets; it is never multiplied by the number of pets.
  function particleSettings() {
    const width = window.innerWidth;
    if (width <= 600) return { max: 6, minMs: 800, maxMs: 1200 };
    if (width <= 1100) return { max: 8, minMs: 650, maxMs: 950 };
    if (width <= 1600) return { max: 10, minMs: 500, maxMs: 850 };
    return { max: 12, minMs: 450, maxMs: 750 };
  }
  const random = (a, b) => a + Math.random() * (b - a);
  const choose = a => a[Math.floor(Math.random() * a.length)];
  const live = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const requestedSeason = new URLSearchParams(window.location.search).get('season');
  const allowedSeasons = ['spring', 'summer', 'autumn', 'winter', 'firefly'];
  const seasonOverride = allowedSeasons.includes(requestedSeason) ? requestedSeason : null;
  const ROOT = 'assets/seasonal/';

  // 動物彩蛋：開始散步後 3 分鐘第一次抽選，此後每 60 分鐘抽一次。
  // 時鐘只累計分頁可見的時間；機率只影響本小時是否排入一次出場。
  const ANIMAL_CHANCE = 0.2;
  const ANIMAL_INTERVAL_MIN = 60;
  const ANIMAL_FIRST_DELAY_MS = 3 * 60 * 1000;
  const ANIMAL_INTERVAL_MS = ANIMAL_INTERVAL_MIN * 60 * 1000;
  const animalOverride = new URLSearchParams(window.location.search).get('animal') === '1';
  const ANIMALS = {
    plum: 'formosan-black-bear', cherry: 'taiwan-blue-magpie',
    tung: 'taiwan-blue-magpie', summer: 'taiwan-sika-deer',
    firefly: 'taiwan-sika-deer', autumn: 'leopard-cat',
    snow: 'formosan-black-bear'
  };
  const ANIMAL_FOOT_PADDING = {
    'taiwan-blue-magpie': .15, 'taiwan-sika-deer': .07,
    'leopard-cat': .15, 'formosan-black-bear': .045
  };


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
  let animalImage = null;
  let animalSpecies = '';
  let animalLoadSerial = 0;
  let currentAnimal = null;

  function preloadSeasonAnimal(theme) {
    const species = ANIMALS[theme];
    if (animalSpecies === species) return;
    animalSpecies = species;
    const serial = ++animalLoadSerial;
    animalImage = null;
    if (currentAnimal) removeAnimal();
    const preload = new Image();
    preload.onload = () => {
      if (animalLoadSerial === serial && preload.naturalWidth > 0) animalImage = preload;
    };
    preload.onerror = () => { if (animalLoadSerial === serial) animalImage = null; };
    preload.src = ROOT + 'animals/' + species + '.png';
  }

  let loaded = { full: [], partial: [], ground: [] };
  let loadingSerial = 0;
  // 只對當季檔案建立 Image。失敗者不進候選清單；換季後忽略舊 onload。
  function updateSeasonAssets(theme) {
    if (activeTheme === theme) return;
    activeTheme = theme;
    preloadSeasonAnimal(theme);
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

    let el, size, ground = false, item = null, pale = false;
    if (type === 'firefly') {
      el = document.createElement('span');
      el.className = 'qseason-particle qseason-firefly';
      // Mostly tiny glimmers, occasionally larger glowing fireflies.
      size = Math.random() < .70 ? random(2.5, 4.7) : random(4.8, 7.5);
      // Scale each halo with its firefly, so small dots stay visibly smaller.
      el.style.setProperty('--glow-blur', (size * .95).toFixed(1) + 'px');
      el.style.setProperty('--glow-spread', (size * .30).toFixed(1) + 'px');
      el.style.setProperty('--glow-halo', (size * 2.2).toFixed(1) + 'px');
      el.style.setProperty('--glow-halo-spread', (size * .45).toFixed(1) + 'px');
    } else {
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
      // Two independent layers: outer container follows a curved flight path,
      // inner PNG spins on its own axis throughout the same 4–5.5 second flight.
      // Grounded dandelion puffs remain as a single stationary image.
      el = document.createElement(ground ? 'img' : 'span');
      el.className = ground
        ? 'qseason-particle qseason-sprite qseason-ground'
        : 'qseason-particle qseason-flight';
      el.style.pointerEvents = 'none';
      if (ground) {
        el.alt = '';
        el.draggable = false;
        el.src = item.file;
      } else {
        const artwork = document.createElement('img');
        artwork.className = 'qseason-sprite qseason-art-spin';
        artwork.alt = '';
        artwork.draggable = false;
        artwork.style.pointerEvents = 'none';
        artwork.src = item.file;
        el.appendChild(artwork);
      }
      pale = /(?:tung-flower|taiwan-lily|taiwan-azalea|lotus|snowflake|plum-|dandelion-)/.test(item.file);
      size = ground ? relativeSize(.11, .15, 19, 32)
        : item.group === 'full' ? relativeSize(.13, .17, 22, 36)
        : relativeSize(.095, .135, 17, 28);
      // Transparent padding around pale PNGs makes their actual flowers appear small.
      // Enlarge their rendered boxes slightly, without changing or outlining the artwork.
      if (pale && !ground) size = Math.min(41, size * 1.12);
    }

    const x = Math.max(14, Math.min(width - 14, rect.left + rect.width * random(.17, .83)));
    const y = ground
      ? Math.max(height - BOTTOM_ZONE, Math.min(height - size - 4, rect.bottom - size - random(2, 8)))
      : Math.max(height - BOTTOM_ZONE, Math.min(height - 6, rect.bottom - random(8, 20)));
    const duration = random(PARTICLE_MIN_MS, PARTICLE_MAX_MS);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--duration', duration + 'ms');
    el.style.setProperty('--peak-opacity',
      random(pale ? .95 : .80, pale ? 1 : .95).toFixed(2));
    const isSeed = !!item && item.file.endsWith('/dandelion-seed.png');
    const drift = isSeed ? 72 : type === 'firefly' ? 65 : 42;
    const dx = random(-drift, drift);
    el.style.setProperty('--dx', dx.toFixed(1) + 'px');
    const rise = type === 'firefly'
      ? Math.min(400, Math.max(75, petHeight * random(.85, 1.70)))
      : isSeed
        ? Math.min(400, Math.max(110, petHeight * random(1.20, 1.80)))
        : Math.min(285, Math.max(70, petHeight * random(.70, 1.20)));
    el.style.setProperty('--dy', (-rise).toFixed(1) + 'px');
    if (item && !ground) {
      // Layer 1: an independently curved flight path, with changing direction
      // and gentle banking while travelling outward / upward.
      const curveDirection = Math.random() < .5 ? -1 : 1;
      const curve = random(10, Math.min(34, Math.max(10, width * .04)));
      const pathPositions = [
        dx * .24 + curveDirection * curve,
        dx * .51 - curveDirection * curve * .55,
        dx * .76 + curveDirection * curve * .40
      ];
      const pathHeights = [.25, .52, .78];
      pathPositions.forEach((pos, index) => {
        const step = index + 1;
        el.style.setProperty('--path-x' + step, pos.toFixed(1) + 'px');
        el.style.setProperty('--path-y' + step,
          (-(rise * pathHeights[index])).toFixed(1) + 'px');
      });
      const bank = random(12, 30) * curveDirection;
      const pathStart = random(-20, 20);
      for (let step = 0; step <= 4; step++) {
        const turn = [pathStart, pathStart + bank,
          pathStart - bank * .6, pathStart + bank * .55,
          pathStart + bank * .25][step];
        el.style.setProperty('--flight-turn' + step, turn.toFixed(1) + 'deg');
      }

      // Layer 2: the PNG itself rotates independently of the flight path.
      // Loose petals, leaf fragments, drifting seeds and fluff spin more than
      // complete blossoms or leaves. Each gets a random direction and angle.
      const artwork = el.firstChild;
      const rapid = item.group === 'partial';
      const direction = Math.random() < .5 ? -1 : 1;
      const spinStart = random(-110, 110);
      const sweep = direction * (rapid ? random(360, 900) : random(180, 420));
      artwork.style.setProperty('--self-start', spinStart.toFixed(1) + 'deg');
      artwork.style.setProperty('--self-end',
        (spinStart + sweep).toFixed(1) + 'deg');
    } else {
      // CSS fireflies retain their original untouched light-particle animation.
      // Dandelion puffs remain grounded with no flying or spinning.
      el.style.setProperty('--rotation', random(-28, 28).toFixed(1) + 'deg');
    }
    // 新 DOM 先插入。z-index 由 CSS 保證：粒子 -1，動物 0，桌寵引擎 1。
    stage.insertBefore(el, stage.firstChild);
    live.add(el);
    window.setTimeout(() => { el.remove(); live.delete(el); }, duration + 100);
  }

  function clearParticles() {
    live.forEach(el => el.remove());
    live.clear();
  }


  // 動物是獨立彩蛋，不佔 MAX_PARTICLES，圖層位於粒子與桌寵之間。
  function spawnAnimal(stage, forced) {
    if (!animalImage || currentAnimal) return false;
    const pets = Array.from(stage.querySelectorAll('.qpet')).filter(p => {
      const r = p.getBoundingClientRect();
      return r.width > 0 && r.bottom >= window.innerHeight - BOTTOM_ZONE &&
        r.top <= window.innerHeight && !p.classList.contains('dragging');
    });
    if (!pets.length) return false;

    const pet = choose(pets);
    const rect = pet.getBoundingClientRect();
    const petHeight = pet.offsetHeight || rect.height;
    const size = petHeight * .50;
    const species = animalSpecies;
    const kind = species === 'taiwan-blue-magpie' ? 'magpie'
      : species === 'taiwan-sika-deer' ? 'deer'
      : species === 'leopard-cat' ? 'cat' : 'bear';
    const side = Math.random() < .5 ? 1 : -1;
    const face = side === 1 ? -1 : 1; // 三種側面動物原圖朝左，翻轉後朝右。
    const width = window.innerWidth;
    const height = window.innerHeight;
    const from = side === 1 ? -size - 20 : width + 20;
    const to = side === 1 ? width + size + 20 : -size - 20;
    const stop = side === 1 ? width * .34 - size * .5 : width * .66 - size * .5;

    const el = document.createElement('img');
    el.src = animalImage.src;
    el.alt = '';
    el.draggable = false;
    el.className = 'qseason-animal qseason-animal-' + kind;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    // 原圖留有透明底邊；按實際四張素材修正，讓可見的腳貼近地面。
    el.style.bottom = (4 - size * ANIMAL_FOOT_PADDING[species]) + 'px';

    function frame(offset, x, y, facing, opacity = 1, rotate = 0, scaleY = 1) {
      return {
        offset, opacity,
        transform: 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) +
          'px,0) rotate(' + rotate + 'deg) scaleX(' + facing +
          ') scaleY(' + scaleY + ')'
      };
    }
    const at = ratio => from + (stop - from) * ratio;
    let frames, duration;
    if (kind === 'magpie') {
      // 四次小拋物線彈跳，停下左右張望，最後斜上方飛離。
      duration = 9300;
      frames = [
        frame(0, from, 0, face, 0),
        frame(.07, at(.18), -size*.15, face),
        frame(.13, at(.30), 0, face),
        frame(.18, at(.46), -size*.14, face),
        frame(.24, at(.56), 0, face),
        frame(.29, at(.72), -size*.13, face),
        frame(.34, at(.80), 0, face),
        frame(.39, at(.94), -size*.12, face),
        frame(.45, stop, 0, face),
        frame(.55, stop, 0, -face),
        frame(.64, stop, 0, face),
        frame(.73, stop, 0, face),
        frame(1, to, -height-size, face, 0, side*12)
      ];
    } else if (kind === 'deer') {
      // 走入、低頭約兩秒、繼續走出另一側。
      duration = 9500;
      frames = [
        frame(0, from, 0, face, 0),
        frame(.09, at(.25), -2, face),
        frame(.18, at(.46), 1, face),
        frame(.29, at(.76), -2, face),
        frame(.39, stop, 0, face),
        frame(.44, stop, size*.055, face, 1, side*11),
        frame(.65, stop, size*.055, face, 1, side*11),
        frame(.69, stop, 0, face),
        frame(.81, stop+(to-stop)*.43, -2, face),
        frame(.90, stop+(to-stop)*.72, 1, face),
        frame(1, to, 0, face, 0)
      ];
    } else if (kind === 'cat') {
      // 壓低慢速潛入、停兩秒、迅速衝離。
      duration = 7500;
      frames = [
        frame(0, from, size*.06, face, 0, 0, .90),
        frame(.18, at(.47), size*.06, face, 1, 0, .90),
        frame(.36, stop, size*.08, face, 1, 0, .88),
        frame(.64, stop, size*.08, face, 1, 0, .88),
        frame(.70, stop, size*.02, face),
        frame(.87, stop+(to-stop)*.70, -size*.04, face),
        frame(1, to, -size*.04, face, 0)
      ];
    } else {
      // 黑熊原圖正面坐姿，不翻面；邊緣淡入，左右輕晃後淡出。
      duration = 7500;
      const edge = side === 1 ? Math.max(8, width*.075) :
        Math.max(8, width-size-width*.075);
      frames = [
        frame(0, edge, 0, 1, 0),
        frame(.12, edge, 0, 1),
        frame(.26, edge, 0, 1, 1, -5),
        frame(.40, edge, 0, 1, 1, 5),
        frame(.54, edge, 0, 1, 1, -5),
        frame(.68, edge, 0, 1, 1, 5),
        frame(.82, edge, 0, 1),
        frame(1, edge, 0, 1, 0)
      ];
    }

    // 測試模式立即進場，展示 3 秒後結束，正式模式播放各物種 6–12 秒。
    if (forced) {
      duration = 3000;
      const holdX = kind === 'bear' ? (side === 1 ? width*.075 : width-size-width*.075) : stop;
      frames = [
        frame(0, holdX, 0, kind === 'bear' ? 1 : face, 0),
        frame(.20, holdX, 0, kind === 'bear' ? 1 : face),
        frame(.75, holdX, 0, kind === 'bear' ? 1 : face),
        frame(1, holdX, -8, kind === 'bear' ? 1 : face, 0)
      ];
    }

    const instance = { el, animation: null, leaving: false };
    currentAnimal = instance;
    stage.insertBefore(el, stage.firstChild);
    const animation = el.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
    instance.animation = animation;
    const cleanup = () => {
      el.remove();
      if (currentAnimal === instance) currentAnimal = null;
    };
    animation.onfinish = cleanup;

    function earlyLeave() {
      if (instance.leaving || currentAnimal !== instance) return;
      instance.leaving = true;
      const transform = window.getComputedStyle(el).transform;
      const opacity = window.getComputedStyle(el).opacity;
      animation.onfinish = null;
      animation.cancel();
      const exit = el.animate([
        { transform, opacity },
        { transform: transform + ' translateY(-18px)', opacity: 0 }
      ], { duration: 550, easing: 'ease-out', fill: 'forwards' });
      instance.animation = exit;
      exit.onfinish = cleanup;
    }
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const box = el.getBoundingClientRect();
      const heart = document.createElement('span');
      heart.className = 'qfx emo qseason-heart';
      heart.textContent = '❤';
      heart.style.left = (box.left + box.width*.5) + 'px';
      heart.style.top = (box.top + box.height*.25) + 'px';
      stage.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1500);
      earlyLeave();
    });
    return true;
  }

  function pauseAnimalIfHidden(hidden) {
    if (!currentAnimal || !currentAnimal.animation) return;
    if (hidden) currentAnimal.animation.pause();
    else currentAnimal.animation.play();
  }

  function removeAnimal() {
    if (currentAnimal) {
      currentAnimal.animation.onfinish = null;
      currentAnimal.animation.cancel();
      currentAnimal.el.remove();
      currentAnimal = null;
    }
  }

  function init() {
    const stage = document.getElementById('stage');
    if (!stage) return;


    // 單調可見時鐘：hidden 狀態不累計，也不因背景計時器延遲而補時。
    let startedWalking = false;
    let visibleMs = 0;
    let lastSample = performance.now();
    let wasVisible = !document.hidden;
    let nextDrawAt = ANIMAL_FIRST_DELAY_MS;
    const animalQueue = [];
    let forcedShown = false;

    function animalBlocked() {
      const picker = document.getElementById('picker');
      return document.hidden || reducedMotion.matches ||
        (picker && !picker.hidden) ||
        !!stage.querySelector('.qpet.dragging') ||
        !stage.querySelector('.qpet');
    }

    function animalTick() {
      const now = performance.now();
      if (startedWalking && wasVisible) visibleMs += Math.max(0, now - lastSample);
      lastSample = now;
      wasVisible = !document.hidden;
      if (!startedWalking) {
        const picker = document.getElementById('picker');
        if (stage.querySelector('.qpet') && (!picker || picker.hidden) && !document.hidden) {
          startedWalking = true;
          visibleMs = 0;
        }
      }
      if (!startedWalking || document.hidden) return;

      if (animalOverride) {
        if (!forcedShown && !animalBlocked() && spawnAnimal(stage, true)) forcedShown = true;
        return;
      }
      // 每個小時窗口各抽一次；若抽中，從這一窗口隨機挑時點排入待出場。
      while (visibleMs >= nextDrawAt) {
        if (Math.random() < ANIMAL_CHANCE) {
          animalQueue.push({ due: nextDrawAt + random(0, ANIMAL_INTERVAL_MS) });
        }
        nextDrawAt += ANIMAL_INTERVAL_MS;
      }
      // 角色拖曳／選角畫面時保留待出場事件，不重新抽機率、不重複出場。
      if (animalQueue.length && animalQueue[0].due <= visibleMs &&
          !animalBlocked() && !currentAnimal && spawnAnimal(stage, false)) {
        animalQueue.shift();
      }
    }

    function tick() {
      const theme = themeNow(); // 每輪重判；開著頁面跨月／跨 19:00 也會切季。
      updateSeasonAssets(theme);
      animalTick();
      const picker = document.getElementById('picker');
      const off = document.hidden || reducedMotion.matches || (picker && !picker.hidden);
      if (off) clearParticles();
      const density = particleSettings();
      if (!off && live.size < density.max) {
        const pets = Array.from(stage.querySelectorAll('.qpet')).filter(p => {
          const r = p.getBoundingClientRect();
          return r.width > 0 && r.bottom >= window.innerHeight - BOTTOM_ZONE &&
            r.top <= window.innerHeight;
        });
        if (pets.length) spawn(stage, theme, choose(pets));
      }
      window.setTimeout(tick, !off ? random(density.minMs, density.maxMs) : 4500);
    }

    document.addEventListener('visibilitychange', () => {
      const now = performance.now();
      if (startedWalking && wasVisible) visibleMs += Math.max(0, now - lastSample);
      lastSample = now;
      wasVisible = !document.hidden;
      pauseAnimalIfHidden(document.hidden);
      if (document.hidden) clearParticles();
    });
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', e => {
        if (e.matches) { clearParticles(); removeAnimal(); }
      });
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else init();
})();
