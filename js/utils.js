// ═══════════════════════════════════════════
//  ShelbyAI — Utils
// ═══════════════════════════════════════════

const Utils = {

  // ── Format ────────────────────────────
  usd(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 }).format(amount);
  },

  usd2(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
  },

  compact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  },

  fmtSize(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  },

  timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  },

  fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  },

  // ── Crypto ────────────────────────────
  hex(n) { return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join(''); },
  fakeHash() { return '0x' + this.hex(64); },
  fakeAddr() { return '0x' + this.hex(8) + '...' + this.hex(4); },
  fakeTx()   { return '0x' + this.hex(16); },
  fakeBlock(){ return Math.floor(Math.random() * 2000000 + 14000000); },
  sleep(ms)  { return new Promise(r => setTimeout(r, ms)); },
  rand(a, b) { return Math.floor(Math.random() * (b - a) + a); },

  // ── DOM ───────────────────────────────
  $(id) { return document.getElementById(id); },
  $$(s)  { return document.querySelectorAll(s); },

  // ── Category color ────────────────────
  catColor(cat) {
    const map = {
      'Prompts':     '#6366f1',
      'Embeddings':  '#06b6d4',
      'Fine-tuning': '#f59e0b',
      'RLHF':        '#a855f7',
      'Vision':      '#ec4899',
      'Audio':       '#10b981',
      'Code':        '#f43f5e',
      'RAG':         '#3b82f6',
    };
    return map[cat] || '#64748b';
  },

  catIcon(cat) {
    const map = {
      'Prompts':     '💬',
      'Embeddings':  '🔢',
      'Fine-tuning': '🎯',
      'RLHF':        '🧠',
      'Vision':      '👁️',
      'Audio':       '🎵',
      'Code':        '💻',
      'RAG':         '📚',
    };
    return map[cat] || '📦';
  },

  // ── Toast ─────────────────────────────
  toast(msg, type = 'success') {
    const t = this.$('toast');
    const dot = this.$('toastDot');
    const txt = this.$('toastMsg');
    if (!t) return;
    const colors = { success: '#00e5a0', error: '#f43f5e', info: '#6366f1', warn: '#f59e0b' };
    if (dot) dot.style.background = colors[type] || colors.success;
    if (txt) txt.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3500);
  },

  copyText(text, label = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => this.toast(label));
  }
};
