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
    o.select.onchange = renderGrid;

    function toggle(id) {
      const i = st.pick.indexOf(id);
      if (i >= 0) st.pick.splice(i, 1);
      else { if (st.pick.length >= max) st.pick.shift(); st.pick.push(id); }
      renderGrid(); renderPicked();
      o.onChange && o.onChange(st.pick.slice());
    }
    function renderGrid() {
      o.grid.innerHTML = '';
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
        o.grid.appendChild(b);
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
