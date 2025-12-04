import React from "react";
import { FileText, Sparkles, Quote, Plus } from "lucide-react";

function MoreDetails({ data, setData }) {
  const handleChange = (value) => {
    setData((prev) => ({ ...prev, moreDetails: value }));
  };

  // Helper function to append text when a chip is clicked
  const addTopic = (topic) => {
    const currentText = data.moreDetails || "";
    // Avoid duplicates or awkward spacing
    const separator = currentText.length > 0 && !currentText.endsWith(" ") ? " " : "";
    const newText = currentText + separator + topic;
    handleChange(newText);
  };

  const topics = [
    "I'm a heavy sleeper.",
    "I love cooking.",
    "I work from home.",
    "I'm allergic to cats.",
    "I enjoy quiet weekends.",
    "I'm neat and organized."
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Almost Done!</h2>
        <p className="text-base-content/60 max-w-lg mx-auto">
          This is your chance to share anything else that might help us find your perfect match.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Main Input */}
        <div className="md:col-span-2">
          <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
            <div className="card-body p-6">
              
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Quote size={20} />
                </div>
                <h3 className="font-bold text-lg">About Me</h3>
              </div>

              <div className="relative h-full min-h-[200px]">
                <textarea
                  className="textarea textarea-bordered w-full h-full text-base leading-relaxed p-4 rounded-xl focus:textarea-primary resize-none"
                  placeholder="e.g. Hi! I'm a software engineer who loves hiking. I'm looking for a roommate who respects quiet hours during the week but enjoys hanging out on weekends..."
                  value={data.moreDetails || ""}
                  onChange={(e) => handleChange(e.target.value)}
                  maxLength={500}
                ></textarea>
                
                {/* Character Counter */}
                <div className="absolute bottom-4 right-4 text-xs text-base-content/40 bg-base-100 px-2 py-1 rounded-md border border-base-200">
                  {(data.moreDetails || "").length} / 500
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Suggestions / "Quick Add" */}
        <div className="md:col-span-1">
          <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
            <div className="card-body p-6">
              
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-yellow-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide text-base-content/70">
                  Quick Topics
                </h3>
              </div>
              
              <p className="text-xs text-base-content/50 mb-4">
                Click to add these common phrases to your bio:
              </p>

              <div className="flex flex-col gap-2">
                {topics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => addTopic(topic)}
                    className="btn btn-sm btn-ghost justify-start font-normal text-left h-auto py-2 border border-base-200 hover:border-primary/50 hover:bg-base-200"
                  >
                    <Plus size={14} className="opacity-50 shrink-0 mr-1" />
                    <span className="truncate">{topic}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6">
                 <div className="alert alert-info bg-base-200 border-none text-xs text-base-content/70 p-3 rounded-lg flex items-start gap-2">
                    <FileText size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Detailed bios get <strong>2x more matches</strong> on average.
                    </span>
                 </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MoreDetails;