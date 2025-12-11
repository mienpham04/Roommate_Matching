import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, User, Coffee, Heart, FileText, Edit, Eye, Check, Settings, Sparkles, X } from "lucide-react";
import Navbar from "../components/Navbar";
import PersonalInfo from "../components/profileOnboard/PersonalInfo";
import LifeStyle from "../components/profileOnboard/LifeStyle";
import Preference1 from "../components/profileOnboard/Preference1";
import Preference2 from "../components/profileOnboard/Preference2";
import Preference3 from "../components/profileOnboard/Preference3";
import MoreDetails from "../components/profileOnboard/MoreDetails";
import { useParams, useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";
import Loading from "../components/Loading";

function UserPage() {
    const { id } = useParams();
    const location = useLocation();
    const { user: currentUser } = useUser();
    const [active, setActive] = useState("Profile");
    const [preferenceSubTab, setPreferenceSubTab] = useState(0);
    const [dbUser, setDbUser] = useState(null);
    const [originalDbUser, setOriginalDbUser] = useState(null); // Store original data for cancel
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const dbUserRef = useRef(null); // Always keep latest user state handy

    // Check if current user is viewing their own profile
    const isOwnProfile = currentUser?.id === id;

    // Keep state and ref in sync whenever user data changes
    const setDbUserSynced = (updater) => {
        setDbUser((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            dbUserRef.current = next;
            return next;
        });
    };

    useEffect(() => {
        dbUserRef.current = dbUser;
    }, [dbUser]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/users/${id}`);
                const data = await res.json();
                setDbUserSynced(data);
            } catch (err) {
                console.error("Failed to fetch DB user:", err);
                setDbUserSynced({ name: "Test User" });
            }
        };
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (location.state?.tab) {
            setActive(location.state.tab);
        }
    }, [location.state]);

    const tabs = ["Profile", "Lifestyle", "Preferences", "About Me"];

    const stepIcons = {
        "Profile": <User className="w-5 h-5" />,
        "Lifestyle": <Coffee className="w-5 h-5" />,
        "Preferences": <Heart className="w-5 h-5" />,
        "About Me": <FileText className="w-5 h-5" />
    };

    const currentIndex = tabs.indexOf(active);

    const getTabDescription = (tabName) => {
        const descriptions = {
            "Profile": "Your basic information, contact details, and budget",
            "Lifestyle": "Your daily habits, routines, and living preferences",
            "Preferences": "What you're looking for in a roommate",
            "About Me": "People want to know more about you!"
        };
        return descriptions[tabName] || "Manage and view your profile settings";
    };

    const changeStep = (newActive) => {
        if (active === newActive) return;
        setActive(newActive);
        if (newActive === "Preferences") {
            setPreferenceSubTab(0);
        }
    };

    const handleNext = async () => {
        if (isEditMode && active === "Preferences" && preferenceSubTab < 2) {
            setPreferenceSubTab(preferenceSubTab + 1);
            return;
        }

        if (currentIndex < tabs.length - 1) {
            changeStep(tabs[currentIndex + 1]);
        }
        // Note: On last tab, "Next" button is now hidden/removed
        // Data is only saved when user clicks "Save Changes" button in header
    };

    const handleFinish = async () => {
        setIsSaving(true);

        try {
            // Save the current state to database
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dbUserRef.current || dbUser),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setDbUserSynced(updatedUser);
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

    const handleCancel = () => {
        // Restore original data
        if (originalDbUser) {
            setDbUserSynced(originalDbUser);
        }
        // Exit edit mode
        setIsEditMode(false);
        setOriginalDbUser(null);

        // Show cancel toast
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast toast-top toast-center z-50';
        toastDiv.innerHTML = `
            <div class="alert alert-info shadow-lg">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Changes discarded</span>
                </div>
            </div>
        `;
        document.body.appendChild(toastDiv);
        setTimeout(() => toastDiv.remove(), 2000);
    };

    const renderPreferences = (canEdit) => {
        return (
            // Added negative margin top (-mt-2 md:-mt-6) to pull tabs closer to the title
            <div className="w-full -mt-2 md:-mt-6">
                {/* Lightweight Tab Navigation - Top Left */}
                <div className="flex gap-1 mb-8 border-b border-base-200">
                    <button
                        className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2
                            ${preferenceSubTab === 0
                                ? 'border-primary text-primary'
                                : 'border-transparent text-base-content/50 hover:text-base-content hover:border-base-300'
                            }`}
                        onClick={() => setPreferenceSubTab(0)}
                    >
                        <Heart className={`w-4 h-4 ${preferenceSubTab === 0 ? 'fill-primary' : ''}`} />
                        Basic
                    </button>
                    <button
                        className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2
                            ${preferenceSubTab === 1
                                ? 'border-primary text-primary'
                                : 'border-transparent text-base-content/50 hover:text-base-content hover:border-base-300'
                            }`}
                        onClick={() => setPreferenceSubTab(1)}
                    >
                        <Coffee className={`w-4 h-4 ${preferenceSubTab === 1 ? 'fill-primary' : ''}`} />
                        Lifestyle
                    </button>
                    <button
                        className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2
                            ${preferenceSubTab === 2
                                ? 'border-primary text-primary'
                                : 'border-transparent text-base-content/50 hover:text-base-content hover:border-base-300'
                            }`}
                        onClick={() => setPreferenceSubTab(2)}
                    >
                        <Sparkles className={`w-4 h-4 ${preferenceSubTab === 2 ? 'fill-primary' : ''}`} />
                        More
                    </button>
                </div>

                <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                    {preferenceSubTab === 0 ? (
                        <Preference1 dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />
                    ) : preferenceSubTab === 1 ? (
                        <Preference2 dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />
                    ) : (
                        <Preference3 dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        // Only allow editing if viewing own profile
        const canEdit = isOwnProfile && isEditMode;

        switch (active) {
            case "Profile": return <PersonalInfo dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />;
            case "Lifestyle": return <LifeStyle dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />;
            case "Preferences": return renderPreferences(canEdit);
            case "About Me": return <MoreDetails dbUser={dbUser} userId={id} setDbUser={setDbUserSynced} isEditMode={canEdit} />;
            default: return null;
        }
    };

    if (!dbUser) return <Loading />;

    return (
        <div className="h-screen w-full bg-gradient-to-br from-base-200 to-base-300 flex flex-col font-sans overflow-hidden text-base-content">
            <Navbar />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex gap-4 md:gap-8 p-4 md:p-8 items-stretch">

                    {/* Left Sidebar */}
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

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
                        <div className="bg-base-100 flex-1 shadow-xl shadow-base-300/50 border border-base-100 rounded-3xl flex flex-col overflow-hidden h-full relative">
                            
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {/* Header */}
                            <div className="px-6 md:px-10 py-6 border-b border-base-200/60 shrink-0 flex justify-between items-center bg-base-100/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-base-content flex items-center gap-3 tracking-tight">
                                        {active}
                                        {isEditMode && <span className="badge badge-warning badge-sm animate-pulse">Editing</span>}
                                    </h2>
                                    <p className="text-sm font-medium text-base-content/50 mt-1">
                                        {isEditMode ? 'Update your information below.' : getTabDescription(active)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        isEditMode ? (
                                            <>
                                                {/* Cancel Button */}
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="btn btn-sm md:btn-md btn-ghost rounded-full px-6 transition-all duration-300 hover:bg-base-200 text-base-content/70"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Cancel</span>
                                                </button>

                                                {/* Save Button */}
                                                <button
                                                    onClick={handleFinish}
                                                    disabled={isSaving}
                                                    className="btn btn-sm md:btn-md btn-success text-white rounded-full px-6 shadow-success/30 shadow-lg transition-all duration-300"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-sm"></span>
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            <span>Save Changes</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    // Save original data before entering edit mode
                                                    setOriginalDbUser(JSON.parse(JSON.stringify(dbUser)));
                                                    setIsEditMode(true);
                                                }}
                                                className="btn btn-sm md:btn-md btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70 rounded-full px-6 transition-all duration-300"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>
                                        )
                                    ) : (
                                        <div className="badge badge-ghost badge-lg">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Only
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-base-100 relative z-0">
                                <div key={active} className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                                    {renderContent()}
                                </div>
                            </div>

                            {/* Footer */}
                            {isOwnProfile && isEditMode && (
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
                                        {currentIndex < tabs.length - 1 && (
                                            <button
                                                onClick={handleNext}
                                                disabled={isSaving}
                                                className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20 gap-2"
                                            >
                                                <span>Next Step</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        )}
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
