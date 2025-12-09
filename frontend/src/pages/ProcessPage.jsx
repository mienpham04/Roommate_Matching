import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Info from "../components/process/Info";
import Location from "../components/process/Location";
import Stepper from "../components/Stepper";
import Additional from "../components/process/Additional";

import { useNavigate } from "react-router";
import { useParams } from "react-router";

function ProcessPage() {
  const { id } = useParams();
  const [dbUser, setDbUser] = useState(null);

  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setDbUser(data);
      } catch (err) {
        console.error("Failed to fetch DB user:", err);
        setDbUser({ name: "Test User" });
      }
    };
    fetchUser();
  }, [id]);

  const stepData = [
    {
      name: "Your information",
      title: "Let’s get started",
      description: "Double check your personal information and preferences to get match with the best roommate.",
    },
    {
      name: "Choose location",
      title: "Where are you heading?",
      description: "Tell us where you want to live. You can adjust the search radius to find hidden gems nearby.",
    },
    {
      name: "Additional",
      title: "Finishing touches",
      description: "Is there anything else we should know about your roommate preferences before we run the matching algorithm?",
    },
  ];

  const currentStepData = stepData[current];

  const handleSubmit = () => navigate(`/explore`);

  const handleNext = () => {
    if (current < stepData.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  function renderStepContent() {
    switch (current) {
      case 0: return <Info dbUser={dbUser} id={id} />;
      case 1: return <Location dbUser={dbUser} id={id} setDbUser={setDbUser} />;
      case 2: return <Additional dbUser={dbUser} id={id} setDbUser={setDbUser} />;
      default: return null;
    }
  }

  // Calculate progress percentage for a visual bar
  const progress = ((current + 1) / stepData.length) * 100;

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* Main Card Container */}
        <div className="bg-base-100 w-full max-w-7xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

          {/* LEFT PANEL: Context & Visuals (Takes up 4/12 columns) */}
          <div className="lg:col-span-4 bg-pink-200 text-primary-content p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Background decoration circle */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>

            {/* Top: Stepper / Progress */}
            <div className="relative z-10">
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">
                Step {current + 1} of {stepData.length}
              </h3>
              {/* Custom Visual Progress Bar */}
              <div className="h-1 w-full bg-black/20 rounded-full mb-8">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="hidden lg:block">
                <Stepper stepData={stepData} current={current} />
              </div>
            </div>

            {/* Middle: Content Info */}
            <div className="relative z-10 my-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {currentStepData.title}
              </h1>
              <p className="text-lg opacity-90 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Form Area (Takes up 8/12 columns) */}
          <div className="lg:col-span-8 p-6 md:p-12 flex flex-col bg-base-100">

            {/* Form Content Wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-2xl mx-auto w-full py-4 animate-fade-in-up">
                {renderStepContent()}
              </div>
            </div>

            {/* Navigation Buttons Area */}
            <div className="pt-8 mt-auto border-t border-base-200">
              <div className="flex justify-between items-center max-w-2xl mx-auto">
                <button
                  onClick={handlePrev}
                  disabled={current === 0}
                  className={`btn btn-ghost hover:bg-base-200 gap-2 pl-0 ${current === 0 ? "invisible" : ""
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>

                {current < stepData.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="btn btn-primary px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Next Step
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Find My Match
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ProcessPage;