import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, User, Coffee, Heart, FileText, Edit, Eye, Check, Settings, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import PersonalInfo from "../components/profileOnboard/PersonalInfo";
import LifeStyle from "../components/profileOnboard/LifeStyle";
import Preference1 from "../components/profileOnboard/Preference1";
import Preference2 from "../components/profileOnboard/Preference2";
import MoreDetails from "../components/profileOnboard/MoreDetails";
import { useParams, useLocation } from "react-router";
import Loading from "../components/Loading";

function UserPage() {
    const { id } = useParams();
    const location = useLocation(); // Fixed missing hook usage
    const [active, setActive] = useState("Profile");
    const [preferenceSubTab, setPreferenceSubTab] = useState(0);
    const [dbUser, setDbUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleNext = async () => {
        if (isEditMode && active === "Preferences" && preferenceSubTab < 1) {
            setPreferenceSubTab(preferenceSubTab + 1);
            return;
        }

        if (currentIndex < tabs.length - 1) {
            changeStep(tabs[currentIndex + 1]);
        } else {
            // Final step - save all data to database
            await handleFinish();
        }
    };

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            // Save the current state to database
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dbUser),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setDbUser(updatedUser);
                setIsEditMode(false);

                // Show success toast notification
                const toastDiv = document.createElement('div');
                toastDiv.className = 'toast toast-top toast-center z-50';
                toastDiv.innerHTML = `
                    <div class="alert alert-success shadow-lg">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Profile updated successfully!</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(toastDiv);
                setTimeout(() => toastDiv.remove(), 3000);
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            console.error("Failed to save profile:", error);

            // Show error toast
            const toastDiv = document.createElement('div');
            toastDiv.className = 'toast toast-top toast-center z-50';
            toastDiv.innerHTML = `
                <div class="alert alert-error shadow-lg">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Failed to save profile. Please try again.</span>
                    </div>
                </div>
            `;
            document.body.appendChild(toastDiv);
            setTimeout(() => toastDiv.remove(), 3000);
        } finally {
            setIsSaving(false);
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
                {/* Modern Pill Segmented Control */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-base-200/60 p-1.5 rounded-full shadow-inner border border-base-300 backdrop-blur-sm relative">
                        {/* Animated Background Pill (Optional complexity, kept simple for React/Tailwind) */}
                        <button
                            className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 min-w-[140px] flex items-center justify-center gap-2
                                ${preferenceSubTab === 0
                                    ? 'bg-white text-primary shadow-md transform scale-105' 
                                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                                }`}
                            onClick={() => setPreferenceSubTab(0)}
                        >
                            <Heart className={`w-4 h-4 ${preferenceSubTab === 0 ? 'fill-primary' : ''}`} />
                            <span>Basic</span>
                        </button>
                        <button
                            className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 min-w-[140px] flex items-center justify-center gap-2
                                ${preferenceSubTab === 1
                                    ? 'bg-white text-secondary shadow-md transform scale-105'
                                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                                }`}
                            onClick={() => setPreferenceSubTab(1)}
                        >
                            <Coffee className={`w-4 h-4 ${preferenceSubTab === 1 ? 'fill-secondary' : ''}`} />
                            <span>Lifestyle</span>
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
        // Added a subtle gradient background to the main page wrapper
        <div className="h-screen w-full bg-gradient-to-br from-base-200 to-base-300 flex flex-col font-sans overflow-hidden text-base-content">
            <Navbar />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex gap-4 md:gap-8 p-4 md:p-8 items-stretch">

                    {/* Left Sidebar - Refined */}
                    <div className="w-20 md:w-64 flex-shrink-0 flex flex-col gap-2 relative z-20 pt-4">
                        <div className="px-4 mb-6 hidden md:block">
                            <h3 className="text-xs font-extrabold text-base-content/40 uppercase tracking-widest flex items-center gap-2">
                                <Settings className="w-3 h-3" /> Account
                            </h3>
                        </div>

                        {tabs.map((tab) => {
                            const isActive = active === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => changeStep(tab)}
                                    // New styling: Floating Pill style instead of Border-Left
                                    className={`
                                        w-full flex items-center gap-3 px-4 md:px-6 py-3.5 transition-all duration-300 rounded-xl group
                                        ${isActive
                                            ? "bg-primary text-primary-content shadow-lg shadow-primary/30 scale-[1.02]" 
                                            : "text-base-content/60 hover:bg-base-100 hover:text-base-content hover:shadow-sm"
                                        }
                                    `}
                                >
                                    <span className={`flex items-center justify-center transition-all duration-300
                                        ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                                    `}>
                                        {stepIcons[tab]}
                                    </span>
                                    <span className={`hidden md:block font-medium ${isActive ? 'font-bold' : ''}`}>
                                        {tab}
                                    </span>
                                    
                                    {isActive && (
                                        <div className="ml-auto hidden md:block">
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Area - Card Design */}
                    <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
                        <div className="bg-base-100 flex-1 shadow-xl shadow-base-300/50 border border-base-100 rounded-3xl flex flex-col overflow-hidden h-full relative">
                            
                            {/* Decorative background blob inside the card (optional) */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {/* Header */}
                            <div className="px-6 md:px-10 py-6 border-b border-base-200/60 shrink-0 flex justify-between items-center bg-base-100/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-base-content flex items-center gap-3 tracking-tight">
                                        {active}
                                        {isEditMode && <span className="badge badge-warning badge-sm animate-pulse">Editing</span>}
                                    </h2>
                                    <p className="text-sm font-medium text-base-content/50 mt-1">
                                        {isEditMode ? 'Update your information below.' : 'Manage and view your profile settings.'}
                                    </p>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (isEditMode) {
                                            // Save when exiting edit mode
                                            await handleFinish();
                                        } else {
                                            setIsEditMode(true);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className={`
                                        btn btn-sm md:btn-md rounded-full px-6 transition-all duration-300
                                        ${isEditMode
                                            ? 'btn-success text-white shadow-success/30 shadow-lg'
                                            : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'
                                        }
                                    `}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            <span>Saving...</span>
                                        </>
                                    ) : isEditMode ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Done Editing</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4" />
                                            <span>Edit</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-base-100 relative z-0">
                                <div key={active} className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                                    {renderContent()}
                                </div>
                            </div>

                            {/* Footer - Only visible in Edit Mode */}
                            {isEditMode && (
                                <div className="p-4 md:p-6 border-t border-base-200 bg-base-100/90 backdrop-blur-md shrink-0 flex justify-between items-center z-10">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentIndex === 0}
                                        className={`btn btn-ghost gap-2 rounded-full px-6
                                            ${currentIndex === 0 
                                                ? 'opacity-0 pointer-events-none' 
                                                : 'text-base-content/60 hover:bg-base-200'
                                            }
                                        `}
                                    >
                                        <ChevronLeft size={18} />
                                        <span>Back</span>
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-base-content/30 hidden md:inline-block">
                                            Step {currentIndex + 1} of {tabs.length}
                                        </span>
                                        <button
                                            onClick={handleNext}
                                            disabled={isSaving}
                                            className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20 gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    {(currentIndex === tabs.length - 1) ? 'Finish' : 'Next Step'}
                                                    <ChevronRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
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