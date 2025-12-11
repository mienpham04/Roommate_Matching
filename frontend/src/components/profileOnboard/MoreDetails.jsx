import { useState, useEffect } from "react";
import { FileText, Sparkles, Quote, Plus, Eraser } from "lucide-react";

function MoreDetails({ dbUser, userId, setDbUser, isEditMode = true }) {
  const [bio, setBio] = useState(dbUser?.moreAboutMe || "");
  
  useEffect(() => {
    if (dbUser) {
      setBio(dbUser.moreAboutMe || "");
    }
  }, [dbUser]);

  useEffect(() => {
    if (isEditMode && dbUser) {
      setDbUser((prev) => ({
        ...prev,
        moreAboutMe: bio,
      }));
    }
  }, [bio, isEditMode]);

  const addTopic = (topic) => {
    if (!isEditMode) return;
    
    setBio((prev) => {
      if (prev.endsWith(topic)) return prev;
      
      const separator = prev.length > 0 && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
      return prev + separator + topic;
    });
  };

  const topics = [
    "I'm a heavy sleeper 😴",
    "I love cooking 🍳",
    "Work from home 💻",
    "Allergic to cats 🐱",
    "Enjoy quiet weekends 📖",
    "Neat and organized ✨",
    "Social drinker 🍷",
    "Gym rat 🏋️‍♂️",
    "Love board games 🎲"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {isEditMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-4">
             <div className="relative group">
                <textarea
                  className="textarea w-full h-72 text-lg leading-relaxed bg-base-100 border-2 border-base-200 focus:border-primary/50 focus:outline-none rounded-3xl p-6 shadow-sm resize-none transition-all placeholder:text-base-content/20"
                  placeholder="E.g. I moved here for work and I'm looking for a chill place. I'm usually out on weekends hiking or visiting friends..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
                
                {/* Character Count & Clear */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                   {bio.length > 0 && (
                     <button 
                       onClick={() => setBio("")}
                       className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                       title="Clear all"
                     >
                       <Eraser className="w-3 h-3" /> Clear
                     </button>
                   )}
                   <div className="badge badge-sm badge-ghost font-mono opacity-60">
                     {bio.length} / 500
                   </div>
                </div>
             </div>
          </div>

          {/* Quick Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-base-200/50 rounded-3xl p-6 border border-base-200 h-full">
               <h4 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-secondary" /> Inspiration
               </h4>
               
               <p className="text-sm text-base-content/60 mb-4">
                 Tap to add these phrases:
               </p>

               <div className="flex flex-wrap gap-2">
                 {topics.map((topic, idx) => (
                   <button
                     key={idx}
                     onClick={() => addTopic(topic)}
                     className="btn btn-sm btn-outline bg-base-100 border-base-300 hover:border-accent hover:bg-accent hover:text-accent-content rounded-xl transition-all duration-200 normal-case font-medium text-xs h-auto py-2"
                   >
                     <Plus className="w-3 h-3 mr-1 opacity-50" />
                     {topic}
                   </button>
                 ))}
               </div>

               <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                 <p className="text-xs text-primary/80 font-medium leading-relaxed">
                   💡 <span className="font-bold">Tip:</span> Users with detailed bios are 2x more likely to find a match in the first week.
                 </p>
               </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- VIEW MODE --- */
        <div className="max-w-3xl mx-auto pt-4">
          {bio ? (
            <div className="relative">
              <Quote className="absolute -top-4 -left-6 w-12 h-12 text-primary/10 rotate-180" />
              <div className="bg-gradient-to-br from-base-100 to-base-200 p-10 rounded-[2rem] border border-base-200 shadow-sm relative z-10">
                <p className="text-xl text-base-content leading-loose font-medium whitespace-pre-wrap">
                  {bio}
                </p>
              </div>
              <Quote className="absolute -bottom-4 -right-6 w-12 h-12 text-primary/10" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
              <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-base-content/20" />
              </div>
              <h3 className="font-bold text-lg text-base-content/60">No bio written yet</h3>
              <p className="text-sm text-base-content/40 max-w-xs mt-1">
                Tell people a little about yourself to get more matches.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MoreDetails;
