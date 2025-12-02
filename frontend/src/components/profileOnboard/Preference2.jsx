function Preference2({ data, setData }) {
  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto w-full">

      {/* TITLE */}
      <div className="text-base-content/60 my-15 text-xl">
        Tell us about your roommate preference to match with the most suitable ones.
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* -------- LEFT COLUMN -------- */}

        {/* PET FRIENDLY */} 
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Pet Friendly</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={data.petFriendly}
              onChange={(e) => handleChange("petFriendly", e.target.checked)}
            />
          </div>
          <p className="text-base-content/60 mt-1 text-sm">
            Are you okay living in a home with pets?
          </p>
        </div>

        {/* SMOKING */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Smoking</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={data.smoking}
              onChange={(e) => handleChange("smoking", e.target.checked)}
            />
          </div>
          <p className="text-base-content/60 mt-1 text-sm">
            Do you smoke or prefer a smoke-free home?
          </p>
        </div>

        {/* -------- RIGHT COLUMN -------- */}

        {/* GUEST FREQUENCY (TEXT INPUT) */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <span className="text-lg font-semibold block mb-2">
            Guest Frequency
          </span>

          <input
            type="text"
            placeholder="Describe how often you host guests"
            className="input input-bordered w-full rounded-xl"
            value={data.guestFrequency}
            onChange={(e) => handleChange("guestFrequency", e.target.value)}
          />

          <p className="text-base-content/60 mt-1 text-sm">
            Example: "I occasionally have friends over on weekends"
          </p>
        </div>

        {/* NIGHT OWL */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Night Owl</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={data.isNightOwl}
              onChange={(e) => handleChange("isNightOwl", e.target.checked)}
            />
          </div>
          <p className="text-base-content/60 mt-1 text-sm">
            Do you usually stay up late at night?
          </p>
        </div>

      </div>
    </div>
  );
}

export default Preference2;
