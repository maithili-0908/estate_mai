import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const AGENT_TABS = ["Overview", "My Listings", "Appointments", "Messages", "Analytics"];
const USER_TABS = ["Overview", "Appointments", "Messages"];
const TAB_QUERY_TO_LABEL = {
  overview: "Overview",
  listings: "My Listings",
  appointments: "Appointments",
  messages: "Messages",
  analytics: "Analytics",
};
const TAB_LABEL_TO_QUERY = {
  Overview: "overview",
  "My Listings": "listings",
  Appointments: "appointments",
  Messages: "messages",
  Analytics: "analytics",
};

export default function DashboardPage() {
  const {
    user,
    properties,
    agents,
    appointments,
    messages,
    deleteProperty,
    sendAgentMessage,
    replyToMessage,
    updateAppointmentStatus,
    markMessageRead,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const isUserRole = user?.role === "user";
  const tabs = isUserRole ? USER_TABS : AGENT_TABS;
  const [activeTab, setActiveTab] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [selectedConversationKey, setSelectedConversationKey] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  if (!user) {
    return (
      <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">!</div>
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

  const conversations = useMemo(() => {
    const groups = new Map();
    const agentMap = new Map((agents || []).map((agent) => [agent.id, agent]));

    (messages || []).forEach((message) => {
      const direction = message.direction || "toAgent";

      let key = "";
      let partnerName = "";
      let partnerSubtitle = "";
      let partnerAvatar = "";
      let conversationAgentId = message.agentId || "";

      if (isUserRole) {
        if (!message.agentId) return;
        const agent = agentMap.get(message.agentId);
        key = `agent:${message.agentId}`;
        partnerName = agent?.name || message.toName || "Agent";
        partnerSubtitle = agent?.email || message.toEmail || "";
        partnerAvatar =
          agent?.avatar || "https://randomuser.me/api/portraits/lego/9.jpg";
      } else {
        const recipientEmail = direction === "toUser" ? message.toEmail : message.fromEmail;
        const recipientName = direction === "toUser" ? message.toName : message.fromName;
        const emailKey = String(recipientEmail || "").toLowerCase();
        key = `client:${message.userId || emailKey || message.id}`;
        partnerName = recipientName || "Client";
        partnerSubtitle = recipientEmail || "";
        partnerAvatar =
          direction === "toUser"
            ? "https://randomuser.me/api/portraits/lego/6.jpg"
            : message.avatar || "https://randomuser.me/api/portraits/lego/6.jpg";
      }

      const existing = groups.get(key) || {
        key,
        partnerName,
        partnerSubtitle,
        partnerAvatar,
        agentId: conversationAgentId,
        items: [],
        unreadCount: 0,
        lastMessage: null,
      };

      existing.items.push(message);

      const isIncoming = isUserRole ? direction === "toUser" : direction !== "toUser";
      if (isIncoming && message.unread) {
        existing.unreadCount += 1;
      }

      groups.set(key, existing);
    });

    return Array.from(groups.values())
      .map((conversation) => {
        const sortedItems = [...conversation.items].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
          ...conversation,
          items: sortedItems,
          lastMessage: sortedItems[sortedItems.length - 1] || null,
          replyAnchorId: sortedItems[sortedItems.length - 1]?.id || "",
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt || 0).getTime() -
          new Date(a.lastMessage?.createdAt || 0).getTime()
      );
  }, [agents, isUserRole, messages]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.key === selectedConversationKey) || null,
    [conversations, selectedConversationKey]
  );
  const unreadMessagesCount = useMemo(
    () =>
      messages.filter((message) => {
        const direction = message.direction || "toAgent";
        const isIncoming = isUserRole ? direction === "toUser" : direction !== "toUser";
        return isIncoming && message.unread;
      }).length,
    [isUserRole, messages]
  );

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab("Overview");
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    const queryTab = String(searchParams.get("tab") || "").toLowerCase();
    const mappedTab = TAB_QUERY_TO_LABEL[queryTab];
    if (!mappedTab) return;
    if (!tabs.includes(mappedTab)) return;
    if (mappedTab === activeTab) return;
    setActiveTab(mappedTab);
  }, [activeTab, searchParams, tabs]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedConversationKey("");
      return;
    }

    const exists = conversations.some((conversation) => conversation.key === selectedConversationKey);
    if (!exists) {
      setSelectedConversationKey(conversations[0].key);
    }
  }, [conversations, selectedConversationKey]);

  useEffect(() => {
    if (activeTab !== "Messages") return;
    if (!selectedConversation) return;

    const unreadIncoming = selectedConversation.items.filter((message) => {
      const direction = message.direction || "toAgent";
      const isIncoming = isUserRole ? direction === "toUser" : direction !== "toUser";
      return isIncoming && message.unread;
    });

    if (unreadIncoming.length === 0) return;

    unreadIncoming.forEach((message) => {
      markMessageRead(message.id).catch(() => {});
    });
  }, [activeTab, isUserRole, markMessageRead, selectedConversation]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;

    try {
      await deleteProperty(id);
      toast.success("Listing removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove listing");
    }
  };

  const handleSendConversationMessage = async () => {
    const body = draftMessage.trim();
    if (!body || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);

      if (isUserRole) {
        if (!selectedConversation.agentId) {
          throw new Error("Agent unavailable for this conversation");
        }
        await sendAgentMessage(selectedConversation.agentId, { message: body });
      } else {
        if (!selectedConversation.replyAnchorId) {
          throw new Error("Conversation unavailable");
        }
        await replyToMessage(selectedConversation.replyAnchorId, body);
      }

      setDraftMessage("");
      toast.success("Message sent");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Could not send message");
    } finally {
      setSendingMessage(false);
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams);
    const tabQuery = TAB_LABEL_TO_QUERY[tab];
    if (!tabQuery || tabQuery === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tabQuery);
    }
    setSearchParams(params);
  };

  const stats = isUserRole
    ? [
        { label: "Appointments", val: appointments.length, icon: FiCalendar, color: "bg-green-50 text-green-600" },
        {
          label: "Unread Messages",
          val: unreadMessagesCount,
          icon: FiMessageSquare,
          color: "bg-gold/10 text-gold-700",
        },
        { label: "Conversations", val: conversations.length, icon: FiUsers, color: "bg-blue-50 text-blue-600" },
        { label: "Total Messages", val: messages.length, icon: FiEye, color: "bg-purple-50 text-purple-600" },
      ]
    : [
        { label: "Active Listings", val: myProperties.length, icon: FiHome, color: "bg-blue-50 text-blue-600" },
        { label: "Total Views", val: myProperties.reduce((sum, property) => sum + Number(property.views || 0), 0).toLocaleString(), icon: FiEye, color: "bg-purple-50 text-purple-600" },
        { label: "Appointments", val: appointments.length, icon: FiCalendar, color: "bg-green-50 text-green-600" },
        {
          label: "New Messages",
          val: unreadMessagesCount,
          icon: FiMessageSquare,
          color: "bg-gold/10 text-gold-700",
        },
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
          {!isUserRole && (
            <button onClick={() => { setEditProp(null); setShowModal(true); }} className="btn-primary text-sm py-2.5">
              <FiPlusCircle /> Add New Listing
            </button>
          )}
        </div>

        <div className="page-container mt-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab ? "bg-gold text-ink" : "text-stone-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab}
                {tab === "Messages" && unreadMessagesCount > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadMessagesCount}
                  </span>
                )}
              </span>
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
              {!isUserRole ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-semibold text-base text-ink">Recent Listings</h3>
                    <button onClick={() => handleTabChange("My Listings")} className="text-xs text-gold font-medium hover:underline">View all</button>
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
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-semibold text-base text-ink">Recent Conversations</h3>
                    <button onClick={() => handleTabChange("Messages")} className="text-xs text-gold font-medium hover:underline">Open inbox</button>
                  </div>
                  <div className="space-y-3">
                    {conversations.slice(0, 3).map((conversation) => (
                      <div key={conversation.key} className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-100 bg-stone-50/50">
                        <img src={conversation.partnerAvatar} alt={conversation.partnerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{conversation.partnerName}</p>
                          <p className="text-xs text-stone-500 truncate">{conversation.lastMessage?.preview || conversation.lastMessage?.body || "No messages yet"}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    ))}
                    {conversations.length === 0 && (
                      <div className="text-xs text-stone-400 py-2">No conversations yet</div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-base text-ink">Upcoming Appointments</h3>
                  <button onClick={() => handleTabChange("Appointments")} className="text-xs text-gold font-medium hover:underline">View all</button>
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
                      <p className="text-xs text-stone-500 mb-0.5 truncate">Location: {property?.title} - {property?.address}</p>
                      {appointment.notes ? (
                        <p className="text-xs text-stone-600 mb-1">
                          Description: {appointment.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 mb-1">Description: No details provided</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><FiCalendar className="text-[10px]" />{appointment.date}</span>
                        <span className="flex items-center gap-1"><FiClock className="text-[10px]" />{appointment.time}</span>
                      </div>
                    </div>
                    {!isUserRole && (
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "Messages" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Messages ({messages.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
                {conversations.length === 0 ? (
                  <div className="p-6 text-sm text-stone-400 text-center">No conversations yet</div>
                ) : (
                  conversations.map((conversation, index) => {
                    const isSelected = selectedConversationKey === conversation.key;
                    return (
                      <button
                        key={conversation.key}
                        onClick={() => setSelectedConversationKey(conversation.key)}
                        className={`w-full text-left px-4 py-3.5 transition-colors ${index < conversations.length - 1 ? "border-b border-stone-100" : ""} ${isSelected ? "bg-gold/10" : "hover:bg-stone-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={conversation.partnerAvatar} alt={conversation.partnerName} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm truncate ${conversation.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-stone-700"}`}>{conversation.partnerName}</p>
                              <span className="text-[10px] text-stone-400">{conversation.lastMessage?.time || ""}</span>
                            </div>
                            <p className="text-xs text-stone-500 truncate">{conversation.lastMessage?.preview || conversation.lastMessage?.body || "No messages yet"}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden lg:col-span-2 flex flex-col min-h-[520px]">
                {!selectedConversation ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-stone-400 px-4 text-center">
                    Select a conversation to read and reply.
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-4 border-b border-stone-200">
                      <p className="font-semibold text-sm text-ink">{selectedConversation.partnerName}</p>
                      <p className="text-xs text-stone-400">{selectedConversation.partnerSubtitle}</p>
                    </div>

                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
                      {selectedConversation.items.map((message) => {
                        const direction = message.direction || "toAgent";
                        const isSentByCurrent = isUserRole ? direction !== "toUser" : direction === "toUser";

                        return (
                          <div key={message.id} className={`flex ${isSentByCurrent ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 border text-sm ${isSentByCurrent ? "bg-gold/15 border-gold/30 text-ink" : "bg-stone-50 border-stone-200 text-stone-700"}`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{message.body || message.preview}</p>
                              <p className={`text-[10px] mt-1 ${isSentByCurrent ? "text-gold-800" : "text-stone-400"}`}>{message.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 border-t border-stone-200">
                      <textarea
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        rows={3}
                        placeholder={isUserRole ? "Write your message to the agent..." : "Write your reply to the client..."}
                        className="input-field text-sm resize-none"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleSendConversationMessage}
                          disabled={sendingMessage || !draftMessage.trim()}
                          className={`btn-primary text-sm py-2 ${sendingMessage || !draftMessage.trim() ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <FiMessageSquare /> {sendingMessage ? "Sending..." : "Send Message"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

