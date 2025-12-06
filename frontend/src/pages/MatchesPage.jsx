import { useEffect, useState, useRef } from "react"; // Added useRef
import { useUser } from "@clerk/clerk-react";
import {
  Heart,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle, // Used in the modal
  Sparkles,
  Home,
  Users,
  MessageCircle,
  ArrowRight,
  Calendar,
  X,
  AlertTriangle // Added for the modal warning
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// --- Sub-Component: Modern Match Card ---
const MatchCard = ({ match, scores, isUpdated, onUnmatch, validationData }) => {
  const mutualScore = scores?.mutualScore ? Math.round(scores.mutualScore * 100) : 0;
  const similarityScore = scores?.similarityScore ? Math.round(scores.similarityScore * 100) : 0;

  // Determine if this is a low match (score <= 50%)
  // Only use validationData if it exists, otherwise default to false (not low match)
  const isLowMatch = validationData?.isLowMatch === true;

  const [isUnmatching, setIsUnmatching] = useState(false);

  // Ref for the modal
  const unmatchModalRef = useRef(null);

  const handleUnmatchClick = () => {
    // Open the modal instead of window.confirm
    unmatchModalRef.current?.showModal();
  };

  const confirmUnmatch = async () => {
    setIsUnmatching(true);
    try {
      await onUnmatch(match.userId);
    } catch (error) {
      console.error("Failed to unmatch:", error);
      setIsUnmatching(false);
    }
  };

  return (
    <>
      <div className={`group relative rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isLowMatch
          ? 'bg-base-200/50 border-base-300 opacity-75 grayscale'
          : 'bg-base-100 border-base-200'
      }`}>

        {/* Top Banner / Status */}
        <div className={`absolute top-0 w-full h-24 bg-gradient-to-r z-0 ${
          isLowMatch
            ? 'from-base-300/20 to-base-300/20'
            : 'from-primary/10 to-secondary/10'
        }`}></div>

        {/* Low Match Badge */}
        {isLowMatch && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 group/badge">
            <div className="bg-warning/90 text-warning-content px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 cursor-help">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Low Match</span>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none">
              <div className="bg-base-100 text-base-content p-3 rounded-lg shadow-xl border border-base-300">
                <p className="text-xs leading-relaxed">
                  <span className="font-bold text-warning">⚠️ Low Compatibility</span>
                  <br />
                  {validationData?.mutualScore ? (
                    <>This user recently updated their profile, resulting in a lower match score of {Math.round(validationData.mutualScore * 100)}%.</>
                  ) : (
                    <>This user's profile changes have resulted in a compatibility score of {mutualScore}% or below. You should remove this user from your matches.</>
                  )}
                </p>
              </div>
              {/* Arrow pointing up */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-100 border-l border-t border-base-300 rotate-45"></div>
            </div>
          </div>
        )}

        {/* Unmatch Button (Triggers Modal) */}
        <button
          onClick={handleUnmatchClick}
          disabled={isUnmatching}
          className="absolute top-3 left-3 z-20 btn btn-ghost btn-xs btn-circle bg-base-200/80 hover:bg-error hover:text-error-content border-none"
          title="Unmatch"
        >
          {isUnmatching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>

        {/* "Just Updated" Badge */}
        {isUpdated && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-purple-200 dark:border-purple-900 pr-3 pl-2 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Updated</span>
            </div>
          </div>
        )}

        <div className="p-5 z-10 flex flex-col h-full">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-4">
            <div className="avatar mb-3 relative">
              <div className="w-24 h-24 rounded-full ring-4 ring-base-100 shadow-lg relative z-10">
                <img
                  src={match.profileImageUrl || `https://ui-avatars.com/api/?name=${match.name}&background=random`}
                  alt={match.name}
                  className="object-cover"
                />
              </div>
              {/* Mutual Heart Icon overlaid on avatar */}
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-base-300 p-1.5 rounded-full shadow-md z-20">
                 <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
            </div>
            
            <h3 className="font-bold text-xl text-base-content leading-tight text-center">
              {match.name || "Anonymous"}
            </h3>
            <p className="text-sm text-base-content/50 font-medium">
              {match.age ? `${match.age} years old` : "Age N/A"}
            </p>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-base-200/50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
               <div className="flex items-center gap-1.5 mb-1">
                  <Home className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-base-content/70">Match</span>
               </div>
               <span className="text-lg font-black text-emerald-600">{mutualScore}%</span>
               <progress className="progress progress-success w-full h-1 mt-1" value={mutualScore} max="100"></progress>
            </div>
            <div className="bg-base-200/50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
               <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-base-content/70">Similar</span>
               </div>
               <span className="text-lg font-black text-blue-600">{similarityScore}%</span>
               <progress className="progress progress-info w-full h-1 mt-1" value={similarityScore} max="100"></progress>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-3 mb-4 flex-grow">
            {match.location && (
              <div className="flex items-center gap-3 text-sm text-base-content/70">
                <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="truncate font-medium">{match.location}</span>
              </div>
            )}

            {(match.minBudget || match.maxBudget) && (
              <div className="flex items-center gap-3 text-sm text-base-content/70">
                <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  ${match.minBudget?.toLocaleString() || 0} - ${match.maxBudget?.toLocaleString() || 0} <span className="text-xs text-base-content/40">/mo</span>
                </span>
              </div>
            )}
            
            {match.lifestyle && (
               <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                     <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                     {match.lifestyle.isNightOwl ? "Night Owl" : "Early Bird"}
                     {match.lifestyle.petFriendly && " • Pets OK"}
                     {match.lifestyle.smoking && " • Smoking OK"}
                  </div>
               </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2 mt-auto pt-4 border-t border-base-200">
             <button 
               className="col-span-1 btn btn-ghost btn-circle bg-base-200 hover:bg-base-300 border-none text-base-content/70"
               title="Send Message"
             >
                <MessageCircle className="w-5 h-5" />
             </button>
             <button 
               onClick={() => window.open(`/user/${match.userId}`, '_blank')}
               className="col-span-4 btn btn-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 border-none group-hover:scale-[1.02] transition-transform"
             >
                View Profile <ArrowRight className="w-4 h-4 ml-1" />
             </button>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <dialog ref={unmatchModalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl">Unmatch with {match.name}?</h3>
            <p className="py-2 text-base-content/70">
              This action cannot be undone. You will lose your connection with this person.
            </p>
          </div>
          
          <div className="modal-action flex justify-center w-full mt-6">
            <form method="dialog" className="flex gap-3 w-full">
              {/* Close Button */}
              <button className="btn btn-ghost flex-1">Cancel</button>
              
              {/* Confirm Button */}
              <button 
                type="button" // Important: prevents form submission
                onClick={confirmUnmatch}
                className="btn btn-error flex-1 text-white"
              >
                Yes, Unmatch
              </button>
            </form>
          </div>
        </div>
        {/* Backdrop to close modal when clicking outside */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

// --- Main Page Component ---
function MatchesPage() {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedScores, setCachedScores] = useState({});
  const [matchValidation, setMatchValidation] = useState({}); // userId -> stillMatches boolean

  // Validate if a match still meets requirements
  const validateMatch = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/matching/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId1: user.id,
          userId2: targetUserId
        })
      });

      const data = await response.json();
      return {
        stillMatches: data.stillMatches,
        isLowMatch: data.isLowMatch,
        mutualScore: data.mutualScore
      };
    } catch (error) {
      console.error("Failed to validate match:", error);
      return { stillMatches: true, isLowMatch: false, mutualScore: 1.0 }; // Default to good match on error
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const eventSource = new EventSource(`${API_URL}/profile-updates/stream`);

    eventSource.addEventListener('profile-update', async (event) => {
      const update = JSON.parse(event.data);

      // Update lastUpdatedAt
      setMatches(prevMatches =>
        prevMatches.map(match =>
          match.userId === update.userId ? { ...match, lastUpdatedAt: new Date().toISOString() } : match
        )
      );

      // Check if this updated user is one of our matches
      const isMatch = matches.some(m => m.userId === update.userId);
      if (isMatch) {
        // Validate if we still match
        const validation = await validateMatch(update.userId);
        setMatchValidation(prev => ({
          ...prev,
          [update.userId]: validation
        }));

        // Also update scores from localStorage (which ExplorePage updates)
        const cached = localStorage.getItem(`matches_${user.id}`);
        if (cached) {
          const cachedMatches = JSON.parse(cached);
          const updatedMatch = cachedMatches.find(m => m.userId === update.userId);
          if (updatedMatch) {
            setCachedScores(prev => ({
              ...prev,
              [update.userId]: {
                mutualScore: updatedMatch.mutualScore,
                similarityScore: updatedMatch.similarityScore
              }
            }));
          }
        }

        if (!validation.isLowMatch) {
          toast.success(`${update.firstName} updated their profile - scores refreshed!`, { icon: '✨' });
        } else {
          toast(`${update.firstName} updated their profile - match score is now low (${Math.round(validation.mutualScore * 100)}%)`, {
            icon: '⚠️',
            duration: 5000
          });
        }
      }
    });

    eventSource.onerror = (error) => {
      console.log('SSE connection error (will auto-reconnect):', error);
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id, matches]);

  useEffect(() => {
    if (user?.id) {
      const cached = localStorage.getItem(`matches_${user.id}`);
      if (cached) {
        const cachedMatches = JSON.parse(cached);
        const scoresMap = {};
        cachedMatches.forEach(match => {
          scoresMap[match.userId] = {
            mutualScore: match.mutualScore,
            similarityScore: match.similarityScore
          };
        });
        setCachedScores(scoresMap);
      }
      fetchMatches();
    }
  }, [user?.id]);

  const fetchMatches = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/likes/mutual/${user.id}`);
      if (res.status === 404) {
        setMatches([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch matches");

      const mutualMatches = (data.mutualMatches || []).map(match => ({
        userId: match.id,
        name: `${match.firstName} ${match.lastName}`,
        age: match.age,
        profileImageUrl: match.profileImageUrl,
        location: match.zipCode,
        minBudget: match.budget?.min,
        maxBudget: match.budget?.max,
        lifestyle: match.lifestyle,
        lastUpdatedAt: match.lastUpdatedAt
      }));
      setMatches(mutualMatches);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isRecentlyUpdated = (lastUpdatedAt) => {
    if (!lastUpdatedAt) return false;
    const diff = new Date() - new Date(lastUpdatedAt);
    return diff / (1000 * 60 * 60) <= 24;
  };

  const handleUnmatch = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/likes/unmatch`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId1: user.id,
          userId2: targetUserId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setMatches(prevMatches => prevMatches.filter(m => m.userId !== targetUserId));

        // Trigger event for current tab and other tabs/windows
        const unmatchEvent = {
          userId: user.id,
          targetUserId: targetUserId,
          timestamp: Date.now()
        };

        // Broadcast to other tabs
        localStorage.setItem('unmatch_event', JSON.stringify(unmatchEvent));

        // Trigger in current tab
        window.dispatchEvent(new CustomEvent('unmatch', { detail: unmatchEvent }));

        toast.success("Successfully unmatched");
      } else {
        throw new Error(data.error || "Failed to unmatch");
      }
    } catch (error) {
      console.error("Failed to unmatch:", error);
      toast.error("Failed to unmatch. Please try again.");
      throw error;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen w-full bg-base-200 flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/60 font-medium animate-pulse">Finding your roommates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-base-200/50 flex flex-col font-sans">
      <Navbar />

      <main className="grow flex flex-col items-center p-4 lg:p-8">
        <div className="w-full max-w-7xl space-y-8">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-base-300">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
                Your Matches
              </h1>
              <p className="text-base-content/60 mt-2 text-lg">
                People who liked you back. <span className="text-primary font-semibold">It's a match!</span>
              </p>
            </div>
            <div className="badge badge-lg badge-ghost p-4 font-medium text-base-content/70">
              {matches.length} {matches.length === 1 ? "Connection" : "Connections"}
            </div>
          </div>

          {/* Error State */}
          {error ? (
            <div className="alert alert-error shadow-lg rounded-2xl max-w-2xl mx-auto">
              <AlertCircle className="stroke-current shrink-0 h-6 w-6" />
              <div>
                <h3 className="font-bold">Error loading matches</h3>
                <div className="text-xs">{error}</div>
              </div>
              <button onClick={fetchMatches} className="btn btn-sm btn-outline">Retry</button>
            </div>
          ) : (
            <>
              {/* Empty State */}
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-base-100 rounded-3xl border border-dashed border-base-300">
                  <div className="bg-base-200 p-6 rounded-full mb-6">
                    <Sparkles className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-base-content mb-2">No matches yet</h3>
                  <p className="text-base-content/50 max-w-md mx-auto mb-8">
                    Don't worry! Keep exploring and liking profiles. When someone likes you back, they'll appear here.
                  </p>
                  <a href="/explore" className="btn btn-primary btn-wide rounded-full">
                    Start Exploring
                  </a>
                </div>
              ) : (
                /* Matches Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {matches.map((match, index) => (
                    <MatchCard
                      key={match.userId || index}
                      match={match}
                      scores={cachedScores[match.userId]}
                      isUpdated={isRecentlyUpdated(match.lastUpdatedAt)}
                      onUnmatch={handleUnmatch}
                      validationData={matchValidation[match.userId]}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default MatchesPage;