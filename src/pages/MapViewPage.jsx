import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FiList, FiFilter, FiX, FiMapPin } from "react-icons/fi";
import { IoBedOutline } from "react-icons/io5";
import { useApp } from "../context/AppContext";

// Custom gold marker
const goldIcon = (label) =>
  L.divIcon({
    html: `<div style="background:#C9A84C;color:#0D0D0D;font-weight:700;font-size:11px;padding:4px 8px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:'DM Sans',sans-serif;border:2px solid #0D0D0D">${label}</div>`,
    className: "",
    iconAnchor: [20, 20],
  });

const selectedIcon = (label) =>
  L.divIcon({
    html: `<div style="background:#0D0D0D;color:#C9A84C;font-weight:700;font-size:11px;padding:5px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.4);font-family:'DM Sans',sans-serif;border:2px solid #C9A84C">${label}</div>`,
    className: "",
    iconAnchor: [20, 20],
  });

const formatPrice = (p) =>
  p >= 1000000 ? `$${(p / 1000000).toFixed(1)}M` : `$${(p / 1000).toFixed(0)}K`;

export default function MapViewPage() {
  const { properties, filterOptions } = useApp();
  const propertyTypes = filterOptions?.propertyTypes || ["All"];
  const statusOptions = filterOptions?.statusOptions || ["All"];
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(true);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = properties.filter((p) => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  const selectedProp = selected ? properties.find((p) => p.id === selected) : null;

  return (
    <div className="pt-[68px] h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 z-10">
        <h1 className="font-serif font-bold text-ink text-lg">Map View</h1>
        <span className="text-xs text-stone-400">- {filtered.length} properties</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filtersOpen ? "bg-gold text-ink border-gold" : "border-stone-200 text-stone-600 hover:border-gold/40 bg-white"}`}>
            <FiFilter /> Filters
            {(filters.type || filters.status) && <span className="w-4 h-4 rounded-full bg-ink text-white text-[9px] flex items-center justify-center">!</span>}
          </button>
          <button onClick={() => setShowList(!showList)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showList ? "bg-ink text-white border-ink" : "border-stone-200 text-stone-600 bg-white hover:border-stone-400"}`}>
            <FiList /> {showList ? "Hide List" : "Show List"}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {filtersOpen && (
        <div className="bg-white border-b border-stone-200 px-4 py-3 flex gap-3 flex-wrap items-center animate-fade-in">
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="select-field text-xs w-auto min-w-[140px]">
            <option value="">All Types</option>
            {propertyTypes.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="select-field text-xs w-auto min-w-[130px]">
            <option value="">Any Status</option>
            {statusOptions.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(filters.type || filters.status) && (
            <button onClick={() => setFilters({ type: "", status: "" })}
              className="text-xs text-stone-400 hover:text-gold transition-colors flex items-center gap-1">
              <FiX className="text-[11px]" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Map + List */}
      <div className="flex flex-1 overflow-hidden">
        {/* Property List Sidebar */}
        {showList && (
          <div className="w-80 flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id === selected ? null : p.id)}
                className={`w-full text-left p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors group ${selected === p.id ? "bg-gold/8 border-l-3 border-l-gold" : ""}`}
              >
                <div className="flex gap-3">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-ink truncate mb-0.5">{p.title}</div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mb-1">
                      <FiMapPin className="text-gold" style={{ fontSize: 9 }} />
                      <span className="truncate">{p.city}, {p.state}</span>
                    </div>
                    <div className="font-bold text-sm text-gold-700">{formatPrice(p.price)}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-stone-400">{p.bedrooms} bd | {p.bathrooms} ba</span>
                      <span className={`badge ${p.status === "For Sale" ? "badge-gold" : "badge-dark"} text-[9px] py-0.5`}>{p.status}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[38.5, -96]}
            zoom={4}
            className="w-full h-full"
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='(c) OpenStreetMap contributors'
            />
            {filtered.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={selected === p.id ? selectedIcon(formatPrice(p.price)) : goldIcon(formatPrice(p.price))}
                eventHandlers={{ click: () => setSelected(p.id === selected ? null : p.id) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <img src={p.images[0]} alt={p.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                    <p className="font-bold text-sm text-ink">{p.title}</p>
                    <p className="text-xs text-stone-500 mb-1">{p.address}</p>
                    <p className="font-bold text-base text-gold-700 mb-2">{p.priceLabel}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                      <span>{p.bedrooms} bd</span>
                      <span>{p.bathrooms} ba</span>
                      <span>{p.size.toLocaleString()} sq ft</span>
                    </div>
                    <a href={`/properties/${p.id}`}
                      className="block text-center bg-ink text-white text-xs font-semibold py-2 rounded-lg hover:bg-ink-400 transition-colors">
                      View Details ->
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Selected property floating card */}
          {selectedProp && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-white rounded-2xl shadow-card-hover border border-stone-200 p-4 flex gap-4 items-center max-w-sm w-full mx-4 animate-fade-up">
              <img src={selectedProp.images[0]} alt={selectedProp.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-serif font-bold text-sm text-ink truncate">{selectedProp.title}</p>
                <p className="text-xs text-stone-400 truncate">{selectedProp.city}</p>
                <p className="font-bold text-gold-700 text-sm mt-0.5">{selectedProp.priceLabel}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link to={`/properties/${selectedProp.id}`}
                  className="bg-gold text-ink text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-gold-300 transition-colors text-center">
                  View
                </Link>
                <button onClick={() => setSelected(null)} className="text-[10px] text-stone-400 hover:text-ink transition-colors text-center">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
