import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  FiMenu, FiX, FiBell, FiHeart, FiUser, FiChevronDown,
  FiLogOut, FiBarChart2, FiHome, FiGrid
} from "react-icons/fi";

export default function Navbar() {
  const { user, logout, unreadCount, savedProperties, notifications, messages, markNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef();
  const unreadInboxCount = (messages || []).filter((message) => {
    const direction = message.direction || "toAgent";
    const isIncoming = user?.role === "user" ? direction === "toUser" : direction !== "toUser";
    return isIncoming && message.unread;
  }).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Properties", path: "/properties" },
    { label: "Map View", path: "/map" },
    { label: "Agents", path: "/agents" },
    { label: "Compare", path: "/compare" },
  ];

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate("/"); };
  const handleNotificationClick = (notification) => {
    if (!notification) return;

    if (notification.type === "appointment") {
      setNotifOpen(false);
      navigate("/dashboard?tab=appointments");
      return;
    }

    if (notification.type === "message") {
      setNotifOpen(false);
      navigate("/dashboard?tab=messages");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ink shadow-2xl py-0" : "bg-ink/95 backdrop-blur-sm py-0"
      }`}
    >
      <div className="page-container flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center group-hover:bg-gold-300 transition-colors">
            <FiHome className="text-ink text-base" />
          </div>
          <span className="font-serif text-xl font-bold text-white tracking-tight">
            Lux<span className="text-gold">Estate</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-item px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(l.path)
                  ? "text-gold bg-gold/10"
                  : "text-stone-300 hover:text-white hover:bg-white/8"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2" ref={menuRef}>
          {/* Saved */}
          <Link
            to="/saved"
            className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <FiHeart className="text-lg" />
            {savedProperties.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-gold rounded-full text-[9px] font-bold text-ink flex items-center justify-center">
                {savedProperties.length}
              </span>
            )}
          </Link>

          {/* Notifications */}
          {user && user.role !== "admin" && (
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-card-hover border border-stone-200 overflow-hidden z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink">Notifications</span>
                    <button
                      onClick={async () => {
                        try {
                          await markNotificationsRead();
                        } catch (_err) {}
                      }}
                      className="text-xs text-gold font-medium cursor-pointer hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-stone-400">No notifications</div>
                    )}
                    {notifications.map((n) => {
                      const icon =
                        n.type === "inquiry"
                          ? "I"
                          : n.type === "appointment"
                            ? "A"
                            : n.type === "listing"
                              ? "L"
                              : n.type === "message"
                                ? "M"
                                : "N";

                      return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0 ${!n.read ? "bg-gold/5" : ""}`}
                      >
                        <span className="text-lg mt-0.5">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-ink leading-snug ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />}
                      </div>
                    )})}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border-2 border-gold/40" />
                <span className="text-white text-sm font-medium hidden lg:block">{user.name.split(" ")[0]}</span>
                <FiChevronDown className={`text-stone-400 text-sm transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-card-hover border border-stone-200 overflow-hidden z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="font-semibold text-sm text-ink">{user.name}</p>
                    <p className="text-xs text-stone-400 capitalize">{user.role}</p>
                  </div>
                  <div className="p-1.5">
                    {user && (
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-stone-50 transition-colors">
                        <FiGrid className="text-gold" />
                        <span className="flex items-center gap-1.5">
                          {user.role === "user" ? "Messages" : "Dashboard"}
                          {unreadInboxCount > 0 && (
                            <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {unreadInboxCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-stone-50 transition-colors">
                        <FiBarChart2 className="text-gold" /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-stone-50 transition-colors">
                      <FiUser className="text-gold" /> Profile
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors mt-0.5">
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-stone-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-600 border-t border-white/10 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(l.path) ? "text-gold bg-gold/10" : "text-stone-300 hover:text-white hover:bg-white/10"
              }`}>
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 mt-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-stone-300 hover:text-white hover:bg-white/10">
                  {user.role === "user" ? "Messages" : "Dashboard"}
                </Link>
                {unreadInboxCount > 0 && (
                  <div className="px-4 -mt-1 mb-1 text-[10px] text-red-400 font-semibold">
                    {unreadInboxCount} new message{unreadInboxCount > 1 ? "s" : ""}
                  </div>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-white/10">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-stone-300 hover:text-white hover:bg-white/10">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gold font-semibold hover:bg-white/10">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

