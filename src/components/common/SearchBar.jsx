import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiSliders } from "react-icons/fi";
import { useApp } from "../../context/AppContext";

function normalizeFilters(initialFilters = {}) {
  return {
    city: initialFilters.city || "",
    type: initialFilters.type || "",
    price: initialFilters.price || "",
    status: initialFilters.status || "",
    beds: initialFilters.beds || "",
    keyword: initialFilters.keyword || "",
  };
}

export default function SearchBar({ compact = false, initialFilters = {}, onSearch = null }) {
  const { filterOptions } = useApp();
  const navigate = useNavigate();
  const cities = filterOptions?.cities || ["All Cities"];
  const propertyTypes = filterOptions?.propertyTypes || ["All"];
  const priceRanges = filterOptions?.priceRanges || [];
  const statusOptions = filterOptions?.statusOptions || ["All"];
  const [filters, setFilters] = useState(() => normalizeFilters(initialFilters));

  const handleChange = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    setFilters(normalizeFilters(initialFilters));
  }, [
    initialFilters.city,
    initialFilters.type,
    initialFilters.price,
    initialFilters.status,
    initialFilters.beds,
    initialFilters.keyword,
  ]);

  const handleSearch = () => {
    if (typeof onSearch === "function") {
      onSearch(filters);
      return;
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/properties?${params.toString()}`);
  };

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            type="text"
            placeholder="Search properties..."
            value={filters.keyword}
            onChange={(e) => handleChange("keyword", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="input-field pl-9"
          />
        </div>
        <select value={filters.type} onChange={(e) => handleChange("type", e.target.value)} className="select-field w-auto min-w-[140px]">
          <option value="">All Types</option>
          {propertyTypes.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => handleChange("status", e.target.value)} className="select-field w-auto min-w-[130px]">
          <option value="">Any Status</option>
          {statusOptions.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleSearch} className="btn-primary py-2.5 px-5 text-sm">
          <FiSearch className="text-sm" /> Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card-hover border border-stone-200 p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Keyword */}
        <div className="lg:col-span-2 relative">
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Location or keyword</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="City, neighborhood, address..."
              value={filters.keyword}
              onChange={(e) => handleChange("keyword", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Property Type</label>
          <div className="relative">
            <select value={filters.type} onChange={(e) => handleChange("type", e.target.value)} className="select-field pr-8">
              <option value="">All Types</option>
              {propertyTypes.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <FiSliders className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Price Range</label>
          <div className="relative">
            <select value={filters.price} onChange={(e) => handleChange("price", e.target.value)} className="select-field pr-8">
              <option value="">Any Price</option>
              {priceRanges.slice(1).map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
            </select>
            <FiSliders className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button onClick={handleSearch} className="btn-primary w-full justify-center">
            <FiSearch /> Search
          </button>
        </div>
      </div>

      {/* Advanced row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-100">
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">City</label>
          <select value={filters.city} onChange={(e) => handleChange("city", e.target.value)} className="select-field text-xs">
            {cities.map((c) => <option key={c} value={c === "All Cities" ? "" : c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Status</label>
          <select value={filters.status} onChange={(e) => handleChange("status", e.target.value)} className="select-field text-xs">
            {statusOptions.map((s) => <option key={s} value={s === "All" ? "" : s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Bedrooms</label>
          <select value={filters.beds} onChange={(e) => handleChange("beds", e.target.value)} className="select-field text-xs">
            {["Any", "1+", "2+", "3+", "4+", "5+"].map((b) => <option key={b} value={b === "Any" ? "" : b}>{b} beds</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => setFilters({ city: "", type: "", price: "", status: "", beds: "", keyword: "" })}
            className="text-xs text-stone-400 hover:text-gold transition-colors pb-2.5 flex items-center gap-1">
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
