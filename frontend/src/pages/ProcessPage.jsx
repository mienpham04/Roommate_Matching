import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Info from "../components/process/Info";
import Preferences from "../components/process/Preferences";
import Location from "../components/process/Location";
import Stepper from "../components/Stepper"; // Assuming you have this, otherwise standard text works
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Heart, Sparkles } from "lucide-react";

function ProcessPage() {
  const { id } = useParams();
  const [dbUser, setDbUser] = useState(null);
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Mocking fetch for visual demonstration
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setDbUser(data);
      } catch (err) {
        console.error("Failed to fetch DB user:", err);
        // Fallback for UI dev
        setDbUser({ 
            firstName: "Long", 
            lastName: "Huynh", 
            profileImageUrl: "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
            email: "longhuynh@example.com",
            gender: "Male",
            dateOfBirth: "2000-01-01"
        });
      }
    };
    fetchUser();
  }, [id]);

  const stepData = [
    {
      name: "Your information",
      title: "Let's get started",
      description: "Double check your personal information and preferences to get matched with the best roommate.",
    },
    {
      name: "Your preferences",
      title: "What's your vibe?",
      description: "Review your lifestyle preferences so we can find someone who matches your style.",
    },
    {
      name: "Choose location",
      title: "Where are you heading?",
      description: "Tell us where you want to live. You can adjust the search radius to find hidden gems nearby.",
    },
  ];

  const currentStepData = stepData[current];

  const handleSubmit = () => {
    window.location.href = '/explore';
  };

  const handleNext = () => {
    if (current < stepData.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  function renderStepContent() {
    switch (current) {
      case 0: return <Info dbUser={dbUser} id={id} />;
      case 1: return <Preferences dbUser={dbUser} id={id} />;
      case 2: return <Location dbUser={dbUser} id={id} setDbUser={setDbUser} />;
      default: return null;
    }
  }

  const progress = ((current + 1) / stepData.length) * 100;

  return (
    <div className="min-h-screen bg-base-200 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="bg-pink-50 w-full max-w-6xl h-[800px] lg:h-[700px] rounded-[2.5rem] shadow-2xl shadow-pink-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-pink-100 ring-1 ring-pink-200/30">

          {/* SIDEBAR */}
          <div className="lg:col-span-4 bg-gradient-to-br from-pink-200 via-pink-300 to-rose-300 text-gray-800 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl"></div>
            
            {/* Top: Progress */}
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                  <span className="bg-white/70 px-2 py-1 rounded text-gray-800 font-extrabold shadow-sm">Step {current + 1}</span>
                  <span className="font-bold">of {stepData.length}</span>
               </div>

               {/* Custom Progress Bar */}
               <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>

               {/* Visual Stepper List (Optional) */}
               <div className="hidden lg:block space-y-4 pt-4">
                  {stepData.map((s, idx) => (
                    <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${idx === current ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold shadow-md ${idx <= current ? 'bg-white text-pink-500 border-white' : 'border-white/50 text-white bg-pink-400/30'}`}>
                            {idx < current ? <Check className="w-4 h-4"/> : <span className="text-sm font-bold">{idx + 1}</span>}
                        </div>
                        <span className="font-semibold text-sm text-gray-800">{s.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Middle: Content Text */}
            <div className="relative z-10 my-auto">
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight text-gray-900 drop-shadow-sm">
                {currentStepData.title}
              </h1>
              <p className="text-lg leading-relaxed font-semibold text-gray-700">
                {currentStepData.description}
              </p>
            </div>

            {/* Bottom decoration */}
            <div className="relative z-10 flex gap-2 opacity-60">
               <Sparkles className="w-6 h-6 animate-pulse text-white" />
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-8 flex flex-col bg-pink-50 relative">

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-12">
              <div className="max-w-2xl mx-auto w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderStepContent()}
              </div>
            </div>

            {/* Footer Navigation (Sticky Bottom) */}
            <div className="p-6 md:px-12 md:py-8 border-t border-pink-200 bg-pink-50/80 backdrop-blur-md sticky bottom-0 z-20">
              <div className="flex justify-between items-center max-w-2xl mx-auto">
                <button
                  onClick={handlePrev}
                  disabled={current === 0}
                  className={`btn btn-ghost hover:bg-base-200 text-base-content/70 gap-2 pl-0 transition-all ${current === 0 ? "invisible opacity-0" : "visible opacity-100"}`}
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Back</span>
                </button>

                {current < stepData.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="group btn bg-teal-400 hover:bg-teal-500 border-0 text-gray-900 px-8 rounded-full shadow-lg shadow-teal-300/50 hover:shadow-teal-400/60 hover:scale-105 transition-all duration-300 font-extrabold"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="group btn bg-teal-400 hover:bg-teal-500 border-0 text-gray-900 px-8 rounded-full shadow-lg shadow-teal-300/50 hover:shadow-teal-400/60 hover:scale-105 transition-all duration-300 font-extrabold"
                  >
                    Find My Match
                    <Heart className="w-4 h-4 group-hover:scale-125 transition-transform" fill="currentColor" />
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

// Helper icon for stepper logic
function Check({className}) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
}

export default ProcessPage;