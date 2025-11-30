import React, { useState } from "react";

const Preference = () => {
  const [cleanliness, setCleanliness] = useState(50);
  const [cleanlinessDisabled, setCleanlinessDisabled] = useState(true);

  const [clutter, setClutter] = useState(50);
  const [clutterDisabled, setClutterDisabled] = useState(true);

  const [noise, setNoise] = useState(50);
  const [noiseDisabled, setNoiseDisabled] = useState(true);

  const [wfh, setWfh] = useState(50);
  const [wfhDisabled, setWfhDisabled] = useState(true);

  return (
    <div className="col-span-2 card bg-base-100 border shadow-sm">
      <div className="card-body space-y-6">

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* DAILY ROUTINE */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Daily Routine</h3>

              <label className="form-control">
                <span className="label-text">Wake-up Time</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>Before 6 AM</option>
                  <option>6–8 AM</option>
                  <option>8–10 AM</option>
                  <option>10 AM or later</option>
                </select>
              </label>

              <label className="form-control">
                <span className="label-text">Bedtime</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>Before 10 PM</option>
                  <option>10 PM – Midnight</option>
                  <option>Midnight – 2 AM</option>
                  <option>After 2 AM</option>
                </select>
              </label>
            </div>

            {/* CLEANLINESS */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Cleanliness</h3>

              {/* CLEANLINESS LEVEL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="label-text">Cleanliness Level</span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">
                      {cleanlinessDisabled
                        ? "Doesn't matter"
                        : `${cleanliness}%`}
                    </span>

                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={cleanlinessDisabled}
                      onChange={(e) =>
                        setCleanlinessDisabled(e.target.checked)
                      }
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={cleanlinessDisabled}
                  value={cleanliness}
                  onChange={(e) => setCleanliness(Number(e.target.value))}
                  className={`range range-secondary w-full ${
                    cleanlinessDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {/* CLUTTER TOLERANCE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="label-text">Clutter Tolerance</span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">
                      {clutterDisabled ? "Doesn't matter" : `${clutter}%`}
                    </span>

                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={clutterDisabled}
                      onChange={(e) =>
                        setClutterDisabled(e.target.checked)
                      }
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={clutterDisabled}
                  value={clutter}
                  onChange={(e) => setClutter(Number(e.target.value))}
                  className={`range range-accent w-full ${
                    clutterDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>
            </div>

            {/* KITCHEN */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kitchen & Food</h3>

              <label className="form-control">
                <span className="label-text">How often do you cook?</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>Rarely</option>
                  <option>A few times a week</option>
                  <option>Daily</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" className="checkbox" />
                Comfortable with strong-smelling foods
              </label>
            </div>

            {/* NOISE */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Noise & Home Environment</h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="label-text">Noise Tolerance</span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">
                      {noiseDisabled ? "Doesn't matter" : `${noise}%`}
                    </span>

                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={noiseDisabled}
                      onChange={(e) =>
                        setNoiseDisabled(e.target.checked)
                      }
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={noiseDisabled}
                  value={noise}
                  onChange={(e) => setNoise(Number(e.target.value))}
                  className={`range range-primary w-full ${
                    noiseDisabled ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <label className="form-control">
                <span className="label-text">Preferred Home Vibe</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>Quiet</option>
                  <option>Moderately Social</option>
                  <option>Very Social & Lively</option>
                </select>
              </label>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">

            {/* WORK / STUDY FROM HOME */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Work / Study From Home</h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="label-text">Days per week</span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">
                      {wfhDisabled ? "Doesn't matter" : `${wfh}%`}
                    </span>

                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={wfhDisabled}
                      onChange={(e) =>
                        setWfhDisabled(e.target.checked)
                      }
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={wfhDisabled}
                  value={wfh}
                  onChange={(e) => setWfh(Number(e.target.value))}
                  className={`range range-info w-full ${
                    wfhDisabled ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* GUEST POLICY */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Guests</h3>

              <label className="form-control">
                <span className="label-text">Guest Frequency</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>Never</option>
                  <option>Occasionally</option>
                  <option>Weekly</option>
                  <option>Frequent / Unlimited</option>
                </select>
              </label>
            </div>

            {/* PETS */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pets</h3>

              <label className="flex items-center gap-3">
                <input type="checkbox" className="checkbox" />
                I own pets
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" className="checkbox" />
                Comfortable living with pets
              </label>
            </div>

            {/* SOCIAL STYLE */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Social Lifestyle</h3>

              <label className="form-control">
                <span className="label-text">Preferred Roommate Dynamic</span>
                <select className="select select-bordered w-full mt-1">
                  <option>It doesn't matter</option>
                  <option>A close friend</option>
                  <option>Friendly but independent</option>
                  <option>Mostly private</option>
                </select>
              </label>
            </div>

            {/* SMOKING / DRINKING */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Smoking & Drinking</h3>

              <label className="flex items-center gap-3">
                <input type="checkbox" className="checkbox" />
                Okay with alcohol in the home
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" className="checkbox" />
                Okay with smoking outside
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Preference;
