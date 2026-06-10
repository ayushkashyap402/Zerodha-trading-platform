const User = require("../model/UserModel");
const { WatchlistModel } = require("../model/WatchlistModel");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcrypt");

const DEFAULT_WATCHLIST = [
  { name: "INFY",      price: 1555.45, percent: "-1.60%", isDown: true  },
  { name: "ONGC",      price: 116.80,  percent: "-0.09%", isDown: true  },
  { name: "TCS",       price: 3194.80, percent: "-0.25%", isDown: true  },
  { name: "KPITTECH",  price: 266.45,  percent: "+3.54%", isDown: false },
  { name: "QUICKHEAL", price: 308.55,  percent: "-0.15%", isDown: true  },
  { name: "WIPRO",     price: 577.75,  percent: "+0.32%", isDown: false },
  { name: "M&M",       price: 779.80,  percent: "-0.01%", isDown: true  },
  { name: "RELIANCE",  price: 2112.40, percent: "+1.44%", isDown: false },
  { name: "HUL",       price: 512.40,  percent: "+1.04%", isDown: false },
];

// ─── Signup ──────────────────────────────────────────────────────────────────
module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ email, password, username });

    // Give every new user a default watchlist
    await WatchlistModel.insertMany(
      DEFAULT_WATCHLIST.map((item) => ({ ...item, userId: user._id }))
    );

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success:  true,
      message:  "Account created successfully",
      token,
      userId:   user._id,
      username: user.username,
      email:    user.email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success:  true,
      message:  "Login successful",
      token,
      userId:   user._id,
      username: user.username,
      email:    user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
