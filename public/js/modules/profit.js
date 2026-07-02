const Profit = {
  ITEM_VALUES: {
    MAIN: [384, 768, 1536, 3072, 6144, 768, 1536, 3072, 6144, 12288, 1536, 3072, 6144, 12288, 24576, 3072, 6144, 12288, 24576, 49152, 6144, 12288, 24576, 49152, 98304],
    '2H': [512, 1024, 2048, 4096, 8192, 1024, 2048, 4096, 8192, 16384, 2048, 4096, 8192, 16384, 32768, 4096, 8192, 16384, 32768, 65536, 8192, 16384, 32768, 65536, 131072],
    MAIN_RUNE: [480, 864, 1632, 3168, 6240, 960, 1728, 3264, 6336, 12480, 1920, 3456, 6528, 12672, 24960, 3840, 6912, 13056, 25344, 49920, 7680, 13824, 26112, 50688, 99840],
    '2H_RUNE': [640, 1152, 2176, 4224, 8320, 1280, 2304, 4352, 8448, 16640, 2560, 4608, 8704, 16896, 33280, 5120, 9216, 17408, 33792, 66560, 10240, 18432, 34816, 67584, 133120],
    MAIN_SOUL: [672, 1056, 1824, 3360, 6432, 1344, 2112, 3648, 6720, 12864, 2688, 4224, 7296, 13440, 25728, 5376, 8448, 14592, 26880, 51456, 10752, 16896, 29184, 53760, 102912],
    '2H_SOUL': [896, 1408, 2432, 4480, 8576, 1792, 2816, 4864, 8960, 17152, 3584, 5632, 9728, 17920, 34304, 7168, 11264, 19456, 35840, 68608, 14336, 22528, 38912, 71680, 137216],
    '2H_RELIC': [1408, 1920, 2944, 4992, 9088, 2816, 3840, 5888, 9984, 18176, 5632, 7680, 11776, 19968, 36352, 11264, 15360, 23552, 39936, 72704, 22528, 30720, 47104, 79872, 145408],
    ARMOR: [256, 512, 1024, 2048, 4096, 512, 1024, 2048, 4096, 8192, 1024, 2048, 4096, 8192, 16384, 2048, 4096, 8192, 16384, 32768, 4096, 8192, 16384, 32768, 65536],
    ARMOR_RUNE: [320, 576, 1088, 2112, 4160, 640, 1152, 2176, 4224, 8320, 1280, 2304, 4352, 8448, 16640, 2560, 4608, 8704, 16896, 33280, 5120, 9216, 17408, 33792, 66560],
    ARMOR_SOUL: [448, 704, 1216, 2240, 4288, 896, 1408, 2432, 4480, 8576, 1792, 2816, 4864, 8960, 17152, 3584, 5632, 9728, 17920, 34304, 7168, 11264, 19456, 35840, 68608],
    ARMOR_RELIC: [704, 960, 1472, 2496, 4544, 1408, 1920, 2944, 4992, 9088, 2816, 3840, 5888, 9984, 18176, 5632, 7680, 11776, 19968, 36352, 11264, 15360, 23552, 39936, 72704],
    ARMOR_AVALON: [1216, 1472, 1984, 3008, 5056, 2432, 2944, 3968, 6016, 10112, 4864, 5888, 7936, 12032, 20224, 9728, 11776, 15872, 24064, 40448, 19456, 23552, 31744, 48128, 80896],
    HEAD: [128, 256, 512, 1024, 2048, 256, 512, 1024, 2048, 4096, 512, 1024, 2048, 4096, 8192, 1024, 2048, 4096, 8192, 16384, 2048, 4096, 8192, 16384, 32768],
    HEAD_RUNE: [160, 288, 544, 1056, 2080, 320, 576, 1088, 2112, 4160, 640, 1152, 2176, 4224, 8320, 1280, 2304, 4352, 8448, 16640, 2560, 4608, 8704, 16896, 33280],
    HEAD_SOUL: [224, 352, 608, 1120, 2144, 448, 704, 1216, 2240, 4288, 896, 1408, 2432, 4480, 8576, 1792, 2816, 4864, 8960, 17152, 3584, 5632, 9728, 17920, 34304],
    HEAD_RELIC: [352, 480, 736, 1248, 2272, 704, 960, 1472, 2496, 4544, 1408, 1920, 2944, 4992, 9088, 2816, 3840, 5888, 9984, 18176, 5632, 7680, 11776, 19968, 36352],
    HEAD_AVALON: [608, 736, 992, 1504, 2528, 1216, 1472, 1984, 3008, 5056, 2432, 2944, 3968, 6016, 10112, 4864, 5888, 7936, 12032, 20224, 9728, 11776, 15872, 24064, 40448],
    CAPE: [128, 240, 368, 624, 2048, 352, 480, 736, 1248, 4096, 704, 960, 1472, 2496, 8192, 1408, 1920, 2944, 4992, 16384, 2816, 3840, 5888, 9984, 32768],
    BAG: [256, 512, 1024, 2048, 4096, 512, 1024, 2048, 4096, 8192, 1024, 2048, 4096, 8192, 16384, 2048, 4096, 8192, 16384, 32768, 4096, 8192, 16384, 32768, 65536],
    CRYSTAL_2H: [2432, 2944, 3968, 6016, 10112, 4864, 5888, 7936, 12032, 20224, 9728, 11776, 15872, 24064, 40448, 19456, 23552, 31744, 48128, 80896, 38912, 47104, 63488, 96256, 161792],
    CRYSTAL_1H: [1824, 2208, 2976, 4512, 7584, 3636, 4404, 5940, 9012, 15168, 7296, 8832, 11904, 18048, 30336, 14592, 17664, 23808, 36096, 60672, 29004, 35148, 47436, 72012, 121344]
  },
  FOCUS_BASE: {
    MAIN: [1286, 2251, 3939, 6893, 12064, 2251, 3939, 6893, 12064, 21111, 3939, 6893, 12064, 21111, 36945, 6893, 12064, 21111, 36945, 64653, 12064, 21111, 36945, 64653, 113144],
    '2H': [1715, 3001, 5252, 9191, 16085, 3001, 5252, 9191, 16085, 28148, 5252, 9191, 16085, 28148, 49260, 9191, 16085, 28148, 49260, 86205, 16085, 28148, 49260, 86205, 150858],
    MAIN_RUNE: [1286, 2251, 3939, 6893, 12064, 2251, 3939, 6893, 12064, 21111, 3939, 6805, 12064, 21111, 36945, 6805, 12064, 21111, 36945, 64653, 12064, 21111, 36945, 64653, 113144],
    '2H_RUNE': [1715, 3001, 5252, 9191, 16085, 3001, 5252, 9191, 16085, 28148, 5252, 9073, 16085, 28148, 49260, 9073, 16085, 28148, 49260, 86205, 16085, 28148, 49260, 86205, 150858],
    MAIN_SOUL: [1715, 3001, 5252, 9191, 12064, 3001, 5252, 9191, 12064, 21111, 5252, 6805, 12064, 21111, 36945, 6805, 12064, 21111, 36945, 64653, 12064, 21111, 36945, 64653, 113144],
    '2H_SOUL': [1715, 3001, 5252, 9191, 16085, 3001, 5252, 9191, 16085, 28148, 5252, 9073, 16085, 28148, 49260, 9073, 16085, 28148, 49260, 86205, 16085, 28148, 49260, 86205, 150858],
    '2H_RELIC': [1715, 3001, 5252, 9191, 16085, 3001, 5252, 9191, 16085, 28148, 5252, 9073, 16085, 28148, 49260, 9073, 16085, 28148, 49260, 86205, 16085, 28148, 49260, 86205, 150858],
    ARMOR: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    ARMOR_RUNE: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    ARMOR_SOUL: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    ARMOR_RELIC: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    ARMOR_AVALON: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    HEAD: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    HEAD_RUNE: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    HEAD_SOUL: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    HEAD_RELIC: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    HEAD_AVALON: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    CAPE: [429, 751, 1313, 2298, 4021, 751, 1313, 2298, 4021, 7037, 1313, 2298, 4021, 7037, 12315, 2298, 4021, 7037, 12315, 21551, 4021, 7037, 12315, 21551, 37715],
    BAG: [858, 1501, 2626, 4596, 8042, 1501, 2626, 4596, 8042, 14074, 2626, 4596, 8042, 14074, 24630, 4596, 8042, 14074, 24630, 43102, 8042, 14074, 24630, 43102, 75429],
    CRYSTAL_2H: [1715, 3001, 5252, 9191, 16085, 3001, 5252, 9191, 16085, 28148, 5252, 9191, 16085, 28148, 49260, 9191, 16085, 28148, 49260, 86205, 16085, 28148, 49260, 86205, 150858],
    CRYSTAL_1H: [1286, 2251, 3939, 6893, 12064, 2251, 3939, 6893, 12064, 21111, 3939, 6805, 12064, 21111, 36945, 6805, 12064, 21111, 36945, 64653, 12064, 21111, 36945, 64653, 113144]
  },

  FAME_PER_CRAFT: [540, 1080, 2160, 4320, 8640, 2160, 4320, 8640, 17280, 34560, 6480, 12960, 25920, 51840, 103680, 15480, 30960, 61920, 123840, 247680, 33480, 66960, 133920, 267840, 535680],

  FAME_PER_JOURNAL: { 4: 3600, 5: 7200, 6: 14400, 7: 28380, 8: 58590 },

  JOURNAL_EMPTY_PRICE: { 4: 2312, 5: 4624, 6: 9248, 7: 18496, 8: 36992 },

  JOURNAL_TYPE: {
    'Espadas': 'WARRIOR', 'Hachas': 'WARRIOR', 'Mazas': 'WARRIOR', 'Martillos': 'WARRIOR',
    'Guantes de Guerra': 'WARRIOR', 'Ballestas': 'WARRIOR', 'Escudos': 'WARRIOR',
    'Arcos': 'HUNTER', 'Dagas': 'HUNTER', 'Lanzas': 'HUNTER', 'Varas': 'HUNTER',
    'Cambiaformas': 'HUNTER', 'Bastones Naturales': 'HUNTER', 'Antorchas': 'HUNTER',
    'Bastones Sagrados': 'MAGE', 'Bastones de Fuego': 'MAGE', 'Bastones de Hielo': 'MAGE',
    'Bastones Arcanos': 'MAGE', 'Bastones Malditos': 'MAGE', 'Libros de Hechizos': 'MAGE',
    'Armaduras de Placa': 'WARRIOR', 'Armaduras de Cuero': 'HUNTER', 'Armaduras de Tela': 'MAGE',
    'Cascos de Placa': 'WARRIOR', 'Cascos de Cuero': 'HUNTER', 'Cascos de Tela': 'MAGE',
    'Zapatos de Placa': 'WARRIOR', 'Zapatos de Cuero': 'HUNTER', 'Zapatos de Tela': 'MAGE',
    'Bolsas': 'TOOLMAKER', 'Capas': 'TOOLMAKER'
  },

  stationFee: 300,
  sellCity: 'Caerleon',
  buyMode: 'sell',

  init() {
    this.stationFeeInput = document.getElementById('station-fee');
    this.premiumCheck = document.getElementById('premium');
    this.focoCheck = document.getElementById('foco');
    this.diariosCheck = document.getElementById('diarios');
    this.sellCitySelect = document.getElementById('sell-city');
    this.buyModeBtns = document.querySelectorAll('.buy-mode-btn');

    if (this.stationFeeInput) {
      this.stationFeeInput.addEventListener('input', () => {
        this.stationFee = parseFloat(this.stationFeeInput.value) || 0;
        this.calculateAll();
      });
      this.stationFee = parseFloat(this.stationFeeInput.value) || 300;
    }

    if (this.sellCitySelect) {
      this.sellCitySelect.addEventListener('change', () => {
        this.sellCity = this.sellCitySelect.value;
        this.calculateAll();
      });
      this.sellCity = this.sellCitySelect.value;
    }

    this.buyModeBtns.forEach(btn => btn.addEventListener('click', () => {
      this.buyModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.buyMode = btn.dataset.mode;
      this.calculateAll();
    }));

    if (this.premiumCheck) this.premiumCheck.addEventListener('change', () => this.calculateAll());
    if (this.focoCheck) this.focoCheck.addEventListener('change', () => this.calculateAll());
    if (this.diariosCheck) this.diariosCheck.addEventListener('change', () => this.calculateAll());

    document.querySelectorAll('.cant-input').forEach(input => input.addEventListener('input', () => this.calculateAll()));

    document.getElementById('craft-item')?.addEventListener('change', () => setTimeout(() => this.calculateAll(), 500));
    document.getElementById('craft-category')?.addEventListener('change', () => setTimeout(() => this.calculateAll(), 500));
    document.getElementById('btn-specs')?.addEventListener('click', () => setTimeout(() => this.calculateAll(), 1500));

    setTimeout(() => this.calculateAll(), 2000);
    console.log('✅ Profit inicializado');
  },

  getRRR() {
    const el = document.getElementById('rrr');
    return el ? parseFloat(el.value) / 100 : 0.152;
  },

  getItemValueColumn(itemData, index) {
    const id = itemData.id;
    const cat = Items.cat.value;
    const is2H = id.includes('2H');

    if (['Espadas', 'Hachas', 'Mazas', 'Martillos', 'Lanzas', 'Dagas', 'Arcos', 'Ballestas', 'Guantes de Guerra', 'Varas', 'Cambiaformas', 'Bastones Naturales', 'Bastones de Fuego', 'Bastones Sagrados', 'Bastones Arcanos', 'Bastones de Hielo', 'Bastones Malditos'].includes(cat)) {
      if (index < 3) return is2H ? '2H' : 'MAIN';
      if (index === 3) return is2H ? '2H_RUNE' : 'MAIN_RUNE';
      if (index === 4) return is2H ? '2H_SOUL' : 'MAIN_SOUL';
      if (index === 5) return '2H_RELIC';
      if (index === 6) return is2H ? 'CRYSTAL_2H' : 'CRYSTAL_1H';
      if (index === 7) return is2H ? 'CRYSTAL_2H' : 'CRYSTAL_1H';
    }

    if (['Escudos', 'Antorchas', 'Libros de Hechizos'].includes(cat)) {
      if (index === 0) return 'MAIN';
      if (index === 1) return 'MAIN_RUNE';
      if (index === 2) return 'MAIN_SOUL';
      if (index === 3) return '2H_RELIC';
      if (index >= 4) return 'CRYSTAL_1H';
    }

    if (cat.includes('Armaduras')) {
      if (index < 3) return 'ARMOR';
      if (index === 3 || index === 4) return 'ARMOR_RUNE';
      if (index === 5) return 'ARMOR_SOUL';
      if (index === 6 || index === 7) return 'ARMOR_RELIC';
      if (index === 8) return 'ARMOR_AVALON';
    }

    if (cat.includes('Cascos') || cat.includes('Zapatos')) {
      if (index < 3) return 'HEAD';
      if (index === 3 || index === 4) return 'HEAD_RUNE';
      if (index === 5) return 'HEAD_SOUL';
      if (index === 6 || index === 7) return 'HEAD_RELIC';
      if (index === 8) return 'HEAD_AVALON';
    }

    if (cat === 'Bolsas') return 'BAG';
    if (cat === 'Capas') return 'CAPE';
    return 'MAIN';
  },

  getPrice(bestPrice) {
    return this.buyMode === 'sell' ? (bestPrice.sell || 0) : (bestPrice.buy || 0);
  },

  getEffectiveCrafts: function(cantidad, rrr, materialesPorItem) {
    let totalCrafts = Math.floor(cantidad / materialesPorItem);
    let recursosDevueltos = Math.floor(totalCrafts * materialesPorItem * rrr);

    while (recursosDevueltos >= materialesPorItem) {
      const craftsExtra = Math.floor(recursosDevueltos / materialesPorItem);
      totalCrafts += craftsExtra;
      recursosDevueltos = Math.floor(craftsExtra * materialesPorItem * rrr);
    }

    return { totalCrafts, sobrantes: recursosDevueltos };
  },

  getFocusSpecialization(itemIndex, cat) {
    const s = JSON.parse(localStorage.getItem('albion-specs') || '{}');
    const catData = s[cat] || { mastery: 0, items: {} };
    let totalSpec = 0;

    // Maestría: +30 por nivel
    totalSpec += (catData.mastery || 0) * 30;

    // Especificaciones de items
    const items = Items.data[cat] || [];
    const isOffhand = ['Escudos', 'Antorchas', 'Libros de Hechizos'].includes(cat);
    const isArmor = cat.includes('Armaduras') || cat.includes('Cascos') || cat.includes('Zapatos');

    items.forEach((item, i) => {
      const lvl = catData.items[item.nombre] || 0;
      if (lvl === 0) return;

      let bonoRama = 0;

      if (isOffhand) {
        // Offhands
        if (i === 0) bonoRama = 90;        // plano
        else if (i <= 4) bonoRama = 15;     // runa, alma, reliquia, avalon
        else bonoRama = 2.15;               // crystal
      } else if (isArmor) {
        // Armaduras, cascos, zapatos
        if (i <= 2) bonoRama = 30;          // planos
        else bonoRama = 15;                  // runa, alma, reliquia, avalon, niebla
      } else {
        // Armas
        if (i <= 2) bonoRama = 30;          // planos
        else if (i <= 6) bonoRama = 15;     // runa, alma, reliquia, avalon
        else bonoRama = 2.15;               // crystal
      }

      totalSpec += lvl * bonoRama;
    });

    // Bono individual del item específico: +250 por nivel
    const itemSpec = catData.items[items[itemIndex]?.nombre] || 0;
    totalSpec += itemSpec * 250;

    return totalSpec;
  },

  calculateAll() {
    const cat = Items.cat.value;
    const itemName = Items.item.value;
    if (!cat || !itemName) return;

    const itemData = Items.data[cat]?.find(i => i.nombre === itemName);
    if (!itemData?.id) return;

    const recipe = Prices.recipes[itemData.id.replace('T8_', '')];
    if (!recipe) return;

    const saved = JSON.parse(localStorage.getItem('albion-prices') || '{}');
    const premium = this.premiumCheck?.checked || false;
    const usarFoco = this.focoCheck?.checked || false;
    const llenarDiarios = this.diariosCheck?.checked || false;
    const taxRate = premium ? 0.065 : 0.105;
    const rrrValue = this.getRRR();
    const journalType = this.JOURNAL_TYPE[cat] || 'WARRIOR';

    const itemIndex = Items.data[cat]?.findIndex(i => i.nombre === itemName) || 0;
    const column = this.getItemValueColumn(itemData, itemIndex);

    Prices.TIERS.forEach((tier, tierIdx) => {
      Prices.ENCHANTS.forEach((ench, enchIdx) => {
        const rowIndex = tierIdx * 5 + enchIdx;
        const itemId = itemData.id.replace('T8_', `T${tier}_`) + ench;

        const group = document.querySelector(`.tier-group[data-tier="T${tier}"]`);
        if (!group) return;

        let targetRow;
        if (enchIdx === 0) {
          targetRow = group.querySelector('.main-row');
        } else {
          const subRows = group.querySelectorAll('.sub-row');
          targetRow = subRows[enchIdx - 1];
        }
        if (!targetRow) return;

        const cantidad = parseInt(targetRow.querySelector('.cant-input')?.value) || 1;

        const bestPrice = Format.getBestPrice(itemId, this.sellCity, saved);
        const precioVenta = bestPrice.sell || 0;

        let costoCrafteo = 0;
        let maxCraftsExtras = Infinity;
        let valorSobrantesTotal = 0;
        const recursos = [recipe.material1, recipe.material2].filter(Boolean);

        recursos.forEach(r => {
          const enchSuffix = ench ? `_LEVEL${ench.replace('@', '')}${ench}` : '';
          const matId = `T${tier}_${r.id}${enchSuffix}`;
          const city = Prices.REFINE[r.id] || 'Caerleon';
          const matPrice = Format.getBestPrice(matId, city, saved);
          const matPrecio = this.getPrice(matPrice);
          const matCantidad = r.cantidad || 1;

          const totalNecesario = matCantidad * cantidad;
          const { totalCrafts, sobrantes } = this.getEffectiveCrafts(totalNecesario, rrrValue, matCantidad);
          const craftsExtras = totalCrafts - cantidad;

          if (craftsExtras < maxCraftsExtras) maxCraftsExtras = craftsExtras;

          costoCrafteo += matPrecio * totalNecesario;
          valorSobrantesTotal += sobrantes * matPrecio;
        });

        // Actualizar lista de compras
        if (typeof Shopping !== 'undefined' && Shopping.update) {
          Shopping.update();
        }

        if (recipe.artefacto) {
          const artId = `T${tier}_${recipe.artefacto.id}`;
          const artPrice = Format.getBestPrice(artId, 'Caerleon', saved);
          costoCrafteo += this.getPrice(artPrice);
        }

        const impuesto = Math.round(precioVenta * cantidad * taxRate);

        const valorObjeto = this.ITEM_VALUES[column]?.[rowIndex] || 0;
        const costoNutricion = Math.round(0.1125 * valorObjeto * cantidad * (this.stationFee / 100));

        const famaPorItem = this.FAME_PER_CRAFT[rowIndex] || 0;
        const famaNecesaria = this.FAME_PER_JOURNAL[tier] || 999999;
        const diariosExactos = (cantidad * famaPorItem) / famaNecesaria;
        const diariosALlenar = Math.ceil(diariosExactos);
        const diarioVacioPrecio = this.JOURNAL_EMPTY_PRICE[tier] || 0;
        const diarioLlenoId = `T${tier}_JOURNAL_${journalType}_FULL`;
        const diarioLlenoData = saved[diarioLlenoId];
        let diarioLlenoPrecio = 0;
        if (diarioLlenoData) {
          const prices = Format.getPrices(diarioLlenoData);
          const bestSell = prices.filter(p => p.sell_price_min > 0).sort((a, b) => a.sell_price_min - b.sell_price_min)[0];
          if (bestSell) diarioLlenoPrecio = bestSell.sell_price_min;
        }
        const gananciaPorDiario = diarioLlenoPrecio - diarioVacioPrecio;

        costoCrafteo += diarioVacioPrecio * diariosALlenar;

        const costoTotal = costoCrafteo + impuesto + costoNutricion;

        let diariosTexto = '<span style="font-size:0.7rem;opacity:0.7;">(0)</span><br>0';
        let gananciaDiarios = 0;

        if (cantidad > 0 && llenarDiarios) {
          gananciaDiarios = Math.round(diariosExactos * gananciaPorDiario);
          diariosTexto = `<span style="font-size:0.7rem;opacity:0.7;">(${diariosExactos.toFixed(1)})</span><br>${gananciaDiarios.toLocaleString()}`;
        }

        const craftsTotales = cantidad + (maxCraftsExtras === Infinity ? 0 : maxCraftsExtras);
        const ingresoTotal = (precioVenta * craftsTotales) + gananciaDiarios + valorSobrantesTotal;
        const profit = ingresoTotal - costoTotal;
        const profitPct = costoTotal > 0 ? ((profit / costoTotal) * 100).toFixed(1) : '0.0';
        let costoFoco = 0;
        if (usarFoco) {
          const focusBase = this.FOCUS_BASE[column]?.[rowIndex] || 0;
          const focusSpec = this.getFocusSpecialization(itemIndex, cat);
          costoFoco = Math.round(focusBase / Math.pow(2, focusSpec / 10000));
        }

        const cells = targetRow.querySelectorAll('td');
        if (cells.length >= 8) {
          cells[1].textContent = precioVenta ? precioVenta.toLocaleString() : '-';
          cells[2].innerHTML = diariosTexto;
          cells[2].style.textAlign = 'center';
          cells[2].style.verticalAlign = 'middle';
          cells[3].textContent = impuesto.toLocaleString();
          cells[4].textContent = costoNutricion.toLocaleString();
          cells[5].textContent = costoCrafteo.toLocaleString();
          cells[6].innerHTML = `${profit.toLocaleString()}<br><span style="font-size:0.7rem;opacity:0.7;">${profitPct}%</span>`;
          cells[6].style.textAlign = 'center';
          cells[6].style.verticalAlign = 'middle';
          cells[6].style.color = profit >= 0 ? 'var(--green-profit)' : 'var(--red-stale)';
          const costoFocoTotal = costoFoco * craftsTotales;
          cells[7].textContent = costoFocoTotal ? costoFocoTotal.toLocaleString() : '-';
        }
      });
    });
  }
};