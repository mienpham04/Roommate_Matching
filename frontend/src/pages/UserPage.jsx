import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, User, Coffee, Heart, FileText, Edit, Eye } from "lucide-react";
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
    const [preferenceSubTab, setPreferenceSubTab] = useState(0);
    const [dbUser, setDbUser] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

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

    const currentIndex = tabs.indexOf(active);

    const changeStep = (newActive) => {
        if (active === newActive) return;
        setAnimating(true);
        setTimeout(() => {
            setActive(newActive);
            if (newActive === "Preferences") {
                setPreferenceSubTab(0);
            }
            setAnimating(false);
        }, 200);
    };

    const handleNext = () => {
        // Handle Preferences sub-tabs in edit mode
        if (isEditMode && active === "Preferences" && preferenceSubTab < 1) {
            setPreferenceSubTab(preferenceSubTab + 1);
            return;
        }

        if (currentIndex < tabs.length - 1) {
            changeStep(tabs[currentIndex + 1]);
        } else {
            // Last tab - "Save & Finish" clicked
            setIsEditMode(false);
        }
    };

    const handleBack = () => {
        // Handle Preferences sub-tabs in edit mode
        if (isEditMode && active === "Preferences" && preferenceSubTab > 0) {
            setPreferenceSubTab(preferenceSubTab - 1);
            return;
        }

        if (currentIndex > 0) {
            changeStep(tabs[currentIndex - 1]);
        }
    };

    const renderPreferences = () => {
        return (
            <div className="w-full">
                {/* Sub-tabs for Preferences */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-base-200/50 p-1.5 rounded-xl shadow-inner border border-base-300/50 backdrop-blur-sm">
                        <button
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ease-out min-w-[120px]
                                ${preferenceSubTab === 0
                                    ? 'bg-primary text-primary-content shadow-lg scale-105'
                                    : 'text-base-content/70 hover:text-base-content hover:bg-base-100/50'
                                }`}
                            onClick={() => setPreferenceSubTab(0)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Heart className={`w-4 h-4 ${preferenceSubTab === 0 ? 'animate-pulse' : ''}`} />
                                <span>Basic</span>
                            </div>
                        </button>
                        <button
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ease-out min-w-[120px]
                                ${preferenceSubTab === 1
                                    ? 'bg-primary text-primary-content shadow-lg scale-105'
                                    : 'text-base-content/70 hover:text-base-content hover:bg-base-100/50'
                                }`}
                            onClick={() => setPreferenceSubTab(1)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Coffee className={`w-4 h-4 ${preferenceSubTab === 1 ? 'animate-pulse' : ''}`} />
                                <span>Lifestyle</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Render the appropriate preference component */}
                {preferenceSubTab === 0 ? (
                    <Preference1 dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />
                ) : (
                    <Preference2 dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (active) {
            case "Profile": return <PersonalInfo dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />;
            case "Lifestyle": return <LifeStyle dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />;
            case "Preferences": return renderPreferences();
            case "More details": return <MoreDetails dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />;
            default: return null;
        }
    };

    if (!dbUser) return <Loading />;

    return (
        <div className="h-screen w-full bg-base-200 flex flex-col font-sans overflow-hidden">
            <Navbar />

            <div className="flex-1 flex overflow-hidden p-2 md:p-4 gap-2 md:gap-4">

                {/* Left Sidebar - Vertical Tabs */}
                <div className="w-48 md:w-56 flex-shrink-0 bg-base-100 rounded-xl shadow-xl border border-base-200 p-3 md:p-4 flex flex-col">
                    <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-3 px-2">
                        Your Profile
                    </h3>
                    <ul className="menu menu-sm md:menu-md gap-1">
                        {tabs.map((tab) => (
                            <li key={tab}>
                                <a
                                    onClick={() => changeStep(tab)}
                                    className={`flex items-center gap-3 rounded-lg transition-all duration-200
                                        ${active === tab
                                            ? "bg-primary text-primary-content font-bold"
                                            : "text-base-content/70 hover:bg-base-200"}
                                    `}
                                >
                                    <span className="flex items-center justify-center w-6 h-6">
                                        {stepIcons[tab]}
                                    </span>
                                    <span className="flex-1">{tab}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-base-100 flex-1 shadow-xl border border-base-200 rounded-xl flex flex-col overflow-hidden">

                        <div className="p-3 md:p-4 border-b border-base-200 shrink-0 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-base-content flex items-center gap-2">
                                    {stepIcons[active]} {active}
                                </h2>
                                <p className="text-xs text-base-content/60">
                                    {isEditMode ? `Step ${currentIndex + 1} of ${tabs.length}` : 'View Mode'}
                                </p>
                            </div>

                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`btn btn-sm md:btn-md gap-1 md:gap-2 ${isEditMode ? 'btn-ghost' : 'btn-primary'}`}
                            >
                                {isEditMode ? (
                                    <>
                                        <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                                        <span className="hidden sm:inline">View Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit size={16} className="md:w-[18px] md:h-[18px]" />
                                        <span className="hidden sm:inline">Edit Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-base-100">
                            <div className={`max-w-4xl mx-auto transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
                                {renderContent()}
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="p-3 md:p-4 border-t border-base-200 bg-base-100 shrink-0 flex justify-between items-center">
                                <button
                                    onClick={handleBack}
                                    disabled={currentIndex === 0}
                                    className={`btn btn-sm md:btn-md btn-ghost gap-2 transition-opacity duration-200
                                        ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                                    `}
                                >
                                    <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
                                    <span className="hidden sm:inline">Back</span>
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="btn btn-sm md:btn-md btn-primary shadow-lg hover:scale-105 transition-transform"
                                >
                                    {(currentIndex === tabs.length - 1) ? 'Save & Finish' : 'Save & Next'}
                                    <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserPage;