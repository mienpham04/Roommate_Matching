import React, { useRef, useState } from "react";
import { Pencil } from "lucide-react";

function PersonalInfo() {
  const fileInputRef = useRef(null);
  const [profileImg, setProfileImg] = useState("https://i.pravatar.cc/200");

  // Handle user image selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);
    setProfileImg(imgUrl); // Preview immediately

    // TODO: Upload to backend if needed
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* PROFILE IMAGE SECTION */}
      <div className="flex justify-center mb-10 relative">
        <div className="relative">
          <img
            src={profileImg}
            alt="profile"
            className="w-40 h-40 rounded-full object-cover shadow-lg"
          />

          {/* Pencil icon triggers file upload */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-2 right-2 bg-base-100 shadow-md p-2 rounded-full border hover:scale-105 transition"
          >
            <Pencil className="size-4 text-base-content/70" />
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FIRST NAME */}
        <div>
          <label className="text-sm text-base-content/60">First Name</label>
          <input
            type="text"
            defaultValue="Dom"
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="text-sm text-base-content/60">Last Name</label>
          <input
            type="text"
            defaultValue="Hill"
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-base-content/60">Email</label>
          <input
            type="email"
            defaultValue="Dom.Hill@gmail.com"
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-base-content/60">Phone Number</label>
          <input
            type="number"
            defaultValue="98 9213690037"
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="text-sm text-base-content/60">Gender</label>
          <select className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none">
            <option>Male</option>
            <option>Female</option>
            <option>Non-binar</option>
            <option>Other</option>
          </select>
        </div>

        {/* BIRTHDAY */}
        <div>
          <label className="text-sm text-base-content/60">Date of Birth</label>
          <input
            type="date"
            defaultValue="08/10/2002"
            className="w-full px-4 py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalInfo;
