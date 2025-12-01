import React, { useState } from "react";

export default function Preference() {
  // PAGE STATE
  const [page, setPage] = useState(1);

  // ---------- STATES (match MongoDB schema) ----------
  const [petFriendly, setPetFriendly] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [guestFrequency, setGuestFrequency] = useState("");

    // Page 2
  const [isNightOwl, setIsNightOwl] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [gender, setGender] = useState("no preference");

  // ---------- SUBMIT ----------
  const handleSave = () => {
    const payload = {
      petFriendly,
      smoking,
      guestFrequency,
      isNightOwl,
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      gender,
    };

    console.log("Saving:", payload);
  };

  return (
    <div className="col-span-2 flex justify-center items-center">
      <div className="card bg-base-100 border shadow-sm w-full max-w-xl">
      <div className="card-body">

        {/* -------- HEADER -------- */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`btn btn-circle btn-outline ${page === 1 && "opacity-20 cursor-not-allowed"}`}
          >
            ❮
          </button>

          <h2 className="text-2xl font-bold">
            Preferences – Page {page} of 2
          </h2>

          <button
            onClick={() => setPage((p) => Math.min(2, p + 1))}
            disabled={page === 2}
            className={`btn btn-circle btn-outline ${page === 2 && "opacity-20 cursor-not-allowed"}`}
          >
            ❯
          </button>
        </div>

        {/* -------------------------------------------- */}
        {/* ---------------- PAGE 1 -------------------- */}
        {/* -------------------------------------------- */}
        {page === 1 && (
          <div className="space-y-10 animate-fade-in">

            {/* PET FRIENDLY */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Pet Friendly</h3>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                />
                I am comfortable living with pets
              </label>
            </div>

            {/* SMOKING */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Smoking</h3>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={smoking}
                  onChange={(e) => setSmoking(e.target.checked)}
                />
                I’m okay with smoking in the home / outside
              </label>
            </div>

            {/* GUEST FREQUENCY */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Guest Frequency</h3>
              <input
                type="text"
                placeholder="Describe your guest preference..."
                className="input input-bordered w-full"
                value={guestFrequency}
                onChange={(e) => setGuestFrequency(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* -------------------------------------------- */}
        {/* ---------------- PAGE 2 -------------------- */}
        {/* -------------------------------------------- */}
        {page === 2 && (
          <div className="space-y-10 animate-fade-in">

            {/* NIGHT OWL */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Sleep Schedule</h3>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-secondary"
                  checked={isNightOwl}
                  onChange={(e) => setIsNightOwl(e.target.checked)}
                />
                I am a night owl
              </label>
            </div>

            {/* AGE RANGE */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Preferred Age Range</h3>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  min={18}
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="input input-bordered w-full"
                />

                <input
                  type="number"
                  placeholder="Max"
                  min={18}
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* GENDER */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Gender Preference</h3>
              <select
                className="select select-bordered w-full"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="no preference">No preference</option>
                <option value="female">Female only</option>
                <option value="male">Male only</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
          </div>
        )}

        {/* -------- SAVE BUTTON (only on page 2) -------- */}
        {page === 2 && (
          <div className="pt-10">
            <button onClick={handleSave} className="btn btn-primary w-full">
              Save Preferences
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
