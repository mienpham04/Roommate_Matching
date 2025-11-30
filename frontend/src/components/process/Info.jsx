import React from "react";

const Info = () => {
  return (
    <div className="col-span-2 card bg-base-100 border shadow-sm">
      <div className="card-body space-y-4">
        <h2 className="card-title text-xl">Basic Info</h2>

        <input
          className="input input-bordered w-full"
          placeholder="Your Name"
        />
        <input className="input input-bordered w-full" placeholder="Email" />
      </div>
    </div>
  );
};

export default Info;
