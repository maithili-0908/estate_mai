function formatPriceLabel(price, status = "For Sale") {
  const amount = Number(price || 0);

  if (amount >= 1000000) {
    const base = `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
    return status === "For Rent" ? `${base}/mo` : base;
  }

  const base = `$${amount.toLocaleString()}`;
  return status === "For Rent" ? `${base}/mo` : base;
}

module.exports = {
  formatPriceLabel,
};

