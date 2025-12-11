import { Moon, PawPrint, Cigarette, Users } from "lucide-react";
import { useState, useEffect } from "react";

function LifeStyle({ dbUser, userId, setDbUser, isEditMode = true }) {

  const [lifestyle, setLifestyle] = useState({
    petFriendly: dbUser?.lifestyle?.petFriendly ?? false,
    smoking: dbUser?.lifestyle?.smoking ?? false,
    nightOwl: dbUser?.lifestyle?.nightOwl ?? false,
    guestFrequency: dbUser?.lifestyle?.guestFrequency ?? ""
  });

  useEffect(() => {
    if (dbUser?.lifestyle) {
      const newLifestyle = {
        petFriendly: dbUser.lifestyle.petFriendly ?? false,
        smoking: dbUser.lifestyle.smoking ?? false,
        nightOwl: dbUser.lifestyle.nightOwl ?? false,
        guestFrequency: dbUser.lifestyle.guestFrequency ?? ""
      };
      setLifestyle(newLifestyle);
    }
  }, [dbUser]);

  // Update parent state without saving to DB
  const updateParentState = (updatedLifestyle) => {
    const updatedUser = {
      ...dbUser,
      lifestyle: updatedLifestyle,
    };
    setDbUser(updatedUser);
  };

  const handleChange = (field, value) => {
    const updated = { ...lifestyle, [field]: value };
    setLifestyle(updated);
    updateParentState(updated);
  };

  const ToggleCard = ({ title, desc, icon, field, checked }) => (
    <div
      className={`card bg-base-100 shadow-sm border transition-all duration-200 ${checked ? "border-primary ring-1 ring-primary" : "border-base-200"
        }`}
    >
      <div className="card-body p-3 md:p-4">
        <div className="flex items-start justify-between mb-1 md:mb-2">
          <div className={`p-1.5 md:p-2 rounded-lg ${checked ? "bg-primary/10 text-primary" : "bg-base-200 text-base-content/70"
            }`}>
            {icon}
          </div>

          <input
            type="checkbox"
            className="toggle toggle-primary toggle-xs md:toggle-sm"
            checked={checked}
            onChange={(e) => handleChange(field, e.target.checked)}
            disabled={!isEditMode}
          />
        </div>

        <h3 className="font-bold text-sm md:text-base">{title}</h3>
        <p className="text-xs md:text-sm text-base-content/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <ToggleCard
          title="Pet Friendly"
          desc="Are you okay with pets?"
          field="petFriendly"
          checked={lifestyle.petFriendly}
          icon={<PawPrint className="w-6 h-6" />}
        />

        <ToggleCard
          title="Smoking"
          desc="Do you smoke at all?"
          field="smoking"
          checked={lifestyle.smoking}
          icon={<Cigarette className="w-6 h-6" />}
        />

        <ToggleCard
          title="Night Owl"
          desc="Do you stay up late regularly?"
          field="nightOwl"
          checked={lifestyle.nightOwl}
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
                  value={lifestyle.guestFrequency || ""}
                  onChange={(e) => handleChange("guestFrequency", e.target.value)}
                  placeholder="e.g. I host dinner parties once a month..."
                />
              ) : (
                <span className="text-sm font-medium text-base-content truncate">
                  {lifestyle.guestFrequency || (
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

export default LifeStyle;
