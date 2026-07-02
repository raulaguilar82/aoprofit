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

        // Por nombre
        if (filters.query && filters.query.trim()) {
            const q = filters.query.toLowerCase().trim();
            results = results.filter(i =>
                (i.es || '').toLowerCase().includes(q) ||
                (i.en || '').toLowerCase().includes(q) ||
                (i.pt || '').toLowerCase().includes(q) ||
                (i.id || '').toLowerCase().includes(q)
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