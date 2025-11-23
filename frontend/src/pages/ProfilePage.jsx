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
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN WRAPPER — 100vh minus navbar height */}
      <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-black text-4xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wider ml-2">
            User's name
          </h1>

          <button className="px-5 py-2.5 bg-linear-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-md hover:scale-105 transition">
            Save
          </button>
        </div>

        {/* MAIN GRID — PERFECTLY FITS SCREEN */}
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-150px)]">

          {/* LEFT SIDEBAR */}
          <div className="bg-base-100 rounded-xl p-4 shadow-md border flex flex-col">

            <h2 className="text-lg text-base-content/70 font-semibold mb-3">
              Account Management
            </h2>

            {/* Profile Photo */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden border">
              <img
                src={photo}
                alt="User profile"
                className="w-full h-full object-cover"
              />

              {showRemove && (
                <button
                  className="absolute top-2 right-2 bg-white shadow rounded-full p-1"
                  onClick={() => {
                    setPhoto("/profile.png");
                    setShowRemove(false);
                  }}
                >
                  <X className="size-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Upload */}
            <label className="mt-4 cursor-pointer">
              <div className="w-full py-2 border rounded-lg text-center bg-base-200 hover:bg-base-300 transition font-medium">
                Upload Photo
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>

            {/* Password */}
            <div className="mt-4">
              <p className="text-sm font-semibold mb-1">Old Password</p>
              <input type="password" className="input input-bordered w-full" />

              <p className="text-sm font-semibold mt-3 mb-1">New Password</p>
              <input type="password" className="input input-bordered w-full" />

              <button className="w-full mt-4 py-2 bg-linear-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow hover:scale-105 transition flex items-center justify-center">
                Change Password
              </button>
            </div>
          </div>

          {/* RIGHT SIDE — PROFILE FORM */}
          <div className="col-span-2 bg-base-100 rounded-xl p-5 shadow-md border overflow-y-auto">

            {/* Profile Info */}
            <h2 className="text-lg text-base-content/70 font-semibold mb-3">
              Profile Information
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <input className="input input-bordered w-full" placeholder="Username" />
              <input className="input input-bordered w-full" placeholder="First Name" />
              <input className="input input-bordered w-full" placeholder="Nickname" />
              <select className="select select-bordered w-full">
                <option>Subscriber</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
              <input className="input input-bordered w-full" placeholder="Last Name" />
              <input className="input input-bordered w-full" placeholder="Display Name As" />
            </div>

            {/* Contact Info */}
            <h2 className="text-lg text-base-content/70 font-semibold mb-3">
              Contact Info
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <input className="input input-bordered w-full" placeholder="Email" />
              <input className="input input-bordered w-full" placeholder="WhatsApp" />
              <input className="input input-bordered w-full" placeholder="Website" />
              <input className="input input-bordered w-full" placeholder="Telegram" />
            </div>

            {/* Bio */}
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
  );
}

export default ProfilePage;
