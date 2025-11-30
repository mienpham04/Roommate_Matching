import React from 'react'

const Preference = () => {
  return (
        <div className="col-span-2 card bg-base-100 border shadow-sm">
          <div className="card-body space-y-4">
            <h2 className="card-title text-xl">Preferences</h2>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="checkbox" />
              Night Owl
            </label>
          </div>
        </div>
      );
}

export default Preference
