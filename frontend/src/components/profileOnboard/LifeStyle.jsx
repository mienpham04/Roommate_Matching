const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);
const PetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309"/></svg>
);
const SmokeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M12 3v3"/><path d="M19.07 4.93 16.24 7.76"/><path d="M4.93 4.93 7.76 7.76"/></svg> // Using a generic 'air/wind' icon as smoking substitute or standardizing
);
const GuestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

function LifeStyle({ data, setData }) {
  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const ToggleCard = ({ title, desc, icon, field, checked }) => (
    <div 
      className={`card bg-base-100 shadow-sm border transition-all duration-200 ${
        checked ? "border-primary ring-1 ring-primary" : "border-base-200"
      }`}
    >
      <div className="card-body p-5">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/70'}`}>
            {icon}
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={checked}
            onChange={(e) => handleChange(field, e.target.checked)}
          />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-base-content/60 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Lifestyle Habits</h2>
        <p className="text-base-content/60 max-w-lg mx-auto">
          Tell us about your general lifestyle so our AI can find the perfect match for you.
        </p>
      </div>

      {/* GRID FOR TOGGLES (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ToggleCard 
          title="Pet Friendly"
          desc="Comfortable living with pets?"
          field="petFriendly"
          checked={data.petFriendly}
          icon={<PetIcon />}
        />
        <ToggleCard 
          title="Smoking"
          desc="Do you smoke or accept smoking?"
          field="smoking"
          checked={data.smoking}
          icon={<SmokeIcon />}
        />
        <ToggleCard 
          title="Night Owl"
          desc="Do you stay up late regularly?"
          field="isNightOwl"
          checked={data.isNightOwl}
          icon={<MoonIcon />}
        />
      </div>

      {/* FULL WIDTH GUEST SECTION */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6 flex flex-col md:flex-row gap-6">
          
          {/* Icon & Label Area */}
          <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-3 md:w-1/4">
            <div className="p-2 bg-base-200 rounded-lg text-base-content/70">
              <GuestIcon />
            </div>
            <div>
              <h3 className="font-bold text-lg">Guest Frequency</h3>
              <p className="text-xs text-base-content/50 hidden md:block mt-1">
                Help us understand your social habits at home.
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-grow">
            <input
              type="text"
              placeholder="e.g. I host dinner parties once a month..."
              className="input input-bordered w-full focus:input-primary transition-all"
              value={data.guestFrequency}
              onChange={(e) => handleChange("guestFrequency", e.target.value)}
            />
            <div className="label">
              <span className="label-text-alt text-base-content/50">
                Be honest! It helps avoid conflicts later.
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LifeStyle;