/* Q版桌寵引擎 v0.7｜網頁版與擴充功能共用
   用法：const world = new QPet.World(stageElement, { max });
         world.set([{ cfg, bitmaps }, ...]);   // bitmaps = { 狀態: [ImageBitmap, ...] }
         world.setSize('小' | '中' | '大');     // 玩家選擇的角色大小，立即生效
         world.callTo(clientX);                // 叫最近的角色小跑步過來 */
(function (global) {
  const SPEED = { '慢': 28, '中': 45, '快': 70 };          // 走路速度 px/秒
  const FRAME = { '慢': 0.18, '中': 0.15, '快': 0.12 };     // 走路每格秒數
  const RUN_MULT = 2.2;                                     // 小跑步速度倍率
  const ACCEL = 120;                                        // 起步與煞車加速度 px/秒²
  const IMAGE_FACES_RIGHT = true;                           // 圖片中角色預設面向右
  const ASPECT = 600 / 450;                                 // 畫布比例（高/寬）
  const GRAVITY = 2200;
  const CORE = ['idle', 'sleep', 'click', 'drag', 'walk'];
  const SIZE_PCT = { '小': .14, '中': .18, '大': .22 };      // 角色高度佔視窗高度比例
  const SIZE_MIN = 100, SIZE_MAX = 240, SIZE_BASE = 120;     // 高度上下限；名冊 size 以 120 為 1 倍

  /* 時段作息（依玩家電腦時間，與網頁版背景同一套時段）
     spd：走路速度倍率｜sleep：入睡秒數倍率｜tired：停下時打呵欠或伸懶腰的機率 */
  const SLOT_RULE = {
    day:   { spd: 1,   sleep: 1,  tired: .06 },   // 06–16
    dusk:  { spd: .9,  sleep: .8, tired: .15 },   // 16–19
    night: { spd: .8,  sleep: .5, tired: .3 },    // 19–24
    late:  { spd: .6,  sleep: .3, tired: .45 }    // 00–06
  };
  function slotNow() { const h = new Date().getHours(); return h < 6 ? 'late' : h < 16 ? 'day' : h < 19 ? 'dusk' : 'night'; }

  /* 生日：名冊 BD 填 "MM-DD"；2/29 生日只在閏年當天慶祝 */
  const BD_POOL = ['🎈', '🎂', '🧁', '🍰', '🧧', '🎊', '🪅', '🥂', '🎉'];
  const BD_CLICK = ['🎂', '🧁', '🍰', '🎁'];
  function isBirthday(c) {
    if (!c.BD) return false;
    const [m, d] = String(c.BD).split(/[-/.]/).map(Number);
    const now = new Date();
    return now.getMonth() + 1 === m && now.getDate() === d;
  }

  const CSS = `
    .qpet{position:absolute;left:0;top:0;pointer-events:auto;cursor:grab;touch-action:none;will-change:transform;}
    .qpet.dragging{cursor:grabbing;}
    .qpet canvas{display:block;width:100%;height:100%;}
    .qfx{position:absolute;pointer-events:none;animation:qup 1.4s ease-out forwards;line-height:0;}
    .qfx.zzz{animation:qzzz 2.4s ease-out forwards;font:700 16px Georgia,serif;color:#9b6fbf;line-height:1;}
    @keyframes qup{0%{opacity:0;transform:translate(-50%,0) scale(.6)}20%{opacity:1;transform:translate(-50%,-10px) scale(1)}100%{opacity:0;transform:translate(-50%,-50px) scale(1)}}
    @keyframes qzzz{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(18px,-46px) scale(1.15)}}
    .qfx.emo{font-size:22px;line-height:1;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;}
    .qfx.drift{animation:qdrift 2.4s ease-out forwards;}
    @keyframes qdrift{0%{opacity:0;transform:translate(-50%,0) scale(.5) rotate(0)}15%{opacity:1;transform:translate(-50%,-8px) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),-70px) scale(.9) rotate(var(--rot,0deg))}}`;

  const SVG = {
    '愛心': '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#f07aa0" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6C12 6.1 13.6 5 15.6 5 19 5 21.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg>',
    '音符': '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#7aa7f0" d="M9 18.5a3 3 0 1 1-2-2.8V5l12-2v12.5a3 3 0 1 1-2-2.8V6.4l-8 1.4z"/></svg>',
    '驚嘆號': '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="10" y="3" width="4" height="12" rx="2" fill="#f0a23a"/><circle cx="12" cy="19.5" r="2.2" fill="#f0a23a"/></svg>',
    '閃光': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#f5c84a" d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/></svg>'
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = list => list[Math.floor(Math.random() * list.length)];

  class Pet {
    constructor(world, cfg, bitmaps, startX) {
      this.w0 = world; this.c = cfg; this.b = bitmaps;
      this.x = startX; this.y = 0; this.vy = 0; this.v = 0;
      this.dir = Math.random() < .5 ? 1 : -1;
      this.speed = SPEED[cfg.speed] || SPEED['中'];
      this.frameT = FRAME[cfg.speed] || FRAME['中'];
      this.t = 0; this.modeT = 0; this.phase = 0; this.meetCool = 0; this.fxT = 0;
      this.lastTouch = performance.now();
      this.el = document.createElement('div'); this.el.className = 'qpet';
      this.cv = document.createElement('canvas');
      this.ctx = this.cv.getContext('2d');
      this.el.appendChild(this.cv);
      world.stage.appendChild(this.el);
      this.resize();
      this.x = startX - this.w / 2;
      this.y = this.ground();
      this.bd = isBirthday(cfg);
      this.walkFxT = rand(6, 14); this.bdT = rand(1.5, 3);
      this.setMode('walk', rand(3, 6));
      const h = new Date().getHours();
      if (h >= 6 && h < 10) this.tiredAct('stretch');   // 早上第一次出現先伸懶腰
      this.bindInput();
    }
    /* 依視窗高度與玩家選擇的大小重新計算尺寸 */
    resize() {
      const cx = this.w ? this.x + this.w / 2 : null;
      const base = Math.min(SIZE_MAX, Math.max(SIZE_MIN, global.innerHeight * (SIZE_PCT[this.w0.size] || SIZE_PCT['中'])));
      this.h = Math.round(base * (this.c.size || SIZE_BASE) / SIZE_BASE);
      this.w = Math.round(this.h / ASPECT);
      this.el.style.width = this.w + 'px'; this.el.style.height = this.h + 'px';
      const dpr = global.devicePixelRatio || 1;
      this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
      const bmp = this.cur; this.cur = null; this.draw(bmp);
      if (cx !== null) this.x = Math.min(Math.max(0, cx - this.w / 2), Math.max(0, global.innerWidth - this.w));
      if (!['drag', 'fall'].includes(this.mode)) this.y = this.ground();
    }
    ground() { return global.innerHeight - this.h - 4; }
    has(s) { return this.b[s] && this.b[s].length; }
    draw(bmp) {
      if (!bmp || this.cur === bmp) return;
      this.cur = bmp;
      this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      this.ctx.drawImage(bmp, 0, 0, this.cv.width, this.cv.height);
    }
    showState(s) { this.draw(pick(this.has(s) ? this.b[s] : this.b.idle)); }
    setMode(m, dur, pose) {
      this.mode = m; this.modeT = 0; this.modeDur = dur || 0; this.pose = pose || '';
      if (m !== 'run') this.goal = null;
      if (m === 'pat') { this.v = 0; this.showState(this.has('heart') ? 'heart' : 'click'); return; }
      if (m === 'stand') { this.lookAt = Math.random() < .5 ? [.7, 1.4] : []; }
      if (!['walk', 'run', 'stand', 'look', 'meet'].includes(m)) this.v = 0;
      const still = { stand: 'idle', look: 'idle', meet: 'idle', fall: 'drag' };
      if (m === 'walk' || m === 'run') return;          // 走路圖於 update 逐格切換
      if (m === 'stand' && this.v > 3) return;           // 煞車中延續走路圖
      this.showState(still[m] || m);
    }
    touch() { this.lastTouch = performance.now(); }
    /* 打呵欠或伸懶腰：有圖就用圖，沒有就由程式做動作 */
    tiredAct(prefer) {
      const opts = ['yawn', 'stretch'].filter(n => this.has(n));
      const want = prefer && this.has(prefer) ? prefer : opts.length ? pick(opts) : null;
      if (want) this.setMode(want, rand(2.5, 4));
      else this.setMode('stand', 1.8, prefer || pick(['yawn', 'stretch']));
    }
    /* 被叫過來：小跑步到指定位置 */
    callTo(x) {
      this.wake(); this.touch();
      this.goal = Math.min(Math.max(0, x - this.w / 2), Math.max(0, global.innerWidth - this.w));
      this.dir = this.goal > this.x ? 1 : -1;
      this.setMode('run', 15);
      this.goal = Math.min(Math.max(0, x - this.w / 2), Math.max(0, global.innerWidth - this.w));
    }
    pat() {
      this.wake(); this.touch();
      this.setMode('pat', 1.8);
      const cx = this.x + this.w / 2;
      this.w0.fx('愛心', cx, this.y + 4);
      setTimeout(() => this.w0.fx('愛心', cx + 14, this.y + 12), 260);
    }
    wake() { if (this.mode === 'sleep') this.setMode('stand', 1); }
    bindInput() {
      let down = null;
      this.el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        this.el.setPointerCapture(e.pointerId);
        down = { x: e.clientX, y: e.clientY, moved: false };
      });
      let rub = [];
      this.el.addEventListener('pointermove', e => {
        if (!down) {   // 摸頭：滑鼠在頭部來回滑動三次
          if (e.pointerType !== 'mouse' || ['drag', 'fall', 'pat'].includes(this.mode)) return;
          const r = this.el.getBoundingClientRect();
          if (e.clientY - r.top > r.height * .42) { rub = []; return; }
          const now = performance.now();
          rub.push([now, e.clientX]); rub = rub.filter(a => now - a[0] < 900);
          let turns = 0;
          for (let i = 2; i < rub.length; i++) if ((rub[i - 1][1] - rub[i - 2][1]) * (rub[i][1] - rub[i - 1][1]) < 0) turns++;
          if (turns >= 3) { rub = []; this.pat(); }
          return;
        }
        if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
          down.moved = true; this.wake(); this.setMode('drag'); this.el.classList.add('dragging');
        }
        if (down.moved) { this.x = e.clientX - this.w / 2; this.y = e.clientY - this.h * .12; this.touch(); }
      });
      const up = e => {
        if (!down) return;
        e && e.stopPropagation();
        if (down.moved) { this.el.classList.remove('dragging'); this.vy = 0; this.setMode('fall'); }
        else this.onClick();
        down = null; this.touch();
      };
      this.el.addEventListener('pointerup', up);
      this.el.addEventListener('pointercancel', up);
      this.el.addEventListener('click', e => e.stopPropagation());
    }
    onClick() {
      this.wake(); this.touch();
      this.setMode('click', 1.2);
      this.w0.fx(this.bd ? [...BD_CLICK, ...(this.c.BD_fx || [])] : this.c.effect_click, this.x + this.w / 2, this.y + 4);
    }
    idleChoice() {
      const extras = (this.c.extras || []).filter(n => this.has(n));
      const rule = SLOT_RULE[this.w0.slot] || SLOT_RULE.day;
      if (Math.random() < rule.tired) return this.tiredAct();
      const r = Math.random();
      if (extras.length && r < .25) this.setMode(pick(extras), rand(4, 8));
      else if (r < .5) this.setMode('stand', rand(1.8, 4));
      else {
        if (Math.random() < .35) this.dir *= -1;
        if (Math.random() < .2) this.setMode('run', rand(1.5, 2.5));
        else this.setMode('walk', rand(3, 6));
      }
    }
    update(dt, other) {
      this.t += dt; this.modeT += dt; this.meetCool -= dt;
      const g = this.ground();
      let bob = 0, tilt = 0, sy = 1;
      const m = this.mode;

      // 起步與煞車
      if (['walk', 'run', 'stand', 'look', 'meet'].includes(m)) {
        const spd = this.speed * (SLOT_RULE[this.w0.slot] || SLOT_RULE.day).spd;
        const target = m === 'walk' ? spd : m === 'run' ? (this.goal != null ? this.speed : spd) * RUN_MULT : 0;
        const d = target - this.v;
        this.v += Math.sign(d) * Math.min(Math.abs(d), ACCEL * (m === 'run' ? 1.6 : 1) * dt);
        this.x += this.dir * this.v * dt;
        if (this.x < 0) { this.x = 0; this.dir = 1; }
        if (this.x > global.innerWidth - this.w) { this.x = global.innerWidth - this.w; this.dir = -1; }
      }
      const moving = this.v > 3;

      if (moving && ['walk', 'run', 'stand', 'look', 'meet'].includes(m)) {
        if (this.has('walk')) {
          this.phase += dt / this.frameT * Math.min(this.v / this.speed, 1.7);
          this.draw(this.b.walk[Math.floor(this.phase) % this.b.walk.length]);
          if (m === 'run') bob = -Math.abs(Math.sin(this.phase * Math.PI)) * 3;
        } else {
          this.phase += dt * 9 * (this.v / this.speed);
          this.draw(this.b.idle[0]);
          bob = -Math.abs(Math.sin(this.phase)) * (m === 'run' ? 7 : 5);
          tilt = Math.sin(this.phase) * 2;
        }
      } else if (['stand', 'look', 'meet'].includes(m)) {
        this.draw(this.b.idle[0]);
        sy = 1 + Math.sin(this.t * 2.2) * .012;
      }

      switch (m) {
        case 'walk': case 'run':
          if (this.goal != null && Math.abs(this.x - this.goal) < 8) { this.setMode('stand', rand(1.4, 2.4)); this.w0.fx('音符', this.x + this.w / 2, this.y + 4); break; }
          if (this.goal != null) this.dir = this.goal > this.x ? 1 : -1;
          if (this.modeT > this.modeDur) this.setMode('stand', rand(1.8, 4));
          break;
        case 'pat':
          sy = 1 - .05 * Math.abs(Math.sin(this.t * 8));
          if (this.modeT > this.modeDur) this.setMode('stand', rand(1, 2));
          break;
        case 'stand':
          if (this.pose === 'stretch' && !moving) sy = 1 + Math.sin(Math.min(this.modeT / 1.6, 1) * Math.PI) * .1;
          if (this.pose === 'yawn' && !moving) tilt = -4 * Math.sin(Math.min(this.modeT / 1.6, 1) * Math.PI);
          if (this.lookAt.length && !moving && this.modeT > this.lookAt[0]) { this.dir *= -1; this.lookAt.shift(); }
          if (this.modeT > this.modeDur && !moving) this.idleChoice();
          break;
        case 'click':
          bob = -Math.sin(Math.min(this.modeT / (this.has('click') ? .35 : .4), 1) * Math.PI) * (this.has('click') ? 8 : 18);
          if (this.modeT > this.modeDur) this.setMode('walk', rand(3, 6));
          break;
        case 'drag':
          tilt = Math.sin(this.t * 6) * (this.has('drag') ? 3 : 8);
          break;
        case 'fall':
          this.vy += GRAVITY * dt; this.y += this.vy * dt;
          if (this.y >= g) { this.y = g; this.vy = 0; this.setMode('stand', rand(1, 2)); }
          break;
        case 'sleep':
          sy = 1 + Math.sin(this.t * 1.4) * .015;
          if (!this.has('sleep')) tilt = 6;
          this.fxT -= dt;
          if (this.fxT <= 0 && this.c.effect_sleep !== '無') { this.fxT = 1.1; this.w0.fx('zzz', this.x + this.w * .68, this.y + this.h * .12); }
          break;
        case 'meet':
          if (other) this.dir = other.x > this.x ? 1 : -1;
          if (this.modeT > this.modeDur) {
            this.meetCool = 12;
            const away = other ? (other.x > this.x ? -1 : 1) : this.dir;
            this.setMode('walk', rand(3, 5)); this.dir = away;
          }
          break;
        case 'look':
          if (other) this.dir = other.x > this.x ? 1 : -1;
          if (!other || (other.mode !== 'drag' && other.mode !== 'fall')) this.setMode('stand', 1.5);
          break;
        default:   // 擴充動作
          if (this.modeT > this.modeDur) this.setMode('walk', rand(3, 6));
      }

      if (!['drag', 'fall'].includes(this.mode)) this.y = g;

      // 散步時偶爾飄出角色專屬 emoji
      const cx = this.x + this.w / 2;
      if (moving && this.c.walk_fx && this.c.walk_fx.length && (this.mode === 'walk' || this.mode === 'run')) {
        this.walkFxT -= dt;
        if (this.walkFxT <= 0) { this.walkFxT = rand(10, 20); this.w0.fx(this.c.walk_fx, cx + rand(-10, 10), this.y + this.h * .08, true); }
      }
      // 生日當天：散步與站著時飄出慶生 emoji
      if (this.bd && ['walk', 'run', 'stand'].includes(this.mode)) {
        this.bdT -= dt;
        if (this.bdT <= 0) {
          this.bdT = rand(2.5, 4.5);
          const pool = [...BD_POOL, ...(this.c.BD_fx || [])];
          this.w0.fx(pool, cx + rand(-this.w * .4, this.w * .4), this.y + this.h * .1, true);
          if (Math.random() < .5) setTimeout(() => this.w0.fx(pool, cx + rand(-this.w * .4, this.w * .4), this.y + this.h * .2, true), 300);
        }
      }

      const sleepAfter = this.c.sleep_after * (SLOT_RULE[this.w0.slot] || SLOT_RULE.day).sleep;
      if ((performance.now() - this.lastTouch) / 1000 > sleepAfter && ['walk', 'stand'].includes(this.mode)) {
        this.setMode('sleep'); this.fxT = .4;
      }
      const flip = (this.dir === 1) === IMAGE_FACES_RIGHT ? 1 : -1;
      this.el.style.transformOrigin = this.mode === 'drag' ? '50% 12%' : '50% 100%';
      this.el.style.transform = `translate(${this.x}px,${this.y + bob}px) rotate(${tilt}deg) scale(${flip},${sy})`;
      this.el.style.zIndex = this.mode === 'drag' ? 10 : 1;
    }
    destroy() { this.el.remove(); }
  }

  class World {
    constructor(stage, opts = {}) {
      this.stage = stage; this.pets = []; this.raf = 0; this.last = 0; this.size = '中';
      this.slot = slotNow(); this.slotT = 0;
      this.max = opts.max || 2;                         // 同時出現上限：網頁版與擴充功能皆為 4
      const root = stage.getRootNode();
      const style = document.createElement('style'); style.textContent = CSS;
      (root === document ? document.head : root).appendChild(style);
      this.loop = this.loop.bind(this);
      this.onResize = () => this.pets.forEach(p => p.resize());
      global.addEventListener('resize', this.onResize);
    }
    setSize(mode) {
      this.size = SIZE_PCT[mode] ? mode : '中';
      this.pets.forEach(p => p.resize());
    }
    /* 特效：kind 可為 '愛心'｜'音符'｜'驚嘆號'｜'閃光'｜'zzz'｜任意 emoji｜上述的陣列（隨機取一個） */
    fx(kind, x, y, drift) {
      if (Array.isArray(kind)) kind = kind.length ? pick(kind) : null;
      if (!kind || kind === '無') return;
      kind = String(kind);
      const el = document.createElement('div');
      if (kind === 'zzz') { el.className = 'qfx zzz'; el.textContent = 'z'; el.style.fontSize = (12 + Math.random() * 8) + 'px'; }
      else if (SVG[kind]) { el.className = 'qfx'; el.innerHTML = SVG[kind]; }
      else { el.className = 'qfx emo'; el.textContent = kind; }
      if (drift) { el.classList.add('drift'); el.style.setProperty('--dx', rand(-24, 24) + 'px'); el.style.setProperty('--rot', rand(-30, 30) + 'deg'); }
      el.style.left = x + 'px'; el.style.top = y + 'px';
      this.stage.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
    set(list) {
      this.clear();
      list.filter(p => p.bitmaps.idle && p.bitmaps.idle.length).slice(0, this.max).forEach((p, i, arr) => {
        const slot = global.innerWidth / (arr.length + 1) * (i + 1);
        this.pets.push(new Pet(this, p.cfg, p.bitmaps, slot));
      });
      if (this.pets.length) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }
    }
    clear() { cancelAnimationFrame(this.raf); this.pets.splice(0).forEach(p => p.destroy()); }
    /* 叫過來：離 clientX 最近、沒被拖著的角色小跑步過去 */
    callTo(clientX) {
      const ps = this.pets.filter(p => !['drag', 'fall'].includes(p.mode));
      if (!ps.length) return false;
      const p = ps.reduce((a, b) => Math.abs(a.x + a.w / 2 - clientX) <= Math.abs(b.x + b.w / 2 - clientX) ? a : b);
      p.callTo(clientX);
      return true;
    }
    loop(now) {
      const dt = Math.min((now - this.last) / 1000, .05); this.last = now;
      this.slotT -= dt;
      if (this.slotT <= 0) {   // 每 30 秒確認一次時段，換時段時讓大家打個呵欠或伸懶腰
        this.slotT = 30;
        const s = slotNow();
        if (s !== this.slot) { this.slot = s; this.pets.forEach(p => { if (['walk', 'stand'].includes(p.mode)) p.tiredAct(); }); }
      }
      const ps = this.pets;
      ps.forEach(p => p.update(dt, p.target));
      // 拖曳：拖起其中一隻時，其他所有角色轉頭看牠
      ps.forEach(p => {
        if (p.mode !== 'drag') return;
        ps.forEach(q => { if (q !== p && ['walk', 'run', 'stand', 'meet'].includes(q.mode)) { q.target = p; q.setMode('look'); } });
      });
      // 相遇：任兩隻走到一起即觸發
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) this.interact(ps[i], ps[j]);
      this.raf = requestAnimationFrame(this.loop);
    }
    interact(a, b) {
      const close = Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)) < (a.w + b.w) * .45;
      const walking = p => p.mode === 'walk' || p.mode === 'run';
      if (close && walking(a) && walking(b) && a.meetCool <= 0 && b.meetCool <= 0) {
        const dur = rand(2.5, 4);
        a.target = b; b.target = a;
        a.setMode('meet', dur); b.setMode('meet', dur); a.touch(); b.touch();
        const mx = (a.x + a.w / 2 + b.x + b.w / 2) / 2, my = Math.min(a.y, b.y) + 10;
        this.fx('閃光', mx, my);
        setTimeout(() => this.fx('閃光', mx + 14, my + 18), 350);
      }
    }
  }

  /* 名冊預設值與狀態清單，供網頁版與擴充功能讀取名冊時使用 */
  const DEFAULTS = { size: 120, speed: '中', sleep_after: 60, effect_click: '愛心', effect_sleep: 'zzz', images: ['idle'], extras: [] };
  function normalize(r) {
    const c = { ...DEFAULTS, ...r };
    c.extras = c.extras || [];
    c.group = c.group || '其他';
    if (c.BD != null) c.BD = String(c.BD);
    ['BD_fx', 'walk_fx'].forEach(k => { if (c[k] != null && !Array.isArray(c[k])) c[k] = [c[k]]; });
    c.states = [...new Set([...CORE, ...(c.images || []), ...c.extras])];
    return c;
  }
  function variantNames(state, max = 5) {
    return [state, ...Array.from({ length: max }, (_, k) => `${state}_${k + 1}`)];
  }

  /* 讀取名冊與圖片清單 files.json，回傳可用角色；base：網頁版 ''，擴充功能填完整網址
     清單裡沒有的角色才逐一確認圖片是否存在 */
  async function loadRoster(base) {
    const [text, manifest] = await Promise.all([
      fetch(base + 'roster.yaml', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('roster ' + r.status); return r.text(); }),
      fetch(base + 'files.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).catch(() => null)
    ]);
    const raw = global.jsyaml.load(text) || [];
    const exists = url => fetch(url, { method: 'HEAD', cache: 'no-cache' }).then(r => r.ok).catch(() => false);
    const list = [];
    for (const r of raw) {
      const c = normalize(r); c.sets = {};
      const files = manifest && manifest[c.id];
      for (const s of c.states) {
        const urls = variantNames(s).map(n => `${base}pets/${c.id}/${n}.png`);
        if (files) c.sets[s] = urls.filter(u => files.includes(u.slice(u.lastIndexOf('/') + 1)));
        else { const ok = await Promise.all(urls.map(exists)); c.sets[s] = urls.filter((_, i) => ok[i]); }
      }
      c.thumb = c.sets.idle[0];
      if (c.sets.idle.length) list.push(c);
    }
    return list;
  }

  global.QPet = { World, normalize, variantNames, loadRoster, SIZES: Object.keys(SIZE_PCT) };
})(typeof window !== 'undefined' ? window : globalThis);
