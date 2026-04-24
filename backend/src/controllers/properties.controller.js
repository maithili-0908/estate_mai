const Property = require("../models/Property");
const Agent = require("../models/Agent");
const { generateId } = require("../utils/id");
const { formatPriceLabel } = require("../utils/price");
const { syncAgentMetrics } = require("../utils/agentSync");

function normalizePropertyInput(body) {
  const status = body.status || "For Sale";
  const price = Number(body.price || 0);

  return {
    title: body.title,
    address: body.address,
    city: body.city,
    state: body.state,
    zip: body.zip || "",
    type: body.type || "House",
    status,
    price,
    priceLabel: body.priceLabel || formatPriceLabel(price, status),
    size: Number(body.size || 0),
    bedrooms: Number(body.bedrooms || 0),
    bathrooms: Number(body.bathrooms || 0),
    garage: Number(body.garage || 0),
    yearBuilt: Number(body.yearBuilt || new Date().getFullYear()),
    lat: Number(body.lat || 0),
    lng: Number(body.lng || 0),
    featured: Boolean(body.featured),
    tags: Array.isArray(body.tags) ? body.tags : [],
    description: body.description || "",
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    images:
      Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    floorPlan: body.floorPlan || null,
    views: Number(body.views || 0),
    saves: Number(body.saves || 0),
    daysListed: Number(body.daysListed || 0),
  };
}

async function listProperties(req, res, next) {
  try {
    const query = {
      pendingApproval: req.query.includePending === "true" ? { $in: [true, false] } : false,
    };

    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.city) query.city = req.query.city;
    if (req.query.agentId) query.agentId = req.query.agentId;
    if (req.query.featured === "true") query.featured = true;

    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

async function getPropertyById(req, res, next) {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property || property.pendingApproval) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    res.json(property);
  } catch (err) {
    next(err);
  }
}

async function createProperty(req, res, next) {
  try {
    const data = normalizePropertyInput(req.body);

    if (!data.title || !data.address || !data.city || !data.state) {
      res.status(400).json({ message: "Missing required property fields" });
      return;
    }

    let agentId = req.body.agentId;

    if (req.user.role === "agent") {
      agentId = req.user.agentId;
    }

    if (!agentId) {
      const firstAgent = await Agent.findOne({ status: "Active" }).sort({ createdAt: 1 });
      agentId = firstAgent?.id;
    }

    if (!agentId) {
      res.status(400).json({ message: "No active agent available for this listing" });
      return;
    }

    const property = await Property.create({
      ...data,
      id: generateId("p"),
      agentId,
      pendingApproval: false,
    });

    await syncAgentMetrics(agentId);

    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
}

async function updateProperty(req, res, next) {
  try {
    const property = await Property.findOne({ id: req.params.id });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    if (req.user.role === "agent" && property.agentId !== req.user.agentId) {
      res.status(403).json({ message: "You can only edit your own listings" });
      return;
    }

    const updates = normalizePropertyInput({ ...property.toJSON(), ...req.body });
    const oldAgentId = property.agentId;

    if (req.user.role === "admin" && req.body.agentId) {
      property.agentId = req.body.agentId;
    }

    Object.assign(property, updates);

    await property.save();

    await Promise.all([
      syncAgentMetrics(oldAgentId),
      syncAgentMetrics(property.agentId),
    ]);

    res.json(property);
  } catch (err) {
    next(err);
  }
}

async function deleteProperty(req, res, next) {
  try {
    const property = await Property.findOne({ id: req.params.id });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    if (req.user.role === "agent" && property.agentId !== req.user.agentId) {
      res.status(403).json({ message: "You can only delete your own listings" });
      return;
    }

    const { agentId } = property;
    await property.deleteOne();
    await syncAgentMetrics(agentId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};

