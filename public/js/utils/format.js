// Utilidades de formato
const Format = {
  date(s) {
    if (!s) return 'Sin datos';
    const d = Math.floor((Date.now() - new Date(s)) / 1000);
    return d < 60 ? 'Ahora' : d < 3600 ? `Hace ${Math.floor(d/60)}min` : d < 86400 ? `Hace ${Math.floor(d/3600)}h` : `Hace ${Math.floor(d/86400)}d`;
  },

  getPrices(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.prices && Array.isArray(data.prices)) return data.prices;
    if (typeof data === 'object') return Object.values(data).filter(v => v && typeof v === 'object' && v.city);
    return [];
  },

  getBestPrice(id, city, saved) {
    const data = saved[id];
    if (data?.manual?.sell?.[city] || data?.manual?.buy?.[city]) return { sell: data.manual.sell?.[city] || 0, buy: data.manual.buy?.[city] || 0, source: 'Manual' };
    const prices = this.getPrices(data);
    const localPrice = prices.find(p => p.city === city);
    if (localPrice && (localPrice.sell_price_min > 0 || localPrice.buy_price_max > 0)) return { sell: localPrice.sell_price_min, buy: localPrice.buy_price_max, source: localPrice.source === 'local' ? 'Local' : 'API' };
    return { sell: 0, buy: 0, source: 'Manual' };
  },

  preserveManuals(saved) {
    const old = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    Object.entries(old).forEach(([id, data]) => {
      if (data?.manual && Object.keys(data.manual).length > 0) {
        if (!saved[id]) saved[id] = { prices: [], updatedAt: 0 };
        saved[id].manual = data.manual;
      }
    });
  }
};