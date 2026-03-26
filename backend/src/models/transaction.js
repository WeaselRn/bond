/**
 * Bond Escrow — Transaction Model & In-Memory Store
 *
 * State Machine:
 *   CREATED → FUNDED → DELIVERED → CONFIRMED → RELEASED
 *                      ↘ DISPUTED → RESOLVED
 */

const { randomUUID } = require('crypto');

// ── Valid state transitions ──────────────────────────────────────────────────
const TRANSITIONS = {
  CREATED:   ['FUNDED'],
  FUNDED:    ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'DISPUTED'],
  CONFIRMED: ['RELEASED'],
  DISPUTED:  ['RESOLVED'],
  RELEASED:  [],
  RESOLVED:  [],
};

// ── In-memory store ──────────────────────────────────────────────────────────
const db = new Map();

// ── Factory ──────────────────────────────────────────────────────────────────
function createTransaction({ itemName, description, amountINR, sellerUpiId, buyerEmail, expiryHours }) {
  const id = randomUUID().slice(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const txn = {
    id,
    shortLink: `bond.app/e/${id}`,
    itemName,
    description: description || '',
    amountINR: parseFloat(amountINR),
    sellerUpiId,
    buyerEmail: buyerEmail || null,
    expiryHours: parseInt(expiryHours, 10) || 48,
    state: 'CREATED',
    history: [{ state: 'CREATED', at: now }],
    deliveryNote: null,
    disputeReason: null,
    createdAt: now,
    updatedAt: now,
  };

  db.set(id, txn);
  return txn;
}

// ── Transition ────────────────────────────────────────────────────────────────
function transitionState(id, toState, meta = {}) {
  const txn = db.get(id);
  if (!txn) throw new Error(`Transaction ${id} not found`);

  const allowed = TRANSITIONS[txn.state];
  if (!allowed.includes(toState)) {
    throw new Error(`Invalid transition: ${txn.state} → ${toState}`);
  }

  const now = new Date().toISOString();
  txn.state = toState;
  txn.updatedAt = now;
  txn.history.push({ state: toState, at: now, ...meta });

  if (meta.deliveryNote) txn.deliveryNote = meta.deliveryNote;
  if (meta.disputeReason) txn.disputeReason = meta.disputeReason;

  db.set(id, txn);
  return txn;
}

// ── Getters ───────────────────────────────────────────────────────────────────
function getTransaction(id) {
  return db.get(id) || null;
}

function getAllTransactions() {
  return Array.from(db.values());
}

module.exports = { createTransaction, transitionState, getTransaction, getAllTransactions, TRANSITIONS };
