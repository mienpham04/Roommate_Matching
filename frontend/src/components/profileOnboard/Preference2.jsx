import { Moon, PawPrint, Cigarette, Users, Pencil, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

function Preference2({ dbUser, userId, setDbUser, isEditMode = true }) {
  const [pref, setPref] = useState({
    petFriendly: dbUser?.preferences?.petFriendly ?? false,
    smoking: dbUser?.preferences?.smoking ?? false,
    nightOwl: dbUser?.preferences?.nightOwl ?? false,
    guestFrequency: dbUser?.preferences?.guestFrequency ?? ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempGuest, setTempGuest] = useState(pref.guestFrequency);

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
      setTempGuest(newPref.guestFrequency);
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

    const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (res.ok) setDbUser(updatedUser);
  };

  const handleToggle = (field, value) => {
    const updated = { ...pref, [field]: value };
    setPref(updated);      
    saveToDB(updated);    
  };

  const saveGuest = () => {
    const updated = { ...pref, guestFrequency: tempGuest };
    setPref(updated);
    saveToDB(updated);
    setIsEditing(false);
  };

  const cancelGuest = () => {
    setTempGuest(pref.guestFrequency);
    setIsEditing(false);
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
            onChange={(e) => handleToggle(field, e.target.checked)}
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

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Roommate Preferences</h2>
        <p className="text-base-content/60 max-w-lg mx-auto">
          Tell us about your preferences to get matched with the best roommate.
        </p>
      </div>

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
          desc="Do you smoke or accept smoking?"
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

            {!isEditing ? (
              <>
                <div className="flex items-center justify-between bg-base-200/30 border border-base-300 rounded-lg px-3 py-2 min-h-11">
                  <span className="text-sm font-medium text-base-content truncate">
                    {pref.guestFrequency || (
                      <span className="text-base-content/30 italic">Not set</span>
                    )}
                  </span>

                  {isEditMode && (
                    <button
                      className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    Be honest! It helps avoid conflicts later.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-base-100 border border-primary rounded-lg px-3 py-2 ring-1 ring-primary/20 min-h-11">

                  <input
                    type="text"
                    className="grow bg-transparent outline-none text-sm text-base-content"
                    value={tempGuest}
                    onChange={(e) => setTempGuest(e.target.value)}
                    autoFocus
                    placeholder="e.g. I host dinner parties once a month..."
                  />

                  <button className="btn btn-circle btn-xs btn-success text-white" onClick={saveGuest}>
                    <Check size={12} />
                  </button>

                  <button className="btn btn-circle btn-xs btn-ghost text-base-content/60" onClick={cancelGuest}>
                    <X size={12} />
                  </button>
                </div>

                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    Be honest! It helps avoid conflicts later.
                  </span>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}

export default Preference2;
