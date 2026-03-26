/**
 * Bond Escrow — Server-Sent Events (SSE) broadcaster
 * Allows the frontend status page to receive live transaction updates.
 */

// Map of transactionId → Set of SSE response objects
const clients = new Map();

function addClient(txnId, res) {
  if (!clients.has(txnId)) clients.set(txnId, new Set());
  clients.get(txnId).add(res);
  console.log(`[SSE] Client connected for ${txnId}. Total: ${clients.get(txnId).size}`);
}

function removeClient(txnId, res) {
  const group = clients.get(txnId);
  if (group) {
    group.delete(res);
    if (group.size === 0) clients.delete(txnId);
  }
}

function broadcast(txnId, data) {
  const group = clients.get(txnId);
  if (!group || group.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of group) {
    try { res.write(payload); } catch (_) { group.delete(res); }
  }
  console.log(`[SSE] Broadcasted to ${group.size} client(s) for ${txnId}`);
}

module.exports = { addClient, removeClient, broadcast };
