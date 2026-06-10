const { Schema, Types } = require("mongoose");

const PositionsSchema = new Schema({
  userId:  { type: Types.ObjectId, ref: "User", required: true },
  product: String,
  name:    { type: String, required: true },
  qty:     { type: Number, required: true },
  avg:     { type: Number, required: true },
  price:   { type: Number, required: true },
  net:     String,
  day:     String,
  isLoss:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = { PositionsSchema };
