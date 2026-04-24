import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiPlusCircle,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiMessageSquare,
  FiTrendingUp,
  FiMapPin,
  FiCheck,
  FiClock,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import PropertyFormModal from "../components/dashboard/PropertyFormModal";

const TABS = ["Overview", "My Listings", "Appointments", "Messages", "Analytics"];

export default function DashboardPage() {
  const {
    user,
    properties,
    appointments,
    messages,
    deleteProperty,
    updateAppointmentStatus,
    markMessageRead,
  } = useApp();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [editProp, setEditProp] = useState(null);

  if (!user) {
    return (
      <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">??</div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">Sign In Required</h2>
          <p className="text-stone-500 text-sm mb-5">Please sign in to access your dashboard.</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const myProperties = user.agentId
    ? properties.filter((property) => property.agentId === user.agentId)
    : properties.slice(0, 4);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;

    try {
      await deleteProperty(id);
      toast.success("Listing removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove listing");
    }
  };

  const stats = [
    { label: "Active Listings", val: myProperties.length, icon: FiHome, color: "bg-blue-50 text-blue-600" },
    { label: "Total Views", val: myProperties.reduce((sum, property) => sum + Number(property.views || 0), 0).toLocaleString(), icon: FiEye, color: "bg-purple-50 text-purple-600" },
    { label: "Appointments", val: appointments.length, icon: FiCalendar, color: "bg-green-50 text-green-600" },
    { label: "New Messages", val: messages.filter((message) => message.unread).length, icon: FiMessageSquare, color: "bg-gold/10 text-gold-700" },
  ];

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-10 px-4">
        <div className="page-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-gold/40" />
            <div>
              <p className="text-stone-400 text-xs mb-0.5">Welcome back</p>
              <h1 className="font-serif text-2xl font-bold text-white">{user.name}</h1>
              <span className="inline-flex items-center gap-1 bg-gold/20 text-gold text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize mt-1">
                {user.role}
              </span>
            </div>
          </div>
          <button onClick={() => { setEditProp(null); setShowModal(true); }} className="btn-primary text-sm py-2.5">
            <FiPlusCircle /> Add New Listing
          </button>
        </div>

        <div className="page-container mt-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab ? "bg-gold text-ink" : "text-stone-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="page-container py-8">
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="text-lg" />
                    </div>
                    <FiTrendingUp className="text-green-400 text-sm" />
                  </div>
                  <div className="font-serif font-bold text-2xl text-ink">{val}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-base text-ink">Recent Listings</h3>
                  <button onClick={() => setActiveTab("My Listings")} className="text-xs text-gold font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {myProperties.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center gap-3 p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
                      <img src={property.images?.[0]} alt={property.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{property.title}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1"><FiMapPin className="text-[10px]" />{property.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gold-700">{property.priceLabel}</p>
                        <p className="text-[10px] text-stone-400">{property.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-base text-ink">Upcoming Appointments</h3>
                  <button onClick={() => setActiveTab("Appointments")} className="text-xs text-gold font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment) => {
                    const property = properties.find((item) => item.id === appointment.propertyId);
                    return (
                      <div key={appointment.id} className="flex items-center gap-3 p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${appointment.status === "Confirmed" ? "bg-green-50" : "bg-amber-50"}`}>
                          <FiCalendar className={appointment.status === "Confirmed" ? "text-green-500 text-sm" : "text-amber-500 text-sm"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink">{appointment.clientName}</p>
                          <p className="text-xs text-stone-400 truncate">{property?.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-ink">{appointment.date}</p>
                          <p className="text-[10px] text-stone-400">{appointment.time}</p>
                          <span className={`text-[10px] font-semibold ${appointment.status === "Confirmed" ? "text-green-600" : "text-amber-600"}`}>{appointment.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "My Listings" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif font-bold text-xl text-ink">My Listings ({myProperties.length})</h2>
              <button onClick={() => { setEditProp(null); setShowModal(true); }} className="btn-primary text-sm py-2">
                <FiPlusCircle /> Add Listing
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      {["Property", "Price", "Status", "Type", "Views", "Days", "Actions"].map((header) => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={property.images?.[0]} alt={property.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-ink">{property.title}</p>
                              <p className="text-xs text-stone-400 flex items-center gap-1"><FiMapPin className="text-[10px]" />{property.city}, {property.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-bold text-gold-700 whitespace-nowrap">{property.priceLabel}</td>
                        <td className="px-4 py-3.5">
                          <span className={`badge ${property.status === "For Sale" ? "badge-gold" : property.status === "For Rent" ? "badge-dark" : "badge-green"} text-[10px]`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-stone-600">{property.type}</td>
                        <td className="px-4 py-3.5 text-xs text-stone-600">{Number(property.views || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-xs text-stone-600">{property.daysListed}d</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/properties/${property.id}`} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-blue-600 transition-colors" title="View">
                              <FiEye className="text-sm" />
                            </Link>
                            <button onClick={() => { setEditProp(property); setShowModal(true); }} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-gold-700 transition-colors" title="Edit">
                              <FiEdit2 className="text-sm" />
                            </button>
                            <button onClick={() => handleDelete(property.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-500 hover:text-red-500 transition-colors" title="Delete">
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Appointments" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Appointments ({appointments.length})</h2>
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const property = properties.find((item) => item.id === appointment.propertyId);
                return (
                  <div key={appointment.id} className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${appointment.status === "Confirmed" ? "bg-green-100" : "bg-amber-100"}`}>
                      <FiCalendar className={appointment.status === "Confirmed" ? "text-green-600 text-xl" : "text-amber-600 text-xl"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-ink">{appointment.clientName}</h3>
                        <span className={`badge text-[10px] ${appointment.status === "Confirmed" ? "badge-green" : "bg-amber-100 text-amber-700"}`}>{appointment.status}</span>
                        <span className="tag text-[10px]">{appointment.type}</span>
                      </div>
                      <p className="text-xs text-stone-500 mb-0.5 truncate">?? {property?.title} — {property?.address}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><FiCalendar className="text-[10px]" />{appointment.date}</span>
                        <span className="flex items-center gap-1"><FiClock className="text-[10px]" />{appointment.time}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            await updateAppointmentStatus(appointment.id, "Confirmed");
                            toast.success("Appointment confirmed");
                          } catch (err) {
                            toast.error(err?.response?.data?.message || "Could not update appointment");
                          }
                        }}
                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Confirm"
                      >
                        <FiCheck className="text-sm" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateAppointmentStatus(appointment.id, "Cancelled");
                            toast.success("Appointment cancelled");
                          } catch (err) {
                            toast.error(err?.response?.data?.message || "Could not update appointment");
                          }
                        }}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Cancel"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "Messages" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Messages ({messages.length})</h2>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              {messages.map((message, index) => (
                <div key={message.id} className={`flex items-start gap-4 p-5 hover:bg-stone-50 transition-colors cursor-pointer ${index < messages.length - 1 ? "border-b border-stone-100" : ""} ${message.unread ? "bg-gold/4" : ""}`}>
                  <div className="relative flex-shrink-0">
                    <img src={message.avatar} alt={message.fromName || "Client"} className="w-11 h-11 rounded-full object-cover" />
                    {message.unread && <span className="absolute top-0 right-0 w-3 h-3 bg-gold rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm ${message.unread ? "font-bold text-ink" : "font-medium text-stone-700"}`}>{message.fromName || "Unknown"}</p>
                      <span className="text-[10px] text-stone-400 flex-shrink-0">{message.time}</span>
                    </div>
                    <p className={`text-xs mb-0.5 ${message.unread ? "text-ink font-medium" : "text-stone-600"}`}>{message.subject}</p>
                    <p className="text-xs text-stone-400 truncate">{message.preview}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await markMessageRead(message.id);
                        toast.success("Conversation opened");
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Could not open conversation");
                      }
                    }}
                    className="btn-ghost text-xs border border-stone-200 rounded-xl py-1.5 px-3 flex-shrink-0"
                  >
                    Reply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Analytics" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Analytics & Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {[
                { label: "Avg. Days on Market", val: "24", sub: "Industry avg: 38", icon: FiClock, up: true },
                { label: "Inquiry Rate", val: "12.4%", sub: "+2.1% vs last month", icon: FiTrendingUp, up: true },
                { label: "Profile Views", val: "1,842", sub: "+18% vs last month", icon: FiUsers, up: true },
              ].map(({ label, val, sub, icon: Icon, up }) => (
                <div key={label} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Icon className="text-gold text-lg" />
                    </div>
                    <span className={`text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>{up ? "?" : "?"}</span>
                  </div>
                  <div className="font-serif font-bold text-2xl text-ink">{val}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                  <div className="text-[10px] text-stone-400 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200">
                <h3 className="font-serif font-semibold text-base text-ink">Property Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      {["Property", "Views", "Saves", "Inquiries", "Days Listed", "Performance"].map((header) => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myProperties.map((property) => {
                      const perf = Math.round((Number(property.saves || 0) / Math.max(Number(property.views || 0), 1)) * 100);
                      return (
                        <tr key={property.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm font-medium text-ink">{property.title}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{Number(property.views || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{property.saves}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{Math.round(Number(property.views || 0) * 0.04)}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{property.daysListed}d</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden min-w-[60px]">
                                <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(perf * 5, 100)}%` }} />
                              </div>
                              <span className="text-xs text-stone-500">{perf}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && <PropertyFormModal property={editProp} onClose={() => setShowModal(false)} />}
    </div>
  );
}

