import { useState } from "react";
import { Check, X } from "lucide-react";

function Additional({ dbUser, id, setDbUser }) {
  const [bio, setBio] = useState(dbUser?.preferences?.moreAboutMe || "");
  const [tempBio, setTempBio] = useState(dbUser?.preferences?.moreAboutMe || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const topics = [
    { icon: "😴", label: "Sleep Schedule" },
    { icon: "🧹", label: "Cleanliness" },
    { icon: "🐶", label: "Pets" },
    { icon: "🥂", label: "Guests & Parties" },
    { icon: "💻", label: "Work Schedule" },
  ];

  /** ✅ SAVE BIO TO DATABASE (fixed syntax + correct update structure) */
  const saveToDB = async () => {
    setIsSaving(true);

    const updatedUser = {
      ...dbUser,
      preferences: {
        ...dbUser.preferences,
        moreAboutMe: tempBio,
      },
    };

    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setDbUser(updatedUser);
        setBio(tempBio);
        setIsLocked(true);
      }
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  /** CANCEL EDIT */
  const cancelEdit = () => {
    setTempBio(bio);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* 1. Banner */}
      <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="text-2xl select-none">✍️</div>
        <div>
          <h3 className="font-bold text-sm">In your own words</h3>
          <p className="text-xs text-base-content/70 mt-1">
            Roommates with detailed bios get <strong>2x more matches</strong>.
          </p>
        </div>
      </div>

      {/* 2. Topics */}
      <div>
        <label className="label py-0 mb-2">
          <span className="label-text text-xs font-bold uppercase tracking-wider opacity-50">
            Topics to consider
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <div 
              key={i} 
              className="badge badge-lg badge-ghost border-base-300 gap-2 text-xs text-base-content/70"
            >
              <span>{topic.icon}</span> {topic.label}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bio Writing Area */}
      <div className="form-control w-full">
        <div className="relative">

          <textarea
            className={`textarea textarea-bordered w-full h-48 text-base leading-relaxed p-4 shadow-sm transition-all resize-none ${
              isLocked ? "bg-base-200 opacity-70 cursor-not-allowed" : "focus:shadow-md focus:border-primary"
            }`}
            placeholder="Tell us more about your roommate preferences..."
            value={tempBio}
            disabled={isLocked}
            onChange={(e) => {
              setTempBio(e.target.value);
              setIsEditing(true);
            }}
            maxLength={500}
          ></textarea>

          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 text-xs bg-base-100/80 px-2 py-1 rounded border border-base-200 text-base-content/50">
            {tempBio.length} chars
          </div>

          {/* ✔ Confirm + ✖ Cancel Buttons */}
          {isEditing && !isLocked && (
            <div className="absolute top-3 right-3 flex gap-2">

              {/* CHECK BUTTON */}
              <button
                className="btn btn-circle btn-xs btn-success text-white shadow"
                onClick={saveToDB}
                disabled={isSaving}
              >
                <Check size={14} />
              </button>

              {/* CANCEL BUTTON */}
              <button
                className="btn btn-circle btn-xs btn-ghost shadow text-base-content/60"
                onClick={cancelEdit}
              >
                <X size={14} />
              </button>
            </div>
          )}

        </div>

        {/* Helper Text */}
        <label className="label">
          <span className="label-text-alt text-error/80"></span>
          <span className="label-text-alt opacity-60 flex items-center gap-1">
            Visible to matches only
          </span>
        </label>
      </div>

    </div>
  );
}

export default Additional;
