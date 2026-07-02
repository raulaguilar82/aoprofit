// Lista de compras
const Shopping = {
    _list: [],

    init() {
        this._addConfirmButtons();
    },

    _addConfirmButtons() {
        document.querySelectorAll('.tier-group').forEach(group => {
            group.addEventListener('click', () => {
                setTimeout(() => this._addButtonsToInputs(), 100);
            });
        });

        const observer = new MutationObserver(() => {
            this._addButtonsToInputs();
        });

        document.querySelectorAll('.tier-group').forEach(group => {
            observer.observe(group, { childList: true, subtree: true });
        });
    },

    _addButtonsToInputs() {
        document.querySelectorAll('.cant-input').forEach(input => {
            if (input.nextElementSibling?.classList.contains('add-to-list-btn')) return;

            const btn = document.createElement('button');
            btn.className = 'add-to-list-btn';
            btn.textContent = '+';
            btn.title = 'Añadir a lista de compras';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._addCurrentToShoppingList(input);
            });

            input.parentElement.appendChild(btn);
        });
    },

    _addCurrentToShoppingList(input) {
        const cat = Items.cat?.value;
        const itemName = Items.item?.value;
        const cantidad = parseInt(input.value) || 0;

        if (!cat || !itemName || cantidad <= 0) return;

        const row = input.closest('tr');
        const group = input.closest('.tier-group');
        const tier = group?.dataset.tier;
        const isSubRow = row?.classList.contains('sub-row');
        const subRows = group?.querySelectorAll('.sub-row');
        let enchantIdx = 0;

        if (isSubRow) {
            subRows.forEach((sr, i) => {
                if (sr === row) enchantIdx = i + 1;
            });
        }

        const enchant = `.${enchantIdx}`;
        const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
        const recipe = Prices.recipes[itemData?.id?.replace('T8_', '')];

        if (!recipe) return;

        this._list.push({
            cat,
            item: itemName,
            tier,
            enchant,
            cantidad,
            recipe: JSON.parse(JSON.stringify(recipe)),
            itemId: itemData.id
        });

        input.style.backgroundColor = '#2a3a1a';
        setTimeout(() => { input.style.backgroundColor = ''; }, 500);

        input.value = 0;

        this.render();
    },

    removeItem(index) {
        this._list.splice(index, 1);
        this.render();
    },

    render() {
        const tbody = document.getElementById('shopping-list-body');
        if (!tbody) return;

        if (this._list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="color:#888;text-align:center;padding:20px;">Añade items con el botón +</td></tr>';
            this.renderTotals();
            this.renderGrandTotals();
            return;
        }

        let html = '';

        this._list.forEach((entry, index) => {
            const tierNum = parseInt(entry.tier?.replace('T', ''));
            const isChecked = entry.checked || false;
            const rowStyle = isChecked ? 'text-decoration: line-through; opacity: 0.5;' : '';

            html += `<tr style="${rowStyle}" class="shopping-row" data-index="${index}">
        <td><span class="tier-badge t${tierNum}-badge">${entry.tier}${entry.enchant}</span> ${entry.item} <span style="color:#888;">(x${entry.cantidad})</span></td>
        <td>
          <button class="check-item-btn" data-index="${index}" title="${isChecked ? 'Desmarcar' : 'Marcar como comprado'}">${isChecked ? '✓' : '○'}</button>
          <button class="remove-item-btn" data-index="${index}" title="Eliminar">✕</button>
        </td>
      </tr>`;
        });

        tbody.innerHTML = html;

        tbody.querySelectorAll('.check-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this._list[index].checked = !this._list[index].checked;
                this.render();
            });
        });

        tbody.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeItem(parseInt(btn.dataset.index));
            });
        });

        this.renderTotals();
        this.renderGrandTotals();
    },

    renderTotals() {
        const tbody = document.getElementById('materials-totals-body');
        if (!tbody) return;

        if (this._list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:#888;text-align:center;padding:20px;">Añade items a la lista de compras</td></tr>';
            return;
        }

        const matNames = {
            PLANKS: 'Tablas', METALBAR: 'Lingotes', CLOTH: 'Tela', LEATHER: 'Cuero'
        };

        // Materiales por tier+enchant
        const materialTotals = {};

        // Artefactos y diarios por tier
        const tierExtras = {};

        this._list.forEach(entry => {
            const matKey = `${entry.tier}${entry.enchant}`;
            const tierKey = entry.tier;

            // Inicializar materiales
            if (!materialTotals[matKey]) {
                materialTotals[matKey] = { tier: entry.tier, enchant: entry.enchant };
            }

            // Inicializar extras por tier
            if (!tierExtras[tierKey]) {
                tierExtras[tierKey] = { artefactos: {}, diarios: {} };
            }

            // Sumar materiales
            const recursos = [entry.recipe.material1, entry.recipe.material2].filter(Boolean);
            recursos.forEach(r => {
                const nombre = matNames[r.id] || r.id;
                const necesario = (r.cantidad || 1) * entry.cantidad;
                materialTotals[matKey][nombre] = (materialTotals[matKey][nombre] || 0) + necesario;
            });

            // Sumar artefactos por nombre
            if (entry.recipe.artefacto) {
                const artNombre = entry.recipe.artefacto.nombre;
                tierExtras[tierKey].artefactos[artNombre] = (tierExtras[tierKey].artefactos[artNombre] || 0) + entry.cantidad;
            }

            // Sumar diarios por tipo
            const tierNum = parseInt(entry.tier?.replace('T', ''));
            const jType = Prices.JOURNAL_TYPE[entry.cat] || 'WARRIOR';
            const famaPorItem = Profit.FAME_PER_CRAFT[(tierNum - 4) * 5 + parseInt(entry.enchant.replace('.', ''))] || 0;
            const famaNecesaria = Profit.FAME_PER_JOURNAL[tierNum] || 999999;
            const diariosCant = Math.ceil((entry.cantidad * famaPorItem) / famaNecesaria);
            tierExtras[tierKey].diarios[jType] = (tierExtras[tierKey].diarios[jType] || 0) + diariosCant;
        });

        // Ordenar
        const sortedMatKeys = Object.keys(materialTotals).sort((a, b) => {
            const tierA = parseInt(materialTotals[a].tier?.replace('T', ''));
            const tierB = parseInt(materialTotals[b].tier?.replace('T', ''));
            if (tierA !== tierB) return tierA - tierB;
            return parseFloat(a.split('.')[1] || 0) - parseFloat(b.split('.')[1] || 0);
        });

        let html = '';
        let lastTier = '';

        sortedMatKeys.forEach(matKey => {
            const matData = materialTotals[matKey];
            const tierNum = parseInt(matData.tier?.replace('T', ''));
            const isFirstOfTier = matData.tier !== lastTier;
            lastTier = matData.tier;

            let artefactoHTML = '';
            let diarioHTML = '';

            if (isFirstOfTier) {
                const extras = tierExtras[matData.tier];

                // Artefactos separados por nombre
                const artEntries = Object.entries(extras.artefactos || {});
                if (artEntries.length > 0) {
                    artefactoHTML = artEntries.map(([nombre, cant]) =>
                        `<small style="color:#888;display:block;">(${nombre})</small>${cant.toLocaleString()}`
                    ).join('');
                }

                // Diarios separados por tipo
                const diaEntries = Object.entries(extras.diarios || {});
                if (diaEntries.length > 0) {
                    diarioHTML = diaEntries.map(([tipo, cant]) => {
                        const tipoNombre = tipo === 'WARRIOR' ? 'Guerrero' :
                            tipo === 'HUNTER' ? 'Cazador' :
                                tipo === 'MAGE' ? 'Mago' : 'Artesano';
                        return `<small style="color:#888;display:block;">(${tipoNombre})</small>${cant.toLocaleString()}`;
                    }).join('');
                }
            }

            html += `<tr>
      <td><span class="tier-badge t${tierNum}-badge">${matKey}</span></td>
      <td>${matData['Tablas'] ? matData['Tablas'].toLocaleString() : ''}</td>
      <td>${matData['Lingotes'] ? matData['Lingotes'].toLocaleString() : ''}</td>
      <td>${matData['Tela'] ? matData['Tela'].toLocaleString() : ''}</td>
      <td>${matData['Cuero'] ? matData['Cuero'].toLocaleString() : ''}</td>
      <td>${artefactoHTML}</td>
      <td>${diarioHTML}</td>
    </tr>`;
        });

        tbody.innerHTML = html;
    },

    renderGrandTotals() {
        const tbody = document.getElementById('totals-body');
        if (!tbody) return;

        if (this._list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="color:#888;text-align:center;padding:20px;">Añade items a la lista de compras</td></tr>';
            return;
        }

        let costoTotalCrafteo = 0;
        let costoTotalFoco = 0;
        let profitTotal = 0;

        const cleanNumber = (text) => {
            if (!text) return 0;
            const cleaned = text.replace(/[^0-9-]/g, '');
            return parseInt(cleaned) || 0;
        };

        this._list.forEach(entry => {
            const tierNum = parseInt(entry.tier?.replace('T', ''));
            const enchNum = parseInt(entry.enchant.replace('.', ''));

            const tierGroup = document.querySelector(`.tier-group[data-tier="T${tierNum}"]`);
            if (!tierGroup) return;

            let targetRow;
            if (enchNum === 0) {
                targetRow = tierGroup.querySelector('.main-row');
            } else {
                const subRows = tierGroup.querySelectorAll('.sub-row');
                targetRow = subRows[enchNum - 1];
            }

            if (!targetRow) return;

            const cells = targetRow.querySelectorAll('td');

            const costoCrafteo = cleanNumber(cells[5]?.textContent);

            // Profit: tomar solo lo que está antes del <br>
            const profitText = cells[6]?.innerHTML?.split('<br>')[0] || '0';
            const profit = cleanNumber(profitText);

            const costoFoco = cleanNumber(cells[7]?.textContent);

            costoTotalCrafteo += costoCrafteo;
            costoTotalFoco += costoFoco;
            profitTotal += profit;
        });

        const profitPct = costoTotalCrafteo > 0 ? ((profitTotal / costoTotalCrafteo) * 100).toFixed(1) : '0.0';
        const profitColor = profitTotal >= 0 ? 'var(--green-profit)' : 'var(--red-stale)';

        tbody.innerHTML = `<tr>
      <td>${costoTotalCrafteo.toLocaleString()}</td>
      <td>${costoTotalFoco.toLocaleString()}</td>
      <td style="color:${profitColor};">${profitTotal.toLocaleString()} (${profitPct}%)</td>
    </tr>`;
    }
};