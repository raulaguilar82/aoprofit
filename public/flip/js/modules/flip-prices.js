// Gestión de precios para Market Flip
const FlipPrices = {
    TIERS: [4, 5, 6, 7, 8],
    ENCHANTS: ['', '@1', '@2', '@3', '@4'],
    CITIES: ['Lymhurst', 'Fort Sterling', 'Thetford', 'Martlock', 'Bridgewatch', 'Caerleon', 'Brecilien', 'Black Market'],
    _cache: {},

    async fetchPrices(items, forceApi = false) {
        const ids = [...new Set((items || []).map(item => item.id).filter(Boolean))];
        if (ids.length === 0) return {};

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
            if (!r.ok) return {};
            const json = await r.json();
            return json?.data && typeof json.data === 'object' ? json.data : {};
        } catch (e) {
            return {};
        }
    },

    async _fetchFromApi(ids) {
        const CHUNK = 10;
        const newData = {};

        const uniqueIds = [...new Set(ids.filter(Boolean))];
        for (let i = 0; i < uniqueIds.length; i += CHUNK) {
            const data = await API.optimized(uniqueIds.slice(i, i + CHUNK));
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
            const normalizedId = (item.id || '').replace(/@\d+$/, '');
            if (!/^T\d+_/.test(normalizedId)) {
                expanded.push({ ...item, id: normalizedId, searchId: item.id });
                return;
            }

            const rootId = normalizedId.replace(/^T\d+_/, '');
            this.TIERS.forEach(tier => {
                this.ENCHANTS.forEach(enchant => {
                    const newId = `T${tier}_${rootId}${enchant ? `@${enchant.replace('@', '')}` : ''}`;
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
                            profitPct,
                            itemName: typeof FlipSearch !== 'undefined' ? FlipSearch.getNameById(itemId, 'es') : itemId
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