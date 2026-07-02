// Renderizado de tabla de resultados
const FlipTable = {
  render(flips, items) {
    const tbody = document.getElementById('flip-results-body');
    if (!tbody) return;

    if (flips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:40px;">No se encontraron oportunidades</td></tr>';
      return;
    }

    // Limitar a 100 resultados
    const displayFlips = flips.slice(0, 100);

    let html = '';

    displayFlips.forEach(flip => {
      const item = items.find(i => i.id === flip.itemId);
      const name = FlipSearch.getName(item, 'es');
      const profitClass = flip.profit >= 0 ? 'flip-profit-positive' : 'flip-profit-negative';

      html += `<tr>
        <td>
          <span>${name}</span>
          <small style="color:#888;display:block;">${flip.itemId}</small>
        </td>
        <td><span class="city-badge ${flip.buyCity.toLowerCase().replace(/\s/g, '')}">${flip.buyCity}</span></td>
        <td>${flip.buyPrice.toLocaleString()}</td>
        <td><span class="city-badge ${flip.sellCity.toLowerCase().replace(/\s/g, '')}">${flip.sellCity}</span></td>
        <td>${flip.sellPrice.toLocaleString()}</td>
        <td class="${profitClass}">${flip.profit.toLocaleString()}</td>
        <td class="${profitClass}">${flip.profitPct.toFixed(1)}%</td>
      </tr>`;
    });

    if (flips.length > 100) {
      html += `<tr><td colspan="7" style="color:#888;text-align:center;padding:10px;">Mostrando 100 de ${flips.length} resultados</td></tr>`;
    }

    tbody.innerHTML = html;
  }
};