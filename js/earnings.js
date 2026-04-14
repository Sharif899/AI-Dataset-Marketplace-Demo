// ═══════════════════════════════════════════
//  ShelbyAI — Earnings Module
//  Contributor earnings dashboard
// ═══════════════════════════════════════════

const Earnings = {

  liveInterval: null,

  init() {
    this.render();
    this.startLiveFeed();
  },

  render() {
    this.renderSummary();
    this.renderHistory();
    this.renderChart();
    this.renderTopDatasets();
  },

  renderSummary() {
    const e = Storage.getEarnings();
    const uploads = Storage.getUploads();

    // Seed some earnings from sample datasets
    const sampleEarnings = 580.50;
    const total = (e.total || 0) + sampleEarnings;
    const reads  = (e.reads || 0) + 148151;

    const set = (id, v) => { const el = Utils.$(id); if (el) el.textContent = v; };
    set('earnTotal',    Utils.usd2(total));
    set('earnToday',    Utils.usd2(e.today || 0));
    set('earnReads',    Utils.compact(reads));
    set('earnDatasets', uploads.length + ' uploaded');
  },

  renderHistory() {
    const container = Utils.$('earningsHistory');
    if (!container) return;
    const e = Storage.getEarnings();

    if (!e.history || !e.history.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <div class="empty-title">No earnings yet</div>
          <div class="empty-sub">Upload datasets and earnings appear here as reads happen</div>
        </div>`;
      return;
    }

    container.innerHTML = e.history.map(h => `
      <div class="earn-item">
        <div class="earn-icon">⚡</div>
        <div class="earn-info">
          <div class="earn-name">${h.datasetName}</div>
          <div class="earn-meta">Read · Tx: ${h.tx.slice(0, 18)}… · ${Utils.timeAgo(h.timestamp)}</div>
        </div>
        <div class="earn-amount">+${Utils.usd(h.amount)}</div>
      </div>`).join('');
  },

  renderChart() {
    const canvas = Utils.$('earningsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth  * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, W, H);

    // Generate fake daily earnings data
    const days = 14;
    const data = Array.from({ length: days }, (_, i) => ({
      day: i,
      amount: 15 + Math.random() * 60 + (i > 10 ? 30 : 0),
    }));

    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map(d => d.amount)) * 1.2;
    const barW   = (chartW / days) * 0.6;
    const gap    = chartW / days;

    // Grid
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
      const y = pad.top + chartH * (1 - pct);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#2a4060';
      ctx.font = `${W * 0.025}px Outfit`;
      ctx.textAlign = 'right';
      ctx.fillText('$' + (maxVal * pct).toFixed(0), pad.left - 6, y + 4);
    });

    // Bars
    data.forEach((d, i) => {
      const x    = pad.left + i * gap + (gap - barW) / 2;
      const barH = (d.amount / maxVal) * chartH;
      const y    = pad.top + chartH - barH;

      const isToday = i === days - 1;
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (isToday) {
        grad.addColorStop(0, '#00e5a0');
        grad.addColorStop(1, '#00e5a044');
      } else {
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#6366f144');
      }

      ctx.fillStyle = grad;
      const r = Math.min(barW * 0.25, 8);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Label
      if (i % 2 === 0 || isToday) {
        ctx.fillStyle = isToday ? '#00e5a0' : '#2a4060';
        ctx.font = `${W * 0.028}px Outfit`;
        ctx.textAlign = 'center';
        ctx.fillText(isToday ? 'Today' : 'Day ' + (i + 1), x + barW / 2, pad.top + chartH + 30);
      }
    });
  },

  renderTopDatasets() {
    const container = Utils.$('topDatasets');
    if (!container) return;
    const datasets = Storage.getDatasets()
      .sort((a, b) => (b.pricePerRead * b.totalReads) - (a.pricePerRead * a.totalReads))
      .slice(0, 5);

    const maxEarning = datasets[0] ? datasets[0].pricePerRead * datasets[0].totalReads : 1;

    container.innerHTML = datasets.map((d, i) => {
      const earned = d.pricePerRead * d.totalReads;
      const pct    = Math.round((earned / maxEarning) * 100);
      const color  = Utils.catColor(d.category);
      return `
        <div class="top-ds-item">
          <div class="top-ds-rank">${i + 1}</div>
          <div class="top-ds-info">
            <div class="top-ds-name">${d.name.slice(0, 40)}${d.name.length > 40 ? '…' : ''}</div>
            <div class="top-ds-bar-wrap">
              <div class="top-ds-bar" style="width:${pct}%;background:${color}"></div>
            </div>
          </div>
          <div class="top-ds-earned">$${earned.toFixed(2)}</div>
        </div>`;
    }).join('');
  },

  // ── Live earnings feed ─────────────────
  startLiveFeed() {
    clearInterval(this.liveInterval);
    this.liveInterval = setInterval(() => {
      if (App.currentPage !== 'earnings') return;

      const datasets = Storage.getDatasets();
      if (!datasets.length) return;

      const d = datasets[Utils.rand(0, datasets.length)];
      const earning = Storage.addEarning(d.pricePerRead, d.name);

      this.renderSummary();
      this.renderHistory();

      // Pulse earning counter
      const el = Utils.$('earnTotal');
      if (el) {
        el.style.color = '#00e5a0';
        setTimeout(() => { el.style.color = ''; }, 600);
      }
    }, 4500);
  }
};
