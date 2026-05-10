import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiMessageSquare,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";

export default function AgentsPage() {
  const { agents, user } = useApp();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");

  const allSpecialties = [...new Set(agents.flatMap((a) => a.specialties))];

  const filtered = agents.filter((a) => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !specialty || a.specialties.includes(specialty);
    return matchSearch && matchSpec;
  });

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      {/* Hero Banner */}
      <div className="bg-ink py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,.5) 30px, rgba(255,255,255,.5) 31px)" }} />
        <div className="page-container relative z-10 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Our Team</p>
          <h1 className="font-serif text-4xl font-bold text-white mb-3">Meet Our Elite Agents</h1>
          <p className="text-stone-400 max-w-md mx-auto text-sm leading-relaxed">
            Award-winning specialists with unrivalled market expertise across the world's most prestigious locations.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-stone-200 sticky top-[68px] z-10">
        <div className="page-container py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSpecialty("")}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${!specialty ? "bg-gold text-ink border-gold" : "border-stone-200 text-stone-600 bg-white hover:border-gold/40"}`}>
              All Specialties
            </button>
            {allSpecialties.map((s) => (
              <button key={s} onClick={() => setSpecialty(s === specialty ? "" : s)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${specialty === s ? "bg-ink text-white border-ink" : "border-stone-200 text-stone-600 bg-white hover:border-stone-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        <p className="text-sm text-stone-500 mb-6">
          Showing <span className="font-semibold text-ink">{filtered.length}</span> agents
        </p>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtered.map((agent) => (
            <div key={agent.id} className="bg-white rounded-2xl border border-stone-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
              <div className="flex">
                {/* Left: Avatar */}
                <div className="relative w-40 flex-shrink-0">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    style={{ minHeight: "200px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-5 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-ink leading-tight">{agent.name}</h3>
                      <p className="text-xs text-stone-500 mb-1.5">{agent.title}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 bg-gold/10 px-2 py-1 rounded-lg">
                      <FiStar className="text-gold fill-gold text-xs" />
                      <span className="text-xs font-bold text-gold-700">{agent.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
                    <FiMapPin className="text-gold text-[11px]" /> {agent.location}
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.specialties.map((s) => (
                      <span key={s} className="tag text-[10px] py-0.5">{s}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 mb-4">
                    {[
                      { label: "Sold", val: agent.propertiesSold },
                      { label: "Years", val: agent.yearsExp },
                      { label: "Active", val: agent.propertiesActive },
                      { label: "Reviews", val: agent.reviewCount },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <div className="font-bold text-sm text-ink">{val}</div>
                        <div className="text-[10px] text-stone-400">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/agents/${agent.id}`} className="btn-primary text-xs py-2 px-4 flex-1 justify-center">
                      View Profile
                    </Link>
                    {user?.role === "user" ? (
                      <Link
                        to={`/agents/${agent.id}?contact=1`}
                        className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-gold/40 hover:text-gold transition-all"
                        title={`Message ${agent.name}`}
                      >
                        <FiMessageSquare className="text-sm" />
                      </Link>
                    ) : (
                      <a
                        href={`mailto:${agent.email}`}
                        className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-gold/40 hover:text-gold transition-all"
                        title={`Email ${agent.name}`}
                      >
                        <FiMail className="text-sm" />
                      </a>
                    )}
                    <a href={`tel:${agent.phone}`} className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-gold/40 hover:text-gold transition-all">
                      <FiPhone className="text-sm" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="font-serif text-xl font-semibold text-ink mb-2">No agents found</h3>
            <p className="text-stone-500 text-sm">Try a different search or specialty filter.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-stone-200 border-t border-stone-300 py-12">
        <div className="page-container text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">Are You an Agent?</h2>
          <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
            Join LuxEstate's elite network and connect with high-intent buyers and sellers worldwide.
          </p>
          <Link to="/register?role=agent" className="btn-dark">
            Join Our Network <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
