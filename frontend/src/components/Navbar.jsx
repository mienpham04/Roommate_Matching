import { Link, useLocation } from "react-router";
import { UsersRound, User, Users, Heart, Compass } from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { name: "Profile", path: `/user/${user?.id}`, icon: User },
    { name: "Matches", path: "/matches", icon: Users },
    { name: "Explore", path: "/explore", icon: Compass }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
            to={"/"}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="size-10 rounded-xl bg-linear-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <UsersRound className="size-6 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                Oday
              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">
                Find your hommie
              </span>
            </div>
        </Link>

        {/* NAV ITEMS (Float Right) */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    state={item.state}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-content shadow-md"
                        : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline font-medium">{item.name}</span>
                  </Link>
                );
              })}

              <div className="ml-4 mt-2">
                <UserButton />
              </div>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="group px-6 py-3 bg-linear-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
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