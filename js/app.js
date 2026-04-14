// ═══════════════════════════════════════════
//  ShelbyAI — App Controller
// ═══════════════════════════════════════════

const App = {

  currentPage: 'marketplace',
  reads: [],
  blockNum: 14829401,

  async init() {
    await Storage.seed();
    this.showPage('marketplace');
    this.setupListeners();
    this.startBlockCounter();
    this.startLiveReadFeed();
    console.log('%c🤖 ShelbyAI loaded', 'color:#6366f1;font-size:14px;font-weight:bold');
  },

  // ── Navigation ────────────────────────
  showPage(page) {
    this.currentPage = page;
    Utils.$$('.page').forEach(p => p.classList.remove('active'));
    Utils.$$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

    const target = Utils.$('page-' + page);
    if (target) target.classList.add('active');

    switch(page) {
      case 'marketplace': Marketplace.init(); break;
      case 'upload':      Upload.init();       break;
      case 'earnings':    Earnings.init();      break;
      case 'reads':       this.renderReadsPage(); break;
    }
  },

  setupListeners() {
    Utils.$$('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.showPage(btn.dataset.page));
    });

    // Search
    const search = Utils.$('dsSearch');
    if (search) {
      search.addEventListener('input', () => Marketplace.setSearch(search.value));
    }

    // Sort
    const sort = Utils.$('dsSort');
    if (sort) {
      sort.addEventListener('change', () => Marketplace.setSort(sort.value));
    }
  },

  // ── Record a read ─────────────────────
  recordRead(dataset, result) {
    this.reads.unshift({
      dataset: dataset.name,
      category: dataset.category,
      latency: result.latency,
      chunks: result.chunksRead,
      nodes: result.nodesHit,
      cost: result.cost,
      tx: result.tx,
      blobAddress: result.blobAddress,
      timestamp: result.timestamp,
    });
    if (this.reads.length > 50) this.reads.pop();
    this.updateReadBadge();
  },

  updateReadBadge() {
    const badge = Utils.$('readsBadge');
    if (badge) badge.textContent = this.reads.length;
  },

  // ── Live read feed ────────────────────
  startLiveReadFeed() {
    const datasets = Storage.getDatasets();
    if (!datasets.length) return;

    setInterval(() => {
      if (Math.random() > 0.6) return;
      const d = datasets[Utils.rand(0, datasets.length)];
      this.recordRead(d, {
        latency: Utils.rand(8, 28) + 'ms',
        chunksRead: Utils.rand(10, 48),
        nodesHit: Utils.rand(3, 9),
        cost: d.pricePerRead,
        tx: Utils.fakeTx(),
        blobAddress: d.blobAddress,
        timestamp: new Date().toISOString(),
      });
      if (this.currentPage === 'reads') this.renderReadsPage();
    }, 3200);
  },

  // ── Reads page ────────────────────────
  renderReadsPage() {
    const container = Utils.$('readsFeed');
    if (!container) return;

    if (!this.reads.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📡</div>
          <div class="empty-title">No reads yet</div>
          <div class="empty-sub">Purchase and access datasets to see live reads here</div>
        </div>`;
      return;
    }

    container.innerHTML = this.reads.map(r => `
      <div class="read-item">
        <div class="read-top">
          <div class="read-left">
            <span class="read-cat" style="color:${Utils.catColor(r.category)}">
              ${Utils.catIcon(r.category)} ${r.category}
            </span>
            <span class="read-name">${r.dataset.slice(0, 45)}${r.dataset.length > 45 ? '…' : ''}</span>
          </div>
          <div class="read-latency ${parseInt(r.latency) < 15 ? 'fast' : ''}">${r.latency}</div>
        </div>
        <div class="read-details">
          <span class="read-chip">⚡ ${r.chunks} chunks</span>
          <span class="read-chip">🌐 ${r.nodes} nodes</span>
          <span class="read-chip">💰 ${Utils.usd(r.cost)}</span>
          <span class="read-chip">🕐 ${Utils.timeAgo(r.timestamp)}</span>
        </div>
        <div class="read-tx">Tx: ${r.tx.slice(0, 28)}…</div>
      </div>`).join('');

    // Stats
    const totalCost = this.reads.reduce((s, r) => s + r.cost, 0);
    const avgLatency = this.reads.length
      ? Math.round(this.reads.reduce((s, r) => s + parseInt(r.latency), 0) / this.reads.length)
      : 0;

    const set = (id, v) => { const el = Utils.$(id); if (el) el.textContent = v; };
    set('readsTotal',      this.reads.length);
    set('readsTotalCost',  Utils.usd2(totalCost));
    set('readsAvgLatency', avgLatency + 'ms');
    set('readsNodes',      '16');
  },

  // ── Block counter ─────────────────────
  startBlockCounter() {
    setInterval(() => {
      this.blockNum += Utils.rand(1, 3);
      const el = Utils.$('blockNum');
      if (el) el.textContent = this.blockNum.toLocaleString();
    }, 3000);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
