const FlipApp = {
  async init() {
    console.log('✅ Market Flip inicializado');
    await FlipSearch.init();
    this._setupFilters();
    this._setupSearch();
  },

  _setupFilters() {
    document.getElementById('btn-search')?.addEventListener('click', () => this.search());
  },

  _setupSearch() {
    const input = document.getElementById('flip-search');
    const dropdown = document.getElementById('flip-search-results');

    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const query = input.value.trim();

      if (query.length < 2) {
        dropdown.classList.remove('active');
        return;
      }

      const results = FlipSearch.filter({ query }).slice(0, 10);

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
            <div>${FlipSearch.getName(item)}</div>
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
      tierMin: parseInt(document.getElementById('flip-tier-min')?.value) || 4,
      tierMax: parseInt(document.getElementById('flip-tier-max')?.value) || 8,
      enchant: document.getElementById('flip-enchant')?.value,
      buyCity: document.getElementById('flip-buy-city')?.value,
      sellCity: document.getElementById('flip-sell-city')?.value,
      minProfit: parseFloat(document.getElementById('flip-min-profit')?.value) || 0,
      premium: document.getElementById('flip-premium')?.checked || false
    };

    const filteredItems = FlipSearch.filter(filters);
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

    FlipTable.render(flips, FlipSearch.items);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FlipApp.init();
});