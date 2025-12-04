import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, User, Coffee, Heart, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import PersonalInfo from "../components/profileOnboard/PersonalInfo";
import LifeStyle from "../components/profileOnboard/LifeStyle";
import Preference1 from "../components/profileOnboard/Preference1";
import Preference2 from "../components/profileOnboard/Preference2";
import MoreDetails from "../components/profileOnboard/MoreDetails";
import { useParams } from "react-router";
import Loading from "../components/Loading";

function UserPage() {
    const { id } = useParams();
    const [active, setActive] = useState("Profile");
    const [subStep, setSubStep] = useState(0);
    const [dbUser, setDbUser] = useState(null);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/users/${id}`);
                const data = await res.json();
                setDbUser(data);
            } catch (err) {
                console.error("Failed to fetch DB user:", err);
                setDbUser({ name: "Test User" });
            }
        };
        fetchUser();
    }, [id]);

    const tabs = ["Profile", "Lifestyle", "Preferences", "More details"];
    
    const stepIcons = {
        "Profile": <User className="w-4 h-4" />,
        "Lifestyle": <Coffee className="w-4 h-4" />,
        "Preferences": <Heart className="w-4 h-4" />,
        "More details": <FileText className="w-4 h-4" />
    };

    const [rmData, setRmData] = useState({
        petFriendly: false,
        smoking: false,
        guestFrequency: "",
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

    const changeStep = (newActive, newSubStep) => {
        if (active === newActive) return;
        setAnimating(true);
        setTimeout(() => {
            setActive(newActive);
            setSubStep(newSubStep);
            setAnimating(false);
        }, 200);
    };

    const handleNext = () => {
        if (active === "Preferences") {
            if (subStep < 1) return setSubStep(subStep + 1);
            return changeStep("More details", 0);
        }

        if (currentIndex < tabs.length - 1) {
            changeStep(tabs[currentIndex + 1], 0);
        }
    };

    const handleBack = () => {
        if (active === "Preferences" && subStep > 0) {
            return setSubStep(subStep - 1);
        }
        if (currentIndex > 0) {
            changeStep(tabs[currentIndex - 1], 0);
        }
    };

    const renderPreferences = () => {
        if (subStep === 0) return <Preference1 data={preferenceData} setData={setPreferenceData} />;
        if (subStep === 1) return <Preference2 data={rmData} setData={setRmData} />;
    };

    const renderContent = () => {
        switch (active) {
            case "Profile": return <PersonalInfo dbUser={dbUser} userId={id} setDbUser={setDbUser}/>;
            case "Lifestyle": return <LifeStyle dbUser={dbUser} userId={id} setDbUser={setDbUser} />;
            case "Preferences": return renderPreferences();
            case "More details": return <MoreDetails data={moreDetailsData} setData={setMoreDetailsData} />;
            default: return null;
        }
    };

    if (!dbUser) return <Loading />;

    return (
        <div className="min-h-screen w-full bg-base-200 flex flex-col font-sans">
            <Navbar />

            <div className="grow flex flex-col items-center p-4 py-10">
                
                <div className="w-full max-w-6xl">
                    <div className="tabs tabs-lift">
                        {tabs.map((tab) => (
                            <a 
                                key={tab}
                                onClick={() => changeStep(tab, 0)}
                                className={`tab tab-lg transition-all duration-200 gap-2
                                    ${active === tab 
                                        ? "tab-active [--tab-bg:var(--color-base-100)] [--tab-border-color:transparent] font-bold text-pink-400" 
                                        : "text-base-content/60 hover:text-base-content"}
                                `}
                            >
                                {stepIcons[tab]}
                                <span className="hidden sm:inline">{tab}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="bg-base-100 w-full max-w-6xl min-h-[500px] shadow-xl border border-base-200 rounded-b-2xl rounded-tr-2xl rounded-tl-2xl relative z-10 flex flex-col">
                    
                    <div className="p-6 border-b border-base-200 shrink-0 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                                {stepIcons[active]} {active}
                            </h2>
                            <p className="text-sm text-base-content/60">
                                Step {currentIndex + 1} of {tabs.length}
                            </p>
                        </div>
                    </div>
                    <div className="grow p-4 md:p-8 bg-base-100 relative">
                        <div className={`max-w-4xl mx-auto transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
                            {renderContent()}
                        </div>
                    </div>

                    <div className="p-4 md:px-8 md:py-5 border-t border-base-200 bg-base-100 shrink-0 flex justify-between items-center rounded-b-2xl">
                        <button
                            onClick={handleBack}
                            disabled={currentIndex === 0 && subStep === 0}
                            className={`btn btn-ghost gap-2 transition-opacity duration-200
                                ${(currentIndex === 0 && subStep === 0) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            `}
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            className="btn btn-primary px-8 shadow-lg hover:scale-105 transition-transform"
                        >
                            {(currentIndex === tabs.length - 1) ? 'Finish Profile' : 'Next'}
                            <ChevronRight size={18} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default UserPage;