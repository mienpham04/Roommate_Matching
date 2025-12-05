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

  const saveToDB = async (updatedPreferences) => {
    // Merge with existing preferences to avoid overwriting other preference fields
    const mergedPreferences = {
      ...dbUser?.preferences,
      ...updatedPreferences,
    };

    const updatedUser = {
      ...dbUser,
      preferences: mergedPreferences,
    };

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setDbUser(updatedUser);
      } else {
        console.error("Failed saving preferences:", await res.text());
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  };

  const handleChange = (field, value) => {
    // if user clears input
    if (value === "") {
      const updated = { ...data, [field]: "" };
      setData(updated);
      saveToDB(updated);
      return;
    }

    const numeric = Number(value);
    if (isNaN(numeric)) return;

    const updated = { ...data, [field]: numeric };
    setData(updated);
    saveToDB(updated);
  };

  const isAnyAge = data.minAge === 15 && data.maxAge === 99;

  const handleAnyAgeToggle = (checked) => {
    const updated = checked
      ? { ...data, minAge: 15, maxAge: 99 }
      : { ...data, minAge: 20, maxAge: 30 };

    setData(updated);
    saveToDB(updated);
  };

  const GenderOption = ({ label, value, icon }) => {
    const isSelected = data.gender === value;

    const updated = { ...data, gender: value };

    return (
      <button
        onClick={() => {
          if (isEditMode) {
            setData(updated);
            saveToDB(updated);
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

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Roommate Preferences</h2>
        <p className="text-base-content/60 max-w-lg mx-auto">
          Set your boundaries. We'll only show you matches that fit within these criteria.
        </p>
      </div>


      <div className="grid grid-cols-1 gap-8">
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-visible">
          <div className="card-body p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base-200 rounded-lg text-base-content/70">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Age Range</h3>
                  <p className="text-xs text-base-content/50">
                    Ideal age of your roommate
                  </p>
                </div>
              </div>

              <label className="cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                <span className="label-text font-medium">It does not matter</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={isAnyAge}
                  onChange={(e) => handleAnyAgeToggle(e.target.checked)}
                  disabled={!isEditMode}
                />
              </label>
            </div>
            <div className={`flex flex-col md:flex-row items-center gap-4 bg-base-200/30 p-6 rounded-xl border border-base-200/50 transition-opacity duration-300
              ${isAnyAge || !isEditMode ? "opacity-50 pointer-events-none grayscale" : "opacity-100"}
            `}>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Min Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge || !isEditMode}
                  min="18"
                  className="input input-lg input-bordered w-full font-bold text-center text-xl focus:input-primary"
                  value={data.minAge}
                  onChange={(e) => handleChange("minAge", e.target.value)}
                />
              </div>

              <div className="hidden md:flex flex-col items-center justify-center pt-8 text-base-content/30">
                <ArrowRight size={24} />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Max Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge || !isEditMode}
                  min={data.minAge || 18}
                  className="input input-lg input-bordered w-full font-bold text-center text-xl focus:input-primary"
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
