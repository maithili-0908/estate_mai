import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiMapPin, FiPhone, FiMail, FiInstagram, FiLinkedin, FiTwitter, FiCheck, FiArrowLeft } from "react-icons/fi";
import PropertyCard from "../components/property/PropertyCard";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function AgentProfilePage() {
  const { id } = useParams();
  const { properties, agents, reviews, sendAgentMessage } = useApp();
  const agent = agents.find((a) => a.id === id);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState("listings");

  if (!agent) return (
    <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-ink mb-4">Agent Not Found</h2>
        <Link to="/agents" className="btn-primary">View All Agents</Link>
      </div>
    </div>
  );

  const agentProperties = properties.filter((p) => p.agentId === id);
  const agentReviews = reviews.filter((r) => r.agentId === id);

  const handleMsg = async (e) => {
    e.preventDefault();
    try {
      await sendAgentMessage(agent.id, msgForm);
      toast.success("Message sent to " + agent.name);
      setSent(true);
      setMsgForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send message");
    }
  };

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      {/* Hero */}
      <div className="bg-ink py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 60%)" }} />
        <div className="page-container relative z-10">
          <Link to="/agents" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-gold text-sm mb-6 transition-colors">
            <FiArrowLeft className="text-xs" /> All Agents
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img src={agent.avatar} alt={agent.name} className="w-28 h-28 rounded-2xl object-cover border-3 border-gold/40" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-ink flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-1">{agent.name}</h1>
              <p className="text-gold text-sm font-medium mb-2">{agent.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                <span className="flex items-center gap-1.5"><FiMapPin className="text-gold text-xs" /> {agent.location}</span>
                <span className="flex items-center gap-1.5"><FiStar className="text-gold fill-gold text-xs" /> {agent.rating} ({agent.reviewCount} reviews)</span>
                <span>{agent.yearsExp} years experience</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <a href={`tel:${agent.phone}`} className="btn-primary text-sm py-2.5 justify-center"><FiPhone /> Call Now</a>
              <a href={`mailto:${agent.email}`} className="btn-secondary text-sm py-2.5 justify-center border-gold/40"><FiMail /> Send Email</a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="page-container py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Properties Sold", val: agent.propertiesSold },
            { label: "Active Listings", val: agent.propertiesActive },
            { label: "Years Experience", val: `${agent.yearsExp}+` },
            { label: "Client Reviews", val: agent.reviewCount },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <div className="font-serif font-bold text-2xl text-gold-700">{val}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="flex border-b border-stone-200">
                {["listings", "about", "reviews"].map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 py-3.5 text-sm font-medium capitalize transition-all border-b-2 ${
                      activeTab === t ? "text-gold border-gold bg-gold/5" : "text-stone-500 border-transparent hover:text-ink"
                    }`}>
                    {t === "listings" ? `Listings (${agentProperties.length})` :
                     t === "reviews" ? `Reviews (${agentReviews.length})` :
                     t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === "listings" && (
                  agentProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {agentProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-400">No active listings</div>
                  )
                )}

                {activeTab === "about" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-ink mb-2">Biography</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">{agent.bio}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-ink mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.specialties.map((s) => (
                          <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 text-gold-700 text-xs font-medium border border-gold/20">
                            <FiCheck className="text-[10px]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-ink mb-2">Languages</h4>
                      <div className="flex gap-2">
                        {agent.languages.map((l) => <span key={l} className="tag">{l}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-ink mb-2">Certifications</h4>
                      <ul className="space-y-1.5">
                        {agent.certifications.map((c) => (
                          <li key={c} className="flex items-center gap-2 text-xs text-stone-600">
                            <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                              <FiCheck className="text-gold text-[9px]" />
                            </div>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="text-center">
                        <div className="font-serif text-4xl font-bold text-ink">{agent.rating}</div>
                        <div className="flex justify-center mt-1">
                          {[1,2,3,4,5].map((s) => <FiStar key={s} className={`text-xs ${s <= Math.round(agent.rating) ? "text-gold fill-gold" : "text-stone-300"}`} />)}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{agent.reviewCount} reviews</div>
                      </div>
                      <div className="flex-1">
                        {[5,4,3,2,1].map((r) => {
                          const pct = r === 5 ? 72 : r === 4 ? 20 : r === 3 ? 5 : r === 2 ? 2 : 1;
                          return (
                            <div key={r} className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-stone-400 w-3">{r}</span>
                              <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-stone-400 w-6">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {agentReviews.length > 0 ? (
                      agentReviews.map((r) => (
                        <div key={r.id} className="p-4 border border-stone-200 rounded-xl bg-stone-50">
                          <div className="flex items-center gap-3 mb-2">
                            <img src={r.avatar} alt={r.author} className="w-9 h-9 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold text-sm text-ink">{r.author}</div>
                              <div className="text-[10px] text-stone-400">{r.date}</div>
                            </div>
                            <div className="ml-auto flex">
                              {[1,2,3,4,5].map((s) => <FiStar key={s} className={`text-xs ${s <= r.rating ? "text-gold fill-gold" : "text-stone-300"}`} />)}
                            </div>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed">{r.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-stone-400 text-sm py-8">No reviews yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Contact Sidebar */}
          <div className="space-y-5">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
              <h3 className="font-serif font-semibold text-base text-ink mb-4">Contact {agent.name.split(" ")[0]}</h3>
              {sent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✉️</div>
                  <p className="font-semibold text-sm text-ink">Message Sent!</p>
                  <p className="text-xs text-stone-500 mt-1">Expect a response within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="text-xs text-gold mt-3 hover:underline font-medium">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleMsg} className="space-y-3">
                  <input type="text" required placeholder="Your Name" value={msgForm.name} onChange={(e) => setMsgForm((f) => ({ ...f, name: e.target.value }))} className="input-field text-sm" />
                  <input type="email" required placeholder="Email Address" value={msgForm.email} onChange={(e) => setMsgForm((f) => ({ ...f, email: e.target.value }))} className="input-field text-sm" />
                  <textarea required placeholder="Write your message..." value={msgForm.message} onChange={(e) => setMsgForm((f) => ({ ...f, message: e.target.value }))} rows={4} className="input-field text-sm resize-none" />
                  <button type="submit" className="btn-primary w-full justify-center text-sm"><FiMail /> Send Message</button>
                </form>
              )}
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
              <h3 className="font-serif font-semibold text-sm text-ink mb-3">Contact Details</h3>
              <div className="space-y-3 text-sm">
                <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-stone-600 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center"><FiPhone className="text-gold text-sm" /></div>
                  {agent.phone}
                </a>
                <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-stone-600 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center"><FiMail className="text-gold text-sm" /></div>
                  {agent.email}
                </a>
                <div className="flex items-center gap-3 text-stone-600">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center"><FiMapPin className="text-gold text-sm" /></div>
                  {agent.location}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                {[FiInstagram, FiLinkedin, FiTwitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:text-gold hover:bg-gold/10 transition-all">
                    <Icon className="text-sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
