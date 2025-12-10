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

    useEffect(() => {
        if (location.state?.tab) {
            setActive(location.state.tab);
        }
    }, [location.state]);

    const tabs = ["Profile", "Lifestyle", "Preferences", "More details"];

    const stepIcons = {
        "Profile": <User className="w-5 h-5" />,
        "Lifestyle": <Coffee className="w-5 h-5" />,
        "Preferences": <Heart className="w-5 h-5" />,
        "More details": <FileText className="w-5 h-5" />
    };

    const currentIndex = tabs.indexOf(active);

    const changeStep = (newActive) => {
        if (active === newActive) return;
        setActive(newActive);
        if (newActive === "Preferences") {
            setPreferenceSubTab(0);
        }
    };

    const handleNext = () => {
        if (isEditMode && active === "Preferences" && preferenceSubTab < 1) {
            setPreferenceSubTab(preferenceSubTab + 1);
            return;
        }

        if (currentIndex < tabs.length - 1) {
            changeStep(tabs[currentIndex + 1]);
        } else {
            setIsEditMode(false);
        }
    };

    const handleBack = () => {
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
                {/* Sub-tabs container */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-base-200 p-1.5 rounded-xl shadow-inner border border-base-300">
                        <button
                            // REVERTED: Using 'bg-secondary' for the pastel look
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 min-w-[120px]
                                ${preferenceSubTab === 0
                                    ? 'bg-secondary text-secondary-content shadow-lg scale-105'
                                    : 'text-base-content/60 hover:text-base-content hover:bg-base-100/50'
                                }`}
                            onClick={() => setPreferenceSubTab(0)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Heart className={`w-4 h-4 ${preferenceSubTab === 0 ? 'fill-current' : ''}`} />
                                <span>Basic</span>
                            </div>
                        </button>
                        <button
                            // REVERTED: Using 'bg-secondary' for the pastel look
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 min-w-[120px]
                                ${preferenceSubTab === 1
                                    ? 'bg-secondary text-secondary-content shadow-lg scale-105'
                                    : 'text-base-content/60 hover:text-base-content hover:bg-base-100/50'
                                }`}
                            onClick={() => setPreferenceSubTab(1)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Coffee className={`w-4 h-4 ${preferenceSubTab === 1 ? 'fill-current' : ''}`} />
                                <span>Lifestyle</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {preferenceSubTab === 0 ? (
                        <Preference1 dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />
                    ) : (
                        <Preference2 dbUser={dbUser} userId={id} setDbUser={setDbUser} isEditMode={isEditMode} />
                    )}
                </div>
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
        <div className="h-screen w-full bg-base-200 flex flex-col font-sans overflow-hidden text-base-content">
            <Navbar />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex gap-0 p-2 md:p-6 items-stretch">

                    {/* Left Sidebar */}
                    <div className="w-52 md:w-64 shrink-0 flex flex-col gap-2 relative z-20 pt-8">
                        <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-4 px-6">
                            Settings & Profile
                        </h3>
                        {tabs.map((tab) => {
                            const isActive = active === tab;
                            return (
                                <div key={tab} className="relative group">
                                    <button
                                        onClick={() => changeStep(tab)}
                                        // VIVID SIDEBAR TEXT:
                                        // Keeping 'text-pink-600' and 'border-pink-600' for readability/vividness
                                        className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 relative
                                            ${isActive
                                                ? "bg-base-100 text-pink-400 font-extrabold rounded-l-2xl border-l-[6px] border-pink-400 border-t border-b -mr-px"
                                                : "text-base-content/60 hover:bg-base-100/50 hover:text-pink-600 hover:font-bold rounded-xl"
                                            }
                                        `}
                                        style={isActive ? { borderRight: 'none', width: 'calc(100% + 1px)' } : {}}
                                    >
                                        <span className={`flex items-center justify-center transition-all duration-300
                                            ${isActive ? 'scale-110 text-pink-400' : 'text-base-content/40 group-hover:text-pink-400'}
                                        `}>
                                            {/* Vivid Icon fill */}
                                            {isActive ?
                                                <div className="fill-pink-600 stroke-pink-600">{stepIcons[tab]}</div> :
                                                stepIcons[tab]
                                            }
                                        </span>
                                        <span className="flex-1 text-left">{tab}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                        <div className="bg-base-100 flex-1 shadow-sm border border-base-300 rounded-2xl rounded-tl-2xl flex flex-col overflow-hidden h-full">

                            {/* Header */}
                            <div className="px-8 py-5 border-b border-base-200 shrink-0 flex justify-between items-center bg-base-100">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-base-content flex items-center gap-3">
                                        {active}
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                        {isEditMode ? 'Make changes to your public profile below.' : 'This is how others see your profile.'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    // REVERTED: Back to standard pastel Secondary button
                                    className={`
                                        btn btn-sm md:btn-md gap-2
                                        ${isEditMode
                                            ? 'btn-ghost text-base-content/70'
                                            : 'btn-outline btn-secondary border-2 hover:bg-secondary hover:text-secondary-content'
                                        }
                                    `}
                                >
                                    {isEditMode ? (
                                        <>
                                            <Eye size={18} />
                                            <span>Preview</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit size={18} />
                                            <span>Edit Profile</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-base-100">
                                <div key={active} className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                    {renderContent()}
                                </div>
                            </div>

                            {/* Footer */}
                            {isEditMode && (
                                <div className="p-4 md:p-6 border-t border-base-200 bg-base-200/50 shrink-0 flex justify-between items-center">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentIndex === 0}
                                        className={`btn btn-ghost gap-2 hover:bg-base-200
                                            ${currentIndex === 0
                                                ? 'opacity-0 pointer-events-none'
                                                : ''
                                            }
                                        `}
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Back</span>
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        // REVERTED: Back to standard pastel Secondary button
                                        className="btn btn-secondary gap-2 shadow-lg font-bold"
                                    >
                                        {(currentIndex === tabs.length - 1) ? 'Save & Finish' : 'Save & Continue'}
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserPage;