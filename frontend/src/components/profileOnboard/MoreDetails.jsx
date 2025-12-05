import { useState, useEffect } from "react";
import { FileText, Sparkles, Quote, Plus, Check, X } from "lucide-react";

function MoreDetails({ dbUser, userId, setDbUser, isEditMode = true }) {

  const [data, setData] = useState({
    moreAboutMe: dbUser?.moreAboutMe ?? ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [tempValue, setTempValue] = useState(data.moreAboutMe);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when dbUser changes (e.g., after page refresh)
  useEffect(() => {
    if (dbUser) {
      const newData = { moreAboutMe: dbUser.moreAboutMe ?? "" };
      setData(newData);
      setTempValue(newData.moreAboutMe);
    }
  }, [dbUser]);

  const saveToDB = async () => {
    setIsSaving(true);

    const updatedUser = {
      ...dbUser,
      moreAboutMe: tempValue,
    };

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setDbUser(updatedUser);
        setData({ moreAboutMe: tempValue });
      }
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setTempValue(data.moreAboutMe);
    setIsEditing(false);
  };

  const addTopic = (topic) => {
    const current = tempValue || "";
    const separator = current.length > 0 && !current.endsWith(" ") ? " " : "";
    const newText = current + separator + topic;
    setTempValue(newText);
    setIsEditing(true);
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

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Tell Us More</h2>
        <p className="text-base-content/60 max-w-lg mx-auto">
          Share anything you haven't mentioned yet that could help us find your perfect roommate match.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                  placeholder="Tell us a bit more about yourself..."
                  value={tempValue}
                  onChange={(e) => {
                    if (isEditMode) {
                      setTempValue(e.target.value);
                      setIsEditing(true);
                    }
                  }}
                  maxLength={500}
                  disabled={!isEditMode}
                ></textarea>

                <div className="absolute bottom-4 right-4 text-xs text-base-content/40 bg-base-100 px-2 py-1 rounded-md border border-base-200">
                  {tempValue?.length} / 500
                </div>

                {isEditing && (
                  <div className="absolute top-4 right-4 flex gap-2">

                    <button
                      className="btn btn-circle btn-sm btn-success text-white shadow"
                      onClick={saveToDB}
                      disabled={isSaving}
                    >
                      <Check size={16} />
                    </button>

                    <button
                      className="btn btn-circle btn-sm btn-ghost shadow text-base-content/60"
                      onClick={cancelEdit}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

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
                    disabled={!isEditMode}
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
