import Navbar from "../components/Navbar";

const ProcessPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          {/* Title + Subtitle */}
          <div className="text-center space-y-3 mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-base-content">
              Let’s Make Sharing a Home Feel Easy
            </h1>
            <p className="text-sm md:text-base text-base-content/70 max-w-3xl mx-auto">
              Using AI-powered personalization to learn your habits and preferences to recommend roommates who naturally align with 
              your daily life.
            </p>
          </div>

          {/* TWO-COLUMN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* LEFT CARD – Basic Info */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body space-y-4">
                <div>
                  <h2 className="card-title text-xl">Basic Info</h2>
                  <p className="text-sm text-base-content/70">
                    We’re pulling this information from your Google Account. If
                    anything is incorrect, feel free to update it.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Avatar */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 md:w-32">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-semibold">
                      S
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 space-y-3">
                    <label className="form-control w-full">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                        Name
                      </span>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue="Shaan Ahuja"
                      />
                    </label>

                    <label className="form-control w-full">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                        Email
                      </span>
                      <input
                        type="email"
                        className="input input-bordered w-full"
                        defaultValue="shaanahuja737@gmail.com"
                      />
                    </label>

                    <label className="form-control w-full">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                        Birthday
                      </span>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue="March 19, 2001 (23 years old)"
                      />
                    </label>

                    <label className="form-control w-full">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                        Gender
                      </span>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue="Male"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARD – AI Onboarding */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="card-title text-xl">
                      AI Onboarding <span className="font-normal">[Optional]</span>
                    </h2>
                    <p className="text-sm text-base-content/70 mt-1 max-w-md">
                      Uploading your Google Takeout data helps the system
                      auto-fill onboarding questions. Your data is processed
                      securely and never stored.
                    </p>
                  </div>

                  <div className="text-xs text-base-content/60">
                    Generated with{" "}
                    <span className="text-primary font-semibold">Gemini</span>
                  </div>
                </div>

                <button className="btn btn-lg w-full justify-start bg-linear-to-r from-amber-50 to-amber-100 border border-amber-200 text-base-content hover:from-amber-100 hover:to-amber-200 mt-2">
                  <span className="mr-3">
                    <span className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-lg">
                      📂
                    </span>
                  </span>
                  <span className="font-semibold tracking-wide">
                    UPLOAD GOOGLE TAKEOUT DATA
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <footer className="w-full mt-auto pb-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <button className="btn btn-outline btn-lg px-10 rounded-full">
            BACK
          </button>
          <button className="btn btn-primary btn-lg px-10 rounded-full">
            NEXT
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ProcessPage;
