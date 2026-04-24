const User = require("../models/User");
const Property = require("../models/Property");
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");
const Inquiry = require("../models/Inquiry");
const { generateId } = require("../utils/id");
const { formatRelativeTime } = require("../utils/time");

function buildPreview(text = "") {
  const clean = String(text).trim();
  if (clean.length <= 90) return clean;
  return `${clean.slice(0, 87)}...`;
}

async function pushNotificationToAgent(agentId, message, type = "system") {
  const agentUser = await User.findOne({ agentId });
  if (!agentUser) return;

  agentUser.notifications.unshift({
    id: generateId("n"),
    type,
    message,
    read: false,
    time: "Just now",
    createdAt: new Date(),
  });

  agentUser.notifications = agentUser.notifications.slice(0, 30);
  await agentUser.save();
}

async function toggleSaved(req, res, next) {
  try {
    const { propertyId } = req.params;

    const [user, property] = await Promise.all([
      User.findOne({ id: req.user.id }),
      Property.findOne({ id: propertyId, pendingApproval: false }),
    ]);

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const current = user.savedProperties || [];
    const hasProperty = current.includes(propertyId);

    user.savedProperties = hasProperty
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId];

    property.saves = Math.max(
      0,
      Number(property.saves || 0) + (hasProperty ? -1 : 1)
    );

    await Promise.all([user.save(), property.save()]);

    res.json({ savedProperties: user.savedProperties });
  } catch (err) {
    next(err);
  }
}

async function clearSaved(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    const ids = [...(user.savedProperties || [])];

    user.savedProperties = [];
    await user.save();

    if (ids.length > 0) {
      await Property.updateMany(
        { id: { $in: ids } },
        { $inc: { saves: -1 } }
      );

      await Property.updateMany(
        { id: { $in: ids }, saves: { $lt: 0 } },
        { $set: { saves: 0 } }
      );
    }

    res.json({ savedProperties: [] });
  } catch (err) {
    next(err);
  }
}

async function toggleCompare(req, res, next) {
  try {
    const { propertyId } = req.params;
    const user = await User.findOne({ id: req.user.id });

    const current = user.compareList || [];

    if (current.includes(propertyId)) {
      user.compareList = current.filter((id) => id !== propertyId);
      await user.save();
      res.json({ compareList: user.compareList });
      return;
    }

    if (current.length >= 3) {
      res.status(400).json({ message: "You can compare up to 3 properties" });
      return;
    }

    user.compareList = [...current, propertyId];
    await user.save();

    res.json({ compareList: user.compareList });
  } catch (err) {
    next(err);
  }
}

async function markNotificationsRead(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });

    user.notifications = (user.notifications || []).map((notification) => ({
      ...notification.toObject(),
      read: true,
    }));

    await user.save();

    res.json({ notifications: user.notifications });
  } catch (err) {
    next(err);
  }
}

async function createInquiry(req, res, next) {
  try {
    const { propertyId, type = "info", name, email, phone, date, time, message } = req.body;

    if (!propertyId || !name || !email) {
      res.status(400).json({ message: "Property, name, and email are required" });
      return;
    }

    const property = await Property.findOne({ id: propertyId, pendingApproval: false });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const inquiry = await Inquiry.create({
      id: generateId("iq"),
      propertyId,
      agentId: property.agentId,
      type,
      name,
      email,
      phone: phone || "",
      date: date || "",
      message: message || "",
    });

    const subject =
      type === "viewing"
        ? `Viewing request: ${property.title}`
        : `Inquiry about ${property.title}`;

    const newMessage = await Message.create({
      id: generateId("m"),
      agentId: property.agentId,
      fromName: name,
      fromEmail: email,
      subject,
      preview: buildPreview(message || ""),
      body: message || "",
      time: "Just now",
      unread: true,
      avatar: "https://randomuser.me/api/portraits/lego/5.jpg",
    });

    let appointment = null;

    if (type === "viewing") {
      appointment = await Appointment.create({
        id: generateId("ap"),
        propertyId,
        agentId: property.agentId,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || "",
        date: date || new Date().toISOString().split("T")[0],
        time: time || "10:00 AM",
        status: "Pending",
        type: "Viewing",
      });
    }

    await pushNotificationToAgent(
      property.agentId,
      `New ${type === "viewing" ? "viewing request" : "inquiry"} on ${property.title}`,
      type === "viewing" ? "appointment" : "inquiry"
    );

    res.status(201).json({
      success: true,
      inquiry,
      message: newMessage,
      appointment,
    });
  } catch (err) {
    next(err);
  }
}

async function sendAgentMessage(req, res, next) {
  try {
    const { agentId } = req.params;
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: "Name, email, and message are required" });
      return;
    }

    const created = await Message.create({
      id: generateId("m"),
      agentId,
      fromName: name,
      fromEmail: email,
      subject: `Message from ${name}`,
      preview: buildPreview(message),
      body: message,
      time: "Just now",
      unread: true,
      avatar: "https://randomuser.me/api/portraits/lego/7.jpg",
    });

    await pushNotificationToAgent(agentId, `New direct message from ${name}`, "message");

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      res.status(400).json({ message: "Invalid appointment status" });
      return;
    }

    const appointment = await Appointment.findOne({ id });

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    if (req.user.role === "agent" && appointment.agentId !== req.user.agentId) {
      res.status(403).json({ message: "You can only update your own appointments" });
      return;
    }

    appointment.status = status;
    await appointment.save();

    const property = await Property.findOne({ id: appointment.propertyId });

    await pushNotificationToAgent(
      appointment.agentId,
      `${appointment.clientName}'s appointment ${status.toLowerCase()}${property ? ` for ${property.title}` : ""}`,
      "appointment"
    );

    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function markMessageRead(req, res, next) {
  try {
    const { id } = req.params;
    const message = await Message.findOne({ id });

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (req.user.role === "agent" && message.agentId !== req.user.agentId) {
      res.status(403).json({ message: "You can only read your own messages" });
      return;
    }

    message.unread = false;
    message.time = formatRelativeTime(message.createdAt);
    await message.save();

    res.json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  toggleSaved,
  clearSaved,
  toggleCompare,
  markNotificationsRead,
  createInquiry,
  sendAgentMessage,
  updateAppointmentStatus,
  markMessageRead,
};

