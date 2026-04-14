// ═══════════════════════════════════════════
//  ShelbyAI — Storage Service
// ═══════════════════════════════════════════

const Storage = {

  KEYS: {
    DATASETS:  'sai_datasets',
    PURCHASES: 'sai_purchases',
    EARNINGS:  'sai_earnings',
    UPLOADS:   'sai_uploads',
    READS:     'sai_reads',
  },

  // ── Generic ───────────────────────────
  save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e) { return false; }
  },

  load(key, fallback = null) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch(e) { return fallback; }
  },

  // ── Datasets ──────────────────────────
  getDatasets() { return this.load(this.KEYS.DATASETS, []); },
  saveDatasets(d) { return this.save(this.KEYS.DATASETS, d); },

  // ── Purchases ─────────────────────────
  getPurchases() { return this.load(this.KEYS.PURCHASES, []); },
  addPurchase(p) {
    const list = this.getPurchases();
    list.unshift(p);
    this.save(this.KEYS.PURCHASES, list);
  },

  hasPurchased(dsId) {
    return this.getPurchases().some(p => p.datasetId === dsId);
  },

  // ── Uploads (my datasets) ─────────────
  getUploads() { return this.load(this.KEYS.UPLOADS, []); },
  addUpload(u) {
    const list = this.getUploads();
    list.unshift(u);
    this.save(this.KEYS.UPLOADS, list);
  },

  // ── Earnings ──────────────────────────
  getEarnings() {
    return this.load(this.KEYS.EARNINGS, {
      total: 0, today: 0, thisWeek: 0, reads: 0, history: []
    });
  },

  addEarning(amount, datasetName) {
    const e = this.getEarnings();
    e.total    = (e.total || 0) + amount;
    e.today    = (e.today || 0) + amount;
    e.thisWeek = (e.thisWeek || 0) + amount;
    e.reads    = (e.reads || 0) + 1;
    e.history  = e.history || [];
    e.history.unshift({
      amount, datasetName,
      timestamp: new Date().toISOString(),
      tx: Utils.fakeTx(),
    });
    if (e.history.length > 50) e.history.pop();
    this.save(this.KEYS.EARNINGS, e);
    return e;
  },

  // ── Shelby mock upload ─────────────────
  async mockUpload(name, sizeMB) {
    await Utils.sleep(1000 + Math.random() * 800);
    return {
      blobAddress: Utils.fakeAddr() + '/shelbyai/' + name.toLowerCase().replace(/\s+/g, '-') + '/data.jsonl',
      merkleRoot:  Utils.fakeHash(),
      transaction: Utils.fakeTx(),
      aptosBlock:  Utils.fakeBlock(),
      timestamp:   new Date().toISOString(),
      chunks:      Math.max(16, Math.ceil(sizeMB) * 16),
      nodes:       16,
      size:        sizeMB.toFixed(1) + ' MB',
    };
  },

  // ── Shelby mock read (pay-per-read) ────
  async mockRead(dataset) {
    await Utils.sleep(Utils.rand(8, 22));
    return {
      success:     true,
      latency:     Utils.rand(8, 22) + 'ms',
      blobAddress: dataset.blobAddress,
      merkleRoot:  dataset.merkleRoot,
      chunksRead:  Utils.rand(10, 32),
      nodesHit:    Utils.rand(3, 8),
      cost:        dataset.pricePerRead,
      tx:          Utils.fakeTx(),
      timestamp:   new Date().toISOString(),
    };
  },

  // ── Seed ──────────────────────────────
  async seed() {
    if (this.getDatasets().length) return;
    try {
      const res = await fetch('data/datasets.json');
      const data = await res.json();
      this.saveDatasets(data.datasets);
    } catch(e) {
      console.warn('Could not seed datasets', e);
    }
  }
};
