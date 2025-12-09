function Stepper({ stepData, current, setCurrent }) {
  return (
    <div className="flex flex-col w-full">
      <ul className="relative flex flex-col gap-6 text-white">
        {stepData.map((step, i) => {
          const isCompleted = i < current;
          const isActive = i === current;
          
          return (
            <li
              key={i}
              onClick={() => setCurrent && setCurrent(i)} // Only works if setCurrent is passed
              className={`relative flex items-center gap-4 group ${
                setCurrent ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {/* The Vertical Connecting Line */}
              {i !== stepData.length - 1 && (
                <div
                  className={`absolute left-[15px] top-8 h-full w-0.5 -z-10 transition-colors duration-300 ${
                    isCompleted ? "bg-white" : "bg-white/20"
                  }`}
                />
              )}

              {/* The Circle Indicator */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10 ${
                  isActive
                    ? "border-b-emerald-500 bg-white text-primary scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    : isCompleted
                    ? "border-b-emerald-500 bg-white text-primary"
                    : "border-white/30 bg-transparent text-transparent"
                }`}
              >
                {/* Icon Logic */}
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              {/* The Label */}
              <div className="flex flex-col">
                <span
                  className={`text-sm text-base-content/70 tracking-wide transition-opacity duration-300 ${
                    isActive || isCompleted ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                  }`}
                >
                  {step.name}
                </span>
                {/* Optional: Show 'Current' label only on active step */}
                {/* {isActive && (
                  <span className="text-xs font-normal opacity-80 animate-pulse">
                    Current Step
                  </span>
                )} */}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Stepper;