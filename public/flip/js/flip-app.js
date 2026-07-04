const FlipApp = {
  selectedItemId: null,
  lastFlips: [],
  lastFilters: null,

  async init() {
    console.log('✅ Market Flip inicializado');
    await FlipSearch.init();
    this._setupFilters();
    this._setupSearch();
  },

  _setupFilters() {
    document.getElementById('btn-search')?.addEventListener('click', () => this.search());
    document.getElementById('flip-premium')?.addEventListener('change', () => this.refreshCurrentResults());

    const category = document.getElementById('flip-category');
    const type = document.getElementById('flip-type');

    if (category && type) {
      category.addEventListener('change', () => {
        this.selectedItemId = null;
        this._fillTypeOptions(category.value, type);
      });
      this._fillTypeOptions(category.value, type);
    }
  },

  _setupSearch() {
    const input = document.getElementById('flip-search');
    const dropdown = document.getElementById('flip-search-results');

    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      this.selectedItemId = null;
      const query = input.value.trim();

      if (query.length < 2) {
        dropdown.classList.remove('active');
        return;
      }

      const filters = {
        query,
        category: document.getElementById('flip-category')?.value,
        type: document.getElementById('flip-type')?.value,
        tierMin: parseInt(document.getElementById('flip-tier-min')?.value) || 4,
        tierMax: parseInt(document.getElementById('flip-tier-max')?.value) || 8,
        enchant: document.getElementById('flip-enchant')?.value
      };

      const results = FlipSearch.getSuggestions(filters).slice(0, 10);

      if (results.length === 0) {
        dropdown.classList.remove('active');
        return;
      }

      dropdown.innerHTML = results.map(item => `
        <div class="search-result-item" data-id="${item.id}">
          <img src="../images/items/${item.id}.png" 
               onerror="this.style.display='none'"
               style="width:24px;height:24px;border-radius:3px;" />
          <div>
            <div>${FlipSearch.getBaseName(item)}</div>
          </div>
        </div>
      `).join('');

      dropdown.classList.add('active');
    });

    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (!item) return;

      const itemId = item.dataset.id;
      const fullItem = FlipSearch.items.find(i => i.id === itemId);

      if (fullItem) {
        this.selectedItemId = itemId;
        input.value = FlipSearch.getName(fullItem);
        dropdown.classList.remove('active');
        this.search();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#flip-search') && !e.target.closest('.search-dropdown')) {
        dropdown.classList.remove('active');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        dropdown.classList.remove('active');
        this.search();
      }
    });
  },

  async search() {
    const tbody = document.getElementById('flip-results-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:40px;">⏳ Buscando oportunidades...</td></tr>';

    const filters = {
      query: document.getElementById('flip-search')?.value || '',
      category: document.getElementById('flip-category')?.value,
      type: document.getElementById('flip-type')?.value,
      tierMin: parseInt(document.getElementById('flip-tier-min')?.value) || 4,
      tierMax: parseInt(document.getElementById('flip-tier-max')?.value) || 8,
      enchant: document.getElementById('flip-enchant')?.value,
      buyCity: document.getElementById('flip-buy-city')?.value,
      sellCity: document.getElementById('flip-sell-city')?.value,
      minProfit: parseFloat(document.getElementById('flip-min-profit')?.value) || 0,
      premium: document.getElementById('flip-premium')?.checked || false
    };

    let filteredItems = [];
    if (this.selectedItemId) {
      const selected = FlipSearch.items.find(i => i.id === this.selectedItemId);
      if (selected) {
        filteredItems = [selected];
      }
    }

    if (!filteredItems.length) {
      filteredItems = FlipSearch.filter(filters);
    }

    console.log(`🔍 ${filteredItems.length} items encontrados`);

    if (filteredItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:40px;">No se encontraron items con esos filtros</td></tr>';
      return;
    }

    const itemsToFetch = filteredItems.slice(0, 50);
    const allVariants = FlipPrices.expandToAllVariants(itemsToFetch);
    console.log(`📦 ${allVariants.length} variantes a consultar`);

    const prices = await FlipPrices.fetchPrices(allVariants, true);
    const flips = FlipPrices.findBestFlips(prices, filters);

    this.lastFlips = flips;
    this.lastFilters = filters;
    this.lastPrices = prices;
    FlipTable.render(flips, FlipSearch.items);
  },

  refreshCurrentResults() {
    if (!this.lastFlips.length || !this.lastFilters) return;

    const premium = document.getElementById('flip-premium')?.checked || false;
    const filters = { ...this.lastFilters, premium };
    const updatedFlips = FlipPrices.findBestFlips(this.lastPrices || {}, filters);

    if (updatedFlips.length !== this.lastFlips.length || updatedFlips.some((flip, index) => flip.profit !== this.lastFlips[index]?.profit || flip.profitPct !== this.lastFlips[index]?.profitPct)) {
      this.lastFlips = updatedFlips;
      FlipTable.render(updatedFlips, FlipSearch.items);
    }
  },

  _fillTypeOptions(categoryValue, typeSelect) {
    if (!typeSelect) return;
    typeSelect.innerHTML = '<option value="">Todos</option>';
    if (!categoryValue) return;

    const prefixes = FlipSearch.getTypesForCategory(categoryValue);
    prefixes.forEach(prefix => {
      const option = document.createElement('option');
      option.value = prefix;
      option.textContent = prefix.replace(/_$/, '');
      typeSelect.appendChild(option);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FlipApp.init();
});