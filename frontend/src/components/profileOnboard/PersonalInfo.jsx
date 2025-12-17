import { useRef, useState, useEffect } from "react";
import { Pencil, X, User, Mail, Phone, Calendar, VenusAndMars } from "lucide-react";
import SimpleField from "../SimpleField";
import BudgetField from "../BudgetField";
import { useUser } from "@clerk/clerk-react";

function PersonalInfo({ dbUser, setDbUser, isEditMode = true }) {
  const { user } = useUser();
  const fileInputRef = useRef(null);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [profileImg, setProfileImg] = useState(
    dbUser?.profileImageUrl || user.imageUrl
  );

  useEffect(() => {
    if (dbUser?.profileImageUrl) setProfileImg(dbUser.profileImageUrl);
  }, [dbUser]);

  const uploadToClerk = async (file) => {
    if (!user) return;

    await user.setProfileImage({ file });
    await user.reload();

    const imageUrl = user.imageUrl;
    setProfileImg(imageUrl);

    await fetch("/api/users/profile-image", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        imageUrl,
      }),
    });
    setDbUser((prev) => ({
      ...prev,
      profileImageUrl: imageUrl,
    }));
    setCustomPhoto(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImg(url);
    setCustomPhoto(url);
    await uploadToClerk(file);
  };

  // const handleRemove = (e) => {
  //   e.stopPropagation();
  //   setCustomPhoto(null);
  //   setProfileImg(dbUser?.profileImageUrl || user.imageUrl);
  // };

  const handleFieldUpdate = (field, newValue) => {
    setDbUser((prev) => ({
      ...prev,
      [field]: newValue
    }));
  };

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
          {/* {customPhoto && isEditMode && (
            <button
              className="absolute top-0 right-0 btn btn-circle btn-xs btn-error shadow-md z-10 scale-90"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
            </button>
          )} */}
        </div>
        {isEditMode && <p className="mt-2 text-xs text-base-content/50">Tap image to change</p>}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

        <SimpleField
          label="First Name"
          field="firstName"
          value={dbUser?.firstName || ""}
          icon={User}
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <SimpleField
          label="Last Name"
          field="lastName"
          value={dbUser?.lastName || ""}
          icon={User}
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <SimpleField
          label="Email Address"
          field="email"
          value={dbUser?.email || ""}
          icon={Mail}
          type="email"
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <SimpleField
          label="Phone Number"
          field="phone"
          value={dbUser?.phone || ""}
          icon={Phone}
          type="tel"
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <SimpleField
          label="Gender"
          field="gender"
          value={dbUser?.gender || ""}
          icon={VenusAndMars}
          type="select"
          options={["Male", "Female", "Non-binary", "Other"]}
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <SimpleField
          label="Date of Birth"
          field="dateOfBirth"
          value={dbUser?.dateOfBirth || ""}
          icon={Calendar}
          type="date"
          onChange={handleFieldUpdate}
          isEditMode={isEditMode}
        />

        <BudgetField
          label="Budget Range"
          value={dbUser?.budget}
          onSave={handleFieldUpdate}
          isEditMode={isEditMode}
        />

      </div>
    </div>
  );
}

export default PersonalInfo;
