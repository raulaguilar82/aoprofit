// Selector de item + specs + bonus
const Items = {
  data: {},
  cat: null, item: null, specs: null, icon: null,

  init() {
    this.cat = document.getElementById('craft-category');
    this.item = document.getElementById('craft-item');
    this.specs = document.getElementById('item-spec-inputs');
    this.icon = document.getElementById('selected-item-icon');

    fetch('data/item-mapping.json').then(r => r.json()).then(d => { this.data = d; this._initCat(); }).catch(console.error);

    this.cat.addEventListener('change', () => { this._fillSelect(this.cat.value); this._updateIcon(); this.show(this.cat.value); });
    this.item.addEventListener('change', () => { this._updateIcon(); this.show(this.cat.value); });
    this.specs.addEventListener('input', e => {
      if (!e.target.matches('input[type="number"]')) return;
      const { cat, item } = e.target.dataset;
      const s = JSON.parse(localStorage.getItem('albion-specs') || '{}');
      if (!s[cat]) s[cat] = { mastery: 0, items: {} };
      s[cat].items[item] = parseInt(e.target.value) || 0;
      localStorage.setItem('albion-specs', JSON.stringify(s));
      this._updateBonus(cat);
    });
  },

  _initCat() { if (this.cat.value) { this._fillSelect(this.cat.value); this.show(this.cat.value); } },
  _fillSelect(cat) { this.item.innerHTML = '<option value="">-- Selecciona un item --</option>'; (this.data[cat] || []).forEach(i => this.item.innerHTML += `<option value="${i.nombre}">${i.nombre}</option>`); },
  _updateIcon() { if (!this.icon) return; const d = this.data[this.cat.value]?.find(i => i.nombre === this.item.value); this.icon.src = d?.id ? `https://render.albiononline.com/v1/item/${d.id}.png` : 'https://render.albiononline.com/v1/item/T8_MAIN_SWORD.png'; },
  _calc(lvl, b) { return { focus: b.focus * lvl, quality: b.quality * lvl, ownFocus: (b.ownFocus || 0) * lvl, spec: (b.spec || 0) * lvl }; },

  _updateBonus(cat) {
    const div = document.getElementById('spec-bonus-display');
    if (!div) return;
    if (!cat || !this.data[cat]) { div.innerHTML = '<span>🔧 Eficiencia de Foco: <strong>+0</strong></span><span>⭐ Calidad: <strong>+0.00</strong></span>'; return; }
    const s = JSON.parse(localStorage.getItem('albion-specs') || '{}');
    const items = s[cat]?.items || {};
    let focus = this._calc(s[cat]?.mastery || 0, { focus: 30, quality: 0.75 }).focus;
    let quality = this._calc(s[cat]?.mastery || 0, { focus: 30, quality: 0.75 }).quality;
    const indv = {};
    this.data[cat].forEach((item, i) => {
      const lvl = items[item.nombre] || 0;
      const b = i < 3 ? { focus: 30, quality: 0.75, ownFocus: 250, spec: 6 } : i < 7 ? { focus: 15, quality: 0.375, ownFocus: 250, spec: 6 } : { focus: 2.15, quality: 0.05, ownFocus: 250, spec: 6 };
      const r = this._calc(lvl, b);
      focus += r.focus; quality += r.quality;
      indv[item.nombre] = { ownFocus: r.ownFocus, spec: r.spec };
    });
    window._individualBonuses = indv;
    div.innerHTML = `<span>🔧 Eficiencia de Foco: <strong>+${focus}</strong></span><span>⭐ Calidad: <strong>+${quality.toFixed(2)}</strong></span>`;
  },

  show(cat) {
    const items = this.data[cat];
    if (!items?.length) { this.specs.innerHTML = '<p style="color:#888;font-size:.8rem;">Sin datos</p>'; this._updateBonus(null); return; }
    const s = JSON.parse(localStorage.getItem('albion-specs') || '{}');
    const sItems = s[cat]?.items || {};
    const sel = this.item.value;
    let h = `<span class="spec-label-small">Specs de ${cat}:</span>`;
    items.forEach(i => { const v = sItems[i.nombre] || 0; h += `<div class="spec-item-compact ${i.nombre === sel ? 'spec-selected' : ''}"><span class="spec-item-name">${i.nombre}</span><input type="number" value="${v}" min="0" max="100" data-cat="${cat}" data-item="${i.nombre}" /></div>`; });
    this.specs.innerHTML = h;
    this._updateBonus(cat);
  }
};