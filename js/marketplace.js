// ═══════════════════════════════════════════
//  ShelbyAI — Marketplace Module
//  Browse, filter, and purchase AI datasets
// ═══════════════════════════════════════════

const Marketplace = {

  datasets: [],
  activeCategory: 'All',
  activeSort: 'popular',
  searchQuery: '',
  detailDataset: null,

  // ── Load & render ─────────────────────
  async init() {
    this.datasets = Storage.getDatasets();
    this.render();
  },

  getFiltered() {
    let list = [...this.datasets];

    if (this.activeCategory !== 'All') {
      list = list.filter(d => d.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q))
      );
    }

    const sorts = {
      popular:  (a, b) => b.totalReads - a.totalReads,
      earnings: (a, b) => b.totalEarnings - a.totalEarnings,
      newest:   (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate),
      price:    (a, b) => a.pricePerRead - b.pricePerRead,
      rating:   (a, b) => b.rating - a.rating,
    };

    return list.sort(sorts[this.activeSort] || sorts.popular);
  },

  render() {
    this.renderStats();
    this.renderCategories();
    this.renderGrid();
  },

  renderStats() {
    const all = this.datasets;
    const totalReads    = all.reduce((s, d) => s + d.totalReads, 0);
    const totalEarnings = all.reduce((s, d) => s + d.totalEarnings, 0);

    const set = (id, v) => { const el = Utils.$(id); if (el) el.textContent = v; };
    set('mktDatasets', all.length);
    set('mktReads',    Utils.compact(totalReads));
    set('mktEarnings', Utils.usd2(totalEarnings));
    set('mktContributors', [...new Set(all.map(d => d.contributor))].length);
  },

  renderCategories() {
    const cats = ['All', ...new Set(this.datasets.map(d => d.category))];
    const wrap = Utils.$('catTabs');
    if (!wrap) return;
    wrap.innerHTML = cats.map(c => `
      <button class="cat-tab ${c === this.activeCategory ? 'active' : ''}"
        onclick="Marketplace.setCategory('${c}')">
        ${c === 'All' ? '🌐' : Utils.catIcon(c)} ${c}
      </button>
    `).join('');
  },

  renderGrid() {
    const grid = Utils.$('datasetGrid');
    if (!grid) return;
    const list = this.getFiltered();

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No datasets found</div>
          <div class="empty-sub">Try a different category or search term</div>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(d => this.cardHTML(d)).join('');
  },

  cardHTML(d) {
    const color   = Utils.catColor(d.category);
    const bought  = Storage.hasPurchased(d.id);
    const earning = (d.pricePerRead * d.totalReads).toFixed(2);

    return `
      <div class="ds-card" onclick="Marketplace.openDetail('${d.id}')">
        <div class="ds-card-top" style="border-color:${color}44">
          <div class="ds-badge-row">
            <span class="ds-cat-badge" style="background:${color}18;color:${color};border-color:${color}33">
              ${Utils.catIcon(d.category)} ${d.category}
            </span>
            ${d.badge ? `<span class="ds-special-badge">${d.badge} ${d.badgeLabel}</span>` : ''}
            ${bought ? `<span class="ds-owned-badge">✓ Owned</span>` : ''}
          </div>
          <div class="ds-name">${d.name}</div>
          <div class="ds-desc">${d.description.slice(0, 110)}…</div>
          <div class="ds-tags">
            ${d.tags.slice(0, 4).map(t => `<span class="ds-tag">#${t}</span>`).join('')}
          </div>
        </div>
        <div class="ds-card-body">
          <div class="ds-meta-row">
            <div class="ds-meta-item">
              <span class="ds-meta-val">${Utils.compact(d.records)}</span>
              <span class="ds-meta-lbl">records</span>
            </div>
            <div class="ds-meta-item">
              <span class="ds-meta-val">${d.size}</span>
              <span class="ds-meta-lbl">size</span>
            </div>
            <div class="ds-meta-item">
              <span class="ds-meta-val">${d.format}</span>
              <span class="ds-meta-lbl">format</span>
            </div>
          </div>
          <div class="ds-footer">
            <div class="ds-contributor">
              <div class="ds-avatar">${d.contributor[2].toUpperCase()}</div>
              <span>${d.contributor} ${d.contributorFlag}</span>
            </div>
            <div class="ds-price-wrap">
              <div class="ds-price">${Utils.usd(d.pricePerRead)}</div>
              <div class="ds-price-lbl">per read</div>
            </div>
          </div>
          <div class="ds-stats-row">
            <span class="ds-stat">📡 ${Utils.compact(d.totalReads)} reads</span>
            <span class="ds-stat">⭐ ${d.rating}</span>
            <span class="ds-stat">💰 $${earning}</span>
          </div>
        </div>
      </div>`;
  },

  // ── Detail modal ──────────────────────
  openDetail(id) {
    const d = this.datasets.find(x => x.id === id);
    if (!d) return;
    this.detailDataset = d;
    const color  = Utils.catColor(d.category);
    const bought = Storage.hasPurchased(d.id);

    Utils.$('modalBody').innerHTML = `
      <div class="detail-hero" style="border-bottom:3px solid ${color}">
        <div class="detail-badges">
          <span class="ds-cat-badge" style="background:${color}18;color:${color};border-color:${color}33">
            ${Utils.catIcon(d.category)} ${d.category}
          </span>
          ${d.badge ? `<span class="ds-special-badge">${d.badge} ${d.badgeLabel}</span>` : ''}
        </div>
        <div class="detail-name">${d.name}</div>
        <div class="detail-desc">${d.description}</div>
        <div class="detail-contributor">
          <div class="ds-avatar">${d.contributor[2].toUpperCase()}</div>
          <div>
            <div class="detail-contrib-name">${d.contributor} ${d.contributorFlag}</div>
            <div class="detail-contrib-date">Uploaded ${Utils.fmtDate(d.uploadDate)}</div>
          </div>
          <div class="detail-rating">
            <span class="stars">${Utils.stars(d.rating)}</span>
            <span class="rating-val">${d.rating} (${d.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-box">
          <div class="detail-box-label">Records</div>
          <div class="detail-box-val">${Utils.compact(d.records)}</div>
        </div>
        <div class="detail-box">
          <div class="detail-box-label">Size</div>
          <div class="detail-box-val">${d.size}</div>
        </div>
        <div class="detail-box">
          <div class="detail-box-label">Format</div>
          <div class="detail-box-val">${d.format}</div>
        </div>
        <div class="detail-box">
          <div class="detail-box-label">Price / read</div>
          <div class="detail-box-val accent">${Utils.usd(d.pricePerRead)}</div>
        </div>
        <div class="detail-box">
          <div class="detail-box-label">Total reads</div>
          <div class="detail-box-val">${Utils.compact(d.totalReads)}</div>
        </div>
        <div class="detail-box">
          <div class="detail-box-label">Total earned</div>
          <div class="detail-box-val green">$${(d.pricePerRead * d.totalReads).toFixed(2)}</div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">📋 Data Preview (3 samples)</div>
        <div class="preview-list">
          ${d.preview.map(p => `<div class="preview-item">${p}</div>`).join('')}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">🔗 Shelby Blob Address</div>
        <div class="blob-display" onclick="Utils.copyText('${d.blobAddress}', 'Blob address copied!')">
          ${d.blobAddress}
          <span class="blob-copy">copy</span>
        </div>
        <div class="merkle-display">
          <span class="merkle-label">Merkle root:</span>
          <span class="merkle-val">${d.merkleRoot.slice(0, 42)}…</span>
        </div>
        <div class="chain-chips">
          <span class="chain-chip">Block #${d.aptosBlock.toLocaleString()}</span>
          <span class="chain-chip">16 nodes</span>
          <span class="chain-chip">Clay 10+6</span>
          <span class="chain-chip">Aptos verified</span>
        </div>
      </div>

      <div class="detail-tags">
        ${d.tags.map(t => `<span class="ds-tag">#${t}</span>`).join('')}
      </div>

      <div class="detail-actions">
        ${bought
          ? `<button class="btn-access" onclick="Marketplace.accessDataset('${d.id}')">
               ⚡ Access Dataset (Read from Shelby)
             </button>`
          : `<button class="btn-buy" onclick="Marketplace.buyDataset('${d.id}')">
               🔓 Purchase Access — ${Utils.usd(d.pricePerRead)}/read
             </button>`
        }
        <button class="btn-preview" onclick="Marketplace.previewDataset('${d.id}')">
          👁️ Free Preview
        </button>
      </div>`;

    Utils.$('modalBackdrop').classList.add('open');
  },

  // ── Buy ───────────────────────────────
  async buyDataset(id) {
    const d = this.datasets.find(x => x.id === id);
    if (!d) return;

    const btn = document.querySelector('.btn-buy');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing…'; }

    await Utils.sleep(1200);

    Storage.addPurchase({
      datasetId: d.id,
      datasetName: d.name,
      pricePaid: d.pricePerRead,
      tx: Utils.fakeTx(),
      timestamp: new Date().toISOString(),
      blobAddress: d.blobAddress,
    });

    Utils.toast(`✓ Access granted to "${d.name}"!`);
    this.renderGrid();
    this.openDetail(id);
  },

  // ── Access (pay-per-read) ─────────────
  async accessDataset(id) {
    const d = this.datasets.find(x => x.id === id);
    if (!d) return;

    const btn = document.querySelector('.btn-access');
    if (btn) { btn.disabled = true; btn.textContent = '⚡ Reading from Shelby nodes…'; }

    const result = await Storage.mockRead(d);

    // Show read result
    if (btn) {
      btn.disabled = false;
      btn.textContent = `✓ Read complete — ${result.latency} · ${result.chunksRead} chunks · ${result.nodesHit} nodes`;
      btn.style.background = '#00e5a020';
      btn.style.borderColor = '#00e5a0';
      btn.style.color = '#00e5a0';
    }

    Utils.toast(`⚡ Read from Shelby in ${result.latency}!`);
    App.recordRead(d, result);
  },

  // ── Preview ───────────────────────────
  previewDataset(id) {
    const d = this.datasets.find(x => x.id === id);
    if (!d) return;
    Utils.toast(`Preview: "${d.preview[0].slice(0, 50)}…"`);
  },

  // ── Filters ───────────────────────────
  setCategory(cat) {
    this.activeCategory = cat;
    this.renderCategories();
    this.renderGrid();
  },

  setSort(sort) {
    this.activeSort = sort;
    this.renderGrid();
  },

  setSearch(q) {
    this.searchQuery = q;
    this.renderGrid();
  },

  closeModal() {
    Utils.$('modalBackdrop').classList.remove('open');
  }
};
