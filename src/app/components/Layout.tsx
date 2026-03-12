import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}