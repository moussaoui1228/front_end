/**
 * NAVBAR COMPONENT
 * The main navigation bar that appears on every page.
 * It handles:
 * - Links to all main pages (Home, Process, etc.)
 * - Role-based links (Dashboard for Owners, Tracking for Customers)
 * - Language switching (FR, EN, KAB)
 * - Real-time notification polling (checks for new alerts every 30s)
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Globe, Check, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/Context/AuthContext";
import { LogOut, Bell } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer";
import API_URL from "@/config";

// Configuration for site-wide links
const getLeftLinks = (t: any) => [
  { to: "/", label: t("nav.home") },
  { to: "/processus", label: t("nav.process") },
  { to: "/plats", label: t("nav.dishes") },
];

const getRightLinks = (t: any) => [
  { to: "/region", label: t("nav.region") },
  { to: "/a-propos", label: t("nav.about") },
];

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "kab", label: "Kabyle" },
];

const Navbar = ({ className = "", onNotificationClick }: { className?: string, onNotificationClick?: (type: 'order' | 'pressing', id: string) => void }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, token, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false); // Controls background transparency on scroll
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
  const [notiOpen, setNotiOpen] = useState(false); // Notification sidebar state
  const [unreadCount, setUnreadCount] = useState(0); // Badge number for notifications
  const location = useLocation();

  /**
   * fetchUnreadCount
   * Checks the server to see if there are any new unread notifications.
   */
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Change navbar appearance when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Set up the notification checker (polls every 30 seconds)
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); 
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // Close mobile menu when user clicks a link (navigates)
  useEffect(() => setMenuOpen(false), [location]);

  const currentLang = i18n.language || "fr";
  const leftLinks = getLeftLinks(t);
  const rightLinks = getRightLinks(t);
  const allLinks = [...leftLinks, ...rightLinks];
  if (isAuthenticated) {
    allLinks.push({ to: "/suivi", label: t("nav.tracking") });
  }

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${className} ${scrolled
          ? "bg-background/60 backdrop-blur-md shadow-sm"
          : "bg-background/30 backdrop-blur-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-14 lg:h-16 relative">

          {/* Left area: Logo */}
          <div className="flex items-center z-10 flex-1">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="TAZDAYTH Logo"
                className="h-14 lg:h-16 w-auto object-contain mt-0.5"
                style={{ transform: "scale(1.2)", transformOrigin: "left center" }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-foreground hidden">
                TAZDAYTH
              </span>
            </Link>
          </div>

          {/* Absolute Center Area: Links */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex justify-center w-full pointer-events-none">
            <div className="hidden lg:flex items-center justify-center gap-8 max-w-4xl mx-auto pointer-events-auto">
              {allLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm tracking-wide transition-colors duration-300 hover:text-primary whitespace-nowrap ${location.pathname === l.to ? "text-primary font-semibold" : "text-foreground/70"
                    }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right area: Icons */}
          <div className="flex items-center justify-end gap-4 z-10 flex-1">

            <Link to="/boutique" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors hover:scale-110 duration-200">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => setNotiOpen(true)}
                className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors hover:scale-110 duration-200 focus:outline-none relative"
              >
                <Bell className="w-4 h-4 stroke-[2.5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-foreground/70 hover:text-primary transition-colors focus:outline-none">
                  <Globe className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">{currentLang.toUpperCase()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex flex-row items-center justify-between cursor-pointer"
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground/70 hover:text-primary transition-colors focus:outline-none">
                    <User className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {user?.role === 'owner' && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer font-bold text-primary">Tableau de Bord</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/suivi" className="cursor-pointer">{t("nav.my_activities")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/connexion" className="hidden lg:flex items-center gap-1 text-foreground/70 hover:text-primary transition-colors">
                <User className="w-4 h-4 stroke-[2.2]" />
              </Link>
            )}

            <button onClick={() => setMenuOpen(true)} className="lg:hidden text-foreground">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="TAZDAYTH Logo"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-xl font-bold tracking-tight text-foreground hidden">TAZDAYTH</span>
              </Link>
              <button onClick={() => setMenuOpen(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-5">
              {allLinks.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={l.to}
                    className={`text-2xl font-medium tracking-tight transition-colors ${location.pathname === l.to ? "text-primary" : "text-foreground"
                      }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: allLinks.length * 0.08 }}
                className="flex flex-col items-center gap-6 mt-3 w-full"
              >
                <div className="flex gap-5 mt-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`text-base font-medium transition-colors ${currentLang === lang.code ? "text-primary" : "text-foreground/60"
                        }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
                {isAuthenticated ? (
                  <div className="flex flex-col items-center gap-4">
                    {user?.role === 'owner' && (
                      <Link to="/dashboard" className="text-lg font-bold text-primary">{t("nav.dashboard") || "Dashboard"}</Link>
                    )}
                    <button onClick={logout} className="text-lg text-destructive font-medium">{t("nav.logout")}</button>
                  </div>
                ) : (
                  <Link to="/connexion" className="text-lg text-foreground/60">{t("nav.login")}</Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationDrawer
        isOpen={notiOpen}
        onClose={() => setNotiOpen(false)}
        onRefresh={fetchUnreadCount}
        unreadCount={unreadCount}
        setUnreadCount={setUnreadCount}
        onNotificationClick={(type, id) => {
          if (user?.role === 'owner') {
            const tab = type === 'order' ? 'orders' : 'pressing';
            window.location.href = `/dashboard?tab=${tab}&id=${id}`;
          } else {
            const tab = type === 'order' ? 'orders' : 'pressing';
            window.location.href = `/suivi?tab=${tab}&id=${id}`;
          }
        }}
      />
    </>
  );
};

export default Navbar;