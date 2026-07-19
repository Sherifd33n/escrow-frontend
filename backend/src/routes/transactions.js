import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// 1. GET / - List transactions for current user (either buyer or seller)
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const txs = await db.query(
      `SELECT t.*, 
              u_buyer.name as buyer_name, u_buyer.email as buyer_email,
              u_seller.name as seller_name, u_seller.email as seller_email
       FROM transactions t
       JOIN users u_buyer ON t.buyer_id = u_buyer.id
       JOIN users u_seller ON t.seller_id = u_seller.id
       WHERE t.buyer_id = ? OR t.seller_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );

    if (txs.length > 0) {
      const txIds = txs.map(t => t.id);
      const milestones = await db.query(
        "SELECT * FROM milestones WHERE transaction_id IN (?) ORDER BY id ASC",
        [txIds]
      );
      txs.forEach(tx => {
        tx.milestones = milestones.filter(m => m.transaction_id === tx.id);
      });
    }

    res.json(txs);
  } catch (error) {
    next(error);
  }
});

// 2. POST / - Create a new transaction
router.post("/", async (req, res, next) => {
  const { title, category, amount, currency, counterparty, role, review_days, milestones_count } = req.body;
  const userId = req.user.id;

  if (!title || !category || !amount || !counterparty) {
    return res.status(400).json({ error: "Missing required transaction fields." });
  }

  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // 1. Find the counterparty user by email
    const [cUsers] = await conn.query("SELECT id, name FROM users WHERE email = ?", [counterparty.trim().toLowerCase()]);
    if (cUsers.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: `Counterparty user with email "${counterparty}" not found.` });
    }
    const counterpartyId = cUsers[0].id;

    // Determine buyer_id and seller_id based on current user's role choice in the transaction
    let buyerId, sellerId;
    if (role === "buyer" || role === "Buyer") {
      buyerId = userId;
      sellerId = counterpartyId;
    } else {
      buyerId = counterpartyId;
      sellerId = userId;
    }

    // 2. Generate a unique transaction code
    const txnCode = `TXN-${crypto.randomInt(100000, 999999)}`;

    // 3. Insert transaction
    const [txnResult] = await conn.query(
      `INSERT INTO transactions 
       (txn_code, title, category, amount, currency, buyer_id, seller_id, status, review_days, milestones_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        txnCode,
        title,
        category,
        parseFloat(amount),
        currency || "USD",
        buyerId,
        sellerId,
        parseInt(review_days) || 3,
        parseInt(milestones_count) || 1
      ]
    );
    const transactionId = txnResult.insertId;

    // 4. Create milestones if count is provided
    const count = parseInt(milestones_count) || 1;
    const milestoneAmount = parseFloat(amount) / count;
    for (let i = 1; i <= count; i++) {
      await conn.query(
        `INSERT INTO milestones (transaction_id, title, amount, status)
         VALUES (?, ?, ?, ?)`,
        [
          transactionId,
          `Milestone ${i} of ${count}`,
          milestoneAmount,
          i === 1 ? "due" : "pending"
        ]
      );
    }

    await conn.commit();

    // Fetch full newly created transaction
    const [newTxn] = await conn.query(
      `SELECT t.*, 
              u_buyer.name as buyer_name, u_buyer.email as buyer_email,
              u_seller.name as seller_name, u_seller.email as seller_email
       FROM transactions t
       JOIN users u_buyer ON t.buyer_id = u_buyer.id
       JOIN users u_seller ON t.seller_id = u_seller.id
       WHERE t.id = ?`,
      [transactionId]
    );

    res.status(201).json(newTxn[0]);
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

// 3. GET /:id - Get a single transaction by ID or code, including its milestones
router.get("/:id", async (req, res, next) => {
  const paramId = req.params.id;
  const userId = req.user.id;

  try {
    // Lookup by primary key ID or txn_code
    const queryStr = isNaN(Number(paramId))
      ? "WHERE t.txn_code = ?"
      : "WHERE t.id = ?";

    const txs = await db.query(
      `SELECT t.*, 
              u_buyer.name as buyer_name, u_buyer.email as buyer_email,
              u_seller.name as seller_name, u_seller.email as seller_email
       FROM transactions t
       JOIN users u_buyer ON t.buyer_id = u_buyer.id
       JOIN users u_seller ON t.seller_id = u_seller.id
       ${queryStr}`,
      [paramId]
    );

    if (txs.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    const tx = txs[0];

    // Check permission (user must be buyer or seller)
    if (tx.buyer_id !== userId && tx.seller_id !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Get milestones
    const milestones = await db.query(
      "SELECT * FROM milestones WHERE transaction_id = ? ORDER BY id ASC",
      [tx.id]
    );

    tx.milestones = milestones;

    res.json(tx);
  } catch (error) {
    next(error);
  }
});

// 4. PATCH /:id/status - Update transaction status
router.patch("/:id/status", async (req, res, next) => {
  const transactionId = req.params.id;
  const { status, ai_audit_note } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // Check transaction existence & access permission
    const [txs] = await conn.query("SELECT * FROM transactions WHERE id = ?", [transactionId]);
    if (txs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Transaction not found." });
    }

    const tx = txs[0];
    if (tx.buyer_id !== userId && tx.seller_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ error: "Access denied." });
    }

    // Perform updates
    await conn.query(
      "UPDATE transactions SET status = ? WHERE id = ?",
      [status, transactionId]
    );

    // If status becomes completed, simulate payout from buyer to seller
    if (status === "completed" && tx.status !== "completed") {
      // 1. Deduct balance from buyer's wallet (in escrow_hold)
      // Note: Escrow platform handles holding funds. In a real system, deposit holds funds.
      // We will update the seller's wallet balance by the transaction amount.
      const [sellerWallet] = await conn.query("SELECT id, balance FROM wallets WHERE user_id = ?", [tx.seller_id]);
      if (sellerWallet.length > 0) {
        const newBalance = parseFloat(sellerWallet[0].balance) + parseFloat(tx.amount);
        await conn.query("UPDATE wallets SET balance = ? WHERE id = ?", [newBalance, sellerWallet[0].id]);
        
        // Record wallet transaction history for the seller
        await conn.query(
          `INSERT INTO wallet_transactions (wallet_id, type, amount, description, reference)
           VALUES (?, 'escrow_release', ?, ?, ?)`,
          [
            sellerWallet[0].id,
            parseFloat(tx.amount),
            `Payout released for project: ${tx.title}`,
            `REF-RELEASE-${crypto.randomInt(100000, 999999)}`
          ]
        );
      }
    }

    await conn.commit();

    res.json({ message: "Transaction status updated successfully.", status });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

// 5. POST /:id/milestones - Add a milestone to a transaction
router.post("/:id/milestones", async (req, res, next) => {
  const transactionId = req.params.id;
  const { title, amount } = req.body;
  const userId = req.user.id;

  if (!title || !amount) {
    return res.status(400).json({ error: "Title and amount are required." });
  }

  try {
    const txs = await db.query("SELECT * FROM transactions WHERE id = ?", [transactionId]);
    if (txs.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    const tx = txs[0];
    if (tx.buyer_id !== userId && tx.seller_id !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    await db.query(
      "INSERT INTO milestones (transaction_id, title, amount, status) VALUES (?, ?, ?, 'pending')",
      [transactionId, title, parseFloat(amount)]
    );

    // Update milestones count in transaction
    await db.query(
      "UPDATE transactions SET milestones_count = milestones_count + 1 WHERE id = ?",
      [transactionId]
    );

    res.status(201).json({ message: "Milestone added successfully." });
  } catch (error) {
    next(error);
  }
});

// 6. PATCH /milestones/:id/status - Update milestone status
router.patch("/milestones/:id/status", async (req, res, next) => {
  const milestoneId = req.params.id;
  const { status, deliverable_note } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  try {
    const milestones = await db.query("SELECT * FROM milestones WHERE id = ?", [milestoneId]);
    if (milestones.length === 0) {
      return res.status(404).json({ error: "Milestone not found." });
    }

    const milestone = milestones[0];
    const txs = await db.query("SELECT * FROM transactions WHERE id = ?", [milestone.transaction_id]);
    const tx = txs[0];

    if (tx.buyer_id !== userId && tx.seller_id !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    const fields = [];
    const params = [];

    fields.push("status = ?");
    params.push(status);

    if (deliverable_note !== undefined) {
      fields.push("deliverable_note = ?");
      params.push(deliverable_note);
    }

    params.push(milestoneId);

    await db.query(
      `UPDATE milestones SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    res.json({ message: "Milestone updated successfully.", status });
  } catch (error) {
    next(error);
  }
});

// 7. POST /milestones/:id/pay - Pay a milestone using wallet balance
router.post("/milestones/:id/pay", async (req, res, next) => {
  const milestoneId = req.params.id;
  const userId = req.user.id;

  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get milestone details
    const [milestones] = await conn.query("SELECT * FROM milestones WHERE id = ?", [milestoneId]);
    if (milestones.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Milestone not found." });
    }
    const milestone = milestones[0];

    // 2. Get transaction details
    const [txs] = await conn.query("SELECT * FROM transactions WHERE id = ?", [milestone.transaction_id]);
    if (txs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Transaction not found." });
    }
    const tx = txs[0];

    // 3. Verify user is the buyer
    if (tx.buyer_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ error: "Only the buyer can make milestone payments." });
    }

    // 4. Verify status is not already paid
    if (milestone.status === "paid") {
      await conn.rollback();
      return res.status(400).json({ error: "Milestone is already paid." });
    }

    // 5. Check buyer's wallet balance
    const [wallets] = await conn.query("SELECT * FROM wallets WHERE user_id = ?", [userId]);
    if (wallets.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Buyer wallet not found." });
    }
    const walletObj = wallets[0];
    const amount = parseFloat(milestone.amount);
    const balance = parseFloat(walletObj.balance);

    if (balance < amount) {
      await conn.rollback();
      return res.status(400).json({ error: "Insufficient wallet balance to pay this milestone." });
    }

    // 6. Deduct balance from buyer's wallet
    const newBalance = balance - amount;
    await conn.query("UPDATE wallets SET balance = ? WHERE id = ?", [newBalance, walletObj.id]);

    // 7. Insert wallet transaction history for buyer
    await conn.query(
      `INSERT INTO wallet_transactions (wallet_id, type, amount, description, reference)
       VALUES (?, 'escrow_hold', ?, ?, ?)`,
      [
        walletObj.id,
        amount,
        `Escrow hold for milestone: ${milestone.title} of "${tx.title}"`,
        `REF-HOLD-${crypto.randomInt(100000, 999999)}`
      ]
    );

    // 8. Update milestone status to 'paid'
    await conn.query("UPDATE milestones SET status = 'paid' WHERE id = ?", [milestoneId]);

    // 9. Auto-set next milestone to 'due' if applicable
    const [allMilestones] = await conn.query(
      "SELECT * FROM milestones WHERE transaction_id = ? ORDER BY id ASC",
      [tx.id]
    );

    const currentIdx = allMilestones.findIndex(m => m.id === parseInt(milestoneId));
    if (currentIdx !== -1 && currentIdx + 1 < allMilestones.length) {
      const nextMilestone = allMilestones[currentIdx + 1];
      if (nextMilestone.status === "pending" || nextMilestone.status === "upcoming") {
        await conn.query("UPDATE milestones SET status = 'due' WHERE id = ?", [nextMilestone.id]);
      }
    }

    // Check if all milestones are paid
    const [updatedMilestones] = await conn.query(
      "SELECT * FROM milestones WHERE transaction_id = ?",
      [tx.id]
    );
    const allPaid = updatedMilestones.every(m => m.status === "paid");
    if (allPaid) {
      await conn.query("UPDATE transactions SET status = 'inprogress' WHERE id = ?", [tx.id]);
    }

    await conn.commit();
    res.json({ message: "Milestone payment successful.", balance: newBalance });

  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

export default router;
