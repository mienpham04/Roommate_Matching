function Stepper({stepData, current}) {
    return (
      <div className="card-body space-y-5">
        <ul className="steps w-full">
          {stepData.map((s, i) => (
            <li
              key={i}
              className={`step cursor-pointer ${
                i <= current ? "step-primary" : ""
              }`}
              onClick={() => setCurrent(i)}
            >
              {s.name}
            </li>
          ))}
        </ul>

        <div className="text-center">
          <h3 className="text-3xl font-bold">{stepData[current].title}</h3>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            {stepData[current].description}
          </p>
        </div>
      </div>
    );
  }

export default Stepper
