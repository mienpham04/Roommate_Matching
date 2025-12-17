import { Link, useLocation } from "react-router";
import { 
  User, Users, Compass, Rocket, Sparkles, 
  ChevronUp, Heart, MessageCircle, Menu, X 
} from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";
import { useEffect, useState, useMemo } from "react";
import useChatSSE from "../hooks/useChatSSE";
import { clsx } from "clsx"; // *Optional: makes class logic cleaner, or just use template literals
import { twMerge } from "tailwind-merge"; // *Optional: handles class conflicts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// --- 1. Custom Hook for Logic Separation ---
const useUnreadNotifications = (user, location) => {
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/chat/unread/${user.id}`);
      const data = await res.json();
      if (data.success) setTotalUnread(data.totalUnread || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // SSE Logic
  useChatSSE(user?.id, {
    onNewMessage: (message) => {
      if (message.recipientId === user?.id && location.pathname !== '/chat') {
        setTotalUnread((prev) => prev + 1);
      }
    },
    onMessageRead: () => {
      if (location.pathname === '/chat') setTotalUnread(0);
      fetchUnreadCount();
    }
  });

  // Polling & Location Logic
  useEffect(() => {
    if (user?.id) fetchUnreadCount();
  }, [user?.id]);

  useEffect(() => {
    if (location.pathname === '/chat' && user?.id) {
      setTotalUnread(0);
      const timer = setTimeout(fetchUnreadCount, 500);
      const interval = setInterval(fetchUnreadCount, 2000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [location.pathname, user?.id]);

  return totalUnread;
};

// --- 2. Sub-Components for cleanliness ---

const NavItem = ({ item, isActive, isMobile = false }) => {
  const Icon = item.icon;
  const isActionItem = item.name === "Match Up";

  // Base styles
  const baseClasses = "relative flex items-center justify-center transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50";
  
  // Desktop specific styles
  const desktopClasses = isActionItem
    ? "bg-gradient-to-r from-primary via-secondary to-accent text-white px-5 py-2.5 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] font-bold"
    : isActive
      ? "bg-primary/10 text-primary font-bold px-4 py-2"
      : "text-base-content/60 hover:bg-base-200/50 hover:text-base-content font-medium px-4 py-2";

  // Mobile specific styles (Bottom bar)
  const mobileClasses = isActive 
    ? "text-primary flex-col gap-1" 
    : "text-base-content/50 hover:text-base-content/80 flex-col gap-1";

  return (
    <Link
      to={item.path}
      className={twMerge(baseClasses, isMobile ? mobileClasses : desktopClasses)}
      aria-label={item.name}
    >
      <div className="relative">
        <Icon
          className={twMerge(
            "transition-all",
            isMobile ? "size-6" : "size-5",
            !isMobile && "mr-2",
            isActionItem && "animate-pulse-slow" // Custom animation class recommended
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />

        {/* Badge Notification */}
        {item.badge > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-sm ring-2 ring-base-100">
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}
      </div>

      {/* Label Logic */}
      {!isMobile && <span className={isActionItem ? "inline" : "hidden lg:inline"}>{item.name}</span>}
      {isMobile && <span className="text-[10px] font-medium">{item.name}</span>}
    </Link>
  );
};

// --- 3. Main Component ---

function Navbar() {
  const location = useLocation();
  const { user, isLoaded } = useUser();
  const totalUnread = useUnreadNotifications(user, location);



  const navItems = useMemo(() => [
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Matches", path: "/matches", icon: Users },
    { name: "Match Up", path: `/process/${user?.id}`, icon: Sparkles },
    { name: "Messages", path: "/chat", icon: MessageCircle, badge: totalUnread },
    { name: "Profile", path: `/user/${user?.id}`, icon: Rocket }, // Replaced Rocket with User for clearer semantics usually, but kept Rocket per request
  ], [user?.id, totalUnread]);

  if (!isLoaded) return null; // Or a skeleton loader

  return (
    <>
      {/* --- DESKTOP TOP BAR --- */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-base-100/80 backdrop-blur-xl supports-[backdrop-filter]:bg-base-100/60"
        role="navigation"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo Section */}
          <Link to="/" className="group flex items-center gap-3 focus:outline-none">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 shadow-inner">
              <ChevronUp className="absolute -mt-1 size-7 text-[#FF6B6B] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={3} />
              <Heart className="absolute size-3 translate-y-1 fill-[#FF6B6B] text-[#FF6B6B] transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-xl font-black tracking-tight text-transparent">
                Homieu
              </span>
              <span className="text-[10px] font-semibold text-base-content/40">
                Find your squad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-1 rounded-full bg-base-200/50 p-1 border border-white/5">
                  {navItems.map((item) => (
                    <NavItem 
                      key={item.name} 
                      item={item} 
                      isActive={location.pathname === item.path} 
                    />
                  ))}
                </div>
                <div className="ml-4 pl-4 border-l border-base-content/10">
                  <UserButton 
                    appearance={{
                      elements: { avatarBox: "size-9 ring-2 ring-primary/20 hover:ring-primary transition-all" }
                    }} 
                  />
                </div>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-content shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:shadow-primary/40 active:scale-95">
                  Login
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile User Profile (Top Right) */}
          <div className="md:hidden">
             {user ? <UserButton /> : (
                <SignInButton mode="modal">
                  <button className="text-sm font-bold text-primary">Login</button>
                </SignInButton>
             )}
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM BAR --- */}
      {/* Only visible on mobile, fixed to bottom */}
      {user && (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-base-content/5 bg-base-100/90 backdrop-blur-lg pb-safe md:hidden">
          <div className="grid h-16 grid-cols-5 items-center justify-items-center px-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={location.pathname === item.path} 
                isMobile={true} 
              />
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;