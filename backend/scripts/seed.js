const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("../src/config/db");
const Agent = require("../src/models/Agent");
const Property = require("../src/models/Property");
const Review = require("../src/models/Review");
const Appointment = require("../src/models/Appointment");
const Message = require("../src/models/Message");
const Inquiry = require("../src/models/Inquiry");
const User = require("../src/models/User");

const {
  agents,
  properties,
  reviews,
  appointments,
  messages,
  users,
} = require("../src/utils/seedData");

async function seed() {
  await connectDB();

  await Promise.all([
    Agent.deleteMany({}),
    Property.deleteMany({}),
    Review.deleteMany({}),
    Appointment.deleteMany({}),
    Message.deleteMany({}),
    Inquiry.deleteMany({}),
    User.deleteMany({}),
  ]);

  await Agent.insertMany(agents);
  await Property.insertMany(properties);
  await Review.insertMany(reviews);
  await Appointment.insertMany(appointments);
  await Message.insertMany(messages);

  for (const user of users) {
    await User.create(user);
  }

  for (const agent of agents) {
    const activeProperties = await Property.countDocuments({
      agentId: agent.id,
      pendingApproval: false,
    });

    const agentReviews = await Review.find({ agentId: agent.id });
    const reviewCount = agentReviews.length;
    const avgRating =
      reviewCount === 0
        ? agent.rating || 0
        : Number(
            (
              agentReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            ).toFixed(1)
          );

    await Agent.updateOne(
      { id: agent.id },
      {
        $set: {
          propertiesActive: activeProperties,
          reviewCount,
          rating: avgRating,
        },
      }
    );
  }

  const agentUsers = await User.find({ role: "agent", agentId: { $ne: null } });
  for (const agentUser of agentUsers) {
    await Agent.updateOne({ id: agentUser.agentId }, { $set: { userId: agentUser.id } });
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
