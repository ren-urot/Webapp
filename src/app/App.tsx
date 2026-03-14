import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./lib/AuthContext";
import { forceSeedDatabase } from "./lib/api";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // One-time clear: force-seed with empty data to remove old dummy data
      const cleared = localStorage.getItem("crm_data_cleared_v2");
      if (!cleared) {
        try {
          await forceSeedDatabase();
          localStorage.setItem("crm_data_cleared_v2", "true");
          console.log("Database cleared of dummy data");
        } catch (err) {
          console.error("Data clear failed (may be offline):", err);
        }
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f6f6]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#5d5d5d] text-[16px]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
