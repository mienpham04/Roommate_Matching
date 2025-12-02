import React, { useState } from "react";
import { ChevronLeft, Speech } from "lucide-react";
import Navbar from "../components/Navbar";
import PersonalInfo from "../components/profileOnboard/PersonalInfo";
import LifeStyle from "../components/profileOnboard/LifeStyle";
import Preference1 from "../components/profileOnboard/Preference1";
import Preference2 from "../components/profileOnboard/Preference2";
import MoreDetails from "../components/profileOnboard/MoreDetails";

function UserPage() {
    const [active, setActive] = useState("Profile");
    const [subStep, setSubStep] = useState(0);

    const tabs = ["Profile", "Lifestyle", "Preferences", "More details"];

    const [lifestyleData, setLifestyleData] = useState({
        petFriendly: false,
        smoking: false,
        guestFrequency: "I occasionally have friends over on weekends",
        isNightOwl: true,
    });

    const [rmData, setRmData] = useState({
        petFriendly: false,
        smoking: false,
        guestFrequency: "I occasionally have friends over on weekends",
        isNightOwl: true,
    });

    const [preferenceData, setPreferenceData] = useState({
        minAge: 20,
        maxAge: 30,
        gender: "no preference",
    });

    const [moreDetailsData, setMoreDetailsData] = useState({
        moreDetails: "",
    });

    const currentIndex = tabs.indexOf(active);
    const progressPercent = ((currentIndex + 1) / tabs.length) * 100;

    // ------- NEXT BUTTON HANDLER -------
    const handleNext = () => {
        // if (active === "Lifestyle") {
        //     if (subStep < 1) return setSubStep(subStep + 1); // Lifestyle Step 1 → 2
        //     setSubStep(0);
        //     return setActive("Preferences"); // Move to next main tab
        // }

        if (active === "Preferences") {
            if (subStep < 1) return setSubStep(subStep + 1); // Preferences Step 1 → 2
            setSubStep(0);
            return setActive("More details");
        }

        if (currentIndex < tabs.length - 1) {
            return setActive(tabs[currentIndex + 1]);
        }
    };

    // ------- BACK BUTTON HANDLER -------
    const handleBack = () => {
        // if (active === "Lifestyle" && subStep > 0) {
        //     return setSubStep(subStep - 1);
        // }
        if (active === "Preferences" && subStep > 0) {
            return setSubStep(subStep - 1);
        }
        if (currentIndex > 0) {
            return setActive(tabs[currentIndex - 1]);
        }
    };

    // ------- SUBPAGE CONTENT -------
    // const renderLifestyle = () => {
    //     if (subStep === 0)
    //         return <LifeStyle1 data={lifestyleData} setData={setLifestyleData} />;
    //     if (subStep === 1)
    //         return <h2 className="mt-10 text-3xl font-bold text-primary">Lifestyle — Step 2</h2>;
    // };

    const renderPreferences = () => {
        if (subStep === 0)
            return <Preference1 data={preferenceData} setData={setPreferenceData} />;
        if (subStep === 1)
            return <Preference2 data={rmData} setData={setRmData} />;
    };

    // ------- MAIN CONTENT -------
    const renderContent = () => {
        switch (active) {
            case "Profile":
                return <PersonalInfo />;

            case "Lifestyle":
                return <LifeStyle data={lifestyleData} setData={setLifestyleData} />;

            case "Preferences":
                return renderPreferences();

            case "More details":
                return <MoreDetails data={moreDetailsData} setData={setMoreDetailsData} />

            default:
                return null;
        }
    };

    return (
        <div className="bg-linear-to-br from-base-100 via-base-200 to-base-300 min-h-screen overflow-hidden">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 mt-6">

                {/* TOP BAR */}
                <div className="flex items-center justify-between w-full">

                    {/* LEFT: BACK BUTTON (disabled on first tab & first substep) */}
                    {!(currentIndex === 0 && subStep === 0) ? (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 text-base-content/70 hover:text-base-content transition"
                        >
                            <ChevronLeft size={18} />
                            <span className="underline hover:scale-105 transition-transform duration-200">Back</span>
                        </button>
                    ) : (
                        <div className="w-[70px]" />
                    )}

                    {/* CENTER: TABS */}
                    <div className="flex gap-14 text-sm font-semibold tracking-wide items-center">
                        {tabs.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActive(tab);
                                    setSubStep(0);
                                }}
                                className={`hover:scale-105 transition-transform duration-200 uppercase ${i <= currentIndex
                                    ? "text-primary font-bold"
                                    : "text-base-content/60"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT ICON */}
                    <div className="w-[70px] flex justify-end">
                        <Speech className="size-6 text-pink-400" />
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-2 bg-base-300/70 rounded-full overflow-hidden mt-3">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-primary via-secondary to-accent transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div className="text-center min-h-[300px]">
                {renderContent()}
            </div>

            {/* CONTINUE BUTTON */}
            <div className="w-full flex justify-center">
                <button
                    onClick={handleNext}
                    className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition my-15"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default UserPage;
