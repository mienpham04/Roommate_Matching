import { Link } from "react-router";
import { UsersRound } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

function Navbar() {

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

        <div className="flex items-center gap-1">
          <div className="ml-4 mt-2" >
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;