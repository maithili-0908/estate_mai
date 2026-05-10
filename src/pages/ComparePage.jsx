import React from "react";
import { Link } from "react-router-dom";
import { FiX, FiCheck, FiPlus, FiArrowRight } from "react-icons/fi";
import { IoBedOutline, IoWaterOutline } from "react-icons/io5";
import { FiMaximize } from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { useApp } from "../context/AppContext";

const ROW = (label, fn) => ({ label, fn });

const ROWS = [
  ROW("Price", (p) => <span className="font-bold text-gold-700">{p.priceLabel}</span>),
  ROW("Status", (p) => <span className={`badge ${p.status === "For Sale" ? "badge-gold" : "badge-dark"} text-[10px]`}>{p.status}</span>),
  ROW("Type", (p) => p.type),
  ROW("Bedrooms", (p) => p.bedrooms),
  ROW("Bathrooms", (p) => p.bathrooms),
  ROW("Size", (p) => `${p.size.toLocaleString()} sq ft`),
  ROW("Price / sq ft", (p) => `$${Math.round(p.price / p.size).toLocaleString()}`),
  ROW("Year Built", (p) => p.yearBuilt),
  ROW("Garage", (p) => p.garage ? `${p.garage} cars` : "None"),
  ROW("Location", (p) => `${p.city}, ${p.state}`),
  ROW("Days Listed", (p) => `${p.daysListed} days`),
  ROW("Views", (p) => p.views.toLocaleString()),
];

export default function ComparePage() {
  const { compareList, toggleCompare, properties } = useApp();
  const compared = compareList.map((id) => properties.find((p) => p.id === id)).filter(Boolean);

  const placeholder = (key) => (
    <div key={key} className="flex-1 min-w-[220px] max-w-[280px] flex items-center justify-center border-2 border-dashed border-stone-300 rounded-2xl h-full min-h-[180px] bg-stone-50">
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-3">
          <FiPlus className="text-stone-400 text-xl" />
        </div>
        <p className="text-xs text-stone-400 font-medium">Add a property</p>
        <Link to="/properties" className="text-xs text-gold font-semibold mt-1.5 hover:underline block">Browse listings</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-12 px-4">
        <div className="page-container">
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Compare Properties</h1>
          <p className="text-stone-400 text-sm">Side-by-side comparison of up to 3 properties</p>
        </div>
      </div>

      <div className="page-container py-10">
        {compared.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-card">
            <div className="text-6xl mb-4">No items</div>
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">Nothing to Compare</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              Browse properties and click "+ Compare" to add them here. You can compare up to 3 at once.
            </p>
            <Link to="/properties" className="btn-primary">
              Browse Properties <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header row */}
              <div className="flex gap-4 mb-6">
                <div className="w-40 flex-shrink-0" /> {/* label column */}
                {compared.map((p) => (
                  <div key={p.id} className="flex-1 min-w-[220px] max-w-[280px] bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
                    <div className="relative">
                      <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover" />
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
                      >
                        <FiX className="text-xs" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/70 to-transparent p-3">
                        <p className="font-serif font-bold text-white text-sm leading-tight">{p.title}</p>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <Link to={`/properties/${p.id}`} className="text-xs text-gold font-semibold hover:underline inline-flex items-center gap-1">
                        View Details <FiArrowRight className="text-[10px]" />
                      </Link>
                    </div>
                  </div>
                ))}
                {/* Placeholders */}
                {Array.from({ length: Math.max(0, 3 - compared.length) }).map((_, i) => placeholder(`ph-${i}`))}
              </div>

              {/* Comparison rows */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
                {ROWS.map((row, ri) => (
                  <div key={row.label} className={`flex items-center ${ri !== ROWS.length - 1 ? "border-b border-stone-100" : ""}`}>
                    <div className="w-40 flex-shrink-0 px-4 py-3.5">
                      <span className="text-xs font-semibold text-stone-500">{row.label}</span>
                    </div>
                    {compared.map((p) => (
                      <div key={p.id} className="flex-1 min-w-[220px] max-w-[280px] px-4 py-3.5 border-l border-stone-100">
                        <span className="text-sm text-ink">{row.fn(p)}</span>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - compared.length) }).map((_, i) => (
                      <div key={i} className="flex-1 min-w-[220px] max-w-[280px] px-4 py-3.5 border-l border-stone-100 border-dashed bg-stone-50/50" />
                    ))}
                  </div>
                ))}

                {/* Amenities row */}
                <div className="border-t border-stone-200">
                  <div className="flex">
                    <div className="w-40 flex-shrink-0 px-4 py-3.5 border-b border-stone-100">
                      <span className="text-xs font-semibold text-stone-500">Amenities</span>
                    </div>
                    {compared.map((p) => {
                      const allAmenities = [...new Set(compared.flatMap((x) => x.amenities || []))];
                      return (
                        <div key={p.id} className="flex-1 min-w-[220px] max-w-[280px] px-4 py-3.5 border-l border-stone-100 border-b">
                          <div className="flex flex-col gap-1">
                            {allAmenities.slice(0, 8).map((a) => (
                              <div key={a} className="flex items-center gap-1.5 text-xs">
                                {p.amenities?.includes(a) ? (
                                  <FiCheck className="text-green-500 text-[11px] flex-shrink-0" />
                                ) : (
                                  <FiX className="text-stone-300 text-[11px] flex-shrink-0" />
                                )}
                                <span className={p.amenities?.includes(a) ? "text-stone-700" : "text-stone-300"}>{a}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - compared.length) }).map((_, i) => (
                      <div key={i} className="flex-1 min-w-[220px] max-w-[280px] px-4 py-3.5 border-l border-stone-100 border-dashed border-b bg-stone-50/50" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
