import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiGrid, FiList, FiSliders, FiX, FiChevronDown } from "react-icons/fi";
import PropertyCard from "../components/property/PropertyCard";
import SearchBar from "../components/common/SearchBar";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Largest Size", value: "size" },
];

export default function PropertiesPage() {
  const { properties, filterOptions } = useApp();
  const priceRanges = filterOptions?.priceRanges || [];
  const propertyTypes = filterOptions?.propertyTypes || ["All"];
  const cities = filterOptions?.cities || ["All Cities"];
  const statusOptions = filterOptions?.statusOptions || ["All"];
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchingServer, setSearchingServer] = useState(false);
  const [serverFilteredProperties, setServerFilteredProperties] = useState(null);
  const readSearchFilters = useCallback(
    () => ({
      keyword: searchParams.get("keyword") || "",
      type: searchParams.get("type") || "",
      city: searchParams.get("city") || "",
      status: searchParams.get("status") || "",
      price: searchParams.get("price") || "",
      beds: searchParams.get("beds") || "",
    }),
    [searchParams]
  );

  const [filters, setFilters] = useState({
    ...readSearchFilters(),
    minSize: "",
    maxSize: "",
    amenities: [],
    yearBuilt: "",
  });
  const topSearchFilters = useMemo(
    () => ({
      keyword: filters.keyword,
      type: filters.type,
      city: filters.city,
      status: filters.status,
      price: filters.price,
      beds: filters.beds,
    }),
    [filters.keyword, filters.type, filters.city, filters.status, filters.price, filters.beds]
  );
  const hasTopSearchFilters = useMemo(
    () => Object.values(topSearchFilters).some((value) => Boolean(String(value || "").trim())),
    [topSearchFilters]
  );

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    const queryFilters = readSearchFilters();
    setFilters((prev) => {
      const next = { ...prev, ...queryFilters };
      const hasChanged =
        prev.keyword !== next.keyword ||
        prev.type !== next.type ||
        prev.city !== next.city ||
        prev.status !== next.status ||
        prev.price !== next.price ||
        prev.beds !== next.beds;

      return hasChanged ? next : prev;
    });
  }, [readSearchFilters]);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (!hasTopSearchFilters) {
        if (active) {
          setServerFilteredProperties(null);
          setSearchingServer(false);
        }
        return;
      }

      setSearchingServer(true);

      try {
        const params = {};

        if (topSearchFilters.keyword) params.keyword = topSearchFilters.keyword;
        if (topSearchFilters.type) params.type = topSearchFilters.type;
        if (topSearchFilters.city) params.city = topSearchFilters.city;
        if (topSearchFilters.status) params.status = topSearchFilters.status;
        if (topSearchFilters.beds) params.beds = parseInt(topSearchFilters.beds, 10);

        if (topSearchFilters.price) {
          const range = priceRanges.find((entry) => entry.label === topSearchFilters.price);
          if (range) {
            if (Number.isFinite(range.min)) params.minPrice = range.min;
            if (Number.isFinite(range.max)) params.maxPrice = range.max;
          }
        }

        const { data } = await api.get("/properties", { params });
        if (active) setServerFilteredProperties(Array.isArray(data) ? data : []);
      } catch (_err) {
        if (active) setServerFilteredProperties(null);
      } finally {
        if (active) setSearchingServer(false);
      }
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [hasTopSearchFilters, priceRanges, topSearchFilters]);

  const handleTopSearch = useCallback(
    (nextFilters) => {
      const queryFilters = {
        keyword: String(nextFilters?.keyword || "").trim(),
        type: nextFilters?.type || "",
        city: nextFilters?.city || "",
        status: nextFilters?.status || "",
        price: nextFilters?.price || "",
        beds: nextFilters?.beds || "",
      };

      setFilters((prev) => ({ ...prev, ...queryFilters }));

      const params = new URLSearchParams();
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      setSearchParams(params);
    },
    [setSearchParams]
  );

  const priceRange = useMemo(() => {
    const r = priceRanges.find((r) => r.label === filters.price);
    return r || { min: 0, max: Infinity };
  }, [filters.price]);

  const filtered = useMemo(() => {
    const source = Array.isArray(serverFilteredProperties) ? serverFilteredProperties : properties;
    let list = [...source];

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(kw) ||
        p.address.toLowerCase().includes(kw) ||
        p.city.toLowerCase().includes(kw) ||
        p.type.toLowerCase().includes(kw)
      );
    }
    if (filters.type) list = list.filter((p) => p.type === filters.type);
    if (filters.city) list = list.filter((p) => p.city === filters.city);
    if (filters.status) list = list.filter((p) => p.status === filters.status);
    if (filters.price) list = list.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    if (filters.beds) {
      const min = parseInt(filters.beds);
      list = list.filter((p) => p.bedrooms >= min);
    }
    if (filters.minSize) list = list.filter((p) => p.size >= parseInt(filters.minSize));
    if (filters.maxSize) list = list.filter((p) => p.size <= parseInt(filters.maxSize));
    if (filters.amenities.length > 0) {
      list = list.filter((p) => filters.amenities.every((a) => p.amenities?.includes(a)));
    }

    switch (sort) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "popular": list.sort((a, b) => b.views - a.views); break;
      case "size": list.sort((a, b) => b.size - a.size); break;
      default: list.sort((a, b) => a.daysListed - b.daysListed);
    }

    return list;
  }, [filters, priceRange, properties, serverFilteredProperties, sort]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== "amenities" ? Boolean(v) : v.length > 0
  ).length;

  const allAmenities = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => p.amenities?.forEach((a) => set.add(a)));
    return [...set].slice(0, 10);
  }, [properties]);

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-ink py-10 px-4">
        <div className="page-container">
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Property Listings</h1>
          <p className="text-stone-400 text-sm">Browse our curated collection of premium properties</p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar compact initialFilters={filters} onSearch={handleTopSearch} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                sidebarOpen || activeFilterCount > 0
                  ? "bg-gold text-ink border-gold"
                  : "bg-white border-stone-200 text-stone-600 hover:border-gold/40"
              }`}
            >
              <FiSliders />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="text-sm text-stone-500">
              <span className="font-semibold text-ink">{filtered.length}</span> properties found
              {searchingServer && hasTopSearchFilters && (
                <span className="ml-2 text-xs text-stone-400">Updating...</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-stone-600 outline-none focus:border-gold cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" />
            </div>
            <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2.5 transition-colors ${view === "grid" ? "bg-ink text-white" : "text-stone-500 hover:bg-stone-50"}`}>
                <FiGrid className="text-sm" />
              </button>
              <button onClick={() => setView("list")} className={`p-2.5 transition-colors ${view === "list" ? "bg-ink text-white" : "text-stone-500 hover:bg-stone-50"}`}>
                <FiList className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {sidebarOpen && (
            <aside className="w-72 flex-shrink-0 animate-slide-right">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-ink">Refine Results</h3>
                  <button
                    onClick={() => setFilters({ keyword: "", type: "", city: "", status: "", price: "", beds: "", minSize: "", maxSize: "", amenities: [], yearBuilt: "" })}
                    className="text-xs text-stone-400 hover:text-gold transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Type */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Property Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {propertyTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter("type", t === "All" ? "" : t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          (filters.type === t || (t === "All" && !filters.type))
                            ? "bg-gold text-ink border-gold"
                            : "border-stone-200 text-stone-600 hover:border-gold/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilter("status", s === "All" ? "" : s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          (filters.status === s || (s === "All" && !filters.status))
                            ? "bg-ink text-white border-ink"
                            : "border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Price Range</label>
                  <select value={filters.price} onChange={(e) => setFilter("price", e.target.value)} className="select-field text-xs">
                    {priceRanges.map((r) => <option key={r.label} value={r.label === "Any Price" ? "" : r.label}>{r.label}</option>)}
                  </select>
                </div>

                {/* City */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">City</label>
                  <select value={filters.city} onChange={(e) => setFilter("city", e.target.value)} className="select-field text-xs">
                    {cities.map((c) => <option key={c} value={c === "All Cities" ? "" : c}>{c}</option>)}
                  </select>
                </div>

                {/* Bedrooms */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Min. Bedrooms</label>
                  <div className="flex gap-1.5">
                    {["Any", "1", "2", "3", "4", "5"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setFilter("beds", b === "Any" ? "" : b)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          (filters.beds === b || (b === "Any" && !filters.beds))
                            ? "bg-gold text-ink border-gold"
                            : "border-stone-200 text-stone-600 hover:border-gold/40"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-5">
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Size (sq ft)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minSize} onChange={(e) => setFilter("minSize", e.target.value)} className="input-field text-xs flex-1" />
                    <input type="number" placeholder="Max" value={filters.maxSize} onChange={(e) => setFilter("maxSize", e.target.value)} className="input-field text-xs flex-1" />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Amenities</label>
                  <div className="space-y-1.5">
                    {allAmenities.map((a) => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(a)}
                          onChange={(e) => {
                            setFilters((f) => ({
                              ...f,
                              amenities: e.target.checked ? [...f.amenities, a] : f.amenities.filter((x) => x !== a),
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-gold rounded"
                        />
                        <span className="text-xs text-stone-600 group-hover:text-ink transition-colors">{a}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                <div className="text-5xl mb-4">No properties</div>
                <h3 className="font-serif text-xl font-semibold text-ink mb-2">No properties found</h3>
                <p className="text-stone-500 text-sm mb-5">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => setFilters({ keyword: "", type: "", city: "", status: "", price: "", beds: "", minSize: "", maxSize: "", amenities: [], yearBuilt: "" })}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
              }>
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} showCompare />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
