import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { MessageCircleIcon, MailIcon, LockIcon } from "lucide-react";

function ProfilePage() {
  return (
    <div className="h-screen w-full bg-base-100 flex flex-col">
      <Navbar />

      {/* <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-6xl h-[650px] grid grid-cols-1 md:grid-cols-2">
          Left: Text (50%)
          <div className="flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-600/20">
            <div className="w-full px-6">
              <MessageCircleIcon className="w-14 h-14 text-slate-400 mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-200 mb-3">Welcome Back</h2>
              <p className="text-slate-400">Login to access your account and manage your profile, preferences, and matches.</p>
            </div>
          </div>

          Right: Form (50%)
          <div className="flex items-center justify-center p-8 bg-linear-to-bl from-slate-800/20 to-transparent">
            <div className="w-full px-6 max-w-md">
              <form className="space-y-6">
                <div>
                  <label className="auth-input-label">Email</label>
                  <div className="relative">
                    <input type="email" className="input" placeholder="johndoe@gmail.com" />
                  </div>
                </div>

                <div>
                  <label className="auth-input-label">Password</label>
                  <div className="relative">
                    <input type="password" className="input" placeholder="Enter your password" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a className="link link-hover">Forgot password?</a>
                  <button className="btn btn-neutral">Login</button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link to="/signup" className="auth-link">Don't have an account? Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default ProfilePage;
