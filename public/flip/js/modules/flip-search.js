// Búsqueda y filtrado de items
const FlipSearch = {
    items: [],

    TYPE_MAP: {
        'Armas': ['MAIN_', '2H_', 'OFF_'],
        'Cascos': ['HEAD_'],
        'Armaduras': ['ARMOR_'],
        'Zapatos': ['SHOES_'],
        'Monturas': ['MOUNT_'],
        'Herramientas': ['TOOL_', 'PICK_', 'AXE_', 'SICKLE_', 'SKINNINGKNIFE_', 'STONEAXE_'],
        'Recursos': ['PLANKS', 'METALBAR', 'CLOTH', 'LEATHER', 'STONEBLOCK', 'FIBER', 'HIDE', 'ORE'],
        'Corazones': ['FACTIONHEART'],
        'Equipo de Recolección': ['GATHERER_'],
        'Pociones': ['POTION_'],
        'Comida': ['MEAL_', 'FISH_'],
        'Muebles': ['FURNITURE_'],
        'Artefactos': ['ARTEFACT_']
    },

    async init() {
        const r = await fetch('data/flip-items.json');
        this.items = await r.json();
        console.log(`📦 ${this.items.length} items cargados`);
        return this;
    },

    getTypesForCategory(category) {
        return this.TYPE_MAP[category] || [];
    },

    getNameById(id, lang = 'es') {
        const item = this.items.find(i => i.id === id || i.id.replace(/@\d+$/, '') === id.replace(/@\d+$/, ''));
        return this.getName(item || { id }, lang);
    },

    getBaseId(id) {
        return String(id || '').replace(/^T\d+_/, '').replace(/@\d+$/, '');
    },

    getBaseName(item, lang = 'es') {
        const name = this.getName(item, lang);
        return this._stripTierName(name);
    },

    getSuggestions(filters = {}) {
        const items = this.filter(filters);
        const grouped = {};

        items.forEach(item => {
            const baseId = this.getBaseId(item.id);
            if (!grouped[baseId]) {
                grouped[baseId] = item;
                return;
            }

            const existing = grouped[baseId];
            if (this._variantScore(item) < this._variantScore(existing)) {
                grouped[baseId] = item;
            }
        });

        return Object.values(grouped);
    },

    _variantScore(item) {
        const tier = parseInt(item.id.match(/T(\d+)/)?.[1]) || 0;
        const enchant = parseInt(item.id.match(/@(\d+)$/)?.[1]) || 0;
        return tier * 10 + enchant;
    },

    _stripTierName(name) {
        if (!name) return '';
        return String(name)
            .replace(/^(Adept's|Expert's|Master's|Grandmaster's|Elder's|Journeyman's|Novice's|Apprentice's)\s+/i, '')
            .replace(/\s+(del|de)\s+(iniciado|experto|maestro|gran maestro|anciano|aprendiz|novato)/i, '')
            .trim();
    },

    _normalize(text) {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    },

    filter(filters = {}) {
        let results = this.items;

        // Por categoría
        if (filters.category && this.TYPE_MAP[filters.category]) {
            const prefixes = this.TYPE_MAP[filters.category];
            results = results.filter(i => prefixes.some(p => i.id.includes(p)));
        }

        // Por tier
        const tierMin = parseInt(filters.tierMin) || 4;
        const tierMax = parseInt(filters.tierMax) || 8;
        results = results.filter(i => {
            const tier = parseInt(i.id.match(/T(\d+)/)?.[1]);
            return tier && tier >= tierMin && tier <= tierMax;
        });

        // Por encantamiento
        if (filters.enchant !== undefined && filters.enchant !== '') {
            const ench = parseInt(filters.enchant);
            results = results.filter(i => {
                if (ench === 0) return !i.id.includes('@');
                return i.id.includes(`@${ench}`);
            });
        }

        // Por tipo específico
        if (filters.type && filters.type.trim()) {
            const typeValue = filters.type.trim();
            results = results.filter(i => i.id.includes(typeValue));
        }

        // Por nombre
        if (filters.query && filters.query.trim()) {
            const q = this._normalize(filters.query.trim());
            results = results.filter(i =>
                this._normalize(i.es || '').includes(q) ||
                this._normalize(i.en || '').includes(q) ||
                this._normalize(i.pt || '').includes(q) ||
                this._normalize(i.id || '').includes(q)
            );
        }

        // Solo items comerciables (con tier)
        results = results.filter(i => i.id.match(/T(\d+)/));

        // Si es búsqueda (no se especifica tier), agrupar por tier base
        if (filters.query && !filters.tierMin) {
            const seen = new Set();
            results = results.filter(i => {
                const baseId = i.id.replace(/@\d+/, ''); // Quitar encantamiento
                if (seen.has(baseId)) return false;
                seen.add(baseId);
                return true;
            });
        }

        return results;
    },

    getName(item, lang = 'es') {
        return item[lang] || item.en || item.id;
    }
};