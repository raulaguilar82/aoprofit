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

        const totals = {};

        this._list.forEach(entry => {
            const key = `${entry.tier}${entry.enchant}`;
            if (!totals[key]) totals[key] = { artefactos: 0, diarios: 0 };

            const recursos = [entry.recipe.material1, entry.recipe.material2].filter(Boolean);

            recursos.forEach(r => {
                const nombre = matNames[r.id] || r.id;
                const necesario = (r.cantidad || 1) * entry.cantidad;
                totals[key][nombre] = (totals[key][nombre] || 0) + necesario;
            });

            if (entry.recipe.artefacto) {
                totals[key].artefactos += entry.cantidad;
            }

            const tierNum = parseInt(entry.tier?.replace('T', ''));
            const famaPorItem = Profit.FAME_PER_CRAFT[(tierNum - 4) * 5 + parseInt(entry.enchant.replace('.', ''))] || 0;
            const famaNecesaria = Profit.FAME_PER_JOURNAL[tierNum] || 999999;
            const diariosCant = Math.ceil((entry.cantidad * famaPorItem) / famaNecesaria);
            totals[key].diarios += diariosCant;
        });

        const sortedKeys = Object.keys(totals).sort((a, b) => {
            const tierA = parseInt(a.match(/T(\d+)/)[1]);
            const tierB = parseInt(b.match(/T(\d+)/)[1]);
            if (tierA !== tierB) return tierA - tierB;
            const enchA = parseFloat(a.split('.')[1] || 0);
            const enchB = parseFloat(b.split('.')[1] || 0);
            return enchA - enchB;
        });

        let html = '';

        sortedKeys.forEach(key => {
            const data = totals[key];
            const tierNum = parseInt(key.match(/T(\d+)/)[1]);

            html += `<tr>
        <td><span class="tier-badge t${tierNum}-badge">${key}</span></td>
        <td>${data['Tablas'] ? data['Tablas'].toLocaleString() : '-'}</td>
        <td>${data['Lingotes'] ? data['Lingotes'].toLocaleString() : '-'}</td>
        <td>${data['Tela'] ? data['Tela'].toLocaleString() : '-'}</td>
        <td>${data['Cuero'] ? data['Cuero'].toLocaleString() : '-'}</td>
        <td>${data.artefactos > 0 ? data.artefactos.toLocaleString() : '-'}</td>
        <td>${data.diarios > 0 ? data.diarios.toLocaleString() : '-'}</td>
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