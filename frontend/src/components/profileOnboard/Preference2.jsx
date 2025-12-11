import { Moon, PawPrint, Cigarette, Users } from "lucide-react";
import { useState, useEffect } from "react";

function Preference2({ dbUser, userId, setDbUser, isEditMode = true }) {
  const [pref, setPref] = useState({
    petFriendly: dbUser?.preferences?.petFriendly ?? false,
    smoking: dbUser?.preferences?.smoking ?? false,
    nightOwl: dbUser?.preferences?.nightOwl ?? false,
    guestFrequency: dbUser?.preferences?.guestFrequency ?? ""
  });

  // Update local state when dbUser changes (e.g., after page refresh)
  useEffect(() => {
    if (dbUser?.preferences) {
      const newPref = {
        petFriendly: dbUser.preferences.petFriendly ?? false,
        smoking: dbUser.preferences.smoking ?? false,
        nightOwl: dbUser.preferences.nightOwl ?? false,
        guestFrequency: dbUser.preferences.guestFrequency ?? ""
      };
      setPref(newPref);
    }
  }, [dbUser]);

  // Update parent state without saving to DB
  const updateParentState = (updatedPreferences) => {
    const mergedPreferences = {
      ...dbUser?.preferences,
      ...updatedPreferences,
    };

    const updatedUser = {
      ...dbUser,
      preferences: mergedPreferences,
    };

    setDbUser(updatedUser);
  };

  const handleChange = (field, value) => {
    const updated = { ...pref, [field]: value };
    setPref(updated);
    updateParentState(updated);
  };

  const ToggleCard = ({ title, desc, icon, field, checked }) => (
    <div
      className={`card bg-base-100 shadow-sm border transition-all duration-200 ${
        checked ? "border-primary ring-1 ring-primary" : "border-base-200"
      }`}
    >
      <div className="card-body p-5">
        <div className="flex items-start justify-between mb-2">
          <div
            className={`p-2 rounded-lg ${
              checked ? "bg-primary/10 text-primary" : "bg-base-200 text-base-content/70"
            }`}
          >
            {icon}
          </div>

          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={checked}
            onChange={(e) => handleChange(field, e.target.checked)}
            disabled={!isEditMode}
          />
        </div>

        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-base-content/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full px-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ToggleCard
          title="Pet Friendly"
          desc="Comfortable living with pets?"
          field="petFriendly"
          checked={pref.petFriendly}
          icon={<PawPrint className="w-6 h-6" />}
        />

        <ToggleCard
          title="Smoking"
          desc="Comfortable with smoking in the household?"
          field="smoking"
          checked={pref.smoking}
          icon={<Cigarette className="w-6 h-6" />}
        />

        <ToggleCard
          title="Night Owl"
          desc="Do you stay up late regularly?"
          field="nightOwl"
          checked={pref.nightOwl}
          icon={<Moon className="w-6 h-6" />}
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6 flex flex-col md:flex-row gap-6">

          <div className="shrink-0 flex md:flex-col items-center md:items-start gap-3 md:w-1/4">
            <div className="p-2 bg-base-200 rounded-lg text-base-content/70">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Guest Frequency</h3>
              <p className="text-xs text-base-content/50 hidden md:block mt-1">
                Help us understand your social habits at home.
              </p>
            </div>
          </div>

          <div className="grow">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 min-h-11
              ${isEditMode ? "border-primary/30 bg-base-100" : "border-base-300 bg-base-200/30"}
            `}>
              {isEditMode ? (
                <input
                  type="text"
                  className="grow bg-transparent outline-none text-sm text-base-content"
                  value={pref.guestFrequency || ""}
                  onChange={(e) => handleChange("guestFrequency", e.target.value)}
                  placeholder="e.g. I host dinner parties once a month..."
                />
              ) : (
                <span className="text-sm font-medium text-base-content truncate">
                  {pref.guestFrequency || (
                    <span className="text-base-content/30 italic">Not set</span>
                  )}
                </span>
              )}
            </div>

            <div className="label">
              <span className="label-text-alt text-base-content/50">
                Be honest! It helps avoid conflicts later.
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Preference2;
