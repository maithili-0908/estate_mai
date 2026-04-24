const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const InquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    type: { type: String, enum: ["viewing", "info"], default: "info" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    date: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  schemaOptions
);

module.exports = mongoose.model("Inquiry", InquirySchema);

