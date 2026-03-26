/**
 * Bond Escrow — API Routes
 */

const express = require('express');
const router = express.Router();
const {
  createTransaction,
  transitionState,
  getTransaction,
  getAllTransactions,
} = require('../models/transaction');
const { addClient, removeClient, broadcast } = require('../sse');

// Helper: broadcast then respond
function mutate(res, id, toState, meta = {}) {
  const txn = transitionState(id, toState, meta);
  broadcast(id, { type: 'STATE_CHANGE', transaction: txn });
  return res.json({ ok: true, transaction: txn });
}

// ── GET /api/escrow — list all ───────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json(getAllTransactions());
});

// ── POST /api/escrow — create ────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { itemName, description, amountINR, sellerUpiId, buyerEmail, expiryHours } = req.body;
  if (!itemName || !amountINR || !sellerUpiId)
    return res.status(400).json({ error: 'itemName, amountINR and sellerUpiId are required' });

  const txn = createTransaction({ itemName, description, amountINR, sellerUpiId, buyerEmail, expiryHours });
  res.status(201).json({ ok: true, transaction: txn });
});

// ── GET /api/escrow/:id — fetch ──────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const txn = getTransaction(req.params.id.toUpperCase());
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json(txn);
});

// ── POST /api/escrow/:id/pay — simulate UPI payment (CREATED → FUNDED) ──────
router.post('/:id/pay', (req, res) => {
  try { mutate(res, req.params.id.toUpperCase(), 'FUNDED'); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// ── POST /api/escrow/:id/deliver — seller marks delivery (FUNDED → DELIVERED)
router.post('/:id/deliver', (req, res) => {
  const { deliveryNote } = req.body;
  try { mutate(res, req.params.id.toUpperCase(), 'DELIVERED', { deliveryNote }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// ── POST /api/escrow/:id/confirm — buyer confirms (DELIVERED → CONFIRMED) ────
router.post('/:id/confirm', (req, res) => {
  try {
    const txn = transitionState(req.params.id.toUpperCase(), 'CONFIRMED');
    // Auto-progress to RELEASED
    const released = transitionState(req.params.id.toUpperCase(), 'RELEASED');
    broadcast(req.params.id.toUpperCase(), { type: 'STATE_CHANGE', transaction: released });
    res.json({ ok: true, transaction: released });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── POST /api/escrow/:id/dispute — buyer raises dispute (DELIVERED → DISPUTED)
router.post('/:id/dispute', (req, res) => {
  const { disputeReason } = req.body;
  try { mutate(res, req.params.id.toUpperCase(), 'DISPUTED', { disputeReason }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// ── POST /api/escrow/:id/resolve — admin resolves (DISPUTED → RESOLVED) ──────
router.post('/:id/resolve', (req, res) => {
  try { mutate(res, req.params.id.toUpperCase(), 'RESOLVED'); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// ── GET /api/escrow/:id/stream — SSE live updates ───────────────────────────
router.get('/:id/stream', (req, res) => {
  const id = req.params.id.toUpperCase();
  const txn = getTransaction(id);
  if (!txn) return res.status(404).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'INIT', transaction: txn })}\n\n`);

  addClient(id, res);
  req.on('close', () => removeClient(id, res));
});

module.exports = router;
