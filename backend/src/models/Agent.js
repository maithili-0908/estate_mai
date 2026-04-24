const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const AgentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    title: { type: String, default: "Real Estate Agent" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    specialties: [{ type: String }],
    languages: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    propertiesSold: { type: Number, default: 0 },
    yearsExp: { type: Number, default: 0 },
    propertiesActive: { type: Number, default: 0 },
    social: {
      instagram: { type: String, default: "#" },
      linkedin: { type: String, default: "#" },
      twitter: { type: String, default: "#" },
    },
    certifications: [{ type: String }],
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
  },
  schemaOptions
);

module.exports = mongoose.model("Agent", AgentSchema);

