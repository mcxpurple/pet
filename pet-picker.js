/*
 * Violet Hour 紫夜星光｜Q版桌寵
 * © 2026 mcx_purple. All rights reserved.
 * 保留所有權利，未經同意請勿複製、修改或用於其他專案。
 * https://www.threads.com/@mcx_purple
 */
/* 選角元件｜網頁版與擴充功能共用
   QPet.picker({ select, grid, picked, roster, pick, onChange, max }) */
(function (global) {
  function picker(o) {
    const max = o.max || 2;
    const st = { pick: (o.pick || []).filter(id => o.roster.some(c => c.id === id)).slice(0, max) };
    // 個別大小的 UI 是 opt-in，舊的 QPet.picker 呼叫方式維持原樣。
    const scaleUI = o.scaleControls === true && typeof o.onPetScale === 'function' && typeof o.getPetScale === 'function';
    const scaleChoices = [{ text: '小', factor: .85 }, { text: '標準', factor: 1 }, { text: '大', factor: 1.15 }];
    let openScaleId = null;
    // 多次開啟選角畫面時，清除上次 picker 綁定的 document 監聽。
    if (typeof o.grid._qpetScaleCleanup === 'function') o.grid._qpetScaleCleanup();
    if (scaleUI) {
      const outside = e => {
        if (openScaleId != null && !o.grid.contains(e.target)) { openScaleId = null; renderGrid(); }
      };
      const onEscape = e => {
        if (e.key === 'Escape' && openScaleId != null) { openScaleId = null; renderGrid(); }
      };
      document.addEventListener('pointerdown', outside);
      o.grid.addEventListener('keydown', onEscape);
      o.grid._qpetScaleCleanup = () => {
        document.removeEventListener('pointerdown', outside);
        o.grid.removeEventListener('keydown', onEscape);
        delete o.grid._qpetScaleCleanup;
      };
    }
    const groups = [];
    o.roster.forEach(c => { if (!groups.includes(c.group)) groups.push(c.group); });
    const first = st.pick.length ? o.roster.find(c => c.id === st.pick[0]).group : groups[0];

    o.select.innerHTML = '';
    groups.forEach(g => {
      const op = document.createElement('option');
      op.value = g; op.textContent = `${g}（${o.roster.filter(c => c.group === g).length} 位）`;
      o.select.appendChild(op);
    });
    o.select.value = first;
    o.select.onchange = () => { openScaleId = null; renderGrid(); };

    function toggle(id) {
      openScaleId = null;
      const i = st.pick.indexOf(id);
      if (i >= 0) st.pick.splice(i, 1);
      else { if (st.pick.length >= max) st.pick.shift(); st.pick.push(id); }
      renderGrid(); renderPicked();
      o.onChange && o.onChange(st.pick.slice());
    }
    function renderGrid() {
      o.grid.innerHTML = '';
      o.grid.classList.toggle('pols-with-scale', scaleUI);
      o.roster.filter(c => c.group === o.select.value).forEach(c => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'pol'; b.setAttribute('aria-pressed', String(st.pick.includes(c.id)));
        const ph = document.createElement('div'); ph.className = 'ph';
        const img = document.createElement('img'); img.src = c.thumb; img.alt = ''; img.loading = 'lazy';
        ph.appendChild(img);
        const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = c.name;
        b.append(ph, nm);
        const i = st.pick.indexOf(c.id);
        if (i >= 0) { const s = document.createElement('span'); s.className = 'seal'; s.textContent = i + 1; b.appendChild(s); }
        b.onclick = () => toggle(c.id);
        if (!scaleUI) { o.grid.appendChild(b); return; }

        // 已選拍立得的外框右下角：膠囊「⋯」按鈕，選單固定往下開。
        const slot = document.createElement('div'); slot.className = 'pol-slot';
        slot.appendChild(b);
        if (i >= 0) {
          const more = document.createElement('button');
          more.type = 'button'; more.className = 'pol-more';
          more.textContent = '⋯';
          more.title = c.name + ' 的個別大小';
          more.setAttribute('aria-label', c.name + ' 的個別大小');
          more.setAttribute('aria-haspopup', 'true');
          more.setAttribute('aria-expanded', String(openScaleId === c.id));
          more.onclick = e => {
            e.stopPropagation();
            openScaleId = openScaleId === c.id ? null : c.id;
            renderGrid();
            const focused = o.grid.querySelector('.pol-more[aria-expanded="true"]');
            if (focused) focused.focus();
          };
          slot.appendChild(more);
          if (openScaleId === c.id) {
            slot.classList.add('is-scale-open');
            const popup = document.createElement('div');
            popup.className = 'pol-size-menu';
            popup.setAttribute('role', 'group');
            popup.setAttribute('aria-label', c.name + ' 個別大小');
            const caption = document.createElement('div');
            caption.className = 'pol-size-title';
            caption.textContent = c.name + '・個別大小';
            const row = document.createElement('div');
            row.className = 'seg pol-size-options';
            const current = o.getPetScale(c.id);
            scaleChoices.forEach(({ text, factor }) => {
              const option = document.createElement('button');
              option.type = 'button'; option.textContent = text;
              option.setAttribute('aria-pressed', String(Math.abs(Number(current) - factor) < .001));
              option.onclick = e => {
                e.stopPropagation();
                o.onPetScale(c.id, factor);
                openScaleId = null;
                renderGrid();
              };
              row.appendChild(option);
            });
            popup.append(caption, row);
            slot.appendChild(popup);
          }
        }
        o.grid.appendChild(slot);
        // 不論在最後一列或手機窄螢幕，都只往下開；左右僅做防裁切對齊。
        const popup = slot.querySelector('.pol-size-menu');
        if (popup && slot.getBoundingClientRect().left + 190 > o.grid.getBoundingClientRect().right) {
          popup.classList.add('align-right');
        }
      });
    }
    function renderPicked() {
      if (!o.picked) return;
      o.picked.innerHTML = '';
      const lab = document.createElement('span'); lab.textContent = st.pick.length ? '已選：' : '尚未選擇角色';
      o.picked.appendChild(lab);
      st.pick.forEach((id, i) => {
        const c = o.roster.find(r => r.id === id);
        const chip = document.createElement('button');
        chip.type = 'button'; chip.className = 'chip'; chip.title = '點一下取消';
        chip.innerHTML = `<b>${i + 1}</b>`; chip.append(c.name);
        chip.onclick = () => toggle(id);
        o.picked.appendChild(chip);
      });
    }
    renderGrid(); renderPicked();
    return { get pick() { return st.pick.slice(); } };
  }
  global.QPet = Object.assign(global.QPet || {}, { picker });
})(typeof window !== 'undefined' ? window : globalThis);

/* 角色大小三段切換：QPet.sizeSeg(容器, 目前值, 變更時的回呼) */
(function (global) {
  global.QPet.sizeSeg = function (box, value, onChange) {
    box.innerHTML = '';
    (global.QPet.SIZES || ["小", "中", "大"]).forEach(s => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = s; b.setAttribute('aria-pressed', String(s === value));
      b.onclick = () => {
        box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        onChange(s);
      };
      box.appendChild(b);
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
