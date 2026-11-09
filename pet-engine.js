/* Q版桌寵引擎 v0.3｜網頁版與擴充功能共用
   用法：const world = new QPet.World(stageElement);
         world.set([{ cfg, bitmaps }, ...]);   // bitmaps = { 狀態: [ImageBitmap, ...] } */
(function (global) {
  const SPEED = { '慢': 28, '中': 45, '快': 70 };          // 走路速度 px/秒
  const FRAME = { '慢': 0.18, '中': 0.15, '快': 0.12 };     // 走路每格秒數
  const RUN_MULT = 2.2;                                     // 小跑步速度倍率
  const ACCEL = 120;                                        // 起步與煞車加速度 px/秒²
  const IMAGE_FACES_RIGHT = true;                           // 圖片中角色預設面向右
  const ASPECT = 600 / 450;                                 // 畫布比例（高/寬）
  const GRAVITY = 2200;
  const CORE = ['idle', 'sleep', 'click', 'drag', 'walk'];

  const CSS = `
    .qpet{position:absolute;left:0;top:0;pointer-events:auto;cursor:grab;touch-action:none;will-change:transform;}
    .qpet.dragging{cursor:grabbing;}
    .qpet canvas{display:block;width:100%;height:100%;}
    .qfx{position:absolute;pointer-events:none;animation:qup 1.4s ease-out forwards;line-height:0;}
    .qfx.zzz{animation:qzzz 2.4s ease-out forwards;font:700 16px Georgia,serif;color:#9b6fbf;line-height:1;}
    @keyframes qup{0%{opacity:0;transform:translate(-50%,0) scale(.6)}20%{opacity:1;transform:translate(-50%,-10px) scale(1)}100%{opacity:0;transform:translate(-50%,-50px) scale(1)}}
    @keyframes qzzz{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(18px,-46px) scale(1.15)}}`;

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
      this.h = cfg.size; this.w = cfg.size / ASPECT;
      this.x = startX; this.y = 0; this.vy = 0; this.v = 0;
      this.dir = Math.random() < .5 ? 1 : -1;
      this.speed = SPEED[cfg.speed] || SPEED['中'];
      this.frameT = FRAME[cfg.speed] || FRAME['中'];
      this.t = 0; this.modeT = 0; this.phase = 0; this.meetCool = 0; this.fxT = 0;
      this.lastTouch = performance.now();
      this.el = document.createElement('div'); this.el.className = 'qpet';
      this.el.style.width = this.w + 'px'; this.el.style.height = this.h + 'px';
      this.cv = document.createElement('canvas');
      const dpr = global.devicePixelRatio || 1;
      this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
      this.ctx = this.cv.getContext('2d');
      this.el.appendChild(this.cv);
      world.stage.appendChild(this.el);
      this.y = this.ground();
      this.setMode('walk', rand(3, 6));
      this.bindInput();
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
    setMode(m, dur) {
      this.mode = m; this.modeT = 0; this.modeDur = dur || 0;
      if (m === 'stand') { this.lookAt = Math.random() < .5 ? [.7, 1.4] : []; }
      if (!['walk', 'run', 'stand', 'look', 'meet'].includes(m)) this.v = 0;
      const still = { stand: 'idle', look: 'idle', meet: 'idle', fall: 'drag' };
      if (m === 'walk' || m === 'run') return;          // 走路圖於 update 逐格切換
      if (m === 'stand' && this.v > 3) return;           // 煞車中延續走路圖
      this.showState(still[m] || m);
    }
    touch() { this.lastTouch = performance.now(); }
    wake() { if (this.mode === 'sleep') this.setMode('stand', 1); }
    bindInput() {
      let down = null;
      this.el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        this.el.setPointerCapture(e.pointerId);
        down = { x: e.clientX, y: e.clientY, moved: false };
      });
      this.el.addEventListener('pointermove', e => {
        if (!down) return;
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
      this.w0.fx(this.c.effect_click, this.x + this.w / 2, this.y + 4);
    }
    idleChoice() {
      const extras = (this.c.extras || []).filter(n => this.has(n));
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
        const target = m === 'walk' ? this.speed : m === 'run' ? this.speed * RUN_MULT : 0;
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
          if (this.modeT > this.modeDur) this.setMode('stand', rand(1.8, 4));
          break;
        case 'stand':
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
      if ((performance.now() - this.lastTouch) / 1000 > this.c.sleep_after && ['walk', 'stand'].includes(this.mode)) {
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
    constructor(stage) {
      this.stage = stage; this.pets = []; this.raf = 0; this.last = 0;
      const root = stage.getRootNode();
      const style = document.createElement('style'); style.textContent = CSS;
      (root === document ? document.head : root).appendChild(style);
      this.loop = this.loop.bind(this);
      this.onResize = () => this.pets.forEach(p => { if (p.x > global.innerWidth - p.w) p.x = Math.max(0, global.innerWidth - p.w); });
      global.addEventListener('resize', this.onResize);
    }
    fx(kind, x, y) {
      if (!kind || kind === '無') return;
      const el = document.createElement('div');
      if (kind === 'zzz') { el.className = 'qfx zzz'; el.textContent = 'z'; el.style.fontSize = (12 + Math.random() * 8) + 'px'; }
      else { if (!SVG[kind]) return; el.className = 'qfx'; el.innerHTML = SVG[kind]; }
      el.style.left = x + 'px'; el.style.top = y + 'px';
      this.stage.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
    set(list) {
      this.clear();
      list.filter(p => p.bitmaps.idle && p.bitmaps.idle.length).slice(0, 2).forEach((p, i, arr) => {
        const slot = global.innerWidth / (arr.length + 1) * (i + 1);
        this.pets.push(new Pet(this, p.cfg, p.bitmaps, slot - (p.cfg.size / ASPECT) / 2));
      });
      if (this.pets.length) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }
    }
    clear() { cancelAnimationFrame(this.raf); this.pets.splice(0).forEach(p => p.destroy()); }
    loop(now) {
      const dt = Math.min((now - this.last) / 1000, .05); this.last = now;
      const ps = this.pets;
      ps.forEach((p, i) => p.update(dt, ps[1 - i]));
      if (ps.length === 2) this.interact(ps[0], ps[1]);
      this.raf = requestAnimationFrame(this.loop);
    }
    interact(a, b) {
      for (const [p, q] of [[a, b], [b, a]]) {
        if (p.mode === 'drag' && ['walk', 'run', 'stand', 'meet'].includes(q.mode)) q.setMode('look');
      }
      const close = Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)) < (a.w + b.w) * .45;
      const walking = p => p.mode === 'walk' || p.mode === 'run';
      if (close && walking(a) && walking(b) && a.meetCool <= 0 && b.meetCool <= 0) {
        const dur = rand(2.5, 4);
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
    c.states = [...new Set([...CORE, ...(c.images || []), ...c.extras])];
    return c;
  }
  function variantNames(state, max = 5) {
    return [state, ...Array.from({ length: max }, (_, k) => `${state}_${k + 1}`)];
  }

  global.QPet = { World, normalize, variantNames };
})(typeof window !== 'undefined' ? window : globalThis);
