import { useState, useEffect } from "react";
import { MessageSquare, Save, Sparkles, Plus, Quote, Eraser } from "lucide-react";
import toast from "react-hot-toast";

function Preference3({ dbUser, userId, setDbUser, isEditMode = true }) {
  // Initialize state safely. (null || "") results in ""
  const [moreAboutMe, setMoreAboutMe] = useState(
    dbUser?.preferences?.moreAboutMe || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Suggestions Data
  const suggestions = [
    "LGBTQ+ Friendly 🏳️‍🌈",
    "Early bird ☀️",
    "Night owl 🌙",
    "Cannabis friendly 🌿",
    "I have guests over often 🥂",
    "I prefer a quiet home 🤫",
    "I love cooking together 🍳",
    "Clean freak ✨",
    "Gamer 🎮",
    "Musician 🎸",
    "Student friendly 📚",
    "Work from home 💻",
    "Eco-conscious ♻️",
    "Love board games 🎲"
  ];

  // Sync local state if dbUser updates
  useEffect(() => {
    // FIX: Ensure we default to "" if the value is null or undefined
    if (dbUser?.preferences) {
      setMoreAboutMe(dbUser.preferences.moreAboutMe || "");
    }
  }, [dbUser]);

  // --- SAVE FUNCTION ---
  const saveToDB = async () => {
    setIsSaving(true);

    const mergedPreferences = {
      ...dbUser?.preferences, 
      moreAboutMe: moreAboutMe, 
    };

    const updatedUser = {
      ...dbUser,
      preferences: mergedPreferences,
    };

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setDbUser(updatedUser); 
        toast.success("Preferences saved successfully!");
      } else {
        const errorText = await res.text();
        console.error("Failed saving preferences:", errorText);
        toast.error("Failed to save changes.");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when user leaves the text area
  const handleBlur = () => {
    if (isEditMode) {
      saveToDB();
    }
  };

  const appendSuggestion = (text) => {
    if (!isEditMode) return;
    
    setMoreAboutMe((prev) => {
      // FIX: Ensure prev is a string before checking includes
      const currentText = prev || ""; 
      if (currentText.includes(text)) return currentText;
      const prefix = currentText.length > 0 && !currentText.endsWith("\n") && !currentText.endsWith(" ") ? ", " : "";
      return currentText + prefix + text;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-base-200 pb-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-base-content">
              The "Vibe" Check
            </h3>
            <p className="text-base-content/60 font-medium">
              What else matters to you? Be specific!
            </p>
          </div>
        </div>
        
        {/* Save Status Indicator */}
        {isEditMode && (
          <div className={`flex items-center gap-2 text-sm font-bold transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
            <span className="loading loading-spinner loading-xs text-primary"></span>
            <span className="text-primary">Saving changes...</span>
          </div>
        )}
      </div>

      {/* --- EDIT MODE --- */}
      {isEditMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-4">
             <div className="relative group">
                <textarea
                  className="textarea w-full h-64 text-lg leading-relaxed bg-base-100 border-2 border-base-200 focus:border-primary/50 focus:outline-none rounded-3xl p-6 shadow-sm resize-none transition-all placeholder:text-base-content/20"
                  placeholder="Tell us about your ideal living situation. E.g., 'I value a quiet home during the week, but love hosting dinner parties on weekends...'"
                  // FIX: Use || "" to prevent uncontrolled input warning if state is momentarily null
                  value={moreAboutMe || ""}
                  onChange={(e) => setMoreAboutMe(e.target.value)}
                  onBlur={handleBlur} 
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  {(moreAboutMe || "").length > 0 && (
                     <button 
                       onClick={() => setMoreAboutMe("")}
                       className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                       title="Clear all"
                     >
                       <Eraser className="w-3 h-3" /> Clear
                     </button>
                  )}
                  <span className="badge badge-ghost text-xs font-mono">
                    {/* FIX: Safe access to length */}
                    {(moreAboutMe || "").length} chars
                  </span>
                </div>
             </div>
             
             <div className="flex justify-end">
                <button
                  onClick={saveToDB}
                  disabled={isSaving}
                  className="btn btn-primary rounded-xl px-8 shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
             </div>
          </div>

          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-base-200/50 rounded-3xl p-5 border border-base-200">
               <h4 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-secondary" /> Quick Add Tags
               </h4>
               <div className="flex flex-wrap gap-2">
                 {suggestions.map((suggestion, idx) => (
                   <button
                     key={idx}
                     onClick={() => appendSuggestion(suggestion)}
                     className="btn btn-sm btn-outline bg-base-100 border-base-300 hover:border-secondary hover:bg-secondary hover:text-white rounded-xl transition-all duration-200 normal-case font-medium text-xs h-auto py-2"
                   >
                     <Plus className="w-3 h-3 mr-1 opacity-50" />
                     {suggestion}
                   </button>
                 ))}
               </div>
               <p className="text-xs text-base-content/40 mt-4 text-center">
                 Click a tag to add it to your text
               </p>
            </div>
          </div>
        </div>
      ) : (
        /* --- VIEW MODE --- */
        <div className="max-w-3xl mx-auto">
          {moreAboutMe ? (
            <div className="relative">
              <Quote className="absolute -top-4 -left-4 w-10 h-10 text-primary/10 rotate-180" />
              <div className="bg-gradient-to-br from-base-100 to-base-200 p-8 rounded-3xl border border-base-200 shadow-sm relative z-10">
                <p className="text-lg text-base-content leading-loose whitespace-pre-wrap font-medium">
                  {moreAboutMe}
                </p>
              </div>
              <Quote className="absolute -bottom-4 -right-4 w-10 h-10 text-primary/10" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
              <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-base-content/20" />
              </div>
              <h3 className="font-bold text-lg text-base-content/60">No additional details yet</h3>
              <p className="text-sm text-base-content/40 max-w-xs mt-1">
                This user hasn't written a custom bio yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Preference3;