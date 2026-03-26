# 🔒 Bond — Programmable Escrow Layer for UPI

Bond is a programmable escrow infrastructure built on top of UPI that enables trustless peer-to-peer transactions.

It allows buyers and sellers to safely transact by locking funds in escrow and releasing them only after delivery is confirmed.

Bond is designed for informal digital commerce — Reddit trades, freelancers, gaming accounts, and other P2P transactions where trust is limited.

## 🧠 The Problem

Peer-to-peer digital transactions in India are risky:

Buyer sends money first → risk of scam
Seller delivers first → risk of non-payment
No dispute mechanism
No transaction visibility
UPI supports instant payments but no conditional transfers

## 💡 The Solution

Bond introduces a programmable escrow layer on top of UPI:

Seller creates escrow
Buyer pays into escrow via UPI
Funds are locked
Seller delivers goods
Buyer confirms receipt
Funds are released

Both parties see live transaction status throughout the process.

Core Features
- Shareable escrow links
- Funds locked until confirmation
- Live transaction updates (SSE)
- Seller delivery confirmation
- Buyer confirmation & release
- Dispute handling flow
- Transaction timeline visualization
- API-first architecture
- No login required (MVP)
- Transaction State Machine

Bond is built around a deterministic escrow state machine:

``` CREATED → FUNDED → DELIVERED → CONFIRMED → RELEASED ```

If there are disputes, ``` DELIVERED → DISPUTED → RESOLVED ```

Each transition is validated and recorded for auditability and safety.

## 🏗️ Architecture
```text
Frontend (Static UI)
        │
        │  REST + SSE
        ▼
Express API (Escrow Engine)
        │
        ├── Transaction State Machine
        ├── Escrow Logic
        ├── Dispute Handling
        └── SSE Broadcaster
```

Bond is designed as a modular monolith with an API-first approach.

## 🔌 API Capabilities

Bond exposes endpoints for:

- Create escrow transaction
- Fund escrow (simulate UPI payment)
- Mark delivery
- Confirm receipt
- Raise dispute
- Resolve dispute
- Stream live updates

This allows marketplaces and bots to integrate escrow directly.

## 📡 Live Transaction Status

Bond uses Server-Sent Events (SSE) for real-time updates.

Both buyer and seller see:

- Payment received
- Funds locked
- Delivery marked
- Confirmation
- Release
- Dispute

This creates transparency and trust.

## 🧪 Example Flow
- Seller creates escrow for ₹3000
- Buyer opens shared link
- Buyer pays via UPI
- Funds move to escrow
- Seller delivers item
- Buyer confirms
- Funds released

## 🎯 Use Cases
- Reddit / Discord marketplace trades
- Gaming account sales
- Freelance payments
- Digital asset transfers
- Informal P2P commerce
- Small service agreements
  
## ⚙️ Design Principles
- Works on top of existing UPI ecosystem
- No mutual trust required
- Shared transaction visibility
- API-first infrastructure
- Minimal friction (link-based)
  
## 🚀 MVP Scope

This MVP simulates:

- Escrow funding
- Payout
- Dispute resolution

The focus is demonstrating:

- Escrow state machine
- Transaction lifecycle
- Real-time updates
- API-first integration
  
## 🌍 Vision

Bond aims to become a trust layer for India’s informal digital economy, enabling safe peer-to-peer transactions without requiring marketplaces to build escrow from scratch.

Future directions:

- Escrow API for marketplaces
- Freelancer payment protection
- Digital goods escrow
- Programmable conditional payments
