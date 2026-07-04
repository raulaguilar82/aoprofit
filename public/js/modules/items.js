// Selector de item + specs + bonus
const Items = {
  data: {},
  cat: null, item: null, specs: null, icon: null,
  customDropdown: null,

  // ============ INICIALIZACIÓN ============
  init() {
    this.cat = document.getElementById('craft-category');
    this.item = document.getElementById('craft-item');
    this.specs = document.getElementById('item-spec-inputs');
    this.icon = document.getElementById('selected-item-icon');
    this.customDropdown = document.getElementById('custom-item-dropdown');

    // Cargar datos
    fetch('data/item-mapping.json')
      .then(r => r.json())
      .then(d => { this.data = d; this._initCat(); })
      .catch(console.error);

    // Evento cambio de categoría
    this.cat.addEventListener('change', () => {
      this._fillDropdown(this.cat.value);
      this._updateIcon();
      this.show(this.cat.value);
    });

    // Evento dropdown personalizado
    this.customDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.custom-option');
      if (option) {
        const value = option.dataset.value;
        this.item.value = value;
        this._updateIcon();
        this.show(this.cat.value);
        this.customDropdown.classList.remove('active');
        document.getElementById('selected-item-display').textContent = value || 'Selecciona un item';

        // Cargar precios automáticamente
        if (typeof Prices !== 'undefined' && Prices.loadPricesOnSelect) {
          Prices.loadPricesOnSelect();
        }
      }
    });

    // Toggle dropdown
    document.getElementById('item-selector-container').addEventListener('click', (e) => {
      if (e.target.closest('#custom-item-dropdown')) return;
      this.customDropdown.classList.toggle('active');
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#item-selector-container')) {
        this.customDropdown.classList.remove('active');
      }
    });

    // Guardar specs al editar
    this.specs.addEventListener('input', e => {
      if (!e.target.matches('input[type="number"]')) return;

      // Forzar límites
      let value = parseInt(e.target.value) || 0;
      if (value < 0) value = 0;
      if (value > 100) value = 100;
      e.target.value = value;

      const { cat, item, mastery } = e.target.dataset;
      const s = Format.Storage.getSpecs();

      if (mastery === 'true') {
        if (!s[cat]) s[cat] = { mastery: 0, items: {} };
        s[cat].mastery = value;
      } else {
        if (!s[cat]) s[cat] = { mastery: 0, items: {} };
        s[cat].items[item] = value;
      }

      Format.Storage.saveSpecs(s);
      this._updateBonus(cat);

      if (typeof Profit !== 'undefined' && Profit.calculateAll) {
        Profit.calculateAll();
      }
    });
  },

  // ============ DROPDOWN ============
  _initCat() {
    if (this.cat.value) {
      this._fillDropdown(this.cat.value);
      this.show(this.cat.value);
    }
  },

  _fillDropdown(cat) {
    this.customDropdown.innerHTML = '';
    (this.data[cat] || []).forEach(i => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.dataset.value = i.nombre;
      option.innerHTML = `
        <img src="images/items/${i.id}.png" alt="${i.nombre}" 
             onerror="this.src='images/items/PLACEHOLDER.png'"
             class="option-icon" />
        <span>${i.nombre}</span>
      `;
      this.customDropdown.appendChild(option);
    });

    // Actualizar el select oculto
    this.item.innerHTML = '<option value="">-- Selecciona un item --</option>';
    (this.data[cat] || []).forEach(i => {
      this.item.innerHTML += `<option value="${i.nombre}">${i.nombre}</option>`;
    });

    document.getElementById('selected-item-display').textContent = 'Selecciona un item';
  },

  _updateIcon() {
    if (!this.icon) return;
    const d = this.data[this.cat.value]?.find(i => i.nombre === this.item.value);
    this.icon.src = d?.id
      ? `images/items/${d.id}.png`
      : 'images/items/PLACEHOLDER.png';
  },

  // ============ BONOS DE ESPECIALIZACIÓN ============
  _calc(lvl, b) {
    return {
      focus: b.focus * lvl,
      quality: b.quality * lvl,
      ownFocus: (b.ownFocus || 0) * lvl,
      spec: (b.spec || 0) * lvl
    };
  },

  _updateBonus(cat) {
    const div = document.getElementById('spec-bonus-display');
    if (!div) return;

    if (!cat || !this.data[cat]) {
      div.innerHTML = `
      <span>🔧 Eficiencia General: <strong>+0</strong></span>
      <span>🎯 Eficiencia Individual: <strong>+0</strong></span>
    `;
      return;
    }

    const s = Format.Storage.getSpecs();
    const items = s[cat]?.items || {};
    const mastery = s[cat]?.mastery || 0;

    let focus = mastery * 30; // Maestría se suma a la general
    let quality = 0;
    const indv = {};

    this.data[cat].forEach((item, i) => {
      const lvl = items[item.nombre] || 0;
      const b = i < 3
        ? { focus: 30, quality: 0.75, ownFocus: 250 }
        : i < 7
          ? { focus: 15, quality: 0.375, ownFocus: 250 }
          : { focus: 2.15, quality: 0.05, ownFocus: 250 };

      const r = this._calc(lvl, b);
      focus += r.focus;
      quality += r.quality;
      indv[item.nombre] = { ownFocus: r.ownFocus };
    });

    window._individualBonuses = indv;

    // Eficiencia individual = solo spec del item (sin maestría)
    const selItem = this.item.value;
    const selBonus = indv[selItem] || { ownFocus: 0 };
    const eficienciaIndividual = selBonus.ownFocus || 0;

    div.innerHTML = `
    <span>🔧 Eficiencia General: <strong>+${focus}</strong></span>
    <span>🎯 Eficiencia Individual: <strong>+${eficienciaIndividual}</strong></span>
  `;
  },

  // ============ PANEL DE SPECS ============
  show(cat) {
    const items = this.data[cat];
    if (!items?.length) {
      this.specs.innerHTML = '<p style="color:#888;font-size:.8rem;">Sin datos</p>';
      this._updateBonus(null);
      return;
    }

    const s = Format.Storage.getSpecs();
    const sItems = s[cat]?.items || {};
    const mastery = s[cat]?.mastery || 0;
    const sel = this.item.value;

    let h = `<span class="spec-label-small">Specs de ${cat}:</span>`;

    // Campo de Maestría
    h += `<div class="spec-item-compact spec-mastery">
          <span class="spec-item-name">⭐ Maestría</span>
          <input type="number" value="${mastery}" min="0" max="100" 
                 data-cat="${cat}" data-mastery="true" class="mastery-input" />
        </div>`;

    // Items individuales
    items.forEach(i => {
      const v = sItems[i.nombre] || 0;
      h += `<div class="spec-item-compact ${i.nombre === sel ? 'spec-selected' : ''}">
            <span class="spec-item-name">${i.nombre}</span>
            <input type="number" value="${v}" min="0" max="100" data-cat="${cat}" data-item="${i.nombre}" />
          </div>`;
    });

    this.specs.innerHTML = h;
    this._updateBonus(cat);
  },
};