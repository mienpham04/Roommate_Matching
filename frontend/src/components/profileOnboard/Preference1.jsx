import { useState, useEffect } from "react";
import { Users, User, ArrowRight, Mars, Venus, CircleDashed } from "lucide-react";

function Preference1({ dbUser, userId, setDbUser, isEditMode = true }) {
  const [data, setData] = useState({
    minAge: dbUser?.preferences?.minAge ?? "15",
    maxAge: dbUser?.preferences?.maxAge ?? "99",
    gender: dbUser?.preferences?.gender ?? "no preference",
  });

  // Update local state when dbUser changes (e.g., after page refresh)
  useEffect(() => {
    if (dbUser?.preferences) {
      setData({
        minAge: dbUser.preferences.minAge ?? "15",
        maxAge: dbUser.preferences.maxAge ?? "99",
        gender: dbUser.preferences.gender ?? "no preference",
      });
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
    // if user clears input
    if (value === "") {
      const updated = { ...data, [field]: "" };
      setData(updated);
      updateParentState(updated);
      return;
    }

    const numeric = Number(value);
    if (isNaN(numeric)) return;

    const updated = { ...data, [field]: numeric };
    setData(updated);
    updateParentState(updated);
  };

  const isAnyAge = data.minAge === 15 && data.maxAge === 99;

  const handleAnyAgeToggle = (checked) => {
    const updated = checked
      ? { ...data, minAge: 15, maxAge: 99 }
      : { ...data, minAge: 20, maxAge: 30 };

    setData(updated);
    updateParentState(updated);
  };

  const GenderOption = ({ label, value, icon }) => {
    const isSelected = data.gender === value;

    const updated = { ...data, gender: value };

    return (
      <button
        onClick={() => {
          if (isEditMode) {
            setData(updated);
            updateParentState(updated);
          }
        }}
        disabled={!isEditMode}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 w-full
          ${isSelected
            ? "border-primary bg-primary/5 text-primary"
            : "border-base-200 bg-base-100 hover:border-primary/50 hover:bg-base-200/50"
          }
          ${!isEditMode ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <div className={`mb-3 ${isSelected ? "text-primary" : "text-base-content/50"}`}>
          {icon}
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-visible">
          <div className="card-body p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base-200 rounded-lg text-base-content/70">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Age Range</h3>
                  <p className="text-sm text-base-content/60">
                    Ideal age of your roommate
                  </p>
                </div>
              </div>

              <label className="cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                <span className="label-text text-sm font-medium">It does not matter</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={isAnyAge}
                  onChange={(e) => handleAnyAgeToggle(e.target.checked)}
                  disabled={!isEditMode}
                />
              </label>
            </div>
            <div className={`flex flex-col md:flex-row items-center gap-4 bg-base-200/30 p-4 rounded-xl border border-base-200/50 transition-opacity duration-300
              ${isAnyAge || !isEditMode ? "opacity-50 pointer-events-none grayscale" : "opacity-100"}
            `}>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Min Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge || !isEditMode}
                  min="18"
                  className="input input-bordered w-full font-bold text-center text-xl focus:input-primary"
                  value={data.minAge}
                  onChange={(e) => handleChange("minAge", e.target.value)}
                />
              </div>

              <div className="hidden md:flex flex-col items-center justify-center pt-6 text-base-content/30">
                <ArrowRight size={20} />
              </div>
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Max Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge || !isEditMode}
                  min={data.minAge || 18}
                  className="input input-bordered w-full font-bold text-center text-xl focus:input-primary"
                  value={data.maxAge}
                  onChange={(e) => handleChange("maxAge", e.target.value)}
                />
              </div>
            </div>

            <p className="text-center text-xs text-base-content/40 mt-3">
              {isAnyAge
                ? "You are open to roommates of any age."
                : `Matches between ${data.minAge || "?"} and ${data.maxAge || "?"} years old.`
              }
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">

            <div className="mb-6">
              <h3 className="font-bold text-lg">Gender Preference</h3>
              <p className="text-sm text-base-content/60">
                Who are you most comfortable living with?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GenderOption
                label="No Preference"
                value="no preference"
                icon={<Users size={28} />}
              />
              <GenderOption
                label="Female"
                value="female"
                icon={<Venus size={30} />}
              />
              <GenderOption
                label="Male"
                value="male"
                icon={<Mars size={30} />}
              />
              <GenderOption
                label="Non-binary"
                value="non-binary"
                icon={<CircleDashed size={30} />}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Preference1;
