if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express    = require("express");
const mongoose   = require("mongoose");
const bodyParser = require("body-parser");
const cors       = require("cors");
const cookieParser = require("cookie-parser");

const { HoldingsModel }  = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel }    = require("./model/OrdersModel");
const { WatchlistModel } = require("./model/WatchlistModel");
const UserModel          = require("./model/UserModel");
const { Signup, Login }  = require("./Controllers/AuthController");
const verifyToken        = require("./middleware/verifyToken");

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("DB error:", err));

// ─── Auth ────────────────────────────────────────────────────────────────────
app.post("/signup", Signup);
app.post("/login",  Login);

// Verify token — dashboard calls this to check if user is still logged in
app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});

// ─── Profile ─────────────────────────────────────────────────────────────────
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.put("/profile", verifyToken, async (req, res) => {
  try {
    const allowed = ["username", "phone", "pan", "dob", "address"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ─── Funds ───────────────────────────────────────────────────────────────────
app.get("/funds", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("balance usedMargin");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate used margin from open orders value
    const holdings = await HoldingsModel.find({ userId: req.userId });
    const invested  = holdings.reduce((s, h) => s + h.avg * h.qty, 0);

    res.json({
      success: true,
      equity: {
        balance:     user.balance,
        usedMargin:  user.usedMargin,
        available:   Math.max(0, user.balance - user.usedMargin),
        invested,
      },
    });
  } catch {
    res.status(500).json({ message: "Error fetching funds" });
  }
});

app.post("/funds/add", verifyToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount" });
    }
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $inc: { balance: amount } },
      { new: true }
    ).select("balance usedMargin");

    res.json({
      success: true,
      message: `₹${amount.toLocaleString("en-IN")} added successfully`,
      balance: user.balance,
    });
  } catch {
    res.status(500).json({ message: "Error adding funds" });
  }
});

app.post("/funds/withdraw", verifyToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const user   = await UserModel.findById(req.userId).select("balance usedMargin");
    const available = user.balance - user.usedMargin;

    if (!amount || amount <= 0)    return res.status(400).json({ message: "Enter a valid amount" });
    if (amount > available)        return res.status(400).json({ message: "Insufficient available balance" });

    const updated = await UserModel.findByIdAndUpdate(
      req.userId,
      { $inc: { balance: -amount } },
      { new: true }
    ).select("balance usedMargin");

    res.json({
      success: true,
      message: `₹${amount.toLocaleString("en-IN")} withdrawn successfully`,
      balance: updated.balance,
    });
  } catch {
    res.status(500).json({ message: "Error withdrawing funds" });
  }
});

// ─── Holdings ────────────────────────────────────────────────────────────────
app.get("/allHoldings", verifyToken, async (req, res) => {
  try {
    const data = await HoldingsModel.find({ userId: req.userId });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error fetching holdings" });
  }
});

// ─── Positions ───────────────────────────────────────────────────────────────
app.get("/allPositions", verifyToken, async (req, res) => {
  try {
    const data = await PositionsModel.find({ userId: req.userId });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error fetching positions" });
  }
});

// ─── Watchlist ───────────────────────────────────────────────────────────────
app.get("/allWatchlist", verifyToken, async (req, res) => {
  try {
    const data = await WatchlistModel.find({ userId: req.userId });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
});

app.post("/addToWatchlist", verifyToken, async (req, res) => {
  try {
    const { name, price, percent, isDown } = req.body;
    const exists = await WatchlistModel.findOne({ userId: req.userId, name });
    if (exists) return res.json({ message: "Already in watchlist" });
    const item = await WatchlistModel.create({ userId: req.userId, name, price: price || 0, percent: percent || "0%", isDown: isDown || false });
    res.status(201).json({ success: true, item });
  } catch {
    res.status(500).json({ message: "Error adding to watchlist" });
  }
});

app.delete("/removeFromWatchlist/:name", verifyToken, async (req, res) => {
  try {
    await WatchlistModel.deleteOne({ userId: req.userId, name: req.params.name });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Error removing from watchlist" });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────
app.get("/allOrders", verifyToken, async (req, res) => {
  try {
    const data = await OrdersModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.post("/newOrder", verifyToken, async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    if (!name || !qty || !mode) {
      return res.status(400).json({ message: "name, qty, mode are required" });
    }

    const orderQty   = Number(qty);
    const orderPrice = Number(price) || 0;
    const orderValue = orderQty * orderPrice;

    // ── Check balance for BUY ───────────────────────────────────────────
    if (mode === "BUY" && orderPrice > 0) {
      const user = await UserModel.findById(req.userId).select("balance usedMargin");
      const available = user.balance - user.usedMargin;
      if (orderValue > available) {
        return res.status(400).json({
          message: `Insufficient balance. Required: ₹${orderValue.toFixed(2)}, Available: ₹${available.toFixed(2)}`,
        });
      }
    }

    // ── Save order ──────────────────────────────────────────────────────
    const order = await OrdersModel.create({
      userId: req.userId,
      name,
      qty:   orderQty,
      price: orderPrice,
      mode,
    });

    // ── BUY: deduct balance + update holdings ───────────────────────────
    if (mode === "BUY") {
      // Deduct from balance
      if (orderPrice > 0) {
        await UserModel.findByIdAndUpdate(req.userId, {
          $inc: { balance: -orderValue },
        });
      }

      const existing = await HoldingsModel.findOne({ userId: req.userId, name });
      if (existing) {
        const totalQty  = existing.qty + orderQty;
        const totalCost = existing.avg * existing.qty + orderPrice * orderQty;
        existing.qty   = totalQty;
        existing.avg   = parseFloat((totalCost / totalQty).toFixed(2));
        existing.price = orderPrice > 0 ? orderPrice : existing.price;
        await existing.save();
      } else {
        await HoldingsModel.create({
          userId: req.userId,
          name,
          qty:    orderQty,
          avg:    orderPrice,
          price:  orderPrice,
          net:    "0.00%",
          day:    "0.00%",
          isLoss: false,
        });
      }
    }

    // ── SELL: credit balance + update holdings ──────────────────────────
    if (mode === "SELL") {
      const existing = await HoldingsModel.findOne({ userId: req.userId, name });
      if (!existing) {
        return res.status(400).json({ message: `You don't hold any ${name} to sell` });
      }
      if (existing.qty < orderQty) {
        return res.status(400).json({
          message: `Cannot sell ${orderQty} units. You only hold ${existing.qty}`,
        });
      }

      // Credit balance
      if (orderPrice > 0) {
        await UserModel.findByIdAndUpdate(req.userId, {
          $inc: { balance: orderValue },
        });
      }

      const newQty = existing.qty - orderQty;
      if (newQty <= 0) {
        await HoldingsModel.deleteOne({ userId: req.userId, name });
      } else {
        existing.qty = newQty;
        await existing.save();
      }
    }

    res.status(201).json({ success: true, message: "Order placed!", order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Error placing order" });
  }
});

// ─── One-time: Give ₹5000 to all users with balance = 0 ─────────────────────
app.get("/migrateBalances", async (req, res) => {
  try {
    const result = await UserModel.updateMany(
      { balance: { $lte: 0 } },
      { $set: { balance: 5000, usedMargin: 0 } }
    );
    res.json({ success: true, message: `Updated ${result.modifiedCount} users with ₹5000 balance` });
  } catch (err) {
    res.status(500).json({ message: "Migration failed", error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
