// Market Flip - App principal
const FlipApp = {
  init() {
    console.log('✅ Market Flip inicializado');
    this._setupFilters();
  },

  _setupFilters() {
    // Por ahora, placeholder
    document.getElementById('btn-search')?.addEventListener('click', () => {
      this.search();
    });
  },

  async search() {
    const tbody = document.getElementById('flip-results-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:40px;">⏳ Buscando oportunidades...</td></tr>';

    // TODO: Implementar búsqueda
    setTimeout(() => {
      tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:40px;">No se encontraron resultados. Ajusta los filtros.</td></tr>';
    }, 1000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FlipApp.init();
});