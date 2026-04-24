const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const schemaOptions = require("./schemaOptions");

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["inquiry", "appointment", "listing", "message", "system"],
      default: "system",
    },
    message: { type: String, required: true },
    time: { type: String, default: "Just now" },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "agent", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    agentId: { type: String, default: null },
    savedProperties: [{ type: String }],
    compareList: [{ type: String }],
    notifications: [NotificationSchema],
    settings: {
      notifications: {
        emailInquiries: { type: Boolean, default: true },
        emailViewings: { type: Boolean, default: true },
        emailNewsletter: { type: Boolean, default: false },
        smsViewings: { type: Boolean, default: false },
        smsMessages: { type: Boolean, default: true },
        pushAll: { type: Boolean, default: true },
      },
      privacy: {
        showProfile: { type: Boolean, default: true },
        showPhone: { type: Boolean, default: false },
        showEmail: { type: Boolean, default: true },
        dataAnalytics: { type: Boolean, default: true },
        cookiePerf: { type: Boolean, default: true },
      },
      appearance: {
        theme: { type: String, default: "light" },
        density: { type: String, default: "comfortable" },
        language: { type: String, default: "en" },
      },
    },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
  },
  schemaOptions
);

UserSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

