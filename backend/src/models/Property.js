const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const PropertySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, default: "" },
    type: { type: String, required: true },
    status: { type: String, enum: ["For Sale", "For Rent", "Sold", "Pending"], default: "For Sale" },
    price: { type: Number, required: true },
    priceLabel: { type: String, default: "" },
    size: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    garage: { type: Number, default: 0 },
    yearBuilt: { type: Number, default: new Date().getFullYear() },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    agentId: { type: String, required: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    description: { type: String, default: "" },
    amenities: [{ type: String }],
    images: [{ type: String }],
    floorPlan: { type: String, default: null },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    daysListed: { type: Number, default: 0 },
    pendingApproval: { type: Boolean, default: false },
  },
  schemaOptions
);

module.exports = mongoose.model("Property", PropertySchema);

