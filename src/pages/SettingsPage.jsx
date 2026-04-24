import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FiBell,
  FiLock,
  FiGlobe,
  FiEye,
  FiMonitor,
  FiSave,
  FiShield,
  FiSmartphone,
  FiMail,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

const TABS = [
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "privacy", label: "Privacy", icon: FiShield },
  { id: "appearance", label: "Appearance", icon: FiMonitor },
  { id: "security", label: "Security", icon: FiLock },
];

export default function SettingsPage() {
  const {
    user,
    updateSettings,
    updatePassword,
    requestUserData,
    enableTwoFactor,
    revokeSession,
    deleteMyAccount,
  } = useApp();
  const [tab, setTab] = useState("notifications");

  const [notifs, setNotifs] = useState({
    emailInquiries: user?.settings?.notifications?.emailInquiries ?? true,
    emailViewings: user?.settings?.notifications?.emailViewings ?? true,
    emailNewsletter: user?.settings?.notifications?.emailNewsletter ?? false,
    smsViewings: user?.settings?.notifications?.smsViewings ?? false,
    smsMessages: user?.settings?.notifications?.smsMessages ?? true,
    pushAll: user?.settings?.notifications?.pushAll ?? true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: user?.settings?.privacy?.showProfile ?? true,
    showPhone: user?.settings?.privacy?.showPhone ?? false,
    showEmail: user?.settings?.privacy?.showEmail ?? true,
    dataAnalytics: user?.settings?.privacy?.dataAnalytics ?? true,
    cookiePerf: user?.settings?.privacy?.cookiePerf ?? true,
  });

  const [appearance, setAppearance] = useState({
    theme: user?.settings?.appearance?.theme || "light",
    density: user?.settings?.appearance?.density || "comfortable",
    language: user?.settings?.appearance?.language || "en",
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  if (!user) return <Navigate to="/login" />;

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-gold" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const SettingRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
      <div className="pr-4">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {desc && <p className="text-xs text-stone-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  const set = (setter, key) => (val) => setter((state) => ({ ...state, [key]: val }));

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-10 px-4">
        <div className="page-container">
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-stone-400 text-sm">Manage your account preferences and privacy</p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-2 sticky top-24">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`sidebar-link w-full ${tab === id ? "active" : ""}`}
                >
                  <Icon className="text-base flex-shrink-0" />
                  {label}
                </button>
              ))}
              <div className="border-t border-stone-100 mt-2 pt-2">
                <Link to="/profile" className="sidebar-link w-full">
                  ? Back to Profile
                </Link>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-5">
            {tab === "notifications" && (
              <div className="animate-fade-in space-y-5">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiMail className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Email Notifications</h2>
                  </div>
                  <div className="space-y-3">
                    <SettingRow
                      label="New Property Inquiries"
                      desc="Get notified when someone enquires about your listings"
                      checked={notifs.emailInquiries}
                      onChange={set(setNotifs, "emailInquiries")}
                    />
                    <SettingRow
                      label="Viewing Confirmations"
                      desc="Email reminders for confirmed viewings"
                      checked={notifs.emailViewings}
                      onChange={set(setNotifs, "emailViewings")}
                    />
                    <SettingRow
                      label="Newsletter & Updates"
                      desc="Market insights and platform updates"
                      checked={notifs.emailNewsletter}
                      onChange={set(setNotifs, "emailNewsletter")}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiSmartphone className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">SMS & Push Notifications</h2>
                  </div>
                  <div className="space-y-3">
                    <SettingRow
                      label="SMS Viewing Reminders"
                      desc="Text alerts before scheduled viewings"
                      checked={notifs.smsViewings}
                      onChange={set(setNotifs, "smsViewings")}
                    />
                    <SettingRow
                      label="SMS New Messages"
                      desc="Instant text when you receive a message"
                      checked={notifs.smsMessages}
                      onChange={set(setNotifs, "smsMessages")}
                    />
                    <SettingRow
                      label="Push Notifications"
                      desc="Enable all browser/app push notifications"
                      checked={notifs.pushAll}
                      onChange={set(setNotifs, "pushAll")}
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await updateSettings({ notifications: notifs });
                      toast.success("Notification preferences saved!");
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Could not save preferences");
                    }
                  }}
                  className="btn-primary"
                >
                  <FiSave /> Save Preferences
                </button>
              </div>
            )}

            {tab === "privacy" && (
              <div className="animate-fade-in space-y-5">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiEye className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Profile Visibility</h2>
                  </div>
                  <div className="space-y-3">
                    <SettingRow
                      label="Public Profile"
                      desc="Allow other users to view your profile page"
                      checked={privacy.showProfile}
                      onChange={set(setPrivacy, "showProfile")}
                    />
                    <SettingRow
                      label="Show Phone Number"
                      desc="Display your phone number on your public profile"
                      checked={privacy.showPhone}
                      onChange={set(setPrivacy, "showPhone")}
                    />
                    <SettingRow
                      label="Show Email Address"
                      desc="Display your email on your public profile"
                      checked={privacy.showEmail}
                      onChange={set(setPrivacy, "showEmail")}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiGlobe className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Data & Analytics</h2>
                  </div>
                  <div className="space-y-3">
                    <SettingRow
                      label="Usage Analytics"
                      desc="Help us improve LuxEstate by sharing anonymous usage data"
                      checked={privacy.dataAnalytics}
                      onChange={set(setPrivacy, "dataAnalytics")}
                    />
                    <SettingRow
                      label="Performance Cookies"
                      desc="Allow cookies that help us measure site performance"
                      checked={privacy.cookiePerf}
                      onChange={set(setPrivacy, "cookiePerf")}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Data Requests</p>
                  <p className="text-xs text-amber-600 mb-3">You can request a copy of your data or ask us to delete your account at any time.</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={async () => {
                        try {
                          await requestUserData("export");
                          toast.success("Data export request submitted. You'll receive an email within 48 hours.");
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Could not submit export request");
                        }
                      }}
                      className="text-xs font-semibold text-amber-700 border border-amber-300 bg-white px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Request Data Export
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await requestUserData("delete");
                          toast.success("Account deletion request submitted.");
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Could not submit deletion request");
                        }
                      }}
                      className="text-xs font-semibold text-red-500 border border-red-200 bg-white px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Request Account Deletion
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await updateSettings({ privacy });
                      toast.success("Privacy settings saved!");
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Could not save privacy settings");
                    }
                  }}
                  className="btn-primary"
                >
                  <FiSave /> Save Privacy Settings
                </button>
              </div>
            )}

            {tab === "appearance" && (
              <div className="animate-fade-in space-y-5">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiMonitor className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Display Preferences</h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", label: "Light", preview: "bg-white border-stone-300" },
                          { id: "dark", label: "Dark", preview: "bg-ink border-stone-700" },
                          { id: "system", label: "System", preview: "bg-gradient-to-r from-white to-ink border-stone-300" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setAppearance((state) => ({ ...state, theme: item.id }))}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              appearance.theme === item.id ? "border-gold bg-gold/5" : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className={`w-full h-10 rounded-lg mb-2 border ${item.preview}`} />
                            <span className="text-xs font-medium text-stone-600">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Content Density</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["compact", "comfortable", "spacious"].map((density) => (
                          <button
                            key={density}
                            onClick={() => setAppearance((state) => ({ ...state, density }))}
                            className={`py-2.5 px-4 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                              appearance.density === density ? "border-gold bg-gold/5 text-gold-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
                            }`}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Language</label>
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance((state) => ({ ...state, language: e.target.value }))}
                        className="select-field w-auto min-w-[200px]"
                      >
                        <option value="en">English (US)</option>
                        <option value="en-gb">English (UK)</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">??</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await updateSettings({ appearance });
                      toast.success("Appearance preferences saved!");
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Could not save appearance settings");
                    }
                  }}
                  className="btn-primary"
                >
                  <FiSave /> Save Appearance
                </button>
              </div>
            )}

            {tab === "security" && (
              <div className="animate-fade-in space-y-5">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiLock className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Change Password</h2>
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Current Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="input-field pl-10"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm((state) => ({ ...state, currentPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input
                          type="password"
                          placeholder="Min. 8 characters"
                          className="input-field pl-10"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm((state) => ({ ...state, newPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input
                          type="password"
                          placeholder="Repeat new password"
                          className="input-field pl-10"
                          value={securityForm.confirmNewPassword}
                          onChange={(e) => setSecurityForm((state) => ({ ...state, confirmNewPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!securityForm.currentPassword || !securityForm.newPassword) {
                          toast.error("Fill current and new password");
                          return;
                        }
                        if (securityForm.newPassword !== securityForm.confirmNewPassword) {
                          toast.error("Passwords do not match");
                          return;
                        }

                        try {
                          await updatePassword({
                            currentPassword: securityForm.currentPassword,
                            newPassword: securityForm.newPassword,
                          });
                          setSecurityForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                          toast.success("Password updated successfully!");
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Could not update password");
                        }
                      }}
                      className="btn-primary"
                    >
                      <FiLock /> Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiSmartphone className="text-gold" />
                    </div>
                    <h2 className="font-serif font-semibold text-lg text-ink">Two-Factor Authentication</h2>
                  </div>
                  <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                    Add an extra layer of security to your account. When enabled, you will need your phone to sign in.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await enableTwoFactor();
                        toast.success("2FA enabled");
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Could not enable 2FA");
                      }
                    }}
                    className="btn-dark text-sm"
                  >
                    Enable 2FA
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                  <h3 className="font-semibold text-sm text-ink mb-3">Active Sessions</h3>
                  {[
                    { device: "Chrome on MacBook Pro", location: "New York, NY", time: "Current session", current: true },
                    { device: "Safari on iPhone 15", location: "New York, NY", time: "2 hours ago", current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-ink flex items-center gap-2">
                          {session.device}
                          {session.current && <span className="badge badge-green text-[9px]">Current</span>}
                        </p>
                        <p className="text-xs text-stone-400">{session.location} · {session.time}</p>
                      </div>
                      {!session.current && (
                        <button
                          onClick={async () => {
                            try {
                              await revokeSession();
                              toast.success("Session revoked");
                            } catch (err) {
                              toast.error(err?.response?.data?.message || "Could not revoke session");
                            }
                          }}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-sm text-red-700 mb-1">Danger Zone</p>
                  <p className="text-xs text-red-500 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Permanently delete your account?")) return;
                      try {
                        await deleteMyAccount();
                        toast.success("Account deleted");
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Could not delete account");
                      }
                    }}
                    className="text-xs font-semibold text-red-600 border border-red-300 bg-white px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

