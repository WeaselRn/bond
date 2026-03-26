/**
 * Bond Escrow — Express Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const escrowRouter = require('./routes/escrow');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Serve static frontend ─────────────────────────────────────────────────────
const frontendDir = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendDir));


// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'bond-escrow-api' }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/escrow', escrowRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`\n🔒 Bond Escrow API running at http://localhost:${PORT}`);
  console.log(`   Health:  GET  /health`);
  console.log(`   Create:  POST /api/escrow`);
  console.log(`   Status:  GET  /api/escrow/:id`);
  console.log(`   Stream:  GET  /api/escrow/:id/stream`);
});

module.exports = app;
