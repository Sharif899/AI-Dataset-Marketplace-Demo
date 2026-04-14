# 🤖 ShelbyAI — AI Dataset Marketplace

**Data as a programmable, economically active asset — powered by Shelby Protocol**

> Upload AI datasets. Earn per read. Access via pay-per-read endpoints.

ShelbyAI is a decentralized marketplace for AI datasets built on [Shelby Protocol](https://shelby.xyz). Contributors upload curated datasets (prompts, embeddings, fine-tuning corpora, RLHF pairs) as permanent blobs on Shelby. Consumers access them via pay-per-read endpoints. Every read triggers a micropayment on Aptos — data becomes both composable and economically active.

---

## ✨ Features

### For AI Engineers (Buyers)
- 🛒 **Browse marketplace** — 8+ curated AI dataset categories
- 🔍 **Search & filter** — by category, price, rating, popularity
- 👁️ **Free preview** — see sample records before buying
- ⚡ **Pay-per-read** — access data without downloading it
- 📡 **Live read feed** — see latency, chunk count, node hits per read

### For Data Contributors (Sellers)
- 📤 **Upload datasets** — drag & drop any format (JSONL, Parquet, NPY, HDF5)
- 💰 **Set your price** — choose your price per read
- 📊 **Earnings dashboard** — live earnings chart, top datasets, history
- 🔗 **On-chain proof** — Merkle root on Aptos for every dataset
- ∞ **Permanent storage** — Shelby stores data forever

---

## 🗂️ Project Structure

```
shelbyai/
├── index.html          ← App shell & all 4 pages
├── README.md           ← This file
├── data/
│   └── datasets.json   ← AI dataset catalog (8 sample datasets)
├── css/
│   └── style.css       ← Full styling, dark theme
└── js/
    ├── utils.js        ← Helpers, formatters, DOM utils
    ├── storage.js      ← LocalStorage + Shelby Protocol mock layer
    ├── marketplace.js  ← Browse, filter, purchase, access datasets
    ├── upload.js       ← Upload datasets + progress flow
    ├── earnings.js     ← Contributor earnings dashboard + live feed
    └── app.js          ← Main controller, navigation, live reads
```

---

## 🚀 Getting Started

### Open directly
Just open `index.html` in your browser. No build step needed.

### Deploy to Vercel
1. Push to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import → Deploy
3. Live in 30 seconds

---

## 🔗 Shelby Protocol Integration

This project is built as a demo of the use case described in the Shelby early access application:

> *"I am building a lightweight data layer for AI workflows where datasets and outputs can be stored, accessed, and monetized in real time. The idea is to treat data not just as storage, but as a programmable asset."*

### Architecture

```
Contributor uploads dataset
        ↓
[Shelby SDK] uploadBlob(blobName, datasetBuffer)
        ↓
Clay erasure coding → 16 storage provider nodes
        ↓
Merkle root committed to Aptos on-chain
        ↓
Dataset listed as pay-per-read endpoint
        ↓
AI engineer calls: readBlob(blobAddress) → micropayment → data
        ↓
Contributor earns per read, automatically
```

### Real SDK Integration

Replace the mock layer in `js/storage.js`:

```javascript
// Current (mock):
async mockUpload(name, sizeMB) { ... }

// Replace with:
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";

const client = new ShelbyNodeClient({
  network: Network.TESTNET,
  apiKey: "aptoslabs_***",
});

// Upload:
const result = await client.uploadBlob(
  `shelbyai/${datasetSlug}/data.jsonl`,
  datasetBuffer
);

// Read (pay-per-read):
const data = await client.readBlob(blobAddress);
```

Apply at [developers.shelby.xyz](https://developers.shelby.xyz)

---

## 🧠 Technical Highlights

| Area | Approach |
|---|---|
| **Architecture** | 6 independent JS modules, zero framework |
| **Charts** | Pure Canvas API — no Chart.js |
| **Storage** | localStorage + Shelby blob simulation |
| **Live feed** | setInterval-based live read simulation |
| **Styling** | Pure CSS custom properties, dark theme |
| **Data** | JSON-driven catalog, fully extensible |
| **No build step** | Open in browser directly |

---

## 📊 Dataset Categories

| Category | Use Case |
|---|---|
| Prompts | Prompt engineering, chain-of-thought datasets |
| Embeddings | Pre-computed vectors for similarity search |
| Fine-tuning | Instruction pairs for LLM fine-tuning |
| RLHF | Human preference pairs for alignment |
| Vision | Image-text pairs, CLIP embeddings |
| Audio | Speech-text pairs for ASR training |
| Code | Code completion pairs, function synthesis |
| RAG | Pre-chunked documents for retrieval pipelines |

---

## 👤 Built By

**0xninofi** — AI + Data Monetization on Shelby Protocol

- 🐦 Twitter: [@0xninofi](https://twitter.com/0xninofi)
- 🏗️ Project: AI + Data Monetization
- 🔗 Apply: [developers.shelby.xyz](https://developers.shelby.xyz)

---

## 📄 License

MIT — use it, fork it, build on it.

---

*This demo directly implements the vision from the Shelby early access application — data as a programmable, economically active asset built on Shelby Protocol's high-performance decentralized storage.*
