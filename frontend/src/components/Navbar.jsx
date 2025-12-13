import { Link, useLocation } from "react-router";
import { User, Users, Compass, Rocket, Sparkles, ChevronUp, Heart, MessageCircle } from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const [totalUnread, setTotalUnread] = useState(0);

  const navItems = [
    { name: "Profile", path: `/user/${user?.id}`, icon: Rocket },
    { name: "Messages", path: "/chat", icon: MessageCircle, badge: totalUnread },
    { name: "Matches", path: "/matches", icon: Users },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Match Up", path: `/process/${user?.id}`, icon: Sparkles }

  ];

  // Fetch unread message count
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/unread/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setTotalUnread(data.totalUnread || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav 
      role="navigation" 
      aria-label="Main Navigation"
      className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg text-base-content"
    >
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
            to={"/"}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Homieu Home"
          >
            <div className="flex flex-col items-center justify-center size-10">
              <ChevronUp className="size-7 text-[#FF6B6B] -mb-1" strokeWidth={3} aria-hidden="true" />
              <Heart className="size-4 text-[#FF6B6B] fill-[#FF6B6B]" strokeWidth={2} aria-hidden="true" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-2xl md:text-3xl font-sans tracking-wide bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Homieu
              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">
                Yes, that's how I met my homie
              </span>
            </div>
        </Link>

        {/* NAV ITEMS */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  const isActionItem = item.name === "Match Up"; 

                  let itemClasses = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ";

                  if (isActionItem) {
                    itemClasses += "bg-linear-to-r from-primary via-secondary to-accent text-primary-content font-bold shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:scale-105 drop-shadow-md border border-white/10";
                  } else if (active) {
                    itemClasses += "bg-primary text-primary-content font-bold shadow-md"; 
                  } else {
                    itemClasses += "hover:bg-base-200 text-base-content/70 hover:text-base-content font-medium";
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      className={`${itemClasses} relative`}
                    >
                      <Icon className={`size-4 ${isActionItem ? "animate-pulse" : ""}`} aria-hidden="true" />
                      <span className="hidden md:inline">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
              })}

              <div className="ml-4 mt-2">
                <UserButton userProfileUrl={user.imageUrl} />
              </div>
            </>
          ) : (
            <SignInButton mode="modal">
              {/* Added focus rings to login button as well */}
              <button className="group px-6 py-3 bg-linear-to-r from-primary to-secondary rounded-xl text-primary-content font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <span>Login</span>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
