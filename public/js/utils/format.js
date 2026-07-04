// Utilidades de formato
const Format = {
  date(s) {
    if (!s) return 'Sin datos';
    const d = Math.floor((Date.now() - new Date(s)) / 1000);
    return d < 60 ? 'Ahora' : d < 3600 ? `Hace ${Math.floor(d / 60)}min` : d < 86400 ? `Hace ${Math.floor(d / 3600)}h` : `Hace ${Math.floor(d / 86400)}d`;
  },

  parseJSON(raw, fallback = {}) {
    try {
      const parsed = raw ? JSON.parse(raw) : fallback;
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  },

  Storage: {
    getManualPrices() {
      return Format.parseJSON(localStorage.getItem('albion-prices'), {});
    },
    saveManualPrices(data) {
      if (!data || typeof data !== 'object') data = {};
      localStorage.setItem('albion-prices', JSON.stringify(data));
    },
    getSpecs() {
      return Format.parseJSON(localStorage.getItem('albion-specs'), {});
    },
    saveSpecs(data) {
      if (!data || typeof data !== 'object') data = {};
      localStorage.setItem('albion-specs', JSON.stringify(data));
    }
  },

  getPrices(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.prices && Array.isArray(data.prices)) return data.prices;
    if (typeof data === 'object') return Object.values(data).filter(v => v && typeof v === 'object' && v.city);
    return [];
  },

  getBestPrice(id, city, saved) {
    if (!id || !saved || typeof saved !== 'object') {
      return { sell: 0, buy: 0, source: 'Manual' };
    }

    // 1. Prioridad: Precio manual
    const manualData = saved?.[id]?.manual || {};
    if (manualData && ((manualData.sell && manualData.sell[city] !== undefined) || (manualData.buy && manualData.buy[city] !== undefined))) {
      return {
        sell: manualData.sell?.[city] ?? 0,
        buy: manualData.buy?.[city] ?? 0,
        source: 'Manual'
      };
    }

    const data = saved[id];
    const prices = this.getPrices(data);

    // 2. Buscar por ciudad exacta (sin importar source)
    const exact = prices.find(p => p.city === city);
    if (exact && (exact.sell_price_min > 0 || exact.buy_price_max > 0)) {
      return {
        sell: exact.sell_price_min,
        buy: exact.buy_price_max,
        source: exact.source || 'DB'
      };
    }

    // 3. Fallback a precio manual global si no hay ciudad específica
    const fallbackSell = manualData.sell?.default;
    const fallbackBuy = manualData.buy?.default;
    if (fallbackSell !== undefined || fallbackBuy !== undefined) {
      return {
        sell: fallbackSell ?? 0,
        buy: fallbackBuy ?? 0,
        source: 'Manual'
      };
    }

    // 3. Cualquier precio disponible
    const any = prices.find(p => p.sell_price_min > 0 || p.buy_price_max > 0);
    if (any) {
      return {
        sell: any.sell_price_min,
        buy: any.buy_price_max,
        source: any.source || 'DB'
      };
    }

    // 4. Sin precio
    return { sell: 0, buy: 0, source: 'Manual' };
  },

  preserveManuals(saved) {
    const old = Format.Storage.getManualPrices();
    Object.entries(old).forEach(([id, data]) => {
      if (data?.manual && Object.keys(data.manual).length > 0) {
        if (!saved[id]) saved[id] = { prices: [], updatedAt: 0 };
        saved[id].manual = data.manual;
      }
    });
  }
};