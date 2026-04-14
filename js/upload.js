// ═══════════════════════════════════════════
//  ShelbyAI — Upload Module
//  Contributors upload AI datasets to Shelby
// ═══════════════════════════════════════════

const Upload = {

  currentFile: null,
  uploading: false,

  init() {
    this.setupDropzone();
    this.populateCategories();
    this.renderMyDatasets();
  },

  setupDropzone() {
    const zone = Utils.$('uploadZone');
    const input = Utils.$('fileInput');
    if (!zone || !input) return;

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.selectFile(file);
    });

    input.addEventListener('change', e => {
      if (e.target.files[0]) this.selectFile(e.target.files[0]);
    });
  },

  selectFile(file) {
    this.currentFile = file;
    const preview = Utils.$('filePreview');
    const placeholder = Utils.$('filePlaceholder');

    if (preview) {
      preview.innerHTML = `
        <div class="file-selected">
          <div class="file-icon">📦</div>
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-meta">${Utils.fmtSize(file.size)} · ${file.type || 'unknown type'}</div>
          </div>
          <div class="file-check">✓</div>
        </div>`;
      preview.style.display = 'block';
    }

    if (placeholder) placeholder.style.display = 'none';

    // Auto-detect format
    const ext = file.name.split('.').pop().toUpperCase();
    const formatInput = Utils.$('dsFormat');
    if (formatInput && ['JSONL', 'JSON', 'CSV', 'PARQUET', 'NPY', 'HDF5'].includes(ext)) {
      formatInput.value = ext;
    }

    Utils.toast(`File selected: ${file.name}`);
  },

  populateCategories() {
    const sel = Utils.$('dsCategory');
    if (!sel) return;
    const cats = ['Prompts', 'Embeddings', 'Fine-tuning', 'RLHF', 'Vision', 'Audio', 'Code', 'RAG'];
    sel.innerHTML = cats.map(c => `<option value="${c}">${Utils.catIcon(c)} ${c}</option>`).join('');
  },

  // ── Upload flow ───────────────────────
  async uploadDataset() {
    if (this.uploading) return;

    const name     = Utils.$('dsName')?.value.trim();
    const desc     = Utils.$('dsDesc')?.value.trim();
    const category = Utils.$('dsCategory')?.value;
    const price    = parseFloat(Utils.$('dsPrice')?.value);
    const records  = parseInt(Utils.$('dsRecords')?.value);
    const format   = Utils.$('dsFormat')?.value.trim();

    if (!name)   { Utils.toast('Dataset name required', 'error'); return; }
    if (!desc)   { Utils.toast('Description required', 'error'); return; }
    if (!price || price <= 0) { Utils.toast('Enter a valid price per read', 'error'); return; }
    if (!records || records <= 0) { Utils.toast('Enter number of records', 'error'); return; }

    const sizeMB = this.currentFile ? this.currentFile.size / (1024 * 1024) : Utils.rand(10, 500);

    this.uploading = true;
    const btn = Utils.$('uploadBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }

    this.showProgress(true);

    // Step 1 — chunk
    this.setStep(1, 'active');
    await Utils.sleep(600);
    this.setStep(1, 'done');

    // Step 2 — erasure code
    this.setStep(2, 'active');
    await Utils.sleep(700);
    this.setStep(2, 'done');

    // Step 3 — on-chain commit
    this.setStep(3, 'active');
    const proof = await Storage.mockUpload(name, sizeMB);
    this.setStep(3, 'done');

    // Step 4 — distribute
    this.setStep(4, 'active');
    await Utils.sleep(800);
    this.setStep(4, 'done');

    // Step 5 — verify
    this.setStep(5, 'active');
    await Utils.sleep(500);
    this.setStep(5, 'done');

    // Save
    const dataset = {
      id:           'ds-' + Date.now(),
      name,
      description:  desc,
      category,
      format:       format || 'JSONL',
      pricePerRead: price,
      records,
      size:         sizeMB.toFixed(1) + ' MB',
      contributor:  '0xninofi',
      contributorFlag: '🇳🇬',
      totalReads:   0,
      totalEarnings:0,
      rating:       0,
      reviews:      0,
      tags:         [category.toLowerCase(), format?.toLowerCase() || 'jsonl'],
      preview:      ['Sample record 1...', 'Sample record 2...', 'Sample record 3...'],
      uploadDate:   new Date().toISOString(),
      blobAddress:  proof.blobAddress,
      merkleRoot:   proof.merkleRoot,
      aptosBlock:   proof.aptosBlock,
      badge:        '🆕',
      badgeLabel:   'New',
    };

    Storage.addUpload(dataset);

    // Add to marketplace datasets
    const all = Storage.getDatasets();
    all.unshift(dataset);
    Storage.saveDatasets(all);
    Marketplace.datasets = all;

    this.showResult(proof, dataset);
    this.renderMyDatasets();

    this.uploading = false;
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Upload to Shelby'; }

    Utils.toast(`"${name}" is live on Shelby!`);
  },

  setStep(n, state) {
    const el = Utils.$('upStep-' + n);
    const st = Utils.$('upStatus-' + n);
    if (!el) return;
    el.className = 'up-step ' + state;
    if (st) st.textContent = { waiting: 'waiting', active: 'running…', done: '✓' }[state];
  },

  showProgress(show) {
    const p = Utils.$('uploadProgress');
    const r = Utils.$('uploadResult');
    if (p) p.style.display = show ? 'block' : 'none';
    if (r) r.style.display = 'none';
    if (show) [1,2,3,4,5].forEach(n => this.setStep(n, 'waiting'));
  },

  showResult(proof, dataset) {
    const r = Utils.$('uploadResult');
    if (!r) return;
    r.style.display = 'block';
    r.innerHTML = `
      <div class="result-header">
        <div class="result-icon">🎉</div>
        <div class="result-title">Dataset live on Shelby!</div>
        <div class="result-sub">Your data is now a pay-per-read asset earning with every access</div>
      </div>
      <div class="result-proof">
        <div class="result-field">
          <span class="result-field-label">Blob address</span>
          <span class="result-field-val accent" onclick="Utils.copyText('${proof.blobAddress}', 'Copied!')">${proof.blobAddress}</span>
        </div>
        <div class="result-field">
          <span class="result-field-label">Merkle root</span>
          <span class="result-field-val green">${proof.merkleRoot.slice(0, 42)}…</span>
        </div>
        <div class="result-chips">
          <span class="chain-chip">Block #${proof.aptosBlock.toLocaleString()}</span>
          <span class="chain-chip">${proof.chunks} chunks</span>
          <span class="chain-chip">${proof.nodes} nodes</span>
          <span class="chain-chip">${proof.size}</span>
        </div>
      </div>
      <div class="result-earning-preview">
        💰 At ${Utils.usd(dataset.pricePerRead)}/read, 1,000 reads = <strong>${Utils.usd2(dataset.pricePerRead * 1000)}</strong>
      </div>`;
  },

  // ── My datasets ───────────────────────
  renderMyDatasets() {
    const container = Utils.$('myDatasets');
    if (!container) return;
    const uploads = Storage.getUploads();

    if (!uploads.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📤</div>
          <div class="empty-title">No datasets uploaded yet</div>
          <div class="empty-sub">Upload your first dataset above to start earning</div>
        </div>`;
      return;
    }

    container.innerHTML = uploads.map(d => `
      <div class="my-dataset-item">
        <div class="my-ds-left">
          <span class="ds-cat-badge" style="background:${Utils.catColor(d.category)}18;color:${Utils.catColor(d.category)}">
            ${Utils.catIcon(d.category)} ${d.category}
          </span>
          <div class="my-ds-name">${d.name}</div>
          <div class="my-ds-meta">${d.records.toLocaleString()} records · ${d.size} · ${d.format}</div>
        </div>
        <div class="my-ds-right">
          <div class="my-ds-price">${Utils.usd(d.pricePerRead)}<span>/read</span></div>
          <div class="my-ds-reads">📡 ${Utils.compact(d.totalReads)} reads</div>
          <div class="my-ds-earned">💰 ${Utils.usd2(d.totalEarnings)} earned</div>
        </div>
      </div>`).join('');
  }
};
