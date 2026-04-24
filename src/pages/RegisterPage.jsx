import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiPhone, FiCheck } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "user");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "", agreeTerms: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (!form.agreeTerms) { toast.error("Please agree to the terms"); return; }
    setLoading(true);
    try {
      const createdUser = await register({
        ...form,
        role,
      });
      toast.success("Account created successfully! Welcome to LuxEstate.");
      if (createdUser.role === "agent") navigate("/dashboard");
      else if (createdUser.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center">
              <FiHome className="text-gold text-lg" />
            </div>
            <span className="font-serif text-2xl font-bold text-ink">Lux<span className="text-gold">Estate</span></span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Create Your Account</h1>
          <p className="text-stone-500 text-sm">Join thousands of satisfied clients</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: "user", label: "Property Buyer / Renter", icon: "🏠", desc: "Browse and save listings" },
            { id: "agent", label: "Real Estate Agent", icon: "🏆", desc: "List and manage properties" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                role === r.id
                  ? "border-gold bg-gold/8"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className={`text-xs font-bold mb-0.5 ${role === r.id ? "text-gold-700" : "text-ink"}`}>{r.label}</div>
              <div className="text-[10px] text-stone-500">{r.desc}</div>
              {role === r.id && (
                <div className="flex items-center gap-1 mt-2">
                  <FiCheck className="text-gold text-[10px]" />
                  <span className="text-[10px] text-gold font-semibold">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                  <input type="text" required placeholder="John" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Last Name</label>
                <input type="text" required placeholder="Smith" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input
                  type={showPw ? "text" : "password"} required minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={(e) => set("password", e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                      form.password.length >= i * 3 ? i <= 2 ? "bg-red-400" : i === 3 ? "bg-yellow-400" : "bg-green-400" : "bg-stone-200"
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input
                  type={showPw ? "text" : "password"} required
                  placeholder="Repeat password"
                  value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
                  className={`input-field pl-10 ${form.confirm && form.confirm !== form.password ? "border-red-300 focus:border-red-400" : ""}`}
                />
                {form.confirm && form.confirm === form.password && (
                  <FiCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 text-sm" />
                )}
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.agreeTerms} onChange={(e) => set("agreeTerms", e.target.checked)} className="w-3.5 h-3.5 accent-gold rounded mt-0.5 flex-shrink-0" />
              <span className="text-xs text-stone-500 leading-relaxed">
                I agree to LuxEstate's{" "}
                <a href="#" className="text-gold hover:underline font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-gold hover:underline font-medium">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${role === "agent" ? "Agent" : ""} Account`}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
