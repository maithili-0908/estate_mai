import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiMaximize, FiHome } from "react-icons/fi";
import { IoBedOutline, IoWaterOutline } from "react-icons/io5";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { useApp } from "../../context/AppContext";

export default function PropertyCard({ property, showCompare = false }) {
  const { savedProperties, toggleSave, compareList, toggleCompare, agents } = useApp();
  const isSaved = savedProperties.includes(property.id);
  const inCompare = compareList.includes(property.id);
  const agent = agents.find((a) => a.id === property.agentId);

  const formatPrice = (p) =>
    p >= 1000000
      ? `$${(p / 1000000).toFixed(p % 1000000 === 0 ? 0 : 1)}M`
      : `$${(p / 1000).toFixed(0)}K`;

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`badge ${property.status === "For Sale" ? "badge-gold" : "badge-dark"} text-[10px]`}>
            {property.status}
          </span>
          {property.tags.includes("New") && <span className="badge badge-green text-[10px]">New</span>}
          {property.tags.includes("Featured") && <span className="badge badge-purple text-[10px]">Featured</span>}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(property.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
            ${isSaved ? "bg-red-500 text-white" : "bg-white/90 text-stone-500 hover:text-red-500"}`}
        >
          <FiHeart className={`text-sm ${isSaved ? "fill-white" : ""}`} />
        </button>

        {/* Price on image bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="font-serif text-white text-lg font-bold drop-shadow-lg">
            {formatPrice(property.price)}
            {property.status === "For Rent" && <span className="text-xs font-sans font-normal opacity-80">/mo</span>}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="font-serif font-semibold text-ink text-base leading-tight mb-1 hover:text-gold-700 transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-stone-500 text-xs mb-3">
          <FiMapPin className="flex-shrink-0 text-gold text-xs" />
          <span className="truncate">{property.address}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <IoBedOutline className="text-stone-400 text-sm" />
            <span>{property.bedrooms} bd</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <IoWaterOutline className="text-stone-400 text-sm" />
            <span>{property.bathrooms} ba</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <FiMaximize className="text-stone-400 text-xs" />
            <span>{property.size.toLocaleString()} ft²</span>
          </div>
          {property.garage > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <MdOutlineDirectionsCar className="text-stone-400 text-sm" />
              <span>{property.garage}</span>
            </div>
          )}
        </div>

        {/* Agent & Compare */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          {agent && (
            <Link to={`/agents/${agent.id}`} className="flex items-center gap-2 group/agent">
              <img src={agent.avatar} alt={agent.name} className="w-7 h-7 rounded-full object-cover border border-stone-200" />
              <span className="text-xs text-stone-500 group-hover/agent:text-gold transition-colors">{agent.name}</span>
            </Link>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {showCompare && (
              <button
                onClick={(e) => { e.preventDefault(); toggleCompare(property.id); }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  inCompare
                    ? "bg-gold/15 border-gold/40 text-gold-700"
                    : "border-stone-200 text-stone-500 hover:border-gold/40 hover:text-gold-700"
                }`}
              >
                {inCompare ? "✓ Compare" : "+ Compare"}
              </button>
            )}
            <Link
              to={`/properties/${property.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-ink text-white hover:bg-ink-400 transition-colors font-medium"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
