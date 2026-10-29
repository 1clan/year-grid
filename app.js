/* ------------------------------------------------------------------
   Year grid — fills, items, storage, keyboard.
   No dependencies, no build step.
   ------------------------------------------------------------------ */

(() => {
  'use strict';

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const COLORS = ['sand', 'clay', 'sky', 'sage', 'lilac', 'stone'];
  const ITEM_DAYS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29];

  const STORE = {
    cells: 'yeargrid:cells:v1',
    items: 'yeargrid:items:v1',
    color: 'yeargrid:color:v1'
  };

  const board = document.getElementById('board');
  const palette = document.getElementById('palette');
  const clearButton = document.getElementById('clear');
  const printButton = document.getElementById('print');

  const cells = new Map();
  const itemNodes = [];

  const state = {
    color: 'sand',
    cells: {},
    items: ITEM_DAYS.map((_, i) => ({ label: `Item ${i + 1}`, color: null }))
  };

  /* ---------------- storage ---------------- */

  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
  }

  function load() {
    const rawCells = read(STORE.cells);
    if (rawCells) {
      try {
        const saved = JSON.parse(rawCells);
        for (const [key, color] of Object.entries(saved)) {
          if (COLORS.includes(color)) state.cells[key] = color;
        }
      } catch { /* ignore corrupt data */ }
    }

    const rawItems = read(STORE.items);
    if (rawItems) {
      try {
        const saved = JSON.parse(rawItems);
        if (Array.isArray(saved)) {
          state.items.forEach((item, i) => {
            if (!saved[i]) return;
            if (typeof saved[i].label === 'string') item.label = saved[i].label;
            if (COLORS.includes(saved[i].color)) item.color = saved[i].color;
          });
        }
      } catch { /* ignore corrupt data */ }
    }

    const color = read(STORE.color);
    if (color === 'none' || COLORS.includes(color)) state.color = color;
  }

  let saveTimer = null;

  function flush() {
    clearTimeout(saveTimer);
    write(STORE.cells, JSON.stringify(state.cells));
    write(STORE.items, JSON.stringify(state.items));
    write(STORE.color, state.color);
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 150);
  }

  /* ---------------- build ---------------- */

  function build() {
    const frag = document.createDocumentFragment();

    MONTHS.forEach((name, m) => {
      const el = document.createElement('div');
      el.className = 'month';
      el.textContent = name[0];
      el.title = name;
      el.setAttribute('aria-hidden', 'true');
      el.style.gridArea = `1 / ${m + 2}`;
      frag.appendChild(el);
    });

    for (let d = 1; d <= 31; d += 1) {
      const number = document.createElement('div');
      number.className = 'daynum';
      number.textContent = d;
      number.setAttribute('aria-hidden', 'true');
      number.style.gridArea = `${d + 1} / 1`;
      frag.appendChild(number);

      for (let m = 0; m < 12; m += 1) {
        const key = `${m}:${d}`;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.dataset.m = m;
        cell.dataset.d = d;
        cell.setAttribute('aria-label', `${MONTHS[m]} ${d}`);
        cell.setAttribute('aria-pressed', 'false');
        cell.tabIndex = m === 0 && d === 1 ? 0 : -1;
        cell.style.gridArea = `${d + 1} / ${m + 2}`;
        if (state.cells[key]) cell.dataset.color = state.cells[key];
        cells.set(key, cell);
        frag.appendChild(cell);
      }
    }

    ITEM_DAYS.forEach((day, i) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.style.gridArea = `${day + 1} / 15`;

      const box = document.createElement('button');
      box.type = 'button';
      box.className = 'item__box';
      box.setAttribute('aria-label', `Colour for item ${i + 1}`);
      box.setAttribute('aria-pressed', 'false');

      const label = document.createElement('input');
      label.className = 'item__label';
      label.type = 'text';
      label.value = state.items[i].label;
      label.maxLength = 36;
      label.spellcheck = false;
      label.setAttribute('aria-label', `Item ${i + 1} label`);
      label.placeholder = `Item ${i + 1}`;

      box.addEventListener('click', () => {
        const color = activeColor();
        const entry = state.items[i];
        entry.color = color && entry.color !== color ? color : null;
        renderItem(i);
        save();
      });

      label.addEventListener('input', () => {
        state.items[i].label = label.value;
        save();
      });

      label.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') label.blur();
      });

      item.append(box, label);
      frag.appendChild(item);
      itemNodes.push({ box, label });
    });

    board.appendChild(frag);

    cells.forEach((cell) => {
      cell.setAttribute('aria-pressed', cell.dataset.color ? 'true' : 'false');
    });
    itemNodes.forEach((_, i) => renderItem(i));
  }

  /* ---------------- painting ---------------- */

  function activeColor() {
    return state.color === 'none' ? null : state.color;
  }

  function paintCell(cell, color) {
    const key = `${cell.dataset.m}:${cell.dataset.d}`;
    if (color) {
      state.cells[key] = color;
      cell.dataset.color = color;
    } else {
      delete state.cells[key];
      delete cell.dataset.color;
    }
    cell.setAttribute('aria-pressed', color ? 'true' : 'false');
    save();
  }

  function renderItem(i) {
    const { box } = itemNodes[i];
    const color = state.items[i].color;
    if (color) {
      box.dataset.color = color;
    } else {
      delete box.dataset.color;
    }
    box.setAttribute('aria-pressed', color ? 'true' : 'false');
  }

  /* ---------------- palette ---------------- */

  function setActive(color) {
    state.color = color;
    palette.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.setAttribute('aria-pressed', String(swatch.dataset.color === color));
    });
    save();
  }

  palette.addEventListener('click', (event) => {
    const swatch = event.target.closest('.swatch');
    if (!swatch) return;
    setActive(swatch.dataset.color);
  });

  /* ---------------- pointer input ---------------- */

  let painting = false;

  board.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const cell = event.target.closest('.cell');
    if (!cell) return;
    painting = true;
    paintCell(cell, activeColor());
    focusCell(Number(cell.dataset.m), Number(cell.dataset.d));
  });

  board.addEventListener('pointerover', (event) => {
    if (!painting) return;
    const cell = event.target.closest('.cell');
    if (cell) paintCell(cell, activeColor());
  });

  board.addEventListener('pointerup', () => { painting = false; });
  window.addEventListener('pointerup', () => { painting = false; });
  window.addEventListener('blur', () => { painting = false; });

  board.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    paintCell(cell, activeColor());
  });

  /* ---------------- keyboard ---------------- */

  function focusCell(m, d) {
    const target = cells.get(`${m}:${d}`);
    if (!target) return;
    cells.forEach((cell) => { cell.tabIndex = -1; });
    target.tabIndex = 0;
    target.focus();
  }

  board.addEventListener('keydown', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;

    const m = Number(cell.dataset.m);
    const d = Number(cell.dataset.d);
    let next = null;

    switch (event.key) {
      case 'ArrowLeft': next = [Math.max(0, m - 1), d]; break;
      case 'ArrowRight': next = [Math.min(11, m + 1), d]; break;
      case 'ArrowUp': next = [m, Math.max(1, d - 1)]; break;
      case 'ArrowDown': next = [m, Math.min(31, d + 1)]; break;
      case 'Home': next = [0, d]; break;
      case 'End': next = [11, d]; break;
      default: break;
    }

    if (next) {
      event.preventDefault();
      focusCell(next[0], next[1]);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      paintCell(cell, null);
      return;
    }

    if (/^[1-6]$/.test(event.key)) {
      event.preventDefault();
      const color = COLORS[Number(event.key) - 1];
      setActive(color);
      paintCell(cell, color);
    }
  });

  /* ---------------- actions ---------------- */

  clearButton.addEventListener('click', () => {
    if (!window.confirm('Clear every fill and item colour?')) return;

    state.cells = {};
    cells.forEach((cell) => {
      delete cell.dataset.color;
      cell.setAttribute('aria-pressed', 'false');
    });

    state.items.forEach((item, i) => {
      item.color = null;
      renderItem(i);
    });

    save();
  });

  printButton.addEventListener('click', () => { window.print(); });

  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });

  /* ---------------- start ---------------- */

  load();
  build();
  setActive(state.color);
})();
