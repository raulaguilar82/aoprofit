// Gestión de precios para Market Flip
const FlipPrices = {
    TIERS: [4, 5, 6, 7, 8],
    ENCHANTS: ['', '@1', '@2', '@3', '@4'],
    CITIES: ['Lymhurst', 'Fort Sterling', 'Thetford', 'Martlock', 'Bridgewatch', 'Caerleon', 'Brecilien', 'Black Market'],
    _cache: {},

    async fetchPrices(items, forceApi = false) {
        const ids = [];

        // Generar todos los IDs para cada item
        items.forEach(item => {
            const baseId = item.id.replace(/T\d+/, 'T$&'); // Mantener el tier original
            ids.push(baseId);
        });

        // 1. Buscar en MongoDB
        let data = await this._fetchFromBackend(ids);

        // 2. Si forceApi o no hay datos, consultar AODP
        if (forceApi || !data || Object.keys(data).length === 0) {
            await this._fetchFromApi(ids);
            data = await this._fetchFromBackend(ids);
        }

        return data || {};
    },

    async _fetchFromBackend(ids) {
        try {
            const r = await fetch(`/api/cached-prices?ids=${ids.join(',')}`);
            const { data } = await r.json();
            return data;
        } catch (e) {
            return null;
        }
    },

    async _fetchFromApi(ids) {
        const CHUNK = 10;
        const newData = {};

        for (let i = 0; i < ids.length; i += CHUNK) {
            const data = await API.optimized(ids.slice(i, i + CHUNK));
            Object.assign(newData, data);
        }

        if (Object.keys(newData).length > 0) {
            await fetch('/api/cached-prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prices: newData })
            });
        }
    },

    expandToAllVariants(items) {
        const expanded = [];

        items.forEach(item => {
            const baseId = item.id.replace(/T\d+/, 'T$&');

            this.TIERS.forEach(tier => {
                this.ENCHANTS.forEach(enchant => {
                    const newId = baseId.replace(/T\d+/, `T${tier}`) + enchant;
                    expanded.push({
                        ...item,
                        id: newId,
                        searchId: item.id
                    });
                });
            });
        });

        return expanded;
    },

    findBestFlips(prices, filters) {
        const flips = [];

        Object.entries(prices).forEach(([itemId, data]) => {
            const priceList = Array.isArray(data) ? data : (data.prices || []);
            if (priceList.length < 2) return;

            // Agrupar por ciudad
            const byCity = {};
            priceList.forEach(p => {
                if (!p.city || !p.sell_price_min) return;
                byCity[p.city] = {
                    buy: p.sell_price_min, // Comprar al precio de venta más bajo
                    sell: p.buy_price_max || p.sell_price_min // Vender al precio de compra más alto
                };
            });

            // Comparar ciudades
            this.CITIES.forEach(buyCity => {
                this.CITIES.forEach(sellCity => {
                    if (buyCity === sellCity) return;
                    if (filters.buyCity && buyCity !== filters.buyCity) return;
                    if (filters.sellCity && sellCity !== filters.sellCity) return;

                    const buyPrice = byCity[buyCity]?.buy || 0;
                    const sellPrice = byCity[sellCity]?.sell || 0;

                    if (buyPrice <= 0 || sellPrice <= 0) return;

                    const taxRate = filters.premium ? 0.065 : 0.105;
                    const tax = Math.round(sellPrice * taxRate);
                    const profit = sellPrice - buyPrice - tax;
                    const profitPct = (profit / buyPrice) * 100;

                    if (profitPct >= (filters.minProfit || 0)) {
                        flips.push({
                            itemId,
                            buyCity,
                            buyPrice,
                            sellCity,
                            sellPrice,
                            tax,
                            profit,
                            profitPct
                        });
                    }
                });
            });
        });

        // Ordenar por profit% descendente
        flips.sort((a, b) => b.profitPct - a.profitPct);

        return flips;
    }
};