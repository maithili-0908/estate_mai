import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlay, FiStar, FiAward, FiUsers, FiHome, FiTrendingUp, FiShield } from "react-icons/fi";
import { IoBedOutline } from "react-icons/io5";
import PropertyCard from "../components/property/PropertyCard";
import SearchBar from "../components/common/SearchBar";
import { useApp } from "../context/AppContext";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
];

export default function HomePage() {
  const { properties, agents, platformStats } = useApp();
  const [heroIdx, setHeroIdx] = useState(0);
  const featured = properties.filter((p) => p.featured).slice(0, 3);
  const recent = properties.slice(0, 4);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background images with crossfade */}
        {HERO_IMAGES.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroIdx ? 1 : 0 }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />
          </div>
        ))}

        {/* Dot navigation */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`transition-all duration-300 rounded-full ${
                i === heroIdx ? "w-8 h-2 bg-gold" : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <div className="page-container relative z-10 pt-24 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold-300 text-xs font-semibold uppercase tracking-widest">Premium Real Estate</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5 animate-fade-up">
              Find Your
              <span className="block text-gold italic">Dream Home</span>
              Today
            </h1>

            <p className="text-stone-300 text-lg leading-relaxed mb-8 animate-fade-up animation-delay-100 max-w-xl">
              Discover extraordinary properties across the world's most prestigious locations. From Manhattan penthouses to Malibu oceanfront estates.
            </p>

            <div className="flex flex-wrap gap-3 mb-12 animate-fade-up animation-delay-200">
              <Link to="/properties" className="btn-primary btn-lg">
                Browse Properties <FiArrowRight />
              </Link>
              <Link to="/map" className="flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 border border-white/20">
                <FiPlay className="text-gold text-sm" />
                View on Map
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 animate-fade-up animation-delay-300">
              {[
                { label: "Properties", value: platformStats.totalProperties.toLocaleString() },
                { label: "Cities", value: platformStats.citiesCovered },
                { label: "Expert Agents", value: platformStats.agentCount },
                { label: "In Sales", value: platformStats.totalSales },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-2xl font-bold text-gold-300">{s.value}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEARCH ───────────────────────────────────────────── */}
      <section className="page-container -mt-10 relative z-20 mb-16">
        <SearchBar />
      </section>

      {/* ─── FEATURED PROPERTIES ─────────────────────────────── */}
      <section className="page-container mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Curated Selection</p>
            <h2 className="section-title">Featured <span className="text-gold-700">Properties</span></h2>
            <p className="section-subtitle">Handpicked luxury residences in the most sought-after locations.</p>
          </div>
          <Link to="/properties?filter=featured" className="hidden md:flex section-link btn-ghost">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => <PropertyCard key={p.id} property={p} showCompare />)}
        </div>
        <div className="mt-6 md:hidden text-center">
          <Link to="/properties" className="btn-dark">View All Properties <FiArrowRight /></Link>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ─────────────────────────────────── */}
      <section className="bg-stone-100 py-20">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Browse By</p>
            <h2 className="section-title mx-auto">Property <span className="text-gold-700">Categories</span></h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Houses", icon: "🏠", count: 312, type: "House" },
              { label: "Penthouses", icon: "🏙️", count: 84, type: "Penthouse" },
              { label: "Villas", icon: "🌴", count: 156, type: "Villa" },
              { label: "Estates", icon: "🏰", count: 48, type: "Estate" },
              { label: "Chalets", icon: "🏔️", count: 62, type: "Chalet" },
              { label: "Mansions", icon: "🏛️", count: 94, type: "Mansion" },
            ].map((cat) => (
              <Link
                key={cat.label}
                to={`/properties?type=${cat.type}`}
                className="bg-white rounded-2xl p-5 text-center border border-stone-200 hover:border-gold/40 hover:shadow-card transition-all duration-200 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <div className="font-semibold text-sm text-ink mb-0.5">{cat.label}</div>
                <div className="text-xs text-stone-400">{cat.count} listings</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US ──────────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Why LuxEstate</p>
            <h2 className="section-title mb-4">
              The Smarter Way to<br />
              <span className="text-gold-700">Buy & Sell</span>
            </h2>
            <p className="text-stone-500 leading-relaxed mb-8 max-w-md">
              We combine industry expertise with cutting-edge technology to deliver an unparalleled real estate experience from search to close.
            </p>
            <div className="space-y-5">
              {[
                { icon: FiShield, title: "Verified Listings", desc: "Every property undergoes rigorous verification to ensure accuracy and legitimacy." },
                { icon: FiUsers, title: "Expert Agents", desc: "Our elite network of 300+ agents brings unrivalled local market knowledge." },
                { icon: FiTrendingUp, title: "Market Insights", desc: "Access real-time data and analytics to make confident, informed decisions." },
                { icon: FiAward, title: "Award-Winning Service", desc: "Recognised as the #1 luxury real estate platform for the third consecutive year." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink mb-0.5">{title}</div>
                    <div className="text-xs text-stone-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700"
              alt="Luxury home"
              className="rounded-2xl w-full object-cover h-[500px] shadow-card-hover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-5 shadow-card-hover border border-stone-200 max-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <FiStar className="text-gold fill-gold text-sm" />
                <span className="font-bold text-sm text-ink">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-stone-500 leading-snug">"LuxEstate made our home purchase an absolute pleasure. Truly exceptional."</p>
              <div className="flex items-center gap-2 mt-3">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-6 h-6 rounded-full" />
                <span className="text-xs text-stone-400">Sarah M. – NYC</span>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 bg-ink rounded-2xl p-4 shadow-card-hover text-white">
              <div className="font-serif text-2xl font-bold text-gold">{platformStats.totalSales}</div>
              <div className="text-xs text-stone-400 mt-0.5">Total Sales</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT LISTINGS ─────────────────────────────────── */}
      <section className="bg-stone-100 py-20">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Just Listed</p>
              <h2 className="section-title">Latest <span className="text-gold-700">Listings</span></h2>
            </div>
            <Link to="/properties" className="hidden md:flex section-link btn-ghost">All Properties <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recent.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* ─── TOP AGENTS ──────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Our Team</p>
            <h2 className="section-title">Meet Our <span className="text-gold-700">Agents</span></h2>
          </div>
          <Link to="/agents" className="hidden md:flex section-link btn-ghost">All Agents <FiArrowRight /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Link key={agent.id} to={`/agents/${agent.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group text-center p-6">
              <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-3 border-stone-200 group-hover:border-gold/40 transition-colors" />
              <h3 className="font-serif font-semibold text-ink text-base mb-0.5">{agent.name}</h3>
              <p className="text-xs text-stone-500 mb-2">{agent.title}</p>
              <div className="flex items-center justify-center gap-1 mb-3">
                <FiStar className="text-gold fill-gold text-xs" />
                <span className="text-xs font-semibold text-ink">{agent.rating}</span>
                <span className="text-xs text-stone-400">({agent.reviewCount})</span>
              </div>
              <div className="flex justify-center gap-4 text-center">
                <div>
                  <div className="font-bold text-sm text-ink">{agent.propertiesSold}</div>
                  <div className="text-[10px] text-stone-400">Sold</div>
                </div>
                <div className="w-px bg-stone-200" />
                <div>
                  <div className="font-bold text-sm text-ink">{agent.yearsExp}y</div>
                  <div className="text-[10px] text-stone-400">Exp.</div>
                </div>
                <div className="w-px bg-stone-200" />
                <div>
                  <div className="font-bold text-sm text-ink">{agent.propertiesActive}</div>
                  <div className="text-[10px] text-stone-400">Active</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="bg-ink py-20">
        <div className="page-container text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Ready to Begin?</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-4">
            Your Perfect Property<br />
            <span className="text-gold">Awaits You</span>
          </h2>
          <p className="text-stone-400 max-w-md mx-auto mb-8 leading-relaxed">
            Join thousands of satisfied clients who found their dream home through LuxEstate's unrivalled network.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary btn-lg">Create Free Account <FiArrowRight /></Link>
            <Link to="/agents" className="btn-secondary btn-lg border-gold/40">Talk to an Agent</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
