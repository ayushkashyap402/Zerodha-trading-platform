const { Schema, Types } = require("mongoose");

const OrdersSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  name:   { type: String, required: true },
  qty:    { type: Number, required: true },
  price:  { type: Number, default: 0 },
  mode:   { type: String, enum: ["BUY", "SELL"], required: true },
}, { timestamps: true });

module.exports = { OrdersSchema };
