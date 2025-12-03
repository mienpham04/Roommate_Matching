import React from "react";

function Preference1({ data, setData }) {
  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto w-full">

      {/* TITLE */}
      <div className="text-base-content/60 my-15 text-xl">
        Tell us about your roommate preference to match with the most suitable ones.
      </div>

      {/* GRID LAYOUT — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* ===== MIN AGE ===== */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <label className="text-lg font-semibold">Minimum Age</label>
          <input
            type="number"
            min="18"
            className="input input-bordered w-full mt-3 rounded-xl"
            value={data.minAge}
            onChange={(e) => handleChange("minAge", Number(e.target.value))}
          />
          <p className="text-base-content/60 mt-1 text-sm">
            The youngest age you're comfortable living with.
          </p>
        </div>

        {/* ===== MAX AGE ===== */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">
          <label className="text-lg font-semibold">Maximum Age</label>
          <input
            type="number"
            min={data.minAge}
            className="input input-bordered w-full mt-3 rounded-xl"
            value={data.maxAge}
            onChange={(e) => handleChange("maxAge", Number(e.target.value))}
          />
          <p className="text-base-content/60 mt-1 text-sm">
            The oldest age you're comfortable living with.
          </p>
        </div>

        {/* ===== GENDER PREFERENCE ===== */}
        <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200 md:col-span-2">
          <label className="text-lg font-semibold">Gender Preference</label>
          <select
            className="select select-bordered w-full mt-3 rounded-xl"
            value={data.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="no preference">No Preference</option>
            <option value="female">Prefer Female</option>
            <option value="male">Prefer Male</option>
            <option value="non-binary">Non-binary</option>
          </select>

          <p className="text-base-content/60 mt-1 text-sm">
            Select if you prefer a roommate with a specific gender identity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Preference1;
