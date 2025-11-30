import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";

function ProfilePage() {
  const { id } = useParams(); // /view/:id
  const [dbUser, setDbUser] = useState(null);

  const [customPhoto, setCustomPhoto] = useState(null);

  // Fetch user from DB
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setDbUser(data);
      } catch (err) {
        console.error("Failed to fetch DB user:", err);
      }
    };
    fetchUser();
  }, [id]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhoto(url);
    }
  };

  const handleRemove = () => setCustomPhoto(null);

  if (!dbUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      <Navbar />

      <div className="flex-1 overflow-y-auto">

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
          <div className="grid grid-cols-3 gap-6 pb-10">
            
            {/* LEFT SIDEBAR */}
            <div className="bg-base-100 rounded-xl p-4 shadow-md border flex flex-col">
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Account Management
              </h2>

              <div className="flex flex-col items-center mt-2">
                <div className="relative w-32 h-32">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-md bg-base-200 flex items-center justify-center">
                    {customPhoto ? (
                      <img
                        src={customPhoto}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={dbUser.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {customPhoto && (
                    <button
                      className="absolute -top-2 -right-2 bg-white shadow rounded-full p-1"
                      onClick={handleRemove}
                    >
                      <X className="size-4 text-gray-600" />
                    </button>
                  )}
                </div>

                {/* UPLOAD */}
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
            <div className="col-span-2 bg-base-100 rounded-xl p-5 shadow-md border">

              {/* PROFILE INFO */}
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Profile Information
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">

                {/* First Name */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    First Name
                  </span>
                  <input
                    className="input input-bordered w-full"
                    defaultValue={dbUser.firstName}
                  />
                </label>

                {/* Last Name */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Last Name
                  </span>
                  <input
                    className="input input-bordered w-full"
                    defaultValue={dbUser.lastName}
                  />
                </label>

                {/* DOB */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Birthday
                  </span>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    defaultValue={dbUser.dateOfBirth}
                  />
                </label>

                {/* Gender */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Gender
                  </span>
                  <select
                    className="select select-bordered w-full"
                    defaultValue={dbUser.gender}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              {/* CONTACT INFO */}
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Contact Info
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Email */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Email
                  </span>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    defaultValue={dbUser.email}
                  />
                </label>

                {/* ZIP CODE */}
                <label className="form-control w-full">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Zip Code
                  </span>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={dbUser.zipCode}
                  />
                </label>
              </div>

              {/* LIFESTYLE */}
              <h2 className="text-lg text-base-content/70 font-semibold mb-3">
                Lifestyle
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-10">

                <label className="form-control">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Pet Friendly
                  </span>
                  <select
                    className="select select-bordered"
                    defaultValue={String(dbUser.lifestyle?.petFriendly)}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Smoking
                  </span>
                  <select
                    className="select select-bordered"
                    defaultValue={String(dbUser.lifestyle?.smoking)}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>

                <label className="form-control col-span-2">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Guest Frequency
                  </span>
                  <input
                    className="input input-bordered w-full"
                    defaultValue={dbUser.lifestyle?.guestFrequency}
                  />
                </label>

                <label className="form-control col-span-2">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                    Night Owl
                  </span>
                  <select
                    className="select select-bordered w-full"
                    defaultValue={String(dbUser.lifestyle?.nightOwl)}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
