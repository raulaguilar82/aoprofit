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
      const name = flip.itemName || FlipSearch.getBaseName({ id: flip.itemId, es: FlipSearch.getNameById(flip.itemId, 'es') });
      const profitClass = flip.profit >= 0 ? 'flip-profit-positive' : 'flip-profit-negative';
      const iconUrl = `../images/items/${flip.itemId}.png`;
      const variantLabel = this._getVariantLabel(flip.itemId);

      const variantClasses = this._getVariantClasses(flip.itemId);
      html += `<tr>
        <td><span class="flip-variant-label ${variantClasses}">${variantLabel}</span></td>
        <td class="flip-item-cell">
          <img src="${iconUrl}" alt="${name}" class="flip-item-icon" onerror="this.src='../images/items/PLACEHOLDER.png'" />
          <span class="flip-item-name">${name}</span>
        </td>
        <td><span class="city-badge ${flip.buyCity.toLowerCase().replace(/\s/g, '')}">${flip.buyCity}</span></td>
        <td>${flip.buyPrice.toLocaleString()}</td>
        <td><span class="city-badge ${flip.sellCity.toLowerCase().replace(/\s/g, '')}">${flip.sellCity}</span></td>
        <td>${flip.sellPrice.toLocaleString()}</td>
        <td class="${profitClass} flip-profit-cell">
          <div class="flip-profit-value">${flip.profit.toLocaleString()}</div>
          <div class="flip-profit-percent">${flip.profitPct.toFixed(1)}%</div>
        </td>
      </tr>`;
    });

    if (flips.length > 100) {
      html += `<tr><td colspan="7" style="color:#888;text-align:center;padding:10px;">Mostrando 100 de ${flips.length} resultados</td></tr>`;
    }

    tbody.innerHTML = html;
  },

  _getVariantLabel(itemId) {
    const tierMatch = itemId.match(/T(\d+)/);
    const enchantMatch = itemId.match(/@(\d+)$/);
    const tier = tierMatch ? `T${tierMatch[1]}` : '';
    const enchant = enchantMatch ? `.${enchantMatch[1]}` : '';
    return `${tier}${enchant}`.trim();
  },

  _getVariantClasses(itemId) {
    const tierMatch = itemId.match(/T(\d+)/);
    const enchantMatch = itemId.match(/@(\d+)$/);
    const tierClass = tierMatch ? `variant-tier-T${tierMatch[1]}` : '';
    const enchantClass = enchantMatch ? `variant-enchant-${enchantMatch[1]}` : 'variant-enchant-0';
    return `${tierClass} ${enchantClass}`.trim();
  }
};