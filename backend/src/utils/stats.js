function formatCurrencyCompact(amount) {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }

  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }

  return `$${amount.toLocaleString()}`;
}

function computePlatformStats(properties, agents) {
  const totalProperties = properties.length;
  const citiesCovered = new Set(properties.map((p) => p.city)).size;
  const agentCount = agents.filter((agent) => agent.status !== "Suspended").length;
  const totalSales = properties.reduce((sum, property) => sum + Number(property.price || 0), 0);

  return {
    totalProperties,
    citiesCovered,
    agentCount,
    totalSales: formatCurrencyCompact(totalSales),
  };
}

function computeAdminStats({ users, properties, agents, appointments }) {
  const totalUsers = users.length;
  const activeListings = properties.filter((p) => !p.pendingApproval).length;
  const monthlyRevenue = properties
    .filter((property) => property.status === "Sold")
    .reduce((sum, property) => sum + Number(property.price || 0), 0);

  const pendingApprovals = properties.filter((p) => p.pendingApproval).length;
  const totalAgents = agents.length;

  const today = new Date().toISOString().split("T")[0];
  const viewingsToday = appointments.filter((appointment) => appointment.date === today).length;

  const conversionRate = activeListings === 0 ? 0 : Number(((appointments.length / activeListings) * 10).toFixed(1));
  const avgDaysOnMarket =
    activeListings === 0
      ? 0
      : Math.round(
          properties
            .filter((property) => !property.pendingApproval)
            .reduce((sum, property) => sum + Number(property.daysListed || 0), 0) / activeListings
        );

  return {
    totalUsers,
    activeListings,
    monthlyRevenue,
    pendingApprovals,
    totalAgents,
    viewingsToday,
    conversionRate,
    avgDaysOnMarket,
  };
}

module.exports = {
  computePlatformStats,
  computeAdminStats,
};

