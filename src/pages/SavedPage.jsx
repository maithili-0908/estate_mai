import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowRight, FiTrash2 } from "react-icons/fi";
import PropertyCard from "../components/property/PropertyCard";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function SavedPage() {
  const { savedProperties, clearSaved, properties } = useApp();
  const saved = properties.filter((p) => savedProperties.includes(p.id));

  const clearAll = async () => {
    try {
      await clearSaved();
      toast.success("All saved properties cleared");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not clear saved properties");
    }
  };

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-12 px-4">
        <div className="page-container flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white mb-1">Saved Properties</h1>
            <p className="text-stone-400 text-sm">{saved.length} {saved.length === 1 ? "property" : "properties"} saved</p>
          </div>
          {saved.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-2 text-xs text-stone-400 hover:text-red-400 transition-colors border border-white/15 hover:border-red-400/40 px-3 py-2 rounded-xl">
              <FiTrash2 /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="page-container py-10">
        {saved.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-stone-200 shadow-card">
            <FiHeart className="text-5xl text-stone-300 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">No Saved Properties</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              Browse our listings and click the heart icon to save your favourite properties here.
            </p>
            <Link to="/properties" className="btn-primary">
              Browse Properties <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map((p) => (
              <PropertyCard key={p.id} property={p} showCompare />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
