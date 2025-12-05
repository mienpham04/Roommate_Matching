import { useRef, useState, useEffect } from "react";
import { Pencil, X, User, Mail, Phone, Calendar } from "lucide-react";
import EditableField from "../EditableField";

function PersonalInfo({ dbUser, userId, setDbUser, isEditMode = true }) {
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

  const handleFieldUpdate = async (field, newValue) => {
    const updateUser = { ...dbUser, [field]: newValue };

    await fetch(`http://localhost:8080/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateUser),
    });
    setDbUser(updateUser);
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col items-center justify-center mb-4">
        <div
          className={`relative group ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => isEditMode && fileInputRef.current.click()}
        >
          <div className="avatar">
            <div className={`w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-lg ${isEditMode ? 'hover:scale-105' : ''} transition-transform duration-300`}>
              <img src={profileImg} alt="Profile" className="object-cover" />
            </div>
          </div>
          {isEditMode && (
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white backdrop-blur-[1px]">
              <Pencil className="w-6 h-6" />
            </div>
          )}
          {customPhoto && isEditMode && (
            <button
              className="absolute top-0 right-0 btn btn-circle btn-xs btn-error shadow-md z-10 scale-90"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {isEditMode && <p className="mt-2 text-xs text-base-content/50">Tap image to change</p>}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

        <EditableField
          label="First Name"
          field="firstName"
          value={dbUser?.firstName || ""}
          icon={User}
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <EditableField
          label="Last Name"
          field="lastName"
          value={dbUser?.lastName || ""}
          icon={User}
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <EditableField
          label="Email Address"
          field="email"
          value={dbUser?.email || ""}
          icon={Mail}
          type="email"
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <EditableField
          label="Phone Number"
          field="phone"
          value={dbUser?.phone || ""}
          icon={Phone}
          type="tel"
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <EditableField
          label="Gender"
          field="gender"
          value={dbUser?.gender || "No preference"}
          type="select"
          options={["Male", "Female", "Non-binary", "Other", "No preference"]}
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <EditableField
          label="Date of Birth"
          field="dateOfBirth"
          value={dbUser?.dateOfBirth || ""}
          icon={Calendar}
          type="date"
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

      </div>
    </div>
  );
}

export default PersonalInfo;