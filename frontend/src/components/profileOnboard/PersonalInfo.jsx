import { useRef, useState, useEffect } from "react";
import { Pencil, X, User, Mail, Phone, Calendar } from "lucide-react";
import EditableField from "../EditableField";

function PersonalInfo({ dbUser }) {
  const fileInputRef = useRef(null);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [profileImg, setProfileImg] = useState(
    dbUser?.profileImageUrl || "https://i.pravatar.cc/200"
  );

  useEffect(() => {
    if (dbUser?.profileImageUrl) setProfileImg(dbUser.profileImageUrl);
  }, [dbUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImg(url);
    setCustomPhoto(url);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setCustomPhoto(null);
    setProfileImg(dbUser?.profileImageUrl || "https://i.pravatar.cc/200");
  };

  return (
    <div className="w-full mx-auto">

      {/* AVATAR SECTION: Reduced margins (mb-4 instead of mb-8) */}
      <div className="flex flex-col items-center justify-center mb-4">
        <div 
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          <div className="avatar">
            {/* Slightly smaller avatar to save space: w-32 -> w-28 */}
            <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <img src={profileImg} alt="Profile" className="object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white backdrop-blur-[1px]">
            <Pencil className="w-6 h-6" />
          </div>
          {customPhoto && (
            <button
              className="absolute top-0 right-0 btn btn-circle btn-xs btn-error shadow-md z-10 scale-90"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-base-content/50">Tap image to change</p>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      </div>

      {/* FORM GRID: Tighter gaps (gap-x-4, gap-y-3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        
        <EditableField
          label="First Name" 
          value={dbUser?.firstName || ""} 
          icon={User} 
        />

        <EditableField 
          label="Last Name" 
          value={dbUser?.lastName || ""} 
          icon={User} 
        />

        <EditableField 
          label="Email Address" 
          value={dbUser?.email || ""} 
          icon={Mail} 
          type="email" 
        />

        <EditableField 
          label="Phone Number" 
          value={dbUser?.phone || ""} 
          icon={Phone} 
          type="tel" 
        />

        <EditableField 
          label="Gender" 
          value={dbUser?.gender || "No preference"} 
          type="select"
          options={["Male", "Female", "Non-binary", "Other", "No preference"]}
        />

        <EditableField 
          label="Date of Birth" 
          value={dbUser?.dateOfBirth || ""} 
          icon={Calendar} 
          type="date" 
        />

      </div>
    </div>
  );
}

export default PersonalInfo;