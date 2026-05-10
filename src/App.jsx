import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AgentsPage from "./pages/AgentsPage";
import AgentProfilePage from "./pages/AgentProfilePage";
import MapViewPage from "./pages/MapViewPage";
import ComparePage from "./pages/ComparePage";
import SavedPage from "./pages/SavedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";

// Pages that should NOT have the footer (full-height map, etc.)
const NO_FOOTER_PATHS = ["/map"];

function AppShell() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_PATHS.includes(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/properties"     element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/agents"         element={<AgentsPage />} />
          <Route path="/agents/:id"     element={<AgentProfilePage />} />
          <Route path="/map"            element={<MapViewPage />} />
          <Route path="/compare"        element={<ComparePage />} />
          <Route path="/saved"          element={<SavedPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/admin"          element={<AdminPage />} />
          <Route path="/profile"        element={<ProfilePage />} />
          {/* 404 */}
          <Route path="*" element={
            <div className="pt-24 min-h-screen bg-stone-100 flex items-center justify-center text-center px-4">
              <div>
                <div className="font-serif text-8xl font-bold text-stone-300 mb-4">404</div>
                <h2 className="font-serif text-2xl font-bold text-ink mb-2">Page Not Found</h2>
                <p className="text-stone-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0D0D0D",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              border: "1px solid rgba(201,168,76,0.25)",
            },
            success: { iconTheme: { primary: "#C9A84C", secondary: "#0D0D0D" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
