/*
 * Violet Hour 紫夜星光｜網頁版季節微景（2026-11-12，GPT-6）
 * © 2026 mcx_purple. All rights reserved.
 * 授權範圍：只由網頁版 index.html 載入，不修改共用的 pet-engine.js 或下載版 ZIP。
 * 原則：在角色腳邊生成 -> 小幅橫向飄散、微升 -> 淡出；絕不從視窗頂端落下。
 * 移除方法：從 index.html 刪除季節微景的 script/link 兩行；詳見 CHANGELOG.md。
 */
(function () {
  'use strict';

  const MAX_PARTICLES = 6;             // 所有桌寵共用上限，不隨角色數量乘上去
  const BOTTOM_ZONE = 125;             // 只允許接近視窗底部的桌寵產生微景
  const PARTICLE_MIN_MS = 2700;
  const PARTICLE_MAX_MS = 4100;
  const random = (a, b) => a + Math.random() * (b - a);
  const choose = a => a[Math.floor(Math.random() * a.length)];
  const live = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 月份／時段規則：6–8 月螢火蟲僅於 19:00 至翌日 05:59 出現。
  function themeNow() {
    const now = new Date(), m = now.getMonth() + 1, h = now.getHours();
    if (m <= 2) return 'plum';
    if (m <= 4) return 'cherry';
    if (m === 5) return 'tung';
    if (m <= 8) return h >= 19 || h < 6 ? 'firefly' : null;
    if (m <= 11) return 'autumn';
    return 'snow';
  }

  // 獨立效果層：只新增無互動的元素，不接觸既有 Pet / World 物件。
  function spawn(stage, type, pet) {
    const rect = pet.getBoundingClientRect();
    const width = window.innerWidth, height = window.innerHeight;
    if (rect.width <= 0 || rect.bottom < height - BOTTOM_ZONE || rect.top > height) return;
    const el = document.createElement('span');
    el.className = 'qseason-particle';
    let size = random(12, 19);

    if (type === 'plum') {
      el.classList.add('qseason-plum');
      el.textContent = choose(['✿', '❀']);
    } else if (type === 'cherry') {
      el.classList.add('qseason-cherry');
      el.textContent = choose(['❀', '✿']);
    } else if (type === 'tung') {
      el.classList.add('qseason-tung');
      el.textContent = '✿';
    } else if (type === 'firefly') {
      el.classList.add('qseason-firefly');
      size = random(3, 5.5);
      el.style.width = size + 'px';
      el.style.height = size + 'px';
    } else if (type === 'autumn') {
      if (Math.random() < .5) {
        el.classList.add('qseason-maple');
        el.textContent = '🍁';
        size = random(12, 17);
      } else {
        el.classList.add('qseason-ginkgo');
        size = random(13, 18);
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        // 固定 SVG，繪出銀杏扇形葉，不依賴遠端圖片。
        el.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 22C9 20 4 16 4 10c0-3 2-5 5-6 2 3 4 5 7 8 3-3 5-5 7-8 3 1 5 3 5 6 0 6-5 10-12 12Z" fill="#e7c65e"/><path d="M16 14v14M9 10l7 11m7-11-7 11" fill="none" stroke="#b18a3e" stroke-width="1.25" stroke-linecap="round"/></svg>';
      }
    } else if (type === 'snow') {
      el.classList.add('qseason-snow');
      el.textContent = choose(['❄', '✻']);
      size = random(10, 16);
    }

    // 依角色目前的位置取座標，但粒子固定於螢幕底部，不跟隨角色飛往上方。
    const x = Math.max(14, Math.min(width - 14, rect.left + rect.width * random(.17, .83)));
    const y = Math.max(height - BOTTOM_ZONE, Math.min(height - 6, rect.bottom - random(8, 20)));
    const duration = random(PARTICLE_MIN_MS, PARTICLE_MAX_MS);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (type !== 'firefly' && !(type === 'autumn' && el.classList.contains('qseason-ginkgo'))) {
      el.style.fontSize = size + 'px';
    }
    el.style.setProperty('--duration', duration + 'ms');
    el.style.setProperty('--peak-opacity', random(.52, .83).toFixed(2));
    el.style.setProperty('--dx', random(-42, 42).toFixed(1) + 'px');
    // 2026-11-12 微調：從腳邊向上飄至角色身體周圍，仍不從畫面頂端落下。
    el.style.setProperty('--dy', (-random(type === 'firefly' ? 45 : 65, type === 'firefly' ? 85 : 110)).toFixed(1) + 'px');
    el.style.setProperty('--rotation', random(-28, 28).toFixed(1) + 'deg');
    stage.appendChild(el);
    live.add(el);
    window.setTimeout(() => { el.remove(); live.delete(el); }, duration + 100);
  }

  function clearParticles() {
    live.forEach(el => el.remove());
    live.clear();
  }

  function init() {
    const stage = document.getElementById('stage');
    if (!stage) return; // 給網頁版使用；沒有 stage 時不干涉頁面

    function tick() {
      // 背景頁、開啟選角器、減少動態效果，以及夏季日間均不播放。
      const picker = document.getElementById('picker');
      const off = document.hidden || reducedMotion.matches || (picker && !picker.hidden);
      if (off) clearParticles();
      const type = off ? null : themeNow();
      if (type && live.size < MAX_PARTICLES) {
        const pets = Array.from(stage.querySelectorAll('.qpet')).filter(p => {
          const r = p.getBoundingClientRect();
          return r.width > 0 && r.bottom >= window.innerHeight - BOTTOM_ZONE && r.top <= window.innerHeight;
        });
        if (pets.length) spawn(stage, type, choose(pets));
      }
      // 一次一顆、各次錯開；多隻角色共用同一粒子上限。
      window.setTimeout(tick, type ? random(950, 1650) : 4500);
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
