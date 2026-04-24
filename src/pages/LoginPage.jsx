import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

const DEMO_USERS = [
  { email: "user@luxestate.com",   password: "demo123", role: "user",  name: "Alex Johnson",   avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { email: "agent@luxestate.com",  password: "demo123", role: "agent", name: "Sophia Marlowe", avatar: "https://randomuser.me/api/portraits/women/44.jpg", agentId: "a1" },
  { email: "admin@luxestate.com",  password: "demo123", role: "admin", name: "Admin User",     avatar: "https://randomuser.me/api/portraits/men/75.jpg" },
];

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(form);
      toast.success(`Welcome back, ${loggedInUser.name.split(" ")[0]}!`);
      if (loggedInUser.role === "admin") navigate("/admin");
      else if (loggedInUser.role === "agent") navigate("/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials. Try the demo accounts below.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u) => {
    setForm({ email: u.email, password: u.password });
  };

  return (
    <div className="pt-[68px] min-h-screen bg-stone-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center">
              <FiHome className="text-gold text-lg" />
            </div>
            <span className="font-serif text-2xl font-bold text-ink">Lux<span className="text-gold">Estate</span></span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Welcome Back</h1>
          <p className="text-stone-500 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Demo Account Quick Login */}
        <div className="bg-gold/10 border border-gold/25 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-gold-700 uppercase tracking-wider mb-3">Demo Accounts — Click to Fill</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((u) => (
              <button key={u.role} onClick={() => quickLogin(u)}
                className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all group">
                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full mb-1.5 border-2 border-stone-200 group-hover:border-gold/40" />
                <span className="text-[11px] font-semibold text-ink capitalize">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input
                  type="email" required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-gold font-medium hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input
                  type={showPw ? "text" : "password"} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-3.5 h-3.5 accent-gold rounded" />
              <label htmlFor="remember" className="text-xs text-stone-500 cursor-pointer">Keep me signed in</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-gold font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-5">
          By signing in, you agree to our{" "}
          <a href="#" className="text-gold hover:underline">Terms</a> and{" "}
          <a href="#" className="text-gold hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
