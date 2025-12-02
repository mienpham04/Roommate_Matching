import React from "react";

function MoreDetails({ data, setData }) {
  const handleChange = (value) => {
    setData((prev) => ({ ...prev, moreDetails: value }));
  };

  return (
    <div className="max-w-3xl mx-auto w-full">

      {/* TITLE */}
      <div className="text-base-content/60 my-15 text-xl">
        More Details
      </div>

      {/* FULL-WIDTH CARD WITH TEXTAREA */}
      <div className="card bg-base-100 shadow-md p-6 rounded-2xl border border-base-200">

        <textarea
          rows={6}
          placeholder="Write anything you'd like your future roommate to know..."
          className="textarea textarea-bordered w-full mt-4 rounded-xl"
          value={data.moreDetails || ""}
          onChange={(e) => handleChange(e.target.value)}
        />

        <p className="text-base-content/60 mt-2 text-sm">
          Add any additional details that help describe your lifestyle or expectations.
        </p>
      </div>
    </div>
  );
}

export default MoreDetails;
