import {
  ArrowRightIcon,
  CheckIcon,
  ZapIcon,
  Binoculars,
  Bolt,
  Brain,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Carousel } from "../components/Carousel";
import Navbar from "../components/Navbar";

function HomePage() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  const handleStartMatching = () => {
    if (isSignedIn && user?.id) {
      navigate(`/user/${user.id}`);
    } else {
      openSignIn();
    }
  };
  const data = {
    slides: [
      {
        src: "https://picsum.photos/seed/img1/600/400",
        alt: "Image 1 for carousel",
      },
      {
        src: "https://picsum.photos/seed/img2/600/400",
        alt: "Image 2 for carousel",
      },
      {
        src: "https://picsum.photos/seed/img3/600/400",
        alt: "Image 3 for carousel",
      },
    ],
  };
  return (
    <div className="bg-linear-to-br from-base-100 via-base-200 to-base-300">
      <Navbar />
      {/* MAIN SECTION */}
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
                Vibe Matching,
              </span>
              <br />
            </h1>

            <p className="text-xl text-base-content/70 leading-relaxed max-w-xl">
              The ultimate platform to match your roommate effiently.
            </p>
            {/* FEATURE */}
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

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary btn-lg" onClick={handleStartMatching}>
                Set up your profile now
                <ArrowRightIcon className="size-5" />
              </button>
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
        <div className="text-center mb-16 bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need To {" "}
            <span className="font-mono bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Live Better Together
            </span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features designed to make finding the right roommate
            effortless and stress-free
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
                Find your ideal roommate instantly with AI-powered preference
                matching that analyzes lifestyle, habits, and compatibility in
                seconds.
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
                Preferences update in real time - budget, sleep schedule,
                cleanliness, noise tolerance - ensuring your matches always
                reflect who you are right now.
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
                Get clear explanations for every match, including shared habits,
                potential conflicts, and personalized recommendations powered by
                AI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-16 bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            How Homieu works
          </h2>
        </div>

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="-space-y-0.5 w-full max-w-xl">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="text-3xl font-semibold text-base-content/40">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  SignUp/Login with Email
                </h3>
                <p className="text-base text-base-content/70 leading-relaxed max-w-xl">
                  Quickly get started by creating an account or logging in with
                  your email.
                </p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="text-3xl font-semibold text-base-content/40">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  Set up your information
                </h3>
                <p className="text-base text-base-content/70 leading-relaxed max-w-xl">
                  Tell us more about yourself so we can understand your
                  lifestyle.
                </p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="text-3xl font-semibold text-base-content/40">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  Choose your preferences
                </h3>
                <p className="text-base text-base-content/70 leading-relaxed max-w-xl">
                  Select your living preferences - sleep schedule, cleanliness,
                  and more.
                </p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="text-3xl font-semibold text-base-content/40">
                4
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  Get Match
                </h3>
                <p className="text-base text-base-content/70 leading-relaxed max-w-xl">
                  Instantly receive your best roommate matches based on
                  compatibility.
                </p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 5 */}
            <div className="flex items-start gap-6">
              <div className="text-3xl font-semibold text-base-content/40">
                5
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  Enjoy!
                </h3>
                <p className="text-base text-base-content/70 leading-relaxed max-w-xl">
                  Move in with confidence.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — CAROUSEL */}
          <div className="order-2 lg:order-2 flex justify-center">
            <Carousel data={data.slides} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
