const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },

  // ── Profile fields ──────────────────────────────────────────────────────
  phone:   { type: String,  default: "" },
  pan:     { type: String,  default: "" },    // PAN card number
  dob:     { type: String,  default: "" },    // Date of birth YYYY-MM-DD
  address: { type: String,  default: "" },

  // ── Account balance ─────────────────────────────────────────────────────
  balance:    { type: Number, default: 5000 },  // Every new user starts with ₹5000
  usedMargin: { type: Number, default: 0 },     // Margin locked in active positions

  createdAt: { type: Date, default: Date.now },
});

// Hash password only when it's modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", userSchema);
