import { useRef, useState, useEffect } from "react";
import { Pencil, X } from "lucide-react";

function PersonalInfo({ dbUser }) {
  const fileInputRef = useRef(null);

  // Store uploaded image preview
  const [customPhoto, setCustomPhoto] = useState(null);

  // Use backend image if exists, otherwise placeholder
  const [profileImg, setProfileImg] = useState(
    dbUser?.profileImageUrl || "https://i.pravatar.cc/200"
  );

  // Sync dbUser when page loads
  useEffect(() => {
    if (dbUser?.profileImageUrl) setProfileImg(dbUser.profileImageUrl);
  }, [dbUser]);

  // Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImg(url);
    setCustomPhoto(url);
  };

  // Remove uploaded image
  const handleRemove = () => {
    setCustomPhoto(null);
    setProfileImg(dbUser?.profileImageUrl || "https://i.pravatar.cc/200");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* PROFILE IMAGE SECTION */}
      <div className="flex justify-center mb-10 relative">
        <div className="relative w-40 h-40">
          <img
            src={profileImg}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover shadow-lg"
          />

          {/* Pencil icon triggers file upload */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-2 right-2 bg-base-100 shadow-md p-2 rounded-full border hover:scale-105 transition"
          >
            <Pencil className="size-4 text-base-content/70" />
          </button>

          {/* Hidden upload input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        {/* Remove button only appears when custom photo is applied */}
        {customPhoto && (
          <button
            className="absolute top-2 right-2 bg-white shadow rounded-full p-1 hover:bg-gray-100 transition"
            onClick={handleRemove}
          >
            <X className="size-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* FIRST NAME */}
        <div>
          <label className="text-sm text-base-content/60">First Name</label>
          <input
            type="text"
            defaultValue={dbUser?.firstName || ""}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="text-sm text-base-content/60">Last Name</label>
          <input
            type="text"
            defaultValue={dbUser?.lastName || ""}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-base-content/60">Email</label>
          <input
            type="email"
            defaultValue={dbUser?.email || ""}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-base-content/60">Phone Number</label>
          <input
            type="text"
            defaultValue={dbUser?.phone || ""}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="text-sm text-base-content/60">Gender</label>
          <select
            defaultValue={dbUser?.gender || "no preference"}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Other</option>
          </select>
        </div>

        {/* DATE OF BIRTH */}
        <div>
          <label className="text-sm text-base-content/60">Date of Birth</label>
          <input
            type="date"
            defaultValue={dbUser?.dob || ""}
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

      </div>
    </div>
  );
}

export default PersonalInfo;
