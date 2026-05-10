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

async function pushNotificationToUser(user, message, type = "system") {
  if (!user) return;

  user.notifications.unshift({
    id: generateId("n"),
    type,
    message,
    read: false,
    time: "Just now",
    createdAt: new Date(),
  });

  user.notifications = user.notifications.slice(0, 30);
  await user.save();
}

async function pushAppointmentNotificationToClient(appointment, status, property) {
  const userQuery = [];
  if (appointment.clientUserId) userQuery.push({ id: appointment.clientUserId });
  if (appointment.clientEmail) userQuery.push({ email: String(appointment.clientEmail).toLowerCase() });
  if (userQuery.length === 0) return;

  const clientUser = await User.findOne({
    role: "user",
    $or: userQuery,
  });

  if (!clientUser) return;

  const statusLabel =
    status === "Confirmed"
      ? "accepted"
      : status === "Cancelled"
        ? "rejected"
        : status.toLowerCase();
  const propertyLabel = property?.title ? ` for ${property.title}` : "";

  await pushNotificationToUser(
    clientUser,
    `Your appointment request${propertyLabel} was ${statusLabel}.`,
    "appointment"
  );
}

async function resolveMessageUser(message) {
  if (message.userId) {
    const byId = await User.findOne({ id: message.userId, role: "user" });
    if (byId) return byId;
  }

  const emailSource = message.direction === "toUser" ? message.toEmail : message.fromEmail;
  const normalizedEmail = String(emailSource || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  return User.findOne({ email: normalizedEmail, role: "user" });
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
    const requester = req.user?.role === "user" ? req.user : null;
    const contactName = requester?.name || name;
    const contactEmail = requester?.email || email;
    const contactPhone = phone || requester?.phone || "";

    if (!propertyId || !contactName || !contactEmail) {
      res.status(400).json({ message: "Property, name, and email are required" });
      return;
    }

    const property = await Property.findOne({ id: propertyId, pendingApproval: false });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    if (type === "viewing" && (!date || !time)) {
      res
        .status(400)
        .json({ message: "Date and time are required for viewing requests" });
      return;
    }

    const inquiry = await Inquiry.create({
      id: generateId("iq"),
      propertyId,
      agentId: property.agentId,
      type,
      name: contactName,
      email: String(contactEmail).toLowerCase(),
      phone: contactPhone,
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
      userId: requester?.id || null,
      direction: "toAgent",
      fromName: contactName,
      fromEmail: String(contactEmail).toLowerCase(),
      subject,
      preview: buildPreview(message || ""),
      body: message || "",
      time: "Just now",
      unread: true,
      avatar: requester?.avatar || "https://randomuser.me/api/portraits/lego/5.jpg",
    });

    let appointment = null;

    if (type === "viewing") {
      appointment = await Appointment.create({
        id: generateId("ap"),
        propertyId,
        agentId: property.agentId,
        clientName: contactName,
        clientEmail: String(contactEmail).toLowerCase(),
        clientPhone: contactPhone,
        notes: String(message || "").trim(),
        clientUserId: requester?.id || null,
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
    const requester = req.user?.role === "user" ? req.user : null;
    const senderName = requester?.name || name;
    const senderEmail = requester?.email || email;

    if (!senderName || !senderEmail || !message) {
      res.status(400).json({ message: "Name, email, and message are required" });
      return;
    }

    const agentUser = await User.findOne({ agentId, role: "agent" });
    if (!agentUser) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    const created = await Message.create({
      id: generateId("m"),
      agentId,
      userId: requester?.id || null,
      direction: "toAgent",
      fromName: senderName,
      fromEmail: String(senderEmail).toLowerCase(),
      toName: agentUser.name || "",
      toEmail: String(agentUser.email || "").toLowerCase(),
      subject: `Message from ${senderName}`,
      preview: buildPreview(message),
      body: message,
      time: "Just now",
      unread: true,
      avatar: requester?.avatar || "https://randomuser.me/api/portraits/lego/7.jpg",
    });

    await pushNotificationToUser(agentUser, `New direct message from ${senderName}`, "message");

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function replyToMessage(req, res, next) {
  try {
    const { id } = req.params;
    const bodyText = String(req.body?.message || "").trim();

    if (!bodyText) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const parent = await Message.findOne({ id });
    if (!parent) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    const isAdmin = req.user.role === "admin";
    const isOwningAgent =
      req.user.role === "agent" && parent.agentId === req.user.agentId;

    if (!isAdmin && !isOwningAgent) {
      res
        .status(403)
        .json({ message: "Only the listing agent or an admin can reply to messages" });
      return;
    }

    const targetUser = await resolveMessageUser(parent);
    if (!targetUser) {
      res.status(404).json({ message: "User not found for this conversation" });
      return;
    }

    const senderName = req.user.name || "Agent";
    const senderEmail = String(req.user.email || "").toLowerCase();

    const created = await Message.create({
      id: generateId("m"),
      agentId: parent.agentId,
      userId: targetUser.id,
      direction: "toUser",
      fromName: senderName,
      fromEmail: senderEmail,
      toName: targetUser.name || "",
      toEmail: String(targetUser.email || "").toLowerCase(),
      subject: `Reply from ${senderName}`,
      preview: buildPreview(bodyText),
      body: bodyText,
      time: "Just now",
      unread: true,
      avatar: req.user.avatar || "https://randomuser.me/api/portraits/lego/3.jpg",
    });

    await pushNotificationToUser(targetUser, `New message from ${senderName}`, "message");

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

    const previousStatus = appointment.status;

    const isAdmin = req.user.role === "admin";
    const isOwningAgent =
      req.user.role === "agent" && appointment.agentId === req.user.agentId;

    if (!isAdmin && !isOwningAgent) {
      res
        .status(403)
        .json({ message: "Only the listing agent or an admin can update appointments" });
      return;
    }

    appointment.status = status;
    await appointment.save();

    const property = await Property.findOne({ id: appointment.propertyId });
    if (previousStatus !== status) {
      await pushAppointmentNotificationToClient(appointment, status, property);
    }

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

    const messageDirection = message.direction || "toAgent";
    const recipientIsUser = messageDirection === "toUser";
    const recipientIsAgent = !recipientIsUser;

    const isAdmin = req.user.role === "admin";
    const isOwningAgent =
      req.user.role === "agent" &&
      message.agentId === req.user.agentId &&
      recipientIsAgent;

    const userOwnsById = Boolean(message.userId) && message.userId === req.user.id;
    const userEmail = String(req.user.email || "").toLowerCase();
    const fallbackEmail = String(message.toEmail || message.fromEmail || "").toLowerCase();
    const userOwnsByEmail = !message.userId && userEmail && fallbackEmail === userEmail;

    const isOwningUser =
      req.user.role === "user" &&
      recipientIsUser &&
      (userOwnsById || userOwnsByEmail);

    if (!isAdmin && !isOwningAgent && !isOwningUser) {
      res.status(403).json({ message: "You do not have access to this message" });
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
  replyToMessage,
  updateAppointmentStatus,
  markMessageRead,
};

