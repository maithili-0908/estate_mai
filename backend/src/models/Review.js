const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, index: true },
    author: { type: String, required: true },
    avatar: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, required: true },
    date: { type: String, required: true },
    text: { type: String, required: true },
  },
  schemaOptions
);

module.exports = mongoose.model("Review", ReviewSchema);

