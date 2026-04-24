const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const AppointmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, default: "" },
    clientPhone: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, default: "10:00 AM" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    type: { type: String, enum: ["Viewing", "Consultation"], default: "Viewing" },
  },
  schemaOptions
);

module.exports = mongoose.model("Appointment", AppointmentSchema);

