import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiMail, FiPhone, FiMapPin, FiInstagram, FiLinkedin, FiTwitter, FiFacebook } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <FiHome className="text-ink text-base" />
              </div>
              <span className="font-serif text-xl font-bold">Lux<span className="text-gold">Estate</span></span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-5">
              The premier destination for luxury real estate. Connecting discerning buyers and sellers with exceptional properties worldwide.
            </p>
            <div className="flex items-center gap-3">
              {[FiInstagram, FiLinkedin, FiTwitter, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-stone-400 hover:text-gold hover:bg-gold/15 transition-all duration-200">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-stone-400 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Browse Properties", to: "/properties" },
                { label: "Map View", to: "/map" },
                { label: "Our Agents", to: "/agents" },
                { label: "Compare Properties", to: "/compare" },
                { label: "Saved Listings", to: "/saved" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-400 hover:text-gold transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-stone-400 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Sign In", to: "/login" },
                { label: "Create Account", to: "/register" },
                { label: "Agent Portal", to: "/dashboard" },
                { label: "Admin Panel", to: "/admin" },
                { label: "My Profile", to: "/profile" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-400 hover:text-gold transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-stone-400 mb-4">Contact</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-400">432 Park Avenue, Suite 500<br />New York, NY 10022</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-gold flex-shrink-0" />
                <span className="text-sm text-stone-400">+1 (800) 589-4321</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-gold flex-shrink-0" />
                <span className="text-sm text-stone-400">hello@luxestate.com</span>
              </li>
            </ul>
            <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/8">
              <p className="text-xs text-stone-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 bg-white/8 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 outline-none focus:border-gold/50 transition-colors" />
                <button className="bg-gold text-ink text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gold-300 transition-colors">Go</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">© 2024 LuxEstate. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a key={l} href="#" className="text-xs text-stone-500 hover:text-gold transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
