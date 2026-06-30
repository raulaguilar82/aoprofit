// Dropdown de tiers T4-T8
function initTiers() {
  document.querySelectorAll('.tier-group').forEach(group => {
    const tier = group.dataset.tier;
    const mainRow = group.querySelector('.main-row');
    if (group.querySelector('.sub-row')) return;

    for (let enc = 1; enc <= 4; enc++) {
      const row = document.createElement('tr');
      row.className = 'sub-row';
      row.innerHTML = `<td class="sub-tier-name">${tier}.${enc}</td>${'<td data-empty></td>'.repeat(7)}<td><input type="number" class="cant-input" value="0" min="0" /></td>`;
      group.appendChild(row);
    }

    const clean = mainRow.cloneNode(true);
    mainRow.replaceWith(clean);
    clean.addEventListener('click', e => { if (!e.target.classList.contains('cant-input')) group.classList.toggle('open'); });
  });
}