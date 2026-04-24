import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiHome,
  FiDollarSign,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiEye,
  FiTrash2,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiStar,
  FiShield,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

const ADMIN_TABS = ["Overview", "Properties", "Agents", "Users", "Reports"];

const MONTHLY_DATA = [
  { month: "Jul", listings: 42, sales: 28, revenue: 620000 },
  { month: "Aug", listings: 55, sales: 34, revenue: 780000 },
  { month: "Sep", listings: 48, sales: 31, revenue: 710000 },
  { month: "Oct", listings: 63, sales: 42, revenue: 940000 },
  { month: "Nov", listings: 58, sales: 38, revenue: 860000 },
  { month: "Dec", listings: 71, sales: 47, revenue: 1020000 },
  { month: "Jan", listings: 52, sales: 33, revenue: 750000 },
];

const PIE_COLORS = ["#C9A84C", "#0D0D0D", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444"];

export default function AdminPage() {
  const {
    user,
    properties,
    agents,
    adminStats,
    users,
    pendingApprovals,
    suspendAgent,
    removeUser,
    adminDeleteProperty,
    handlePendingProperty,
    exportAdminReport,
    generateAdminReport,
  } = useApp();
  const [activeTab, setActiveTab] = useState("Overview");

  if (!user || user.role !== "admin") {
    return (
      <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center text-center px-4">
        <div>
          <FiShield className="text-5xl text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">Admin Access Only</h2>
          <p className="text-stone-500 text-sm mb-5">Use admin@luxestate.com / demo123</p>
          <Link to="/login" className="btn-primary">Sign In as Admin</Link>
        </div>
      </div>
    );
  }

  const safeStats = {
    totalUsers: adminStats?.totalUsers || 0,
    activeListings: adminStats?.activeListings || properties.length,
    monthlyRevenue: adminStats?.monthlyRevenue || 0,
    pendingApprovals: adminStats?.pendingApprovals || pendingApprovals.length,
    totalAgents: adminStats?.totalAgents || agents.length,
    viewingsToday: adminStats?.viewingsToday || 0,
    conversionRate: adminStats?.conversionRate || 0,
    avgDaysOnMarket: adminStats?.avgDaysOnMarket || 0,
  };

  const typeData = useMemo(() => {
    const map = new Map();
    properties
      .filter((property) => !property.pendingApproval)
      .forEach((property) => {
        map.set(property.type, (map.get(property.type) || 0) + 1);
      });

    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0) || 1;

    return Array.from(map.entries()).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [properties]);

  const topStats = [
    { label: "Total Users", val: safeStats.totalUsers.toLocaleString(), icon: FiUsers, change: "+12%", up: true, color: "text-blue-600 bg-blue-50" },
    { label: "Active Listings", val: safeStats.activeListings.toLocaleString(), icon: FiHome, change: "+8%", up: true, color: "text-gold-700 bg-gold/10" },
    { label: "Monthly Revenue", val: `$${(safeStats.monthlyRevenue / 1000).toFixed(0)}K`, icon: FiDollarSign, change: "+23%", up: true, color: "text-green-600 bg-green-50" },
    { label: "Pending Approvals", val: safeStats.pendingApprovals, icon: FiAlertCircle, change: `${safeStats.pendingApprovals}`, up: false, color: "text-amber-600 bg-amber-50" },
    { label: "Total Agents", val: safeStats.totalAgents, icon: FiStar, change: "+3%", up: true, color: "text-purple-600 bg-purple-50" },
    { label: "Viewings Today", val: safeStats.viewingsToday, icon: FiCalendar, change: "+14%", up: true, color: "text-rose-600 bg-rose-50" },
    { label: "Conversion Rate", val: `${safeStats.conversionRate}%`, icon: FiActivity, change: "+0.4%", up: true, color: "text-teal-600 bg-teal-50" },
    { label: "Avg. Days on Market", val: safeStats.avgDaysOnMarket, icon: FiBarChart2, change: "-3d", up: true, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-8 px-4">
        <div className="page-container flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiShield className="text-gold text-sm" />
              <span className="text-gold text-xs font-semibold uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">Control Centre</h1>
          </div>
          <button
            onClick={async () => {
              try {
                await exportAdminReport();
                toast.success("Report downloaded!");
              } catch (err) {
                toast.error(err?.response?.data?.message || "Could not export report");
              }
            }}
            className="btn-secondary border-gold/40 text-sm py-2"
          >
            <FiDownload /> Export Report
          </button>
        </div>
        <div className="page-container mt-5 flex gap-1 overflow-x-auto scrollbar-hide">
          {ADMIN_TABS.map((tab) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {topStats.map(({ label, val, icon: Icon, change, up, color }) => (
                <div key={label} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="text-base" />
                    </div>
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-green-500" : "text-red-400"}`}>
                      {up ? <FiTrendingUp className="text-[10px]" /> : <FiTrendingDown className="text-[10px]" />}
                      {change}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-2xl text-ink">{val}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-base text-ink">Revenue & Listings Trend</h3>
                  <span className="text-xs text-stone-400">Last 7 months</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MONTHLY_DATA}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D0D0D" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0D0D0D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value, name) => name === "revenue" ? [`$${(value / 1000).toFixed(0)}K`, "Revenue"] : [value, "Listings"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#rev)" />
                    <Area type="monotone" dataKey="listings" stroke="#0D0D0D" strokeWidth={2} fill="url(#lst)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                <h3 className="font-serif font-semibold text-base text-ink mb-4">Listings by Type</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {typeData.map((entry, index) => <Cell key={entry.name} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {typeData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: entry.color }} />
                      <span className="text-[11px] text-stone-500">{entry.name} <span className="font-semibold text-stone-700">{entry.value}%</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
              <h3 className="font-serif font-semibold text-base text-ink mb-4">Monthly Listings vs Sales</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MONTHLY_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="listings" fill="#C9A84C" radius={[4, 4, 0, 0]} name="New Listings" />
                  <Bar dataKey="sales" fill="#0D0D0D" radius={[4, 4, 0, 0]} name="Sales Closed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <h3 className="font-serif font-semibold text-base text-ink">Pending Approvals</h3>
                <span className="badge bg-amber-100 text-amber-700 text-[10px]">{pendingApprovals.length} pending</span>
              </div>
              <div className="divide-y divide-stone-100">
                {pendingApprovals.map((property) => {
                  const agent = agents.find((item) => item.id === property.agentId);
                  return (
                    <div key={property.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">{property.title}</p>
                        <p className="text-xs text-stone-400">By {agent?.name || "Unknown Agent"} · {property.type} · {property.priceLabel}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await handlePendingProperty(property.id, "approve");
                              toast.success(`"${property.title}" approved`);
                            } catch (err) {
                              toast.error(err?.response?.data?.message || "Could not approve listing");
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium transition-colors"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await handlePendingProperty(property.id, "reject");
                              toast.error(`"${property.title}" rejected`);
                            } catch (err) {
                              toast.error(err?.response?.data?.message || "Could not reject listing");
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors"
                        >
                          <FiX /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Properties" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">All Properties ({properties.length})</h2>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      {["#", "Property", "Agent", "Price", "Type", "Status", "Views", "Actions"].map((header) => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {properties.map((property, index) => {
                      const agent = agents.find((item) => item.id === property.agentId);
                      return (
                        <tr key={property.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-stone-400">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <img src={property.images?.[0]} alt={property.title} className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-ink">{property.title}</p>
                                <p className="text-[10px] text-stone-400">{property.city}, {property.state}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-stone-600">{agent?.name || "Unknown"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gold-700 whitespace-nowrap">{property.priceLabel}</td>
                          <td className="px-4 py-3 text-xs text-stone-600">{property.type}</td>
                          <td className="px-4 py-3">
                            <span className={`badge text-[10px] ${property.status === "For Sale" ? "badge-gold" : "badge-dark"}`}>{property.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-stone-600">{Number(property.views || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link to={`/properties/${property.id}`} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-blue-600 transition-colors">
                                <FiEye className="text-xs" />
                              </Link>
                              <button
                                onClick={async () => {
                                  try {
                                    await adminDeleteProperty(property.id);
                                    toast.success("Removed");
                                  } catch (err) {
                                    toast.error(err?.response?.data?.message || "Could not remove property");
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
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

        {activeTab === "Agents" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Registered Agents ({agents.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-2xl border border-stone-200 shadow-card p-4 flex items-start gap-4">
                  <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{agent.name}</p>
                    <p className="text-xs text-stone-500">{agent.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{agent.location}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-stone-600"><span className="font-bold">{agent.propertiesSold}</span> sold</span>
                      <span className="text-stone-600"><span className="font-bold">{agent.propertiesActive}</span> active</span>
                      <span className="flex items-center gap-0.5 text-gold-700"><FiStar className="text-[10px] fill-gold text-gold" />{agent.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Link to={`/agents/${agent.id}`} className="text-[11px] text-blue-600 hover:underline font-medium text-center">View</Link>
                    <button
                      onClick={async () => {
                        try {
                          await suspendAgent(agent.id, agent.status !== "Suspended");
                          toast.success(agent.status === "Suspended" ? "Agent activated" : "Agent suspended");
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Could not update agent status");
                        }
                      }}
                      className={`text-[11px] hover:underline font-medium ${agent.status === "Suspended" ? "text-green-600" : "text-red-500"}`}
                    >
                      {agent.status === "Suspended" ? "Activate" : "Suspend"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Registered Users</h2>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {["User", "Email", "Role", "Joined", "Status", "Actions"].map((header) => (
                      <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm font-medium text-ink">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">{entry.email}</td>
                      <td className="px-4 py-3"><span className={`badge text-[10px] ${entry.role === "agent" ? "badge-gold" : "badge-dark"}`}>{entry.role}</span></td>
                      <td className="px-4 py-3 text-xs text-stone-500">{entry.joined || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${entry.status === "Active" ? "text-green-600" : "text-red-500"}`}>{entry.status || "Active"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => toast.success(`${entry.name} viewed`)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-gold transition-colors">
                            <FiEye className="text-xs" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await removeUser(entry.id);
                                toast.error(`${entry.name} removed`);
                              } catch (err) {
                                toast.error(err?.response?.data?.message || "Could not remove user");
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Reports" && (
          <div>
            <h2 className="font-serif font-bold text-xl text-ink mb-5">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { title: "Monthly Sales Report", desc: "Revenue breakdown by agent and property type", icon: FiBarChart2 },
                { title: "User Activity Report", desc: "Registration, login, and engagement metrics", icon: FiUsers },
                { title: "Listing Performance", desc: "Views, saves, and conversion per listing", icon: FiPieChart },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                    <Icon className="text-gold text-lg" />
                  </div>
                  <h4 className="font-semibold text-sm text-ink mb-1">{title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">{desc}</p>
                  <button
                    onClick={async () => {
                      try {
                        await generateAdminReport(title);
                        toast.success("Generating report...");
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Could not generate report");
                      }
                    }}
                    className="btn-primary text-xs py-2 w-full justify-center"
                  >
                    <FiDownload /> Generate PDF
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
              <h3 className="font-serif font-semibold text-base text-ink mb-4">Revenue by Month</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(0)}K`]} />
                  <Bar dataKey="revenue" fill="#C9A84C" radius={[6, 6, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

