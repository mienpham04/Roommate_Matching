import Navbar from "../components/Navbar";
import { useState } from "react";
import { Camera, X } from "lucide-react";

function ProfilePage() {
  const [photo, setPhoto] = useState("/profile.png");
  const [showRemove, setShowRemove] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(url);
      setShowRemove(true);
    }
  };

  return (
    <div className="h-screen w-full bg-linear-to-br from-base-100 via-base-200 to-base-300 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 py-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-black text-3xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wider">
              Personal Information
            </h1>

            <button className="px-5 py-2.5 bg-linear-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-md hover:scale-105 transition">
              Save
            </button>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* LEFT SIDEBAR */}
            <div className="bg-base-100 rounded-xl p-4 shadow-md border flex flex-col">
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Account Management
              </h2>

              {/* PROFILE PHOTO */}
              <div className="flex flex-col items-center mt-2">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-md bg-base-200 flex items-center justify-center">
                    <img
                      src={photo}
                      alt="User profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {showRemove && (
                    <button
                      className="absolute -top-2 -right-2 bg-white shadow rounded-full p-1"
                      onClick={() => {
                        setPhoto("/profile.png");
                        setShowRemove(false);
                      }}
                    >
                      <X className="size-4 text-gray-600" />
                    </button>
                  )}
                </div>

                <label className="mt-4 cursor-pointer w-full">
                  <div className="w-full py-2 border rounded-lg text-center bg-base-200 hover:bg-base-300 transition font-medium">
                    Upload Photo
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="col-span-2 bg-base-100 rounded-xl p-5 shadow-md border overflow-y-auto">
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Profile Information
              </h2>
              {/* <label className="form-control w-full">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                        Name
                      </span>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue="Shaan Ahuja"
                      />
                    </label> */}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Full name
                  </span>
                  <input
                    className="input input-bordered w-full"
                    placeholder="First Name"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Nickname
                  </span>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Nickname displayed"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Birthday
                  </span>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    placeholder="Birthdate"
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Gender
                  </span>
                  <select className="select select-bordered w-full" required>
                    <option value="" disabled selected>
                      Select Gender
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Contact Info
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Email
                  </span>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="Email"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Social Media
                  </span>
                  <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder="Social Media"
                  />
                </label>
              </div>

              <h2 className="text-lg text-base-content/70 font-semibold mb-2">
                Biographical Info
              </h2>

              <textarea
                className="textarea textarea-bordered w-full h-28"
                placeholder="Write something..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
