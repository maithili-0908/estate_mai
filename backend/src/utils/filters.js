const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: "Under $1M", min: 0, max: 1000000 },
  { label: "$1M - $5M", min: 1000000, max: 5000000 },
  { label: "$5M - $10M", min: 5000000, max: 10000000 },
  { label: "$10M - $20M", min: 10000000, max: 20000000 },
  { label: "$20M+", min: 20000000, max: Number.MAX_SAFE_INTEGER },
];

function buildFilterOptions(properties) {
  const propertyTypes = ["All", ...new Set(properties.map((property) => property.type))];
  const cities = ["All Cities", ...new Set(properties.map((property) => property.city))];
  const statusOptions = ["All", "For Sale", "For Rent", "Sold", "Pending"];

  return {
    propertyTypes,
    priceRanges: PRICE_RANGES,
    cities,
    statusOptions,
    bedroomOptions: ["Any", "1+", "2+", "3+", "4+", "5+"],
  };
}

module.exports = {
  buildFilterOptions,
  PRICE_RANGES,
};

