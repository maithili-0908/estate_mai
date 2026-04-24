const Agent = require("../models/Agent");
const Property = require("../models/Property");
const Review = require("../models/Review");

async function syncAgentMetrics(agentId) {
  const [activeCount, reviewDocs] = await Promise.all([
    Property.countDocuments({ agentId, pendingApproval: false }),
    Review.find({ agentId }),
  ]);

  const reviewCount = reviewDocs.length;
  const rating =
    reviewCount === 0
      ? 0
      : Number(
          (
            reviewDocs.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
            reviewCount
          ).toFixed(1)
        );

  await Agent.updateOne(
    { id: agentId },
    {
      $set: {
        propertiesActive: activeCount,
        reviewCount,
        rating,
      },
    }
  );
}

module.exports = {
  syncAgentMetrics,
};

