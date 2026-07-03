// Modal de precios
const Prices = {
  TIERS: [4, 5, 6, 7, 8], ENCHANTS: ['', '@1', '@2', '@3', '@4'],
  REFINE: { METALBAR: 'Thetford', PLANKS: 'Fort Sterling', CLOTH: 'Lymhurst', LEATHER: 'Martlock' },
  RECURSO: { METALBAR: 'Lingotes', PLANKS: 'Tablas', CLOTH: 'Tela', LEATHER: 'Cuero' },
  recipes: {},
  _cache: {},
  _pollInterval: null,

  JOURNAL_TYPE: {
    'Espadas': 'WARRIOR', 'Hachas': 'WARRIOR', 'Mazas': 'WARRIOR', 'Martillos': 'WARRIOR',
    'Guantes de Guerra': 'WARRIOR', 'Ballestas': 'WARRIOR', 'Escudos': 'WARRIOR',
    'Arcos': 'HUNTER', 'Dagas': 'HUNTER', 'Lanzas': 'HUNTER', 'Varas': 'HUNTER',
    'Cambiaformas': 'HUNTER', 'Bastones Naturales': 'HUNTER', 'Antorchas': 'HUNTER',
    'Bastones Sagrados': 'MAGE', 'Bastones de Fuego': 'MAGE', 'Bastones de Hielo': 'MAGE',
    'Bastones Arcanos': 'MAGE', 'Bastones Malditos': 'MAGE', 'Libros de Hechizos': 'MAGE',
    'Armaduras de Placa': 'WARRIOR', 'Armaduras de Cuero': 'HUNTER', 'Armaduras de Tela': 'MAGE',
    'Cascos de Placa': 'WARRIOR', 'Cascos de Cuero': 'HUNTER', 'Cascos de Tela': 'MAGE',
    'Zapatos de Placa': 'WARRIOR', 'Zapatos de Cuero': 'HUNTER', 'Zapatos de Tela': 'MAGE',
    'Bolsas': 'TOOLMAKER', 'Capas': 'TOOLMAKER'
  },

  // ============ INICIALIZACIÓN ============
  init() {
    this.modal = document.getElementById('modal-specs');
    this.list = document.getElementById('prices-list');
    this.statusText = document.getElementById('status-text');
    this.statusDot = document.querySelector('.status-dot');

    fetch('data/recipes.json').then(r => r.json()).then(d => { this.recipes = d; }).catch(console.error);

    // Abrir modal
    document.getElementById('btn-specs').addEventListener('click', () => {
      this.modal.classList.add('active');
      this._renderModalFromCache();
      this._startPolling();
    });

    // Cerrar modal
    document.getElementById('modal-close').addEventListener('click', () => {
      this._saveManualPrices();
      this.modal.classList.remove('active');
      this._stopPolling();
    });

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) {
        this._saveManualPrices();
        this.modal.classList.remove('active');
        this._stopPolling();
      }
    });

    // Guardar precios manuales al editar
    this.list.addEventListener('input', e => {
      if (!e.target.matches('.price-input-manual')) return;
      e.target.dataset.touched = 'true';
      this._saveManualPrices();
    });

    // Guardar precios manuales al perder foco (más preciso)
    this.list.addEventListener('change', e => {
      if (!e.target.matches('.price-input-manual')) return;
      this._saveManualPrices();
      if (typeof Profit !== 'undefined') Profit.calculateAll();
    });
  },

  // ============ FLUJO PRINCIPAL ============
  async loadPricesOnSelect() {
    const cat = Items.cat?.value;
    const itemName = Items.item?.value;
    if (!cat || !itemName) return;

    const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
    if (!itemData?.id) return;

    const recipe = this.recipes[itemData.id.replace('T8_', '')];
    if (!recipe) return;

    const ids = this._getIdsForItem(itemData, recipe, cat);
    const allIds = [...ids.final, ...ids.resources, ...ids.artifacts, ...ids.journals];

    this._setButtonLoading(true);

    // Cargar del backend
    let data = await this._fetchFromBackend(allIds);
    const manuals = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    let merged = this._mergeData(data, manuals);

    this._saveToCacheAndStorage(itemData.id, merged, manuals);
    if (typeof Profit !== 'undefined') Profit.calculateAll();

    // Consultar API en segundo plano
    try {
      await this._fetchAodpAndSave(ids, recipe);
      const freshData = await this._fetchFromBackend(allIds);
      if (freshData) {
        const freshManuals = JSON.parse(localStorage.getItem('albion-prices') || '{}');
        const freshMerged = this._mergeData(freshData, freshManuals);
        this._saveToCacheAndStorage(itemData.id, freshMerged, freshManuals);
        if (typeof Profit !== 'undefined') Profit.calculateAll();
      }
    } catch (e) {
      console.error('Error actualizando desde API:', e);
    }

    this._setButtonLoading(false);
  },

  _mergeData(data, manuals) {
    const merged = {};
    if (data) {
      Object.entries(data).forEach(([id, prices]) => {
        merged[id] = { prices: prices.prices || prices };
        if (manuals[id]?.manual) merged[id].manual = manuals[id].manual;
      });
    }
    Object.entries(manuals).forEach(([id, manualData]) => {
      if (!merged[id] && manualData?.manual) {
        merged[id] = { prices: [], manual: manualData.manual };
      }
      if (merged[id] && manualData?.manual) {
        merged[id].manual = manualData.manual;
      }
    });
    return merged;
  },

  // ============ MODAL ============
  _renderModalFromCache() {
    const cat = Items.cat?.value;
    const itemName = Items.item?.value;
    if (!cat || !itemName) return;

    const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
    if (!itemData?.id) return;

    const recipe = this.recipes[itemData.id.replace('T8_', '')];
    if (!recipe) return;

    const cached = this._cache[itemData.id];
    if (!cached) {
      this.list.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">Cargando precios...</p>';
      return;
    }

    const ids = this._getIdsForItem(itemData, recipe, cat);
    this.renderPrices(cached, itemData, recipe, ids.recursos);
  },

  // ============ POLLING ============
  _startPolling() {
    this._stopPolling();
    this._pollInterval = setInterval(async () => {
      const cat = Items.cat?.value;
      const itemName = Items.item?.value;
      if (!cat || !itemName) return;

      const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
      if (!itemData?.id) return;

      const recipe = this.recipes[itemData.id.replace('T8_', '')];
      if (!recipe) return;

      const ids = this._getIdsForItem(itemData, recipe, cat);
      const allIds = [...ids.final, ...ids.resources, ...ids.artifacts, ...ids.journals];

      try {
        const r = await fetch(`/api/cached-prices?ids=${allIds.join(',')}`);
        const { data } = await r.json();

        if (data && Object.keys(data).length > 0) {
          const manuals = JSON.parse(localStorage.getItem('albion-prices') || '{}');
          const merged = this._mergeData(data, manuals);
          
          merged._timestamp = Date.now();
          this._cache[itemData.id] = merged;

          const toSave = {};
          Object.entries(merged).forEach(([id, d]) => {
            if (id === '_timestamp') return;
            toSave[id] = { prices: d.prices || [], updatedAt: Date.now() };
            if (d.manual) toSave[id].manual = d.manual;
          });
          localStorage.setItem('albion-prices', JSON.stringify(toSave));

          this._updateInputs(merged);
          if (typeof Profit !== 'undefined') Profit.calculateAll();
        }
      } catch (e) {}
    }, 5000);
  },

  _stopPolling() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  },

  // ============ HELPERS ============
  _getIdsForItem(itemData, recipe, cat) {
    const jType = this.JOURNAL_TYPE[cat] || 'WARRIOR';
    const final = [], resources = [], artifacts = [], journals = [];
    const recursos = [recipe.material1, recipe.material2].filter(Boolean);

    this.TIERS.forEach(t => {
      this.ENCHANTS.forEach(e => {
        final.push(itemData.id.replace('T8_', `T${t}_`) + e);
        recursos.forEach(r => {
          resources.push(`T${t}_${r.id}${e ? `_LEVEL${e.replace('@', '')}${e}` : ''}`);
        });
      });
    });

    if (recipe.artefacto) {
      this.TIERS.forEach(t => artifacts.push(`T${t}_${recipe.artefacto.id}`));
    }

    this.TIERS.forEach(t => {
      journals.push(`T${t}_JOURNAL_${jType}_FULL`);
    });

    return { final, resources, artifacts, journals, recursos };
  },

  async _fetchFromBackend(allIds) {
    try {
      const r = await fetch(`/api/cached-prices?ids=${allIds.join(',')}`);
      const { data } = await r.json();
      return data;
    } catch (e) {
      return null;
    }
  },

  async _fetchAodpAndSave(ids, recipe) {
    const CHUNK = 10;
    const newData = {};

    try {
      for (let i = 0; i < ids.final.length; i += CHUNK) {
        const data = await API.optimized(ids.final.slice(i, i + CHUNK));
        Object.assign(newData, data);
      }
      for (const r of ids.recursos) {
        const rIds = this.TIERS.flatMap(t =>
          this.ENCHANTS.map(e => `T${t}_${r.id}${e ? `_LEVEL${e.replace('@', '')}${e}` : ''}`)
        );
        for (let i = 0; i < rIds.length; i += CHUNK) {
          const data = await API.optimized(rIds.slice(i, i + CHUNK), '1', this.REFINE[r.id]);
          Object.assign(newData, data);
        }
      }
      for (let i = 0; i < ids.artifacts.length; i += CHUNK) {
        const data = await API.optimized(ids.artifacts.slice(i, i + CHUNK), '1');
        Object.assign(newData, data);
      }
      for (let i = 0; i < ids.journals.length; i += CHUNK) {
        const data = await API.optimized(ids.journals.slice(i, i + CHUNK), '1');
        Object.assign(newData, data);
      }

      if (Object.keys(newData).length > 0) {
        await fetch('/api/cached-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prices: newData })
        });
      }
    } catch (e) {
      console.error('Error API:', e);
    }
  },

  _saveToCacheAndStorage(itemId, merged, manuals) {
    merged._timestamp = Date.now();
    this._cache[itemId] = merged;

    const toSave = {};
    Object.entries(merged).forEach(([id, data]) => {
      if (id === '_timestamp') return;
      toSave[id] = { prices: data.prices || [], updatedAt: Date.now() };
      if (data.manual) toSave[id].manual = data.manual;
    });
    Object.entries(manuals).forEach(([id, data]) => {
      if (!toSave[id] && data?.manual) {
        toSave[id] = { prices: [], manual: data.manual };
      }
    });
    localStorage.setItem('albion-prices', JSON.stringify(toSave));
  },

  _saveManualPrices() {
    const inputs = this.list.querySelectorAll('.price-input-manual[data-touched="true"]');
    if (inputs.length === 0) return;

    const s = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    inputs.forEach(input => {
      const { id, type, city } = input.dataset;
      if (!id || !type) return;
      const v = parseInt(input.value.replace(/\./g, '')) || 0;
      if (!s[id]) s[id] = { manual: {} };
      if (!s[id].manual[type]) s[id].manual[type] = {};
      s[id].manual[type][city || 'default'] = v;
    });
    localStorage.setItem('albion-prices', JSON.stringify(s));
  },

  setStatus(text, loading = false) {
    if (this.statusText) this.statusText.textContent = text;
    if (this.statusDot) this.statusDot.classList.toggle('loading', loading);
  },

  // ============ RENDERIZADO ============
  renderPrices(data, itemData, recipe, recursos) {
    if (!this.modal?.classList.contains('active')) return;
    const jType = this.JOURNAL_TYPE[Items.cat.value] || 'WARRIOR';

    let html = '';
    const section = (title, entries) => {
      html += `<details class="price-details"><summary class="price-summary">${title}</summary><table class="price-table"><tbody>`;
      entries.forEach(e => html += this.row(e.id, e.label, data));
      html += '</tbody></table></details>';
    };

    section(`🛡️ Item Final - ${itemData.nombre}`, this.TIERS.flatMap(t => this.ENCHANTS.map(e => ({
      id: itemData.id.replace('T8_', `T${t}_`) + e,
      label: `T${t}${e ? '.' + e.slice(1) : '.0'}`
    }))));

    recursos.forEach(r => {
      html += this.resSection(`${this.RECURSO[r.id] || r.id} (x${r.cantidad})`, r.id, data);
    });

    if (recipe.artefacto) {
      section(`🏺 Artefacto - ${recipe.artefacto.nombre}`, this.TIERS.map(t => ({
        id: `T${t}_${recipe.artefacto.id}`,
        label: `T${t}`
      })));
    }

    section('📖 Diarios', this.TIERS.map(t => ({
      id: `T${t}_JOURNAL_${jType}_FULL`,
      label: `T${t} Lleno`
    })));

    this.list.innerHTML = html;
  },

  _updateInputs(data) {
    if (!this.modal?.classList.contains('active')) return;
    this.list.querySelectorAll('.price-input-manual').forEach(input => {
      if (input.dataset.touched === 'true') return;
      const { id, type, city } = input.dataset;
      const best = Format.getBestPrice(id, city, data);
      const val = type === 'sell' ? best.sell : best.buy;
      const newValue = val ? val.toLocaleString() : '';
      if (newValue === '' && input.value !== '') return;
      if (input.value !== newValue) input.value = newValue;
    });
  },

  resSection(title, rid, saved) {
    const city = this.REFINE[rid];
    const cc = (city || '').toLowerCase().replace(/\s/g, '');
    let h = `<details class="price-details"><summary class="price-summary">${title}</summary><table class="price-table"><tbody>`;

    this.TIERS.forEach(t => {
      h += `<tr><td><span class="tier-badge t${t}-badge">T${t}</span></td><td colspan="2"><div class="city-cards">`;
      this.ENCHANTS.forEach(e => {
        const id = `T${t}_${rid}${e ? `_LEVEL${e.replace('@', '')}${e}` : ''}`;
        const best = Format.getBestPrice(id, city, saved);
        h += `<div class="city-card ${cc} ench-${e ? e.slice(1) : '0'}">
          <span class="city-name ench-${e ? e.slice(1) : '0'}">${city} ${e ? '.' + e.slice(1) : '.0'}</span>
          <div class="separator-small"></div>
          <span class="sell-buy-order">Venta:</span>
          <input type="text" inputmode="numeric" class="price-input-manual" value="${best.sell ? best.sell.toLocaleString() : ''}" data-id="${id}" data-type="sell" data-city="${city}">
          <span class="sell-buy-order">Compra:</span>
          <input type="text" inputmode="numeric" class="price-input-manual" value="${best.buy ? best.buy.toLocaleString() : ''}" data-id="${id}" data-type="buy" data-city="${city}">
        </div>`;
      });
      h += `</div></td></tr>`;
    });

    return h + '</tbody></table></details>';
  },

  // ============ INDICADOR VISUAL ============
  _setButtonLoading(loading) {
    const btn = document.getElementById('btn-specs');
    if (!btn) return;

    if (loading) {
      btn.classList.add('loading');
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Cargando...';
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';
    } else {
      btn.classList.remove('loading');
      btn.innerHTML = btn.dataset.originalText || '🔄 Actualizar Precios';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  },

  row(id, label, saved) {
    const tier = parseInt(String(id).match(/T(\d+)/)?.[1]) || 8;
    const ORDER = ['Lymhurst', 'Fort Sterling', 'Thetford', 'Martlock', 'Bridgewatch', 'Caerleon', 'Black Market', 'Brecilien'];
    const visible = (id.includes('ARTEFACT') || id.includes('JOURNAL'))
      ? ORDER.filter(c => c !== 'Black Market' && c !== 'Caerleon')
      : ORDER;

    let cards = '<div class="city-cards">';
    visible.forEach(c => {
      const best = Format.getBestPrice(id, c, saved);
      const cls = c.toLowerCase().replace(/\s/g, '');
      cards += `<div class="city-card ${cls}">
        <span class="city-name">${c}</span>
        <div class="separator-small"></div>
        <span class="sell-buy-order">Venta:</span>
        <input type="text" inputmode="numeric" class="price-input-manual" value="${best.sell ? best.sell.toLocaleString() : ''}" data-id="${id}" data-type="sell" data-city="${c}">
        <span class="sell-buy-order">Compra:</span>
        <input type="text" inputmode="numeric" class="price-input-manual" value="${best.buy ? best.buy.toLocaleString() : ''}" data-id="${id}" data-type="buy" data-city="${c}">
      </div>`;
    });

    return `<tr><td><span class="tier-badge t${tier}-badge">T${tier}</span>${label}</td><td colspan="2">${cards}</td></tr>`;
  }
};