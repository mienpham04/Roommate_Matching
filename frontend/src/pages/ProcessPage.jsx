import { useState } from "react";
import Navbar from "../components/Navbar";

import Info from "../components/process/Info";
import Location from "../components/process/Location";
import Preference from "../components/process/Preference";
import Stepper from "../components/Stepper";
import Additional from "../components/process/Additional";

import { useNavigate } from "react-router";

function ProcessPage() {
  const navigate = useNavigate();

  const stepData = [
    {
      name: "Basic info",
      title: "Let’s Make Sharing a Home Feel Easy",
      description:
        "Learn your habits and preferences to recommend roommates who naturally align with your daily life.",
    },
    {
      name: "Choose location",
      title: "Location",
      description:
        "Tell us where you want to live and adjust the search radius.",
    },
    {
      name: "Preferences",
      title: "Preferences",
      description: "Tell us your roommate preferences.",
    },
    {
      name: "Additional",
      title: "Additional Information",
      description: "Are there anything you want to add?",
    },
  ];

  const [current, setCurrent] = useState(0);

  const handleSubmit = () => navigate(`/explore`);

  const handleNext = () => {
    if (current < stepData.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  function renderStepContent() {
    switch (current) {
      case 0:
        return <Info />;

      case 1:
        return <Location />;

      case 2:
        return <Preference />;

      case 3:
        return <Additional />;

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <Stepper stepData={stepData} current={current}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderStepContent()}
          </div>
        </div>
      </main>

      <footer className="w-full mt-auto pb-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="btn btn-outline btn-lg rounded-full disabled:opacity-40"
          >
            BACK
          </button>

          {current < stepData.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary btn-lg rounded-full"
            >
              NEXT
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-lg rounded-full"
            >
              FINISH
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default ProcessPage;
