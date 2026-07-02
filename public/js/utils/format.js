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
    // 1. Prioridad: Precio manual (localStorage)
    const manualData = saved[id]?.manual;
    if (manualData?.sell?.[city] || manualData?.buy?.[city]) {
      return { 
        sell: manualData.sell?.[city] || 0, 
        buy: manualData.buy?.[city] || 0, 
        source: 'Manual' 
      };
    }
    
    const data = saved[id];
    const prices = this.getPrices(data);
    
    // 2. Prioridad: Precio local de la ciudad exacta (data broker)
    const localExact = prices.find(p => p.city === city && p.source === 'local');
    if (localExact && (localExact.sell_price_min > 0 || localExact.buy_price_max > 0)) {
      return { 
        sell: localExact.sell_price_min, 
        buy: localExact.buy_price_max, 
        source: 'Local' 
      };
    }
    
    // 3. Prioridad: Cualquier precio local
    const localAny = prices.find(p => p.source === 'local');
    if (localAny && (localAny.sell_price_min > 0 || localAny.buy_price_max > 0)) {
      return { 
        sell: localAny.sell_price_min, 
        buy: localAny.buy_price_max, 
        source: 'Local' 
      };
    }
    
    // 4. Prioridad: Precio API de la ciudad exacta
    const apiExact = prices.find(p => p.city === city && p.source === 'api');
    if (apiExact && (apiExact.sell_price_min > 0 || apiExact.buy_price_max > 0)) {
      return { 
        sell: apiExact.sell_price_min, 
        buy: apiExact.buy_price_max, 
        source: 'API' 
      };
    }
    
    // 5. Prioridad: Cualquier precio API
    const apiAny = prices.find(p => p.source === 'api' && (p.sell_price_min > 0 || p.buy_price_max > 0));
    if (apiAny) {
      return { 
        sell: apiAny.sell_price_min, 
        buy: apiAny.buy_price_max, 
        source: 'API' 
      };
    }
    
    // 6. Sin precio
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