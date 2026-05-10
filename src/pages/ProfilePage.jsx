import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiCamera, FiEye, FiEyeOff } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, deleteMyAccount } = useApp();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
    });
  }, [user]);

  if (!user) return (
    <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center text-center px-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-4">Sign In Required</h2>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    </div>
  );

  const handleSave = async () => {
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.current || !passwordForm.next) {
      toast.error("Fill current and new password");
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      toast.success("Password updated!");
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update password");
    }
  };

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100">
      <div className="bg-ink py-10 px-4">
        <div className="page-container">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-gold/40" />
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <FiCamera className="text-ink text-[10px]" />
              </button>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-stone-400 text-sm capitalize">{user.role} account | {user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-2">
              {[
                { id: "profile", label: "Profile Info", icon: FiUser },
                { id: "security", label: "Security", icon: FiLock },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)} className={`sidebar-link w-full ${tab === id ? "active" : ""}`}>
                  <Icon className="text-base" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {tab === "profile" && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                <h2 className="font-serif font-semibold text-xl text-ink mb-5">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="input-field pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Location</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                        <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, State" className="input-field pl-10" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself..." className="input-field resize-none" />
                  </div>
                  <div className="pt-2">
                    <button onClick={handleSave} className="btn-primary">
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === "security" && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
                <h2 className="font-serif font-semibold text-xl text-ink mb-5">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current password"
                        className="input-field pl-10 pr-10"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-gold transition-colors"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        {showCurrentPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="password"
                        placeholder="New password"
                        className="input-field pl-10"
                        value={passwordForm.next}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        className="input-field pl-10"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button onClick={handlePasswordUpdate} className="btn-primary">Update Password</button>
                </div>

                {user.role === "user" && (
                  <div className="mt-8 pt-6 border-t border-stone-200">
                    <h3 className="font-semibold text-sm text-ink mb-3">Danger Zone</h3>
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
                      className="flex items-center gap-2 text-xs text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

