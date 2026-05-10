import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiHeart, FiShare2, FiMapPin, FiPhone, FiMail, FiCalendar, FiMaximize,
  FiArrowLeft, FiArrowRight, FiStar, FiEye, FiClock, FiCheck,
  FiHome, FiArrowUpRight
} from "react-icons/fi";
import { IoBedOutline, IoWaterOutline } from "react-icons/io5";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    properties,
    savedProperties,
    toggleSave,
    toggleCompare,
    compareList,
    agents,
    sendPropertyInquiry,
  } = useApp();
  const property = properties.find((p) => p.id === id);
  const isLoggedInUser = user?.role === "user";

  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
    type: "viewing",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoggedInUser) return;

    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [isLoggedInUser, user?.name, user?.email, user?.phone]);

  if (!property) return (
    <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">Not found</div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Property Not Found</h2>
        <Link to="/properties" className="btn-primary mt-4">Back to Listings</Link>
      </div>
    </div>
  );

  const agent = agents.find((a) => a.id === property.agentId);
  const isSaved = savedProperties.includes(property.id);
  const inCompare = compareList.includes(property.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        propertyId: property.id,
        type: form.type,
        message: form.message,
      };

      if (form.type === "viewing") {
        payload.date = form.date;
        payload.time = form.time;
      }

      if (!isLoggedInUser) {
        payload.name = form.name;
        payload.email = form.email;
        payload.phone = form.phone;
      }

      await sendPropertyInquiry(payload);
      toast.success("Your inquiry has been sent! The agent will contact you shortly.");
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send inquiry");
    }
  };

  const similar = properties.filter((p) => p.id !== id && p.type === property.type).slice(0, 3);

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="page-container flex items-center gap-2 text-xs text-stone-500">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-gold transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-stone-700 font-medium truncate">{property.title}</span>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Back btn */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-ink mb-5 transition-colors">
          <FiArrowLeft className="text-xs" /> Back to listings
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`badge ${property.status === "For Sale" ? "badge-gold" : "badge-dark"}`}>{property.status}</span>
              {property.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink leading-tight mb-2">{property.title}</h1>
            <div className="flex items-center gap-1.5 text-stone-500 text-sm">
              <FiMapPin className="text-gold" />
              <span>{property.address}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1"><FiEye className="text-[11px]" />{property.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><FiHeart className="text-[11px]" />{property.saves} saves</span>
              <span className="flex items-center gap-1"><FiClock className="text-[11px]" />{property.daysListed} days listed</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="font-serif text-3xl font-bold text-ink">{property.priceLabel}</div>
            <div className="text-xs text-stone-400">
              ${Math.round(property.price / property.size).toLocaleString()} / sq ft
            </div>
            <div className="flex gap-2">
              <button onClick={() => { toggleSave(property.id); toast.success(isSaved ? "Removed from saved" : "Saved!"); }}
                className={`p-2.5 rounded-xl border transition-all ${isSaved ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-500"}`}>
                <FiHeart className={isSaved ? "fill-red-500" : ""} />
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}
                className="p-2.5 rounded-xl border bg-white border-stone-200 text-stone-500 hover:border-gold/40 hover:text-gold transition-all">
                <FiShare2 />
              </button>
              <button onClick={() => { toggleCompare(property.id); toast.success(inCompare ? "Removed from compare" : "Added to compare!"); }}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${inCompare ? "bg-gold/15 border-gold/40 text-gold-700" : "bg-white border-stone-200 text-stone-600 hover:border-gold/40"}`}>
                {inCompare ? "In Compare" : "+ Compare"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-card">
              <div className="relative h-80 md:h-[440px]">
                <img
                  src={property.images[imgIdx]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button onClick={() => setImgIdx((i) => (i - 1 + property.images.length) % property.images.length)}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <FiArrowLeft className="text-ink text-sm" />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % property.images.length)}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <FiArrowRight className="text-ink text-sm" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-ink/70 text-white text-xs px-2.5 py-1 rounded-full">
                  {imgIdx + 1} / {property.images.length}
                </div>
              </div>
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                {property.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-gold" : "border-transparent opacity-60 hover:opacity-90"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: IoBedOutline, label: "Bedrooms", val: property.bedrooms },
                { icon: IoWaterOutline, label: "Bathrooms", val: property.bathrooms },
                { icon: FiMaximize, label: "Square Feet", val: `${property.size.toLocaleString()} sq ft` },
                { icon: MdOutlineDirectionsCar, label: "Garage", val: property.garage ? `${property.garage} cars` : "None" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-white rounded-xl p-4 border border-stone-200 text-center shadow-card">
                  <Icon className="text-gold text-xl mx-auto mb-1.5" />
                  <div className="font-bold text-sm text-ink">{val}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="flex border-b border-stone-200">
                {["overview", "amenities", "map", "floorplan"].map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-3.5 text-sm font-medium capitalize transition-all border-b-2 ${
                      tab === t ? "text-gold border-gold bg-gold/5" : "text-stone-500 border-transparent hover:text-ink"
                    }`}>
                    {t === "floorplan" ? "Floor Plan" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === "overview" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-ink mb-2">About This Property</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">{property.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                      {[
                        { label: "Property Type", val: property.type },
                        { label: "Year Built", val: property.yearBuilt },
                        { label: "Status", val: property.status },
                        { label: "Bedrooms", val: property.bedrooms },
                        { label: "Bathrooms", val: property.bathrooms },
                        { label: "Garage Spaces", val: property.garage },
                        { label: "Total Area", val: `${property.size.toLocaleString()} sq ft` },
                        { label: "Price per sq ft", val: `$${Math.round(property.price / property.size).toLocaleString()}` },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between items-center py-2.5 border-b border-stone-100">
                          <span className="text-xs text-stone-500">{label}</span>
                          <span className="text-xs font-semibold text-ink">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "amenities" && (
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-ink mb-4">Property Amenities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {property.amenities?.map((a) => (
                        <div key={a} className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                          <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <FiCheck className="text-gold text-[10px]" />
                          </div>
                          <span className="text-xs font-medium text-stone-700">{a}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {property.tags.map((tag) => (
                        <span key={tag} className="badge badge-dark text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "map" && (
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-ink mb-4">Location</h3>
                    <div className="h-72 rounded-xl overflow-hidden border border-stone-200">
                      <MapContainer center={[property.lat, property.lng]} zoom={14} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='(c) OpenStreetMap' />
                        <Marker position={[property.lat, property.lng]}>
                          <Popup><b>{property.title}</b><br />{property.address}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    <p className="text-xs text-stone-500 mt-2 flex items-center gap-1"><FiMapPin className="text-gold" />{property.address}</p>
                  </div>
                )}

                {tab === "floorplan" && (
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-ink mb-4">Floor Plan</h3>
                    {property.floorPlan ? (
                      <img src={property.floorPlan} alt="Floor Plan" className="w-full rounded-xl border border-stone-200" />
                    ) : (
                      <div className="h-48 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center">
                        <div className="text-center">
                          <FiHome className="text-stone-300 text-3xl mx-auto mb-2" />
                          <p className="text-stone-400 text-sm">Floor plan not available</p>
                          <p className="text-stone-400 text-xs mt-1">Contact the agent to request floor plans</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Similar */}
            {similar.length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-bold text-ink mb-4">Similar Properties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similar.map((p) => (
                    <Link key={p.id} to={`/properties/${p.id}`} className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                      <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover" />
                      <div className="p-3">
                        <div className="font-serif font-semibold text-sm text-ink mb-0.5 truncate">{p.title}</div>
                        <div className="text-xs text-stone-500 truncate mb-1">{p.city}, {p.state}</div>
                        <div className="font-bold text-sm text-gold-700">{p.priceLabel}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Agent + Contact */}
          <div className="space-y-5">
            {/* Agent Card */}
            {agent && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <p className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Listed by</p>
                <div className="flex items-center gap-3 mb-4">
                  <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full object-cover border-2 border-stone-200" />
                  <div>
                    <Link to={`/agents/${agent.id}`} className="font-serif font-semibold text-base text-ink hover:text-gold-700 transition-colors">{agent.name}</Link>
                    <p className="text-xs text-stone-500">{agent.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiStar className="text-gold fill-gold text-xs" />
                      <span className="text-xs font-semibold text-ink">{agent.rating}</span>
                      <span className="text-xs text-stone-400">({agent.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <FiPhone className="text-gold flex-shrink-0" /> {agent.phone}
                  </div>
                  <div className="flex items-center gap-2 text-stone-600">
                    <FiMail className="text-gold flex-shrink-0" /> {agent.email}
                  </div>
                  <div className="flex items-center gap-2 text-stone-600">
                    <FiMapPin className="text-gold flex-shrink-0" /> {agent.location}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${agent.phone}`} className="btn-dark flex-1 justify-center text-xs py-2.5"><FiPhone /> Call</a>
                  <Link to={`/agents/${agent.id}`} className="btn-ghost flex-1 justify-center text-xs border border-stone-200 rounded-xl py-2.5">
                    Profile <FiArrowUpRight className="text-[11px]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
              <h3 className="font-serif font-semibold text-base text-ink mb-4">Send Inquiry</h3>
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheck className="text-green-500 text-xl" />
                  </div>
                  <p className="font-semibold text-sm text-ink mb-1">Message Sent!</p>
                  <p className="text-xs text-stone-500">The agent will respond within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="text-xs text-gold font-medium mt-3 hover:underline">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, type: "viewing" }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.type === "viewing" ? "bg-gold text-ink border-gold" : "border-stone-200 text-stone-600"}`}>
                      Schedule Viewing
                    </button>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, type: "info" }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.type === "info" ? "bg-gold text-ink border-gold" : "border-stone-200 text-stone-600"}`}>
                      Request Info
                    </button>
                  </div>
                  {isLoggedInUser ? (
                    <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500">
                      Using your account details for name, email, and phone.
                    </div>
                  ) : (
                    <>
                      <input type="text" required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field text-sm" />
                      <input type="email" required placeholder="Email Address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field text-sm" />
                      <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-field text-sm" />
                    </>
                  )}
                  {form.type === "viewing" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        required
                        value={form.date || ""}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                        className="input-field text-sm"
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <input
                        type="time"
                        required
                        value={form.time || ""}
                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                        className="input-field text-sm"
                      />
                    </div>
                  )}
                  <textarea
                    placeholder={
                      form.type === "viewing"
                        ? "Preferred viewing time or additional notes..."
                        : "What would you like to know about this property?"
                    }
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={3}
                    className="input-field text-sm resize-none"
                  />
                  <button type="submit" className="btn-primary w-full justify-center text-sm">
                    <FiCalendar className="text-sm" />
                    {form.type === "viewing" ? "Request Viewing" : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>

            {/* Share / Save */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 mb-2">Share this property</p>
              <div className="flex gap-2">
                {["Email", "SMS", "Copy Link"].map((s) => (
                  <button key={s} onClick={() => toast.success(`Shared via ${s.split(" ")[1]}`)}
                    className="flex-1 text-[11px] py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:border-gold/40 hover:text-gold-700 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
