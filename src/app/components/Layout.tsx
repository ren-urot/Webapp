import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../lib/AuthContext";

export default function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
    // If user is logged in but hasn't completed app verification, sign them out
    // and redirect to signup so they can complete verification
    if (!loading && user && user.user_metadata?.app_verified === false) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f6f6]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#5d5d5d] text-[16px]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-[#f7f7f7]">
      <Header />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}