/*
 * Violet Hour 紫夜星光｜Q版桌寵
 * © 2026 mcx_purple. All rights reserved.
 * 保留所有權利，未經同意請勿複製、修改或用於其他專案。
 * https://www.threads.com/@mcx_purple
 */
/* Q版桌寵引擎 v1.0｜網頁版與擴充功能共用
   用法：const world = new QPet.World(stageElement, { max });
         world.set([{ cfg, bitmaps }, ...]);   // bitmaps = { 狀態: [ImageBitmap, ...] }
         world.setSize('小' | '中' | '大');     // 玩家選擇的角色大小，立即生效
         world.setPetScale(id, .85 | 1 | 1.15); // 個別角色大小，立即生效
         world.setPetScales({ id: 倍率 });       // 一次套用全部個別大小，不觸發儲存（擴充功能同步用）
         world.startle();                       // 被捲動嚇到（擴充功能偵測快速捲動後呼叫）
   選項：opts.petScales 初始個別大小、opts.saveScales(map) 自訂儲存；未提供時使用 localStorage pet_size_each
         world.callTo(clientX);                // 叫最近的角色小跑步過來
   選項：opts.once(key) → Promise<boolean>，同一 key 第一次呼叫回傳 true（吃飯提醒一天一次用；預設存在 localStorage） */
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
    .qfx.hold{animation:qhold 3s ease-out forwards;}
    @keyframes qhold{0%{opacity:0;transform:translate(-50%,0) scale(.5)}12%{opacity:1;transform:translate(-50%,-14px) scale(1.1)}20%{transform:translate(-50%,-12px) scale(1)}85%{opacity:1;transform:translate(-50%,-16px) scale(1)}100%{opacity:0;transform:translate(-50%,-24px) scale(1)}}
    .qfx.dizzy{animation:none;line-height:1;transform:translate(-50%,-6px) scaleY(.45);}
    .qfx.dizzy .ring{position:relative;width:44px;height:44px;animation:qspin .7s linear infinite;}
    .qfx.dizzy i{position:absolute;left:50%;top:50%;margin:-8px 0 0 -6px;font:700 15px/1 sans-serif;font-style:normal;color:#f5c84a;}
    .qfx.dizzy i:nth-child(1){transform:translate(0,-19px)} .qfx.dizzy i:nth-child(2){transform:translate(17px,10px)} .qfx.dizzy i:nth-child(3){transform:translate(-17px,10px)}
    @keyframes qspin{to{transform:rotate(360deg)}}
    @keyframes qdrift{0%{opacity:0;transform:translate(-50%,0) scale(.5) rotate(0)}15%{opacity:1;transform:translate(-50%,-8px) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),-70px) scale(.9) rotate(var(--rot,0deg))}}`;

  const SVG = {
    '愛心': '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#f07aa0" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6C12 6.1 13.6 5 15.6 5 19 5 21.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg>',
    '音符': '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#7aa7f0" d="M9 18.5a3 3 0 1 1-2-2.8V5l12-2v12.5a3 3 0 1 1-2-2.8V6.4l-8 1.4z"/></svg>',
    '驚嘆號': '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="10" y="3" width="4" height="12" rx="2" fill="#f0a23a"/><circle cx="12" cy="19.5" r="2.2" fill="#f0a23a"/></svg>',
    '閃光': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#f5c84a" d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/></svg>'
  };

  const MOVERS = ['walk', 'run', 'stand', 'look', 'meet', 'follow'];   // 會移動的模式
  /* 同作品才會一起睡、跟著走；單人角之間視為不同作品 */
  const sameGroup = (a, b) => a.c.group === b.c.group && a.c.group !== '單人角';

  /* 吃飯時間：12 點與 18 點這一小時內提醒一次，之後比較常吃東西 */
  const MEAL_HOURS = [12, 18];
  const MEAL_FX = ['🍙', '🍱', '🍜', '🍚', '🥢'];

  /* 節日：所有角色飄節慶 emoji；農曆日期已換算至 2040 年 */
  const LUNAR_NY = { 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03', 2031: '01-23', 2032: '02-11', 2033: '01-31',
    2034: '02-19', 2035: '02-08', 2036: '01-28', 2037: '02-15', 2038: '02-04', 2039: '01-24', 2040: '02-12' };
  const MID_AUTUMN = { 2026: '09-25', 2027: '09-15', 2028: '10-03', 2029: '09-22', 2030: '09-12', 2031: '10-01', 2032: '09-19', 2033: '09-08',
    2034: '09-27', 2035: '09-16', 2036: '10-04', 2037: '09-24', 2038: '09-13', 2039: '10-02', 2040: '09-20' };
  const FEST_FX = {
    xmas: ['🎄', '🎁', '⛄', '🔔', '🦌'],
    newyear: ['🎆', '🎇', '🥂', '🎉'],
    lunar: ['🧧', '🧨', '🏮', '🍊', '🥟'],
    moon: ['🥮', '🌕', '🐇', '🏮']
  };
  function festNow() {
    const d = new Date(), y = d.getFullYear(), md = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (md === '12-24' || md === '12-25') return FEST_FX.xmas;
    if (md === '12-31' || md === '01-01') return FEST_FX.newyear;
    if (LUNAR_NY[y]) {   // 除夕到初三
      const [m, dd] = LUNAR_NY[y].split('-').map(Number), ny = new Date(y, m - 1, dd), diff = Math.round((new Date(y, d.getMonth(), d.getDate()) - ny) / 864e5);
      if (diff >= -1 && diff <= 2) return FEST_FX.lunar;
    }
    if (MID_AUTUMN[y] === md) return FEST_FX.moon;
    return null;
  }

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
      this.vx = 0; this.peekCool = rand(8, 20); this.edgeOK = false; this.goal = null; this.lead = null; this.next = null;
      this.mouseLookReadyAt = 0;  // 偷看滑鼠：每隻角色獨立冷卻（毫秒時間戳）
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
      // 全域大小 × 名冊 size × 個別倍率，最終仍受 100–240px 上下限保護。
      const height = global.innerHeight * (SIZE_PCT[this.w0.size] || SIZE_PCT['中']) *
        (this.c.size || SIZE_BASE) / SIZE_BASE * this.w0.getPetScale(this.c.id);
      this.h = Math.round(Math.min(SIZE_MAX, Math.max(SIZE_MIN, height)));
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
      this.goal = null; this.arrive = null; this.next = null;
      if (m !== 'follow') this.lead = null;
      if (m === 'pat') { this.v = 0; this.showState(this.has('heart') ? 'heart' : 'click'); return; }
      if (m === 'stand') { this.lookAt = !this.pose && Math.random() < .5 ? [.7, 1.4] : []; }
      if (!MOVERS.includes(m)) this.v = 0;
      const still = { stand: 'idle', look: 'idle', meet: 'idle', follow: 'idle', fall: 'drag', trip: 'idle' };
      if (m === 'walk' || m === 'run') return;          // 走路圖於 update 逐格切換
      if (['stand', 'follow', 'look'].includes(m) && this.v > 3) return;   // 煞車中延續走路圖
      this.showState(still[m] || m);
    }
    /* 走到 x 後執行 arrive；沒有 arrive 則停下 */
    goTo(x, mode, arrive) {
      const lo = this.edgeOK ? -this.w : 0, hi = this.edgeOK ? global.innerWidth : Math.max(0, global.innerWidth - this.w);
      this.setMode(mode, 60);
      this.goal = Math.min(Math.max(lo, x), hi); this.arrive = arrive || null;
      this.dir = this.goal > this.x ? 1 : -1;
    }
    /* 動作結束時若有排定的下一步就執行，回傳是否已處理 */
    done() { if (!this.next) return false; const f = this.next; this.next = null; f(); return true; }
    touch() { this.lastTouch = performance.now(); }
    cx() { return this.x + this.w / 2; }
    free() { return ['walk', 'stand'].includes(this.mode) && !this.goal && !this.edgeOK; }
    /* 打呵欠或伸懶腰：有圖就用圖，沒有就由程式做動作；spread 為 true 時附近角色可能跟著打呵欠 */
    tiredAct(prefer, spread = true) {
      const opts = ['yawn', 'stretch'].filter(n => this.has(n));
      const want = prefer && this.has(prefer) ? prefer : !prefer && opts.length ? pick(opts) : null;
      const kind = want || prefer || pick(['yawn', 'stretch']);
      if (want) this.setMode(want, rand(2.5, 4));
      else this.setMode('stand', 1.8, kind);
      if (spread && kind === 'yawn') this.w0.contagion(this);
    }
    /* 被叫過來：小跑步到指定位置 */
    callTo(x) {
      this.wake(); this.touch(); this.edgeOK = false;
      this.goTo(x - this.w / 2, 'run', () => { this.setMode('stand', rand(1.4, 2.4)); this.w0.fx('音符', this.cx(), this.y + 4); });
    }
    pat() {
      this.wake(); this.touch();
      this.setMode('pat', 1.8);
      const cx = this.cx();
      this.w0.fx('愛心', cx, this.y + 4);
      setTimeout(() => this.w0.fx('愛心', cx + 14, this.y + 12), 260);
    }
    wake() { if (this.mode === 'sleep') this.setMode('stand', 1); }
    sleepNow(chain = true) {
      this.setMode('sleep'); this.fxT = .4;
      if (chain) this.w0.onSleep(this);
    }
    /* 睡醒迷糊：恍神晃一下，再伸懶腰或打呵欠 */
    rouse() {
      this.touch();
      this.setMode('stand', 2, 'groggy');
      this.next = () => this.tiredAct(pick(['stretch', 'yawn']), false);
    }
    /* 突然想起事情：停下、冒驚嘆號，轉身小跑 */
    remember() {
      this.setMode('stand', .8, 'startle');
      this.w0.fx('驚嘆號', this.cx(), this.y + 4);
      this.next = () => { this.dir *= -1; this.setMode('run', rand(1.6, 2.6)); };
    }
    /* 被捲動嚇到：定住彈一下、冒驚嘆號，接著小跑幾步或左右張望；每隻冷卻 20–40 秒 */
    startle() {
      const now = performance.now();
      if (now < (this.startleReadyAt || 0)) return;
      if (!['walk', 'stand', 'run', 'look', 'follow', 'meet'].includes(this.mode) || this.goal != null || this.edgeOK) return;
      this.startleReadyAt = now + rand(20000, 40000);
      this.touch();
      this.setMode('stand', .7, 'startle');
      if (this.has('click')) this.showState('click');
      this.w0.fx('驚嘆號', this.cx(), this.y + 4);
      this.next = Math.random() < .5
        ? () => { this.dir = Math.random() < .5 ? 1 : -1; this.setMode('run', rand(.8, 1.4)); }
        : () => { this.setMode('stand', 1.8, 'look'); this.lookAt = [.45, 1.05]; };
    }
    /* 小跑跌倒 */
    trip() {
      this.setMode('trip', 1.6);
      setTimeout(() => this.w0.fx('💨', this.cx() - this.dir * this.w * .3, this.y + this.h * .82), 180);
    }
    /* 邊邊探頭：走出畫面一半，停一下再轉身探頭回來 */
    peek(side) {
      this.edgeOK = true; this.peekCool = 40;
      const out = side < 0 ? -this.w * .55 : global.innerWidth - this.w * .45;
      this.goTo(out, 'walk', () => {
        this.setMode('stand', rand(1, 1.8), 'hide');
        this.next = () => {
          this.dir = -side;
          this.setMode('stand', 1.6, 'peek');
          this.next = () => { this.edgeOK = false; this.setMode('walk', rand(3, 5)); };
        };
      });
    }
    /* 跟在 lead 後面走 */
    follow(lead, dur) { this.setMode('follow', dur); this.lead = lead; }
    /* 吃東西：有 eat／drink 圖就用圖，沒有就由程式做捧碗吃的動作 */
    munch(dur) {
      const opts = ['eat', 'drink'].filter(n => this.has(n));
      if (opts.length) this.setMode(pick(opts), dur || rand(4, 6));
      else this.setMode('stand', dur || 3.2, 'munch');
    }
    bindInput() {
      let down = null;
      this.el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        this.el.setPointerCapture(e.pointerId);
        down = { x: e.clientX, y: e.clientY, moved: false, trail: [], turns: [], lastSign: 0 };
      });
      let rub = [];
      this.el.addEventListener('pointermove', e => {
        if (!down) {   // 摸頭：滑鼠在頭部來回滑動三次
          if (e.pointerType !== 'mouse' || ['drag', 'fall', 'pat', 'trip'].includes(this.mode)) return;
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
          down.moved = true; this.wake(); this.edgeOK = false; this.setMode('drag'); this.el.classList.add('dragging');
        }
        if (down.moved) {
          this.x = e.clientX - this.w / 2; this.y = e.clientY - this.h * .12; this.touch();
          const now = performance.now();
          down.trail.push([now, e.clientX, e.clientY]); down.trail = down.trail.filter(a => now - a[0] < 100);
          // 搖晃偵測：快速左右甩動的折返次數
          const tr = down.trail;
          if (tr.length > 1) {
            const vx = (tr[tr.length - 1][1] - tr[tr.length - 2][1]);
            const s = Math.abs(vx) > 6 ? Math.sign(vx) : 0;
            if (s && down.lastSign && s !== down.lastSign) down.turns.push(now);
            if (s) down.lastSign = s;
            down.turns = down.turns.filter(t => now - t < 1400);
          }
        }
      });
      const up = e => {
        if (!down) return;
        e && e.stopPropagation();
        if (down.moved) {
          this.el.classList.remove('dragging');
          const tr = down.trail, a = tr[0], b = tr[tr.length - 1];
          const dt = a && b && b[0] > a[0] ? (b[0] - a[0]) / 1000 : 0;
          const vx = dt ? (b[1] - a[1]) / dt : 0, vy = dt ? (b[2] - a[2]) / dt : 0;
          this.throwIt(Math.max(-1600, Math.min(1600, vx)), Math.max(-1600, Math.min(1400, vy)), down.turns.length >= 5);
        } else this.onClick();
        down = null; this.touch();
      };
      this.el.addEventListener('pointerup', up);
      this.el.addEventListener('pointercancel', up);
      this.el.addEventListener('click', e => e.stopPropagation());
    }
    /* 放手：依甩動速度飛出去；dizzy 為 true 時落地後頭暈 */
    throwIt(vx, vy, dizzy) {
      this.setMode('fall');
      this.vx = Math.abs(vx) > 120 ? vx : 0; this.vy = vy; this.bounces = 0; this.bonked = false;
      this.hard = Math.hypot(vx, vy) > 900; this.dizzy = dizzy;
      if (this.vx) this.dir = Math.sign(this.vx);
    }
    land() {
      this.vx = 0; this.vy = 0;
      if (this.dizzy) {
        this.setMode('stand', 2.6, 'dizzy');
        this.w0.fx('暈', this.cx(), this.y + this.h * .02);
      } else if (this.hard || this.bounces) this.setMode('stand', 1.4, 'groggy');
      else this.setMode('stand', rand(1, 2));
    }
    onClick() {
      if (this.mode === 'sleep') return this.rouse();
      this.touch();
      this.setMode('click', 1.2);
      this.w0.fx(this.bd ? [...BD_CLICK, ...(this.c.BD_fx || [])] : this.c.effect_click, this.cx(), this.y + 4);
    }
    idleChoice() {
      const extras = (this.c.extras || []).filter(n => this.has(n));
      const w = this.w0, rule = SLOT_RULE[w.slot] || SLOT_RULE.day;
      if (Math.random() < rule.tired) return this.tiredAct();
      if (w.mealTime() && Math.random() < .3) {   // 吃飯時間比較常吃東西
        if (!['eat', 'drink'].some(n => this.has(n))) w.fx(MEAL_FX, this.cx(), this.y + this.h * .1, true);
        return this.munch();
      }
      if (Math.random() < .05) return this.remember();
      if (Math.random() < .1) {   // 同作品的角色偶爾跟著走
        const lead = w.pets.find(p => p !== this && sameGroup(p, this) && ['walk', 'run'].includes(p.mode) && !p.goal);
        if (lead) return this.follow(lead, rand(10, 16));
      }
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
      this.t += dt; this.modeT += dt; this.meetCool -= dt; this.peekCool -= dt;
      const g = this.ground(), W = global.innerWidth;
      let bob = 0, tilt = 0, sy = 1;
      const m = this.mode;
      const rule = SLOT_RULE[this.w0.slot] || SLOT_RULE.day;
      const spd = this.speed * rule.spd;

      // 起步與煞車
      if (MOVERS.includes(m)) {
        const base = this.goal != null ? this.speed : spd;   // 有目的地時不受時段減速
        let target = m === 'walk' ? base : m === 'run' ? base * RUN_MULT : 0;
        if (m === 'follow' && this.lead) {
          const L = this.lead, want = L.x - L.dir * L.w * .8, dx = want - this.x;
          if (Math.abs(dx) > 14) { this.dir = Math.sign(dx); target = Math.min(spd * 1.5, Math.abs(dx) * 1.5); }
          else if (this.v < 4) this.dir = L.dir;
        }
        if (m === 'look' && this.gawk && other) {   // 圍觀：走到被拖起的角色旁邊
          const dx = other.cx() - this.cx(), stop = (other.w + this.w) * .6;
          if (Math.abs(dx) > stop) { this.dir = Math.sign(dx); target = spd * 1.2; }
        }
        const d = target - this.v;
        this.v += Math.sign(d) * Math.min(Math.abs(d), ACCEL * (m === 'run' ? 1.6 : 1) * dt);
        this.x += this.dir * this.v * dt;
        const lo = this.edgeOK ? -this.w : 0, hi = this.edgeOK ? W : W - this.w;
        if (this.x < lo) { this.x = lo; this.dir = 1; this.edgeHit(-1); }
        else if (this.x > hi) { this.x = hi; this.dir = -1; this.edgeHit(1); }
      }
      const moving = this.v > 3;
      if (this.edgeOK && this.goal == null && !['hide', 'peek'].includes(this.pose) && this.x >= 0 && this.x <= W - this.w) this.edgeOK = false;

      if (moving && MOVERS.includes(m)) {
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
      } else if (['stand', 'look', 'meet', 'follow'].includes(m)) {
        this.draw(this.b.idle[0]);
        sy = 1 + Math.sin(this.t * 2.2) * .012;
      }

      const ramp = k => Math.sin(Math.min(this.modeT / k, 1) * Math.PI);
      switch (m) {
        case 'walk': case 'run':
          if (this.goal != null) {
            this.dir = this.goal > this.x ? 1 : -1;
            if (Math.abs(this.x - this.goal) < 8) {
              const f = this.arrive; this.goal = null; this.arrive = null;
              if (f) f(); else this.setMode('stand', rand(1.4, 2.4));
            }
            break;
          }
          if (m === 'run' && moving && Math.random() < .025 * dt) { this.trip(); break; }   // 小跑偶爾跌倒
          if (this.modeT > this.modeDur) this.setMode('stand', rand(1.8, 4));
          break;
        case 'follow':
          if (!this.lead || !['walk', 'run', 'stand', 'follow'].includes(this.lead.mode) || this.modeT > this.modeDur) this.setMode('stand', rand(1.5, 3));
          break;
        case 'pat':
          sy = 1 - .05 * Math.abs(Math.sin(this.t * 8));
          if (this.modeT > this.modeDur && !this.done()) this.setMode('stand', rand(1, 2));
          break;
        case 'stand':
          if (!moving) {
            const p = this.pose;
            if (p === 'stretch') sy = 1 + ramp(1.6) * .1;
            if (p === 'yawn') tilt = -4 * ramp(1.6);
            if (p === 'groggy') { tilt = Math.sin(this.t * 2.6) * 5; sy = .985; }
            if (p === 'dizzy') tilt = Math.sin(this.t * 6) * 8 * Math.max(.3, 1 - this.modeT / this.modeDur);
            if (p === 'startle') bob = -ramp(.3) * 9;
            if (p === 'peek') tilt = this.dir * 9 * Math.min(this.modeT / .3, 1);
            if (p === 'munch') { sy = 1 - .025 * Math.abs(Math.sin(this.t * 7)); bob = -Math.abs(Math.sin(this.t * 7)) * 1.5;
              this.fxT -= dt; if (this.fxT <= 0) { this.fxT = 1.1; this.w0.fx(MEAL_FX, this.cx() + this.dir * this.w * .2, this.y + this.h * .25); } }
          }
          if (this.lookAt.length && !moving && this.modeT > this.lookAt[0]) { this.dir *= -1; this.lookAt.shift(); }
          if (this.modeT > this.modeDur && !moving && !this.done()) this.idleChoice();
          break;
        case 'click':
          bob = -Math.sin(Math.min(this.modeT / (this.has('click') ? .35 : .4), 1) * Math.PI) * (this.has('click') ? 8 : 18);
          if (this.modeT > this.modeDur && !this.done()) this.setMode('walk', rand(3, 6));
          break;
        case 'drag':
          tilt = Math.sin(this.t * 6) * (this.has('drag') ? 3 : 8);
          break;
        case 'fall':
          this.vy += GRAVITY * dt; this.y += this.vy * dt;
          this.x += this.vx * dt; this.vx *= Math.max(0, 1 - .7 * dt);
          if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx) * .5; }
          if (this.x > W - this.w) { this.x = W - this.w; this.vx = -Math.abs(this.vx) * .5; }
          if (Math.abs(this.vx) > 60) this.dir = Math.sign(this.vx);
          tilt = Math.max(-25, Math.min(25, this.vx * .02));
          if (!this.bonked && this.vy > 0) this.w0.bonk(this);
          if (this.y >= g) {
            this.y = g;
            if (this.vy > 650) { this.vy = -this.vy * .35; this.vx *= .6; this.bounces++; }
            else this.land();
          }
          break;
        case 'trip': {
          const t = this.modeT, k = this.dir * 82;
          tilt = t < .18 ? k * t / .18 : t < 1.1 ? k : k * Math.max(0, 1 - (t - 1.1) / .4);
          if (t > this.modeDur) this.setMode('stand', .9, 'groggy');
          break;
        }
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
          if (other && (!this.gawk || this.v < 4)) this.dir = other.x > this.x ? 1 : -1;
          if (!other || (other.mode !== 'drag' && other.mode !== 'fall')) { this.gawk = false; this.setMode('stand', 1.5); }
          break;
        default:   // 擴充動作
          if (this.modeT > this.modeDur && !this.done()) this.setMode('walk', rand(3, 6));
      }

      if (!['drag', 'fall'].includes(this.mode)) this.y = g;

      // 散步時偶爾飄出角色專屬 emoji
      const cx = this.cx();
      if (moving && this.c.walk_fx && this.c.walk_fx.length && (this.mode === 'walk' || this.mode === 'run')) {
        this.walkFxT -= dt;
        if (this.walkFxT <= 0) { this.walkFxT = rand(10, 20); this.w0.fx(this.c.walk_fx, cx + rand(-10, 10), this.y + this.h * .08, true); }
      }
      // 生日當天：散步與站著時飄出慶生 emoji；節日則所有角色飄節慶 emoji（生日優先）
      if (['walk', 'run', 'stand', 'follow'].includes(this.mode)) {
        const fest = this.bd ? [...BD_POOL, ...(this.c.BD_fx || [])] : this.w0.fest;
        if (fest) {
          this.bdT -= dt;
          if (this.bdT <= 0) {
            this.bdT = this.bd ? rand(2.5, 4.5) : rand(6, 10);
            this.w0.fx(fest, cx + rand(-this.w * .4, this.w * .4), this.y + this.h * .1, true);
            if (this.bd && Math.random() < .5) setTimeout(() => this.w0.fx(fest, cx + rand(-this.w * .4, this.w * .4), this.y + this.h * .2, true), 300);
          }
        }
      }

      const sleepAfter = this.c.sleep_after * rule.sleep;
      if ((performance.now() - this.lastTouch) / 1000 > sleepAfter && this.free()) this.sleepNow();

      const flip = (this.dir === 1) === IMAGE_FACES_RIGHT ? 1 : -1;
      this.el.style.transformOrigin = this.mode === 'drag' ? '50% 12%' : this.mode === 'fall' ? '50% 50%' : '50% 100%';
      this.el.style.transform = `translate(${this.x}px,${this.y + bob}px) rotate(${tilt}deg) scale(${flip},${sy})`;
      this.el.style.zIndex = ['drag', 'fall'].includes(this.mode) ? 10 : 1;
    }
    /* 走到畫面邊緣：散步中偶爾探頭 */
    edgeHit(side) {
      if (this.mode === 'walk' && !this.goal && !this.edgeOK && this.peekCool <= 0 && Math.random() < .35) this.peek(side);
    }
    destroy() { this.el.remove(); }
  }

  class World {
    constructor(stage, opts = {}) {
      this.stage = stage; this.pets = []; this.raf = 0; this.last = 0; this.size = '中';
      // 分角色倍率使用 pet_size_each，允許 0.85 / 1 / 1.15，預設標準。
      // 擴充功能傳入 opts.petScales／opts.saveScales，改存 chrome.storage，避免寫進各網站的 localStorage。
      this.petScales = Object.create(null);
      this.saveScales = typeof opts.saveScales === 'function' ? opts.saveScales : null;
      let saved = opts.petScales;
      if (!saved) { try { saved = JSON.parse(localStorage.getItem('pet_size_each') || '{}'); } catch { saved = {}; } }
      this.loadScales(saved);
      this.slot = slotNow(); this.slotT = 0; this.fest = festNow();
      this.watchMouse = opts.watchMouse !== false;  // 未指定時預設開啟；擴充功能可 opt-out
      this.mouseThrottleAt = 0; this.mousePoint = null;
      this.once = opts.once || (key => { try { if (localStorage.getItem('pet_meal') === key) return Promise.resolve(false); localStorage.setItem('pet_meal', key); } catch {} return Promise.resolve(true); });
      // 回到分頁歡迎：不使用 localStorage；一次隱藏只觸發一次。
      this.welcome = opts.welcome !== false;
      this.welcomeAfter = Number.isFinite(opts.welcomeAfter) && opts.welcomeAfter >= 0 ? opts.welcomeAfter : 600;
      this.awayAt = document.hidden ? Date.now() : 0;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { this.awayAt = Date.now(); return; }
        const elapsed = this.awayAt ? (Date.now() - this.awayAt) / 1000 : 0;
        this.awayAt = 0;
        this.mealCheck(); // 保留原本吃飯提醒行為
        if (this.welcome && elapsed >= this.welcomeAfter) this.welcomeBack();
      });
      this.max = opts.max || 2;                         // 同時出現上限：網頁版與擴充功能皆為 4
      const root = stage.getRootNode();
      const style = document.createElement('style'); style.textContent = CSS;
      (root === document ? document.head : root).appendChild(style);
      this.loop = this.loop.bind(this);
      this.onResize = () => this.pets.forEach(p => p.resize());
      global.addEventListener('resize', this.onResize);
      if (this.watchMouse) {
        this.onPointerMove = e => this.watchPointer(e);
        document.addEventListener('pointermove', this.onPointerMove, { passive: true });
      }
    }
    setSize(mode) {
      this.size = SIZE_PCT[mode] ? mode : '中';
      this.pets.forEach(p => p.resize());
    }
    /* 個別大小 API：new QPet.World(stage,{max}) 舊呼叫完全相容。
       調整時保留角色中心 X，沿用 Pet.resize() 的 ground() 腳底對齊。 */
    getPetScale(id) { return this.petScales[String(id)] || 1; }
    loadScales(map) {
      this.petScales = Object.create(null);
      if (map && typeof map === 'object' && !Array.isArray(map)) {
        Object.entries(map).forEach(([id, value]) => {
          if ([.85, 1.15].includes(Number(value))) this.petScales[id] = Number(value);
        });
      }
    }
    setPetScales(map) { this.loadScales(map); this.pets.forEach(p => p.resize()); }
    setPetScale(id, factor) {
      const scale = Number(factor);
      if (!id || ![.85, 1, 1.15].includes(scale)) return false;
      if (scale === 1) delete this.petScales[String(id)];
      else this.petScales[String(id)] = scale;
      if (this.saveScales) this.saveScales({ ...this.petScales });
      else { try { localStorage.setItem('pet_size_each', JSON.stringify(this.petScales)); } catch {} }
      this.pets.filter(p => String(p.c.id) === String(id)).forEach(p => p.resize());
      return true;
    }
    /* 偷看滑鼠：只收 document pointermove，100ms 節流；不影響拖曳、睡覺與帶目標移動。
       滑鼠位置只存在記憶體，不寫入 localStorage。opts.watchMouse=false 可完全停用。 */
    watchPointer(e) {
      if (e.pointerType === 'touch' || document.hidden || !this.pets.length) return;
      const now = performance.now();
      if (now - this.mouseThrottleAt < 100) return;
      this.mouseThrottleAt = now;
      this.mousePoint = { x: e.clientX, y: e.clientY, at: now };
      if (now - this.mousePoint.at > 1500 || this.pets.some(p => p.mode === 'drag' || p.mode === 'fall')) return;
      this.pets.forEach(p => {
        if (now < p.mouseLookReadyAt || Math.abs(p.cx() - this.mousePoint.x) > 250) return;
        if (p.goal != null || p.edgeOK || p.lead || p.pose || p.v > 4 && p.mode !== 'walk') return;
        if (p.mode !== 'stand' && p.mode !== 'walk') return; // 排除 sleep / peek / follow / click 等動畫
        p.mouseLookReadyAt = now + rand(6000, 12000);
        if (p.mode === 'walk' && Math.random() >= .20) return; // 80% 機率照常散步
        p.setMode('stand', rand(1, 2), 'watch');
        p.dir = this.mousePoint.x >= p.cx() ? 1 : -1;
        if (Math.random() < .30) this.fx(pick(['音符', '驚嘆號']), p.cx(), p.y + 5);
      });
    }
    /* 特效：kind 可為 '愛心'｜'音符'｜'驚嘆號'｜'閃光'｜'zzz'｜任意 emoji｜上述的陣列（隨機取一個） */
    fx(kind, x, y, drift) {
      if (Array.isArray(kind)) kind = kind.length ? pick(kind) : null;
      if (!kind || kind === '無') return;
      kind = String(kind);
      const el = document.createElement('div');
      if (kind === '暈') { el.className = 'qfx dizzy'; el.innerHTML = '<div class="ring"><i>★</i><i>★</i><i>★</i></div>'; }
      else if (kind === 'zzz') { el.className = 'qfx zzz'; el.textContent = 'z'; el.style.fontSize = (12 + Math.random() * 8) + 'px'; }
      else if (SVG[kind]) { el.className = 'qfx'; el.innerHTML = SVG[kind]; }
      else { el.className = 'qfx emo'; el.textContent = kind; }
      if (drift === 'hold') el.classList.add('hold');
      else if (drift) { el.classList.add('drift'); el.style.setProperty('--dx', rand(-24, 24) + 'px'); el.style.setProperty('--rot', rand(-30, 30) + 'deg'); }
      el.style.left = x + 'px'; el.style.top = y + 'px';
      this.stage.appendChild(el);
      setTimeout(() => el.remove(), kind === '暈' ? 2600 : 3200);
    }
    set(list) {
      this.clear();
      list.filter(p => p.bitmaps.idle && p.bitmaps.idle.length).slice(0, this.max).forEach((p, i, arr) => {
        const slot = global.innerWidth / (arr.length + 1) * (i + 1);
        this.pets.push(new Pet(this, p.cfg, p.bitmaps, slot));
      });
      if (this.pets.length) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); setTimeout(() => this.mealCheck(), 2500); }
    }
    clear() { cancelAnimationFrame(this.raf); this.pets.splice(0).forEach(p => p.destroy()); }
    /* 被捲動嚇到：多隻角色錯開 0–350ms 反應 */
    startle() {
      if (document.hidden) return;
      this.pets.forEach(p => global.setTimeout(() => { if (this.pets.includes(p)) p.startle(); }, rand(0, 350)));
    }
    /* 歡迎回來：每次隱藏超過 welcomeAfter 秒只觸發一次。
       拖曳、拋出狀態不打斷。睡著先 rouse() 迷糊醒來，再以 next 串到歡迎動作。 */
    welcomeBack() {
      if (!this.pets.length || document.hidden) return;
      const group = [...this.pets];
      let delay = 0;
      group.forEach((p, i) => {
        if (i) delay += rand(300, 800); // 多角色錯開，避免同時衝向中央
        global.setTimeout(() => {
          if (document.hidden || !this.pets.includes(p) || ['drag', 'fall'].includes(p.mode)) return;
          const greet = () => {
            if (!this.pets.includes(p) || document.hidden || ['drag', 'fall'].includes(p.mode)) return;
            this.welcomePet(p, i, group.length, group);
          };
          if (p.mode === 'sleep') {
            p.rouse();               // 迷糊醒來約兩秒
            p.next = greet;          // 原本 rouse() 的疲倦後續讓位給歡迎
          } else greet();
        }, delay);
      });
    }
    welcomePet(p, index, total, group) {
      const W = global.innerWidth;
      const widest = Math.max(...group.map(q => q.w));
      const gap = total > 1 ? Math.min(Math.max(72, widest * 1.08), Math.max(0, (W - widest - 8) / (total - 1))) : 0;
      const center = W / 2 + (index - (total - 1) / 2) * gap;
      const destination = Math.min(Math.max(0, center - p.w / 2), Math.max(0, W - p.w));
      p.touch(); p.edgeOK = false; p.meetCool = Math.max(p.meetCool, 12);
      const arrive = () => {
        if (!this.pets.includes(p) || document.hidden) return;
        p.dir = p.cx() < W / 2 ? 1 : -1; // 依現有左右朝向素材，朝畫面中央
        p.touch();
        this.fx('愛心', p.cx(), p.y + 4);
        p.setMode(p.has('wave') ? 'wave' : 'click', 1.5);
        p.next = () => p.setMode('stand', rand(1.5, 2.3));
      };
      if (Math.abs(p.x - destination) < 9) arrive();
      else p.goTo(destination, 'run', arrive);
    }
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
      if (this.slotT <= 0) {   // 每 30 秒確認一次時段、節日、吃飯時間與列隊散步
        this.slotT = 30;
        const s = slotNow();
        if (s !== this.slot) { this.slot = s; this.pets.forEach(p => { if (p.free()) p.tiredAct(null, false); }); }
        this.fest = festNow();
        this.mealCheck();
        if (Math.random() < .08) this.parade();
      }
      const ps = this.pets;
      ps.forEach(p => p.update(dt, p.target));
      // 拖曳：拖起其中一隻時，其他角色轉頭看；附近的會走過來圍觀
      ps.forEach(p => {
        if (p.mode !== 'drag') return;
        ps.forEach(q => {
          if (q === p || !['walk', 'run', 'stand', 'meet', 'follow'].includes(q.mode) || q.edgeOK) return;
          q.target = p; q.gawk = Math.abs(q.cx() - p.cx()) < 450 && Math.random() < .75; q.setMode('look');
        });
      });
      // 相遇：任兩隻走到一起即觸發
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) this.interact(ps[i], ps[j]);
      this.raf = requestAnimationFrame(this.loop);
    }
    interact(a, b) {
      const close = Math.abs(a.cx() - b.cx()) < (a.w + b.w) * .45;
      const walking = p => (p.mode === 'walk' || p.mode === 'run') && p.goal == null && !p.edgeOK;
      if (close && walking(a) && walking(b) && a.meetCool <= 0 && b.meetCool <= 0) {
        const dur = rand(2.5, 4);
        a.target = b; b.target = a;
        a.setMode('meet', dur); b.setMode('meet', dur); a.touch(); b.touch();
        const mx = (a.cx() + b.cx()) / 2, my = Math.min(a.y, b.y) + 10;
        this.fx('閃光', mx, my);
        setTimeout(() => this.fx('閃光', mx + 14, my + 18), 350);
      }
    }
    /* 呵欠傳染：附近的角色可能跟著打呵欠 */
    contagion(src) {
      const p = this.slot === 'night' || this.slot === 'late' ? .7 : .4;
      this.pets.forEach(q => {
        if (q === src || !q.free() || Math.abs(q.cx() - src.cx()) > 350 || Math.random() > p) return;
        setTimeout(() => { if (q.free()) q.tiredAct('yawn', false); }, rand(700, 1500));
      });
    }
    /* 一起睡：同作品的角色睡著時，醒著的同伴可能走過去睡在旁邊 */
    onSleep(a) {
      const chance = this.slot === 'night' || this.slot === 'late' ? .6 : .25;
      const b = this.pets.find(q => q !== a && sameGroup(a, q) && q.free());
      if (!b || Math.random() > chance) return;
      const side = b.cx() < a.cx() ? -1 : 1;
      b.goTo(a.x + side * a.w * .7, 'walk', () => {
        if (a.mode === 'sleep') { b.dir = a.x > b.x ? 1 : -1; b.sleepNow(false); }
        else b.setMode('stand', 1.5);
      });
    }
    /* 疊在一起：往下掉時碰到別人的頭，彈開並嚇對方一跳 */
    bonk(p) {
      const q = this.pets.find(q => q !== p && !['drag', 'fall'].includes(q.mode) &&
        Math.abs(q.cx() - p.cx()) < q.w * .45 && p.y + p.h >= q.y + q.h * .15 && p.y + p.h <= q.y + q.h * .6);
      if (!q) return;
      p.bonked = true; p.vy = -520; p.vx = (p.cx() < q.cx() ? -1 : 1) * 260;
      q.touch(); q.edgeOK = false;
      q.setMode('stand', .6, 'startle');
      this.fx('驚嘆號', q.cx(), q.y + 4);
      q.next = () => { q.dir = p.cx() < q.cx() ? 1 : -1; q.setMode('run', rand(1.2, 1.8)); };
    }
    /* 列隊散步：三隻以上時，極偶爾排成一列走一段 */
    parade() {
      const ps = this.pets;
      if (ps.length < 3 || !ps.every(p => p.free())) return;
      const order = [...ps].sort(() => Math.random() - .5);
      order[0].setMode('walk', 18);
      for (let i = 1; i < order.length; i++) order[i].follow(order[i - 1], 18);
    }
    mealTime() { const d = new Date(); return MEAL_HOURS.includes(d.getHours()); }
    /* 吃飯提醒：吃飯時間內第一次看到桌寵時，最近畫面中央的角色跑過來提醒 */
    mealCheck() {
      if (!this.pets.length || !this.mealTime() || document.visibilityState !== 'visible') return;
      const d = new Date(), key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}`;
      Promise.resolve(this.once(key)).then(first => { if (first) this.mealCall(); }).catch(() => {});
    }
    mealCall() {
      const W = global.innerWidth;
      const ps = this.pets.filter(p => !['drag', 'fall'].includes(p.mode));
      if (!ps.length) return;
      const p = ps.reduce((a, b) => Math.abs(a.cx() - W / 2) <= Math.abs(b.cx() - W / 2) ? a : b);
      p.wake(); p.touch(); p.edgeOK = false;
      p.goTo(W / 2 - p.w / 2, 'run', () => {
        p.setMode('stand', 2.4, 'startle');
        this.fx('🍚❓', p.cx(), p.y - 6, 'hold');
        p.next = () => p.munch(5);
      });
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
