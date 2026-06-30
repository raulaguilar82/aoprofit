// Modal de precios
const Prices = {
  TIERS: [4,5,6,7,8], ENCHANTS: ['','@1','@2','@3','@4'],
  REFINE: { METALBAR:'Thetford', PLANKS:'Fort Sterling', CLOTH:'Lymhurst', LEATHER:'Martlock' },
  RECURSO: { METALBAR:'🔩 Lingotes', PLANKS:'🪵 Tablas', CLOTH:'🧵 Tela', LEATHER:'🦎 Cuero' },
  recipes: {},
  _pollInterval: null,
  _rendered: false,

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

  init() {
    this.modal = document.getElementById('modal-specs');
    this.list = document.getElementById('prices-list');
    this.statusText = document.getElementById('status-text');
    this.statusDot = document.querySelector('.status-dot');

    fetch('data/recipes.json').then(r => r.json()).then(d => { this.recipes = d; }).catch(console.error);

    document.getElementById('btn-specs').addEventListener('click', () => { this._rendered = false; this.modal.classList.add('active'); this.load(true); this._startPolling(); });
    document.getElementById('modal-close').addEventListener('click', () => { this.modal.classList.remove('active'); this._stopPolling(); });
    this.modal.addEventListener('click', e => { if (e.target === this.modal) { this.modal.classList.remove('active'); this._stopPolling(); } });
    document.getElementById('btn-refresh-prices').addEventListener('click', () => { this.load(true); });

    document.getElementById('craft-item')?.addEventListener('change', () => setTimeout(() => this.preloadPrices(), 500));
    document.getElementById('craft-category')?.addEventListener('change', () => setTimeout(() => this.preloadPrices(), 500));
    setTimeout(() => this.preloadPrices(), 2000);

    this.list.addEventListener('input', e => {
      if (!e.target.matches('.price-input-manual')) return;
      e.target.dataset.touched = 'true';
      const { id, type, city } = e.target.dataset;
      const v = parseInt(e.target.value.replace(/\./g,'')) || 0;
      const s = JSON.parse(localStorage.getItem('albion-prices') || '{}');
      if (!s[id]) s[id] = { prices:[], updatedAt:0, manual:{} };
      if (!s[id].manual[type]) s[id].manual[type] = {};
      s[id].manual[type][city||'default'] = v;
      localStorage.setItem('albion-prices', JSON.stringify(s));
    });
  },

  async preloadPrices() {
    const cat = Items.cat?.value;
    const itemName = Items.item?.value;
    if (!cat || !itemName) return;

    const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
    if (!itemData?.id) return;

    const recipe = this.recipes[itemData.id.replace('T8_','')];
    if (!recipe) return;

    const saved = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    const jType = this.JOURNAL_TYPE[cat] || 'WARRIOR';

    const finalIds = [], resIds = [], artIds = [], diaIds = [];
    const recursos = [recipe.material1, recipe.material2].filter(Boolean);
    this.TIERS.forEach(t => {
      this.ENCHANTS.forEach(e => {
        finalIds.push(itemData.id.replace('T8_',`T${t}_`)+e);
        recursos.forEach(r => resIds.push(`T${t}_${r.id}${e ? `_LEVEL${e.replace('@','')}${e}` : ''}`));
      });
    });
    if (recipe.artefacto) this.TIERS.forEach(t => artIds.push(`T${t}_${recipe.artefacto.id}`));
    this.TIERS.forEach(t => { diaIds.push(`T${t}_JOURNAL_${jType}_FULL`); });

    const allIds = [...finalIds, ...resIds, ...artIds, ...diaIds];

    try {
      const r = await fetch(`/api/cached-prices?ids=${encodeURIComponent(allIds.join(','))}`);
      const { data } = await r.json();
      if (data) {
        Object.entries(data).forEach(([id, d]) => { saved[id] = { prices: d.prices || d, updatedAt: d.updatedAt || Date.now() }; });
        Format.preserveManuals(saved);
        localStorage.setItem('albion-prices', JSON.stringify(saved));
      }
    } catch(e) {}

    try {
      let newData = {};
      const CHUNK = 10;

      for (let i = 0; i < finalIds.length; i += CHUNK) {
        const data = await API.optimized(finalIds.slice(i, i + CHUNK));
        if (Object.keys(data).length) Object.assign(newData, data);
      }
      for (const r of recursos) {
        const rIds = this.TIERS.flatMap(t => this.ENCHANTS.map(e => `T${t}_${r.id}${e ? `_LEVEL${e.replace('@','')}${e}` : ''}`));
        for (let i = 0; i < rIds.length; i += CHUNK) {
          const data = await API.optimized(rIds.slice(i, i + CHUNK), '1', this.REFINE[r.id]);
          if (Object.keys(data).length) Object.assign(newData, data);
        }
      }
      for (let i = 0; i < artIds.length; i += CHUNK) {
        const data = await API.optimized(artIds.slice(i, i + CHUNK), '1');
        if (Object.keys(data).length) Object.assign(newData, data);
      }
      for (let i = 0; i < diaIds.length; i += CHUNK) {
        const data = await API.optimized(diaIds.slice(i, i + CHUNK), '1');
        if (Object.keys(data).length) Object.assign(newData, data);
      }

      if (Object.keys(newData).length > 0) {
        await fetch('/api/cached-prices', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prices:newData}) });
        Object.entries(newData).forEach(([id, prices]) => {
          if (!saved[id]?.manual) saved[id] = { prices, updatedAt: Date.now() };
        });
        Format.preserveManuals(saved);
        localStorage.setItem('albion-prices', JSON.stringify(saved));
        if (typeof Profit !== 'undefined' && Profit.calculateAll) Profit.calculateAll();
      }
    } catch(e) { console.error('Error precargando:', e); }
  },

  _startPolling() { this._stopPolling(); this._pollInterval = setInterval(() => this.load(), 2000); },
  _stopPolling() { if (this._pollInterval) { clearInterval(this._pollInterval); this._pollInterval = null; } },

  setStatus(text, loading = false) {
    this.statusText.textContent = text;
    this.statusDot.classList.toggle('loading', loading);
  },

  async load(forceRefresh = false) {
    const cat = Items.cat.value, itemName = Items.item.value;
    if (!cat || !itemName) { this.list.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">Selecciona un item a craftear</p>'; this._rendered = false; return; }
    const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
    if (!itemData?.id) return;
    const recipe = this.recipes[itemData.id.replace('T8_','')];
    if (!recipe) { this.list.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">Receta no encontrada</p>'; this._rendered = false; return; }

    const saved = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    const jType = this.JOURNAL_TYPE[cat] || 'WARRIOR';

    const finalIds = [], resIds = [], artIds = [], diaIds = [];
    const recursos = [recipe.material1, recipe.material2].filter(Boolean);
    this.TIERS.forEach(t => {
      this.ENCHANTS.forEach(e => {
        finalIds.push(itemData.id.replace('T8_',`T${t}_`)+e);
        recursos.forEach(r => resIds.push(`T${t}_${r.id}${e ? `_LEVEL${e.replace('@','')}${e}` : ''}`));
      });
    });
    if (recipe.artefacto) this.TIERS.forEach(t => artIds.push(`T${t}_${recipe.artefacto.id}`));
    this.TIERS.forEach(t => { diaIds.push(`T${t}_JOURNAL_${jType}_FULL`); });

    const allIds = [...finalIds, ...resIds, ...artIds, ...diaIds];

    try {
      const r = await fetch(`/api/cached-prices?ids=${encodeURIComponent(allIds.join(','))}`);
      const { data } = await r.json();
      if (data) {
        Object.entries(data).forEach(([id, d]) => { saved[id] = { prices: d.prices || d, updatedAt: d.updatedAt || Date.now() }; });
        Format.preserveManuals(saved);
        localStorage.setItem('albion-prices', JSON.stringify(saved));
      }
    } catch(e) {}

    this.render(saved, itemData, recipe, recursos);
    this.setStatus('Listo', false);

    if (forceRefresh) {
      this.setStatus('Cargando API...', true);

      const updateUI = async (newData) => {
        await fetch('/api/cached-prices', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prices:newData}) });
        Object.entries(newData).forEach(([id, prices]) => {
          if (!saved[id]?.manual) saved[id] = { prices, updatedAt: Date.now() };
        });
        Format.preserveManuals(saved);
        localStorage.setItem('albion-prices', JSON.stringify(saved));
        this.render(saved, itemData, recipe, recursos);
        if (typeof Profit !== 'undefined' && Profit.calculateAll) Profit.calculateAll();
      };

      try {
        const CHUNK = 10;

        for (let i = 0; i < finalIds.length; i += CHUNK) {
          const data = await API.optimized(finalIds.slice(i, i + CHUNK));
          if (Object.keys(data).length) await updateUI(data);
        }
        for (const r of recursos) {
          const rIds = this.TIERS.flatMap(t => this.ENCHANTS.map(e => `T${t}_${r.id}${e ? `_LEVEL${e.replace('@','')}${e}` : ''}`));
          for (let i = 0; i < rIds.length; i += CHUNK) {
            const data = await API.optimized(rIds.slice(i, i + CHUNK), '1', this.REFINE[r.id]);
            if (Object.keys(data).length) await updateUI(data);
          }
        }
        for (let i = 0; i < artIds.length; i += CHUNK) {
          const data = await API.optimized(artIds.slice(i, i + CHUNK), '1');
          if (Object.keys(data).length) await updateUI(data);
        }
        for (let i = 0; i < diaIds.length; i += CHUNK) {
          const data = await API.optimized(diaIds.slice(i, i + CHUNK), '1');
          if (Object.keys(data).length) await updateUI(data);
        }

        this.setStatus('Actualizado', false);
      } catch(e) { this.setStatus('Error API', false); }
    }
  },

  render(saved, itemData, recipe, recursos) {
    const jType = this.JOURNAL_TYPE[Items.cat.value] || 'WARRIOR';

    if (!this._rendered) {
      let html = '';
      const section = (title, entries) => {
        html += `<details class="price-details"><summary class="price-summary">${title}</summary><table class="price-table"><tbody>`;
        entries.forEach(e => html += this.row(e.id, e.label, saved));
        html += '</tbody></table></details>';
      };

      section(`🛡️ Item Final - ${itemData.nombre}`, this.TIERS.flatMap(t => this.ENCHANTS.map(e => ({ id: itemData.id.replace('T8_',`T${t}_`)+e, label: `T${t}${e ? '.'+e.slice(1) : '.0'}` }))));
      recursos.forEach(r => { html += this.resSection(`${this.RECURSO[r.id]||r.id} (x${r.cantidad})`, r.id, saved); });
      if (recipe.artefacto) section(`🏺 Artefacto - ${recipe.artefacto.nombre}`, this.TIERS.map(t => ({ id: `T${t}_${recipe.artefacto.id}`, label: `T${t}` })));
      section('📖 Diarios', this.TIERS.map(t => ({ id:`T${t}_JOURNAL_${jType}_FULL`, label:`T${t} Lleno` })));

      this.list.innerHTML = html;
      this._rendered = true;
      return;
    }

    this.list.querySelectorAll('.price-input-manual').forEach(input => {
      if (input.dataset.touched === 'true') return;
      const { id, type, city } = input.dataset;
      const best = Format.getBestPrice(id, city, saved);
      const val = type === 'sell' ? best.sell : best.buy;
      input.value = val ? val.toLocaleString() : '';
    });
  },

  resSection(title, rid, saved) {
    const city = this.REFINE[rid], cc = (city||'').toLowerCase().replace(/\s/g,'');
    let h = `<details class="price-details"><summary class="price-summary">${title}</summary><table class="price-table"><tbody>`;
    this.TIERS.forEach(t => {
      h += `<tr><td><span class="tier-badge t${t}-badge">T${t}</span></td><td colspan="2"><div class="city-cards">`;
      this.ENCHANTS.forEach(e => {
        const id = `T${t}_${rid}${e ? `_LEVEL${e.replace('@','')}${e}` : ''}`;
        const best = Format.getBestPrice(id, city, saved);
        h += `<div class="city-card ${cc} ench-${e ? e.slice(1) : '0'}"><span class="city-name ench-${e ? e.slice(1) : '0'}">${city} ${e ? '.'+e.slice(1) : '.0'}</span><div class="separator-small"></div><span class="sell-buy-order">Venta:</span><input type="text" inputmode="numeric" class="price-input-manual" value="${best.sell ? best.sell.toLocaleString() : ''}" data-id="${id}" data-type="sell" data-city="${city}"><span class="sell-buy-order">Compra:</span><input type="text" inputmode="numeric" class="price-input-manual" value="${best.buy ? best.buy.toLocaleString() : ''}" data-id="${id}" data-type="buy" data-city="${city}"></div>`;
      });
      h += `</div></td></tr>`;
    });
    return h + '</tbody></table></details>';
  },

  row(id, label, saved) {
    const tier = parseInt(String(id).match(/T(\d+)/)?.[1]) || 8;
    const ORDER = ['Lymhurst','Fort Sterling','Thetford','Martlock','Bridgewatch','Caerleon','Black Market','Brecilien'];
    const visible = (id.includes('ARTEFACT') || id.includes('JOURNAL')) ? ORDER.filter(c => c !== 'Black Market' && c !== 'Caerleon') : ORDER;
    let cards = '<div class="city-cards">';
    visible.forEach(c => {
      const best = Format.getBestPrice(id, c, saved);
      const cls = c.toLowerCase().replace(/\s/g,'');
      cards += `<div class="city-card ${cls}"><span class="city-name">${c}</span><div class="separator-small"></div><span class="sell-buy-order">Venta:</span><input type="text" inputmode="numeric" class="price-input-manual" value="${best.sell ? best.sell.toLocaleString() : ''}" data-id="${id}" data-type="sell" data-city="${c}"><span class="sell-buy-order">Compra:</span><input type="text" inputmode="numeric" class="price-input-manual" value="${best.buy ? best.buy.toLocaleString() : ''}" data-id="${id}" data-type="buy" data-city="${c}"></div>`;
    });
    return `<tr><td><span class="tier-badge t${tier}-badge">T${tier}</span>${label}</td><td colspan="2">${cards}</td></tr>`;
  }
};