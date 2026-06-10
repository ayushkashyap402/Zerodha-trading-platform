const { Schema, Types } = require("mongoose");

const HoldingsSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  name:   { type: String, required: true },
  qty:    { type: Number, required: true },
  avg:    { type: Number, required: true },
  price:  { type: Number, required: true },
  net:    String,
  day:    String,
  isLoss: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = { HoldingsSchema };
