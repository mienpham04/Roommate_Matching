import { useEffect, useState } from "react";
import { Pencil, X, Check } from "lucide-react";

function EditableField({ label, value, icon: Icon, type = "text", options = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    setCurrentValue(tempValue);
    setIsEditing(false);
    console.log(`Saved ${label}: ${tempValue}`);
  };

  const handleCancel = () => {
    setTempValue(currentValue);
    setIsEditing(false);
  };

  return (
    <div className="form-control w-full">
      {/* Reduced padding (p-1) and bottom margin (mb-1) for label */}
      <label className="label p-1 min-h-0 h-auto mb-1">
        <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">{label}</span>
      </label>

      {/* COMPACT CONTAINER: 
         - Changed py-3 to py-2 
         - Added min-h-[2.75rem] to keep it slim but clickable
      */}
      <div className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 
        ${isEditing ? "border-primary bg-base-100 ring-1 ring-primary/20" : "border-base-300 bg-base-200/30"}
        min-h-11`}
      >
        {Icon && <Icon className={`size-4 ${isEditing ? "text-primary" : "text-base-content/50"}`} />}

        {isEditing ? (
          <>
            {type === "select" ? (
              <select
                className="grow bg-transparent outline-none text-sm text-base-content h-full"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                className="grow bg-transparent outline-none text-sm text-base-content h-full"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
              />
            )}
            
            <div className="flex gap-1">
              <button onClick={handleSave} className="btn btn-circle btn-xs btn-success text-white">
                <Check size={12} />
              </button>
              <button onClick={handleCancel} className="btn btn-circle btn-xs btn-ghost text-base-content/60">
                <X size={12} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="grow text-sm text-base-content font-medium truncate">
              {currentValue || <span className="text-base-content/30 italic">Not set</span>}
            </span>
            
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-primary"
            >
              <Pencil size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditableField;