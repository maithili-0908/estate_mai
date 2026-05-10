import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredToken, setStoredToken } from "../lib/api";

const AppContext = createContext();

const DEFAULT_PLATFORM_STATS = {
  totalProperties: 0,
  citiesCovered: 0,
  agentCount: 0,
  totalSales: "$0",
};

const DEFAULT_FILTER_OPTIONS = {
  propertyTypes: ["All"],
  priceRanges: [
    { label: "Any Price", min: 0, max: Number.MAX_SAFE_INTEGER },
    { label: "Under $1M", min: 0, max: 1000000 },
    { label: "$1M - $5M", min: 1000000, max: 5000000 },
    { label: "$5M - $10M", min: 5000000, max: 10000000 },
    { label: "$10M - $20M", min: 10000000, max: 20000000 },
    { label: "$20M+", min: 20000000, max: Number.MAX_SAFE_INTEGER },
  ],
  cities: ["All Cities"],
  statusOptions: ["All", "For Sale", "For Rent", "Sold", "Pending"],
  bedroomOptions: ["Any", "1+", "2+", "3+", "4+", "5+"],
};

export function AppProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [platformStats, setPlatformStats] = useState(DEFAULT_PLATFORM_STATS);
  const [adminStats, setAdminStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);

  const [savedProperties, setSavedProperties] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const hydrateBootstrap = useCallback((data) => {
    setUser(data.user || null);

    setProperties(data.properties || []);
    setAgents(data.agents || []);
    setReviews(data.reviews || []);

    setPlatformStats(data.platformStats || DEFAULT_PLATFORM_STATS);
    setAdminStats(data.adminStats || null);
    setFilterOptions(data.filterOptions || DEFAULT_FILTER_OPTIONS);

    setSavedProperties(data.savedProperties || []);
    setCompareList(data.compareList || []);
    setNotifications(data.notifications || []);
    setAppointments(data.appointments || []);
    setMessages(data.messages || []);
    setUsers(data.users || []);
    setPendingApprovals(data.pendingApprovals || []);
  }, []);

  const loadBootstrap = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);

        const { data } = await api.get("/bootstrap");
        hydrateBootstrap(data);
      } catch (err) {
        if (err?.response?.status === 401) {
          clearStoredToken();
        }
      } finally {
        if (!silent) {
          setLoading(false);
          setInitialized(true);
        }
      }
    },
    [hydrateBootstrap]
  );

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      setStoredToken(data.token);
      await loadBootstrap({ silent: true });
      return data.user;
    },
    [loadBootstrap]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      setStoredToken(data.token);
      await loadBootstrap({ silent: true });
      return data.user;
    },
    [loadBootstrap]
  );

  const logout = useCallback(async () => {
    clearStoredToken();
    await loadBootstrap({ silent: true });
  }, [loadBootstrap]);

  const toggleSave = useCallback(
    async (propertyId) => {
      if (!user) {
        setSavedProperties((prev) =>
          prev.includes(propertyId)
            ? prev.filter((id) => id !== propertyId)
            : [...prev, propertyId]
        );
        return;
      }

      const { data } = await api.post(`/interactions/saved/${propertyId}/toggle`);
      setSavedProperties(data.savedProperties || []);
      await loadBootstrap({ silent: true });
      return data.savedProperties || [];
    },
    [loadBootstrap, user]
  );

  const clearSaved = useCallback(async () => {
    if (!user) {
      setSavedProperties([]);
      return [];
    }

    const { data } = await api.post("/interactions/saved/clear");
    setSavedProperties(data.savedProperties || []);
    await loadBootstrap({ silent: true });
    return data.savedProperties || [];
  }, [loadBootstrap, user]);

  const toggleCompare = useCallback(
    async (propertyId) => {
      if (!user) {
        setCompareList((prev) => {
          if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
          if (prev.length >= 3) return prev;
          return [...prev, propertyId];
        });
        return;
      }

      const { data } = await api.post(`/interactions/compare/${propertyId}/toggle`);
      setCompareList(data.compareList || []);
      return data.compareList || [];
    },
    [user]
  );

  const addProperty = useCallback(
    async (payload) => {
      const { data } = await api.post("/properties", payload);
      setProperties((prev) => [data, ...prev]);
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const updateProperty = useCallback(
    async (id, updates) => {
      const { data } = await api.patch(`/properties/${id}`, updates);
      setProperties((prev) => prev.map((property) => (property.id === id ? data : property)));
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const deleteProperty = useCallback(
    async (id) => {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((property) => property.id !== id));
      await loadBootstrap({ silent: true });
    },
    [loadBootstrap]
  );

  const markNotificationsRead = useCallback(async () => {
    if (!user) {
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      return;
    }

    const { data } = await api.post("/interactions/notifications/read-all");
    setNotifications(data.notifications || []);
    return data.notifications || [];
  }, [user]);

  const updateProfile = useCallback(
    async (payload) => {
      const { data } = await api.patch("/users/me", payload);
      setUser(data);
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const updatePassword = useCallback(async (payload) => {
    const { data } = await api.patch("/users/password", payload);
    return data;
  }, []);

  const updateSettings = useCallback(
    async (payload) => {
      const { data } = await api.patch("/users/settings", payload);
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const requestUserData = useCallback(async (type) => {
    const { data } = await api.post("/users/requests", { type });
    return data;
  }, []);

  const enableTwoFactor = useCallback(async () => {
    const { data } = await api.post("/users/2fa/enable");
    await loadBootstrap({ silent: true });
    return data;
  }, [loadBootstrap]);

  const revokeSession = useCallback(async () => {
    const { data } = await api.post("/users/sessions/revoke");
    return data;
  }, []);

  const deleteMyAccount = useCallback(async () => {
    const { data } = await api.delete("/users/me");
    clearStoredToken();
    await loadBootstrap({ silent: true });
    return data;
  }, [loadBootstrap]);

  const sendPropertyInquiry = useCallback(
    async (payload) => {
      const { data } = await api.post("/interactions/inquiries", payload);
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const sendAgentMessage = useCallback(
    async (agentId, payload) => {
      const { data } = await api.post(`/interactions/agents/${agentId}/message`, payload);
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const replyToMessage = useCallback(
    async (messageId, message) => {
      const { data } = await api.post(`/interactions/messages/${messageId}/reply`, {
        message,
      });
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const updateAppointmentStatus = useCallback(
    async (id, status) => {
      const { data } = await api.patch(`/interactions/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((item) => (item.id === id ? data : item)));
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const markMessageRead = useCallback(
    async (id) => {
      const { data } = await api.patch(`/interactions/messages/${id}/read`);
      setMessages((prev) => prev.map((item) => (item.id === id ? data : item)));
      return data;
    },
    []
  );

  const suspendAgent = useCallback(
    async (agentId, suspended = true) => {
      const { data } = await api.patch(`/admin/agents/${agentId}/suspend`, { suspended });
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const removeUser = useCallback(
    async (userId) => {
      await api.delete(`/admin/users/${userId}`);
      await loadBootstrap({ silent: true });
    },
    [loadBootstrap]
  );

  const adminDeleteProperty = useCallback(
    async (propertyId) => {
      await api.delete(`/admin/properties/${propertyId}`);
      await loadBootstrap({ silent: true });
    },
    [loadBootstrap]
  );

  const handlePendingProperty = useCallback(
    async (propertyId, action) => {
      const { data } = await api.patch(`/admin/pending/${propertyId}`, { action });
      await loadBootstrap({ silent: true });
      return data;
    },
    [loadBootstrap]
  );

  const exportAdminReport = useCallback(async () => {
    const { data } = await api.get("/admin/reports/export");
    return data;
  }, []);

  const generateAdminReport = useCallback(async (type) => {
    const { data } = await api.post("/admin/reports/generate", { type });
    return data;
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = {
    initialized,
    loading,
    user,
    properties,
    agents,
    reviews,
    platformStats,
    adminStats,
    filterOptions,
    savedProperties,
    compareList,
    notifications,
    appointments,
    messages,
    users,
    pendingApprovals,
    unreadCount,
    refreshData: loadBootstrap,
    login,
    register,
    logout,
    toggleSave,
    clearSaved,
    toggleCompare,
    addProperty,
    updateProperty,
    deleteProperty,
    markNotificationsRead,
    updateProfile,
    updatePassword,
    updateSettings,
    requestUserData,
    enableTwoFactor,
    revokeSession,
    deleteMyAccount,
    sendPropertyInquiry,
    sendAgentMessage,
    replyToMessage,
    updateAppointmentStatus,
    markMessageRead,
    suspendAgent,
    removeUser,
    adminDeleteProperty,
    handlePendingProperty,
    exportAdminReport,
    generateAdminReport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}

