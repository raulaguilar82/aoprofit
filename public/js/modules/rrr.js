// Tasa de retorno automática
const RRR = {
  BASE: { 'city-no-bonus': 15.2, 'city-bonus': 24.8, 'custom': 0.0 },
  current: 'city-no-bonus',
  bonus: 0,

  init() {
    this.input = document.getElementById('rrr');
    this.desc = document.getElementById('rrr-desc');
    this.foco = document.getElementById('foco');
    this.customGroup = document.getElementById('custom-rrr-group');
    this.customInput = document.getElementById('custom-rrr');

    document.querySelectorAll('.location-btn').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.location-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.current = b.dataset.location;
      this.customGroup.style.display = this.current === 'custom' ? 'block' : 'none';
      this.update();
    }));

    document.querySelectorAll('.bonus-btn').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.bonus-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.bonus = parseInt(b.dataset.bonus);
      this.update();
    }));

    this.customInput?.addEventListener('input', () => this.update());
    this.foco?.addEventListener('change', () => this.update());
    this.update();
  },

  update() {
    const R = this.current === 'custom' ? (parseFloat(this.customInput.value) || 0) / 100 : this.BASE[this.current] / 100;
    let B = R / (1 - R) + (this.bonus / 100);
    if (this.foco.checked) B += 0.59;
    this.input.value = ((B / (1 + B)) * 100).toFixed(1);
    this.desc.textContent = `Base: ${(R * 100).toFixed(1)}%${this.bonus > 0 ? ` + Bono: ${this.bonus}%` : ''}${this.foco.checked ? ' + Foco' : ''}`;
    
    if (typeof Profit !== 'undefined' && Profit.calculateAll && typeof Items !== 'undefined' && Items.cat?.value) {
      Profit.calculateAll();
    }
  }
};