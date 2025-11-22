import { Link } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  ZapIcon,
  UsersRound,
  Binoculars,
  Bolt,
  Brain,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

function HomePage() {
  return (
    <div className="bg-linear-to-br from-base-100 via-base-200 to-base-300">
      {/* NAVBAR */}
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

          {/* AUTH BTN */}
          {/* <SignInButton className="btn btn-soft btn-primary">Login</SignInButton> */}
          <SignInButton mode="modal">
            <button className="group px-6 py-3 bg-linear-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <span>Login</span>
            </button>
          </SignInButton>
        </div>
      </nav>
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-8">
            <div className="badge badge-sm bg-pink-100 text-pink-700">
              <ZapIcon className="size-4" />
              Find your best hommie
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Roommate Matching,
              </span>
              <br />
              {/* <span className="text-base-content">Learn Together</span> */}
            </h1>

            <p className="text-xl text-base-content/70 leading-relaxed max-w-xl">
              The ultimate platform to match your roommate effiently.
            </p>
            {/* FEATURE PILLS */}
            <div className="flex flex-wrap gap-3">
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Smart Matchmaking
              </div>
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Real-Time Preference Scoring
              </div>
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Personality-Based Recommendations
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg">
                  Start Matching Now
                  <ArrowRightIcon className="size-5" />
                </button>
              </SignInButton>

              {/* <button className="btn btn-outline btn-lg">
                <VideoIcon className="size-5" />
                Watch Demo
              </button> */}
            </div>

            {/* STATS */}
            <div className="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg">
              <div className="stat">
                <div className="stat-value text-primary">10K+</div>
                <div className="stat-title">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-value text-secondary">50K+</div>
                <div className="stat-title">Sessions</div>
              </div>
              <div className="stat">
                <div className="stat-value text-accent">99.9%</div>
                <div className="stat-title">Uptime</div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <img
            src="/homepage.png"
            alt="roommate matching app"
            className="w-full h-auto rounded-3xl shadow-2xl border-4 border-base-100 hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to {" "}
            <span className="text-primary font-mono">Live Better Together</span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features designed to make finding the right roommate effortless and stress-free
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Binoculars className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Smart Matchmaking</h3>
              <p className="text-base-content/70">
                Find your ideal roommate instantly with AI-powered preference matching that analyzes lifestyle, habits, and compatibility in seconds.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Bolt className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Live Preference Matching</h3>
              <p className="text-base-content/70">
                Preferences update in real time - budget, sleep schedule, cleanliness, noise tolerance - ensuring your matches always reflect who you are right now.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Transparent Compatibility Insights</h3>
              <p className="text-base-content/70">
                Get clear explanations for every match, including shared habits, potential conflicts, and personalized recommendations powered by AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
