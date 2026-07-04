// Utilidades de API AODP
const API = {
  async fetchAODP(ids, quality = '', location = '') {
    if (!ids.length) return {};
    try {
      const p = [quality && `qualities=${quality}`, location && `locations=${location}`].filter(Boolean).join('&');
      const r = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${ids.join(',')}.json${p ? '?' + p : ''}`);
      if (!r.ok) throw new Error('No disponible');
      const g = {};
      (await r.json()).forEach(d => {
        if (d.sell_price_min || d.buy_price_max) {
          if (!g[d.item_id]) g[d.item_id] = [];
          g[d.item_id].push({
            city: d.city,
            sell_price_min: d.sell_price_min || 0,
            sell_price_min_date: d.sell_price_min_date || '',
            buy_price_max: d.buy_price_max || 0,
            buy_price_max_date: d.buy_price_max_date || ''
          });
        }
      });
      return g;
    } catch {
      return {};
    }
  },

  async chunked(ids, q, l) {
    const r = {};
    for (let i = 0; i < ids.length; i += 10) Object.assign(r, await this.fetchAODP(ids.slice(i, i + 10), q, l));
    return r;
  },

  async optimized(ids, quality = '', location = '') {
    const quals = quality ? [quality] : ['1', '2', '3'];
    const results = await Promise.all(quals.map(q => this.chunked(ids, q, location)));
    const all = {};
    results.forEach(r => Object.entries(r).forEach(([id, prices]) => {
      if (!all[id]) all[id] = [];
      all[id].push(...prices);
    }));

    const merged = {};
    Object.entries(all).forEach(([id, prices]) => {
      const byCity = {};
      prices.forEach(p => {
        if (!byCity[p.city]) byCity[p.city] = { sell: [], buy: [] };
        if (p.sell_price_min > 0) byCity[p.city].sell.push(p.sell_price_min);
        if (p.buy_price_max > 0) byCity[p.city].buy.push(p.buy_price_max);
      });
      const proc = [];
      Object.entries(byCity).forEach(([city, vals]) => {
        const filter = arr => {
          if (arr.length <= 1) return arr;
          arr.sort((a, b) => a - b);
          const m = arr[Math.floor(arr.length / 2)];
          return arr.filter(v => v > 0 && v <= m * 3);
        };
        const sf = filter([...vals.sell]);
        const bf = filter([...vals.buy]);
        const as = sf.length ? Math.round(sf.reduce((s, v) => s + v, 0) / sf.length) : 0;
        const ab = bf.length ? Math.round(bf.reduce((s, v) => s + v, 0) / bf.length) : 0;
        if (as || ab) proc.push({
          city,
          sell_price_min: as,
          sell_price_min_date: new Date(prices.reduce((max, p) => Math.max(max, new Date(p.sell_price_min_date).getTime()), 0)).toISOString(),
          buy_price_max: ab,
          buy_price_max_date: new Date(prices.reduce((max, p) => Math.max(max, new Date(p.buy_price_max_date).getTime()), 0)).toISOString()
        });
      });
      if (proc.length) merged[id] = proc;
    });
    return merged;
  }
};
