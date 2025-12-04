import React from "react";
import { Users, User, ArrowRight } from "lucide-react";

const MarsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="m21 3-6.75 6.75"/><circle cx="10" cy="14" r="6"/></svg>
);
const VenusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6"/></svg>
);
const GenderlessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
);

function Preference1({ data, setData }) {
  
  // LOGIC: Check if current data represents "Any Age" (18 - 99)
  const isAnyAge = data.minAge === 18 && data.maxAge >= 99;

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // HANDLER: Toggles the "Does not matter" checkbox
  const handleAnyAgeToggle = (checked) => {
    if (checked) {
      // Set to widest range
      setData((prev) => ({ ...prev, minAge: 18, maxAge: 99 }));
    } else {
      // Restore a "typical" range so they can edit
      setData((prev) => ({ ...prev, minAge: 20, maxAge: 30 }));
    }
  };

  const GenderOption = ({ label, value, icon }) => {
    const isSelected = data.gender === value;
    return (
      <button
        onClick={() => handleChange("gender", value)}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 w-full
          ${isSelected 
            ? "border-primary bg-primary/5 text-primary" 
            : "border-base-200 bg-base-100 hover:border-primary/50 hover:bg-base-200/50"
          }
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

        {/* SECTION 1: AGE RANGE */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-visible">
          <div className="card-body p-6">
            
            {/* Header with Checkbox */}
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

              {/* NEW: DOES NOT MATTER CHECKBOX */}
              <label className="cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                <span className="label-text font-medium">It does not matter</span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary"
                  checked={isAnyAge}
                  onChange={(e) => handleAnyAgeToggle(e.target.checked)}
                />
              </label>
            </div>

            {/* Age Inputs Wrapper */}
            <div className={`flex flex-col md:flex-row items-center gap-4 bg-base-200/30 p-6 rounded-xl border border-base-200/50 transition-opacity duration-300 
              ${isAnyAge ? "opacity-50 pointer-events-none grayscale" : "opacity-100"}
            `}>
              
              {/* Min Age */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Min Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge} // Disabled if "Any" is checked
                  min="18"
                  max={data.maxAge}
                  className="input input-lg input-bordered w-full font-bold text-center text-xl focus:input-primary"
                  value={data.minAge}
                  onChange={(e) => handleChange("minAge", Number(e.target.value))}
                />
              </div>

              <div className="hidden md:flex flex-col items-center justify-center pt-8 text-base-content/30">
                <ArrowRight size={24} />
              </div>

              {/* Max Age */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs uppercase font-bold text-base-content/50">Max Age</span>
                </label>
                <input
                  type="number"
                  disabled={isAnyAge} // Disabled if "Any" is checked
                  min={data.minAge}
                  className="input input-lg input-bordered w-full font-bold text-center text-xl focus:input-primary"
                  value={data.maxAge}
                  onChange={(e) => handleChange("maxAge", Number(e.target.value))}
                />
              </div>
            </div>
            
            <p className="text-center text-xs text-base-content/40 mt-3">
               {isAnyAge 
                 ? "You are open to roommates of any age." 
                 : `Matches between ${data.minAge} and ${data.maxAge} years old.`
               }
            </p>
          </div>
        </div>

        {/* SECTION 2: GENDER PREFERENCE */}
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
                icon={<VenusIcon />} 
              />
              <GenderOption 
                label="Male" 
                value="male" 
                icon={<MarsIcon />} 
              />
              <GenderOption 
                label="Non-binary" 
                value="non-binary" 
                icon={<GenderlessIcon />} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Preference1;