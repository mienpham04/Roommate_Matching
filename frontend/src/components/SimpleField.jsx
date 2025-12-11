function SimpleField({ label, field, value, icon: Icon, type = "text", options = [], onChange, isEditMode = true }) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(field, e.target.value);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label p-1 min-h-0 h-auto mb-1">
        <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">{label}</span>
      </label>

      <div className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
        ${isEditMode ? "border-primary/30 bg-base-100" : "border-base-300 bg-base-200/30"}
        min-h-11`}
      >
        {Icon && <Icon className={`size-4 ${isEditMode ? "text-primary" : "text-base-content/50"}`} />}

        {isEditMode ? (
          <>
            {type === "select" ? (
              <select
                className="grow bg-transparent outline-none text-sm text-base-content h-full"
                value={value || ""}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                className="grow bg-transparent outline-none text-sm text-base-content h-full"
                value={value || ""}
                onChange={handleChange}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )}
          </>
        ) : (
          <span className="grow text-sm text-base-content font-medium truncate">
            {value || <span className="text-base-content/30 italic">Not set</span>}
          </span>
        )}
      </div>
    </div>
  );
}

export default SimpleField;
