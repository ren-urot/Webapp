import { Link, useLocation, useNavigate } from "react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, ChevronRight, ChevronDown, LogOut, User, X, Mail, Phone, MapPin, Briefcase, Check, Menu } from "lucide-react";
import svgPaths from "../../imports/svg-vr1w7212pc";
import { useAuth } from "../lib/AuthContext";
import * as api from "../lib/api";

// Helper to format ISO timestamp into relative time
function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Fetch notifications on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Also refresh when dropdown opens
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { to: "/sales", label: "Sales & Orders" },
    { to: "/pos", label: "Point of Sale" },
    { to: "/workshops", label: "Workshops" },
    { to: "/inventory", label: "Inventory" },
    { to: "/deliveries", label: "Deliveries" },
  ];

  const { user, signOut, displayName } = useAuth();
  const userEmail = user?.email || "";
  const userPlan = user?.user_metadata?.plan || "basic";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "N/A";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.95)] border-b border-[#d8d8d8] backdrop-blur-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 h-[60px] sm:h-[85px] flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="h-5 sm:h-6 w-[90px] sm:w-[111px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111.217 24.2384">
                <g>
                  <path d={svgPaths.p35e1f00} fill="#FF4E00" />
                  <path d={svgPaths.p3f84db00} fill="#383838" />
                  <path d={svgPaths.p387e2d00} fill="#383838" />
                  <path d={svgPaths.pd3ea180} fill="#383838" />
                  <path d={svgPaths.p3e529840} fill="#383838" />
                  <path d={svgPaths.p1a2e7680} fill="#FF4E00" />
                  <path d={svgPaths.p326996f2} fill="#FF4E00" />
                  <path d={svgPaths.p3a897f80} fill="#383838" />
                  <path d={svgPaths.pc62baf0} fill="#383838" />
                  <path d={svgPaths.p11c05700} fill="#383838" />
                </g>
              </svg>
            </div>
            <div className="w-[2px] h-5 sm:h-7 bg-[#ff4e00] hidden sm:block" />
            <span className="text-[#383838] text-[16px] sm:text-[20px] font-medium hidden sm:inline">Flowershop CRM</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[15px] ${isActive(link.to) ? "text-[#ff4e00] font-medium" : "text-[#5d5d5d] hover:text-[#ff4e00]"} transition-colors`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Messages Icon with Badge */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 hover:bg-[#fff5f0] rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-[#ff4e00]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#424242] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[380px] bg-white rounded-[14px] border border-[#e9e9e9] shadow-lg z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#e9e9e9]">
                  <h3 className="text-[#ff4e00] text-[18px] font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, read: true }))
                        );
                        try { await api.markAllNotificationsRead(); } catch (err) { console.error("Failed to mark all read:", err); }
                      }}
                      className="flex items-center gap-1 text-[13px] text-[#9a9a9a] hover:text-[#ff4e00] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[340px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="text-[#9a9a9a] text-[14px]">No notifications yet</p>
                      <p className="text-[#c0c0c0] text-[12px] mt-1">Actions like adding customers or orders will appear here</p>
                    </div>
                  ) : (
                  notifications.map((notif, idx) => (
                    <button
                      key={notif.id}
                      onClick={async () => {
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notif.id ? { ...n, read: true } : n
                          )
                        );
                        try { await api.markNotificationRead(notif.id); } catch (err) { console.error("Failed to mark notification read:", err); }
                      }}
                      className={`w-full text-left px-4 sm:px-5 py-3.5 flex gap-3 items-start hover:bg-[#fff5f0] transition-colors ${
                        idx < notifications.length - 1 ? "border-b border-[#f0f0f0]" : ""
                      } ${!notif.read ? "bg-[#fff8f5]" : ""}`}
                    >
                      {/* Dot indicator */}
                      <div className="pt-1.5 flex-shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            !notif.read ? "bg-[#ff4e00]" : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[14px] truncate ${!notif.read ? "text-[#383838] font-semibold" : "text-[#5d5d5d] font-medium"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[11px] text-[#b0b0b0] flex-shrink-0">{timeAgo(notif.time)}</span>
                        </div>
                        <p className="text-[13px] text-[#9a9a9a] mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </button>
                  ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                <div className="border-t border-[#e9e9e9] px-5 py-3">
                  <button
                    onClick={async () => {
                      const ids = notifications.map(n => n.id);
                      setNotifications([]);
                      setNotifOpen(false);
                      for (const id of ids) {
                        try { await api.deleteNotification(id); } catch (err) { console.error("Failed to delete notification:", err); }
                      }
                    }}
                    className="w-full text-center text-[13px] text-[#9a9a9a] hover:text-[#ff4e00] transition-colors"
                  >
                    Clear all notifications
                  </button>
                </div>
                )}
              </div>
            )}
          </div>

          {/* Vertical Divider - desktop only */}
          <div className="w-px h-12 bg-[#cacaca] hidden sm:block" />

          {/* Customers Button - desktop only */}
          <Link 
            to="/customers"
            className={`hidden sm:block px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg border-[1.5px] transition-colors ${
              isActive("/customers") 
                ? "bg-[#ff4e00] text-white border-[#ff4e00]" 
                : "bg-white text-[#ff4e00] border-[#ff4e00] hover:bg-[#ff4e00] hover:text-white"
            }`}
          >
            <span className="font-semibold text-[15px] lg:text-[17px]">Customers</span>
          </Link>

          {/* User Menu - desktop only */}
          <div className="relative hidden lg:block" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-[#ff4e00]"
            >
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 19 19">
                  <g>
                    <path d={svgPaths.p27342900} fill="#FF4E00" />
                    <path d={svgPaths.p1e70a00} fill="#FF4E00" />
                  </g>
                </svg>
              </div>
              <span className="text-[15px] font-medium">{displayName || "User"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-[#e9e9e9] shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#5d5d5d] hover:bg-[#fff5f0] hover:text-[#ff4e00] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile Details
                </button>
                <div className="border-t border-[#e9e9e9] mx-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#c62828] hover:bg-[#fce4ec] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-[#fff5f0] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#ff4e00]" /> : <Menu className="w-5 h-5 text-[#ff4e00]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e9e9e9] bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-3 px-3 rounded-lg text-[15px] ${
                  isActive(link.to) ? "text-[#ff4e00] font-medium bg-[#fff5f0]" : "text-[#5d5d5d] hover:bg-[#fff5f0] hover:text-[#ff4e00]"
                } transition-colors`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/customers"
              className={`py-3 px-3 rounded-lg text-[15px] ${
                isActive("/customers") ? "text-[#ff4e00] font-medium bg-[#fff5f0]" : "text-[#5d5d5d] hover:bg-[#fff5f0] hover:text-[#ff4e00]"
              } transition-colors sm:hidden`}
            >
              Customers
            </Link>
            <div className="border-t border-[#e9e9e9] mt-2 pt-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 19 19">
                  <g>
                    <path d={svgPaths.p27342900} fill="#FF4E00" />
                    <path d={svgPaths.p1e70a00} fill="#FF4E00" />
                  </g>
                </svg>
                <span className="text-[#383838] text-[15px] font-medium">{displayName || "User"}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-[#5d5d5d] hover:bg-[#fff5f0] hover:text-[#ff4e00] rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Profile Details
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-[#c62828] hover:bg-[#fce4ec] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Profile Details Modal */}
      {profileOpen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setProfileOpen(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-[14px] w-full max-w-[420px] mx-4 shadow-xl border border-[#e0e0e0] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#ff4e00] px-6 pt-6 pb-12 relative">
              <button
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-white text-[22px] font-semibold">Profile Details</h2>
            </div>

            {/* Avatar overlapping header */}
            <div className="relative flex justify-center" style={{ marginTop: "-32px" }}>
              <div className="w-16 h-16 rounded-full bg-white border-[3px] border-white shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#fff0e8] flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 19 19">
                    <g>
                      <path d={svgPaths.p27342900} fill="#FF4E00" />
                      <path d={svgPaths.p1e70a00} fill="#FF4E00" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center mt-3 mb-5">
              <p className="text-[#383838] text-[20px] font-semibold">{displayName || "User"}</p>
              <p className="text-[#ff4e00] text-[14px] font-medium capitalize">{userPlan} Plan</p>
            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f6f6] rounded-lg">
                <Mail className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[#9a9a9a] text-[11px]">Email</p>
                  <p className="text-[#5d5d5d] text-[14px] truncate">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f6f6] rounded-lg">
                <Briefcase className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <div>
                  <p className="text-[#9a9a9a] text-[11px]">Member Since</p>
                  <p className="text-[#5d5d5d] text-[14px]">{memberSince}</p>
                </div>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="w-full mt-4 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}