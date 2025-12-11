import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Users,
  Cigarette,
  Dog,
  CheckCircle2,
  Check,
  PenLine,
  FileText
} from "lucide-react";

const Preferences = ({ dbUser, id }) => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleEdit = () => {
    navigate(`/user/${id}#preferences`);
  };

  const PreferenceBadge = ({ icon: Icon, label, value, color = "pink" }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-base-200/40 rounded-full border border-base-300">
      <Icon size={14} className="text-pink-500" strokeWidth={2.5} />
      <span className="text-xs font-bold text-base-content/50 uppercase tracking-wide">{label}:</span>
      <span className="text-sm font-bold text-base-content">{value}</span>
    </div>
  );

  const PreferenceText = ({ icon: Icon, label, value }) => (
    <div className="p-4 bg-base-200/40 rounded-lg border border-base-300">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-pink-500" strokeWidth={2.5} />
        <span className="text-xs font-bold text-base-content/50 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-base-content leading-relaxed pl-5">
        {value || <span className="text-base-content/30 italic">Not specified</span>}
      </p>
    </div>
  );

  if (isConfirmed) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 py-10">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl relative z-10 mb-6">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
        </div>

        <h3 className="text-2xl font-black text-base-content mb-2">Preferences Locked!</h3>
        <p className="text-base-content/60 text-center max-w-sm leading-relaxed mb-8">
          Your preferences have been saved. We'll use these to find your perfect match.
        </p>
        <button onClick={() => setIsConfirmed(false)} className="btn btn-sm btn-ghost text-base-content/40 hover:text-base-content">
          Undo confirmation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Your Preferences
          </h2>
          <p className="text-sm text-base-content/60 mt-1">Review your lifestyle preferences for matching.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-base-100 rounded-2xl p-1 shadow-sm border border-base-200">
        <div className="bg-base-200/30 rounded-[1.2rem] p-5">

          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">Lifestyle & Habits</h3>
              <p className="text-xs text-base-content/50">Your daily routine preferences</p>
            </div>
          </div>

          {/* Quick Facts - Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            <PreferenceBadge
              icon={Dog}
              label="Pets"
              value={
                dbUser?.preferences?.petFriendly !== undefined
                  ? (dbUser.preferences.petFriendly ? "Yes" : "No")
                  : (dbUser?.pets !== undefined ? (dbUser.pets ? "Yes" : "No") : "Not specified")
              }
            />
            <PreferenceBadge
              icon={Cigarette}
              label="Smoking"
              value={(dbUser?.preferences?.smoking !== undefined ? dbUser.preferences.smoking : dbUser?.smoking) ? "Yes" : "No"}
            />
            <PreferenceBadge
              icon={Sparkles}
              label="Night Owl"
              value={(dbUser?.preferences?.nightOwl !== undefined ? dbUser.preferences.nightOwl : dbUser?.nightOwl) ? "Yes" : "No"}
            />
          </div>

          {/* Detailed Preferences */}
          <div className="space-y-2">
            <PreferenceText
              icon={Users}
              label="Guest Policy"
              value={dbUser?.preferences?.guestFrequency || dbUser?.guestPolicy}
            />
          </div>
        </div>
      </div>

      {/* More About Roommate Section */}
      {dbUser?.preferences?.moreAboutMe && (
        <div className="bg-base-100 rounded-2xl p-1 shadow-sm border border-base-200">
          <div className="bg-base-200/30 rounded-[1.2rem] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white text-pink-500 flex items-center justify-center shadow-sm">
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold">More About Roommate</h3>
                <p className="text-xs text-base-content/50">Your additional preferences</p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-4">
              <p className="text-sm text-base-content leading-relaxed whitespace-pre-wrap">
                {dbUser.preferences.moreAboutMe}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleEdit}
          className="btn btn-ghost bg-base-100 border border-base-200 hover:border-base-300 hover:bg-base-200 text-base-content/70"
        >
          <PenLine className="w-4 h-4 mr-2" />
          Edit Preferences
        </button>

        <button
          onClick={handleConfirm}
          className="btn bg-teal-400 hover:bg-teal-500 border-0 text-gray-900 shadow-lg shadow-teal-300/30 hover:scale-[1.02] transition-transform font-extrabold"
        >
          <Check className="w-4 h-4 mr-2" strokeWidth={3} />
          Confirm & Continue
        </button>
      </div>

    </div>
  );
};

export default Preferences;
