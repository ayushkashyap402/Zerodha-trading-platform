const { Schema, Types } = require("mongoose");

const WatchlistSchema = new Schema({
  userId:  { type: Types.ObjectId, ref: "User", required: true },
  name:    { type: String, required: true },
  price:   { type: Number, required: true },
  percent: String,
  isDown:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = { WatchlistSchema };
