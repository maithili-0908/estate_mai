const mongoose = require("mongoose");
const schemaOptions = require("./schemaOptions");

const MessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, index: true },
    fromName: { type: String, required: true },
    fromEmail: { type: String, default: "" },
    avatar: { type: String, default: "https://randomuser.me/api/portraits/lego/1.jpg" },
    subject: { type: String, required: true },
    preview: { type: String, default: "" },
    body: { type: String, default: "" },
    time: { type: String, default: "Just now" },
    unread: { type: Boolean, default: true },
  },
  schemaOptions
);

module.exports = mongoose.model("Message", MessageSchema);

