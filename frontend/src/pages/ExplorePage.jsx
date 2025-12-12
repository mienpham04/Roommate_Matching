import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  X,
  Home,
  Users,
  Heart,
  ArrowUp,
  Sparkles,
  RefreshCw,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Briefcase,
  UserCircle,
  Search,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function ExplorePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [allMatches, setAllMatches] = useState(() => {
    const cached = localStorage.getItem(`matches_${user?.id}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [displayedMatches, setDisplayedMatches] = useState([]);
  const [error, setError] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(15);
  const [allLimit, setAllLimit] = useState(15);
  const [likedUsers, setLikedUsers] = useState(new Set());
  const [mutualMatchIds, setMutualMatchIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [steps, setSteps] = useState([
    { text: "Getting your profile ID…", done: false },
    { text: "Finding people with similar lifestyles…", done: false },
    { text: "Checking who fits your preferences…", done: false },
    { text: "Analyzing compatibility and merging results…", done: false },
    { text: "Finalizing your matches…", done: false },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredData = (dataList) => {
    if (!searchQuery) return dataList;

    const lowerQuery = searchQuery.toLowerCase();

    return dataList.filter((item) => {
      // Determine if the item is a direct User object or a Match object containing a user
      const person = item.user ? item.user : item;

      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
      const city = (person.city || "").toLowerCase();

      return fullName.includes(lowerQuery) || city.includes(lowerQuery);
    });
  };

  const completeStep = (index) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, done: true } : step)),
    );
  };

  // --- LOGIC: Event Listeners ---
  useEffect(() => {
    if (!user?.id) return;

    const handleStorageChange = (e) => {
      if (e.key === "unmatch_event") {
        const unmatchData = JSON.parse(e.newValue);
        if (unmatchData && unmatchData.userId === user.id) {
          fetchLikedUsers();
          fetchReceivedLikes();
          fetchSentLikes();
          fetchMutualMatches();
        }
      }
    };

    const handleUnmatchEvent = (e) => {
      if (e.detail && e.detail.userId === user.id) {
        fetchLikedUsers();
        fetchReceivedLikes();
        fetchSentLikes();
        fetchMutualMatches();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("unmatch", handleUnmatchEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("unmatch", handleUnmatchEvent);
    };
  }, [user?.id]);

  // --- LOGIC: Fetch Data on Mount ---
  useEffect(() => {
    if (user?.id) {
      fetchCurrentUser();
      if (allMatches.length === 0) {
        fetchMatches();
      } else {
        setLoading(false);
      }
      fetchLikedUsers();
      fetchReceivedLikes();
      fetchSentLikes();
      fetchMutualMatches();
      fetchAllUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  // --- LOGIC: SSE Updates ---
  useEffect(() => {
    if (!user?.id) return;
    const eventSource = new EventSource(`${API_URL}/profile-updates/stream`);

    eventSource.addEventListener("profile-update", async (event) => {
      const update = JSON.parse(event.data);

      // Use callback form to get latest state without dependency on allMatches
      setAllMatches((prevMatches) => {
        // Check if the updated user is in our matches
        const isInMatches = prevMatches.some((m) => m.userId === update.userId);

        if (!isInMatches) {
          return prevMatches; // No changes needed
        }

        // Fetch updated scores for this specific user
        (async () => {
          try {
            const [similarResponse, mutualResponse] = await Promise.all([
              fetch(`${API_URL}/matching/similar/${user.id}?topK=1000`),
              fetch(
                `${API_URL}/matching/mutual/ultrafast/${user.id}?topK=1000`,
              ),
            ]);

            if (similarResponse.ok && mutualResponse.ok) {
              const similarData = await similarResponse.json();
              const mutualData = await mutualResponse.json();

              const similarMatches = similarData.matches || [];
              const mutualMatches = mutualData.matches || [];

              // Find the updated user's new scores
              const updatedSimilar = similarMatches.find(
                (m) => m.userId === update.userId,
              );
              const updatedMutual = mutualMatches.find(
                (m) => m.userId === update.userId,
              );

              if (updatedSimilar || updatedMutual) {
                // Update the match with new scores
                setAllMatches((currentMatches) => {
                  const updated = currentMatches.map((match) => {
                    if (match.userId === update.userId) {
                      return {
                        ...match,
                        mutualScore:
                          updatedMutual?.mutualScore ?? match.mutualScore,
                        similarityScore:
                          updatedSimilar?.similarityScore ??
                          match.similarityScore,
                        user: {
                          ...match.user,
                          lastUpdatedAt: new Date().toISOString(),
                        },
                      };
                    }
                    return match;
                  });

                  // Update localStorage with new scores
                  localStorage.setItem(
                    `matches_${user.id}`,
                    JSON.stringify(updated),
                  );
                  return updated;
                });

                toast.success(
                  `${update.firstName} updated their profile - scores refreshed!`,
                  { icon: "✨" },
                );
              } else {
                // User no longer meets criteria - just update timestamp
                setAllMatches((currentMatches) => {
                  const updated = currentMatches.map((match) => {
                    if (match.userId === update.userId) {
                      return {
                        ...match,
                        user: {
                          ...match.user,
                          lastUpdatedAt: new Date().toISOString(),
                        },
                      };
                    }
                    return match;
                  });
                  localStorage.setItem(
                    `matches_${user.id}`,
                    JSON.stringify(updated),
                  );
                  return updated;
                });
                toast(`${update.firstName} updated their profile`, {
                  icon: "⚠️",
                });
              }
            }
          } catch (error) {
            console.error("Failed to recompute match scores:", error);
            // Fallback to just updating timestamp
            setAllMatches((currentMatches) => {
              const updated = currentMatches.map((match) => {
                if (match.userId === update.userId) {
                  return {
                    ...match,
                    user: {
                      ...match.user,
                      lastUpdatedAt: new Date().toISOString(),
                    },
                  };
                }
                return match;
              });
              localStorage.setItem(
                `matches_${user.id}`,
                JSON.stringify(updated),
              );
              return updated;
            });
            toast.success(`${update.firstName} just updated their profile!`, {
              icon: "✨",
            });
          }
        })();

        return prevMatches; // Return current state immediately
      });
    });

    eventSource.onerror = (error) => {
      console.log("SSE connection error (will auto-reconnect):", error);
    };

    return () => eventSource.close();
  }, [user]);

  // --- LOGIC: Fetch Functions ---
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) {
        const userData = await response.json();
        console.log("Current user data:", userData);
        console.log("City:", userData.city);
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        const users = await response.json();
        // Filter out current user and sort by lastUpdatedAt (most recent first)
        const filteredUsers = users
          .filter((u) => u.id !== user.id)
          .sort((a, b) => {
            // Handle cases where dates might be null/undefined
            const dateA = a.lastUpdatedAt || a.createdAt || 0;
            const dateB = b.lastUpdatedAt || b.createdAt || 0;

            // If both have dates, sort by date (most recent first)
            if (dateA && dateB) {
              return new Date(dateB) - new Date(dateA);
            }
            // If only one has a date, prioritize the one with a date
            if (dateA) return -1;
            if (dateB) return 1;
            // If neither has a date, maintain original order
            return 0;
          });
        setAllUsers(filteredUsers);
      }
    } catch (err) {
      console.error("Failed to fetch all users:", err);
    }
  };

  const fetchMutualMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/likes/mutual/${user.id}`);
      if (response.status === 404) {
        setMutualMatchIds(new Set());
        return;
      }
      const data = await response.json();
      if (data.success) {
        const ids = (data.mutualMatches || []).map((match) => match.id);
        setMutualMatchIds(new Set(ids));
      }
    } catch (err) {
      console.error("Failed to fetch mutual matches:", err);
    }
  };

  const fetchLikedUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/likes/sent/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setLikedUsers(new Set(data.likedUserIds));
      }
    } catch (err) {
      console.error("Failed to fetch liked users:", err);
    }
  };

  const fetchReceivedLikes = async () => {
    try {
      const res = await fetch(`${API_URL}/likes/received/${user.id}`);
      if (res.status === 404) {
        setReceivedLikes([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        const likerIds = data.likerIds || [];
        const cachedMatches = localStorage.getItem(`matches_${user.id}`);
        const cached = cachedMatches ? JSON.parse(cachedMatches) : [];
        const updatedCache = [...cached];

        const likersWithDetails = await Promise.all(
          likerIds.map(async (likerId) => {
            try {
              const userRes = await fetch(`${API_URL}/users/${likerId}`);
              if (!userRes.ok) return null;

              const userData = await userRes.json();

              // Try to reuse cached scores for consistency with matches page
              const cachedEntry = cached.find((m) => m.userId === likerId);
              let mutualScore = cachedEntry?.mutualScore;
              let similarityScore = cachedEntry?.similarityScore;

              // If no cached scores, fetch fresh validation (same API used on Matches page)
              if (mutualScore === undefined || similarityScore === undefined) {
                try {
                  const scoreRes = await fetch(`${API_URL}/matching/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId1: user.id,
                      userId2: likerId,
                    }),
                  });
                  if (scoreRes.ok) {
                    const scoreData = await scoreRes.json();
                    mutualScore = scoreData.mutualScore ?? 0;
                    similarityScore = scoreData.similarityScore ?? 0;

                    // Persist in local cache so both pages see the same numbers
                    const cacheIndex = updatedCache.findIndex(
                      (m) => m.userId === likerId,
                    );
                    if (cacheIndex >= 0) {
                      updatedCache[cacheIndex] = {
                        ...updatedCache[cacheIndex],
                        mutualScore,
                        similarityScore,
                      };
                    } else {
                      updatedCache.push({
                        userId: likerId,
                        mutualScore,
                        similarityScore,
                        user: userData,
                      });
                    }
                  }
                } catch (scoreErr) {
                  console.error(
                    "Failed to fetch validation scores for liker",
                    likerId,
                    scoreErr,
                  );
                }
              }

              return {
                userId: userData.id,
                user: userData,
                isMutualMatch: likedUsers.has(likerId),
                mutualScore,
                similarityScore,
              };
            } catch (err) {
              return null;
            }
          }),
        );

        // Update shared cache if we added any scores
        localStorage.setItem(
          `matches_${user.id}`,
          JSON.stringify(updatedCache),
        );

        setReceivedLikes(likersWithDetails.filter((match) => match !== null));
      }
    } catch (err) {
      console.error("Failed to fetch received likes:", err);
    }
  };

  const fetchSentLikes = async () => {
    try {
      const res = await fetch(`${API_URL}/likes/sent/${user.id}`);
      if (res.status === 404) {
        setSentLikes([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        const likedUserIds = data.likedUserIds || [];
        const cachedMatches = localStorage.getItem(`matches_${user.id}`);
        const cached = cachedMatches ? JSON.parse(cachedMatches) : [];
        const updatedCache = [...cached];

        const likedUsersWithDetails = await Promise.all(
          likedUserIds.map(async (likedId) => {
            try {
              const userRes = await fetch(`${API_URL}/users/${likedId}`);
              if (!userRes.ok) return null;

              const userData = await userRes.json();

              // Try to reuse cached scores for consistency
              const cachedEntry = cached.find((m) => m.userId === likedId);
              let mutualScore = cachedEntry?.mutualScore;
              let similarityScore = cachedEntry?.similarityScore;

              // If no cached scores, fetch fresh validation
              if (mutualScore === undefined || similarityScore === undefined) {
                try {
                  const scoreRes = await fetch(`${API_URL}/matching/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId1: user.id,
                      userId2: likedId,
                    }),
                  });
                  if (scoreRes.ok) {
                    const scoreData = await scoreRes.json();
                    mutualScore = scoreData.mutualScore ?? 0;
                    similarityScore = scoreData.similarityScore ?? 0;

                    // Persist in local cache
                    const cacheIndex = updatedCache.findIndex(
                      (m) => m.userId === likedId,
                    );
                    if (cacheIndex >= 0) {
                      updatedCache[cacheIndex] = {
                        ...updatedCache[cacheIndex],
                        mutualScore,
                        similarityScore,
                      };
                    } else {
                      updatedCache.push({
                        userId: likedId,
                        mutualScore,
                        similarityScore,
                        user: userData,
                      });
                    }
                  }
                } catch (scoreErr) {
                  console.error(
                    "Failed to fetch validation scores for sent like",
                    likedId,
                    scoreErr,
                  );
                }
              }

              return {
                userId: userData.id,
                user: userData,
                isMutualMatch: false,
                mutualScore,
                similarityScore,
              };
            } catch (err) {
              return null;
            }
          }),
        );

        // Update shared cache if we added any scores
        localStorage.setItem(
          `matches_${user.id}`,
          JSON.stringify(updatedCache),
        );

        setSentLikes(likedUsersWithDetails.filter((match) => match !== null));
      }
    } catch (err) {
      console.error("Failed to fetch sent likes:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentLimit(5);
      setSteps((prev) => prev.map((s) => ({ ...s, done: false })));

      completeStep(0);
      const userId = user.id;
      completeStep(1);

      const similarResponse = await fetch(
        `${API_URL}/matching/similar/${userId}?topK=1000`,
      );
      if (!similarResponse.ok)
        throw new Error("Failed to fetch similar matches");
      const similarData = await similarResponse.json();
      completeStep(2);

      const mutualResponse = await fetch(
        `${API_URL}/matching/mutual/ultrafast/${userId}?topK=1000`,
      );
      if (!mutualResponse.ok)
        throw new Error("Failed to fetch roommate potential");
      const mutualData = await mutualResponse.json();
      completeStep(3);

      const similarMatches = similarData.matches || [];
      const mutualMatches = mutualData.matches || [];
      const matchMap = new Map();

      mutualMatches.forEach((m) => {
        matchMap.set(m.userId, {
          ...m,
          mutualScore: m.mutualScore,
          isMutualMatch: true,
        });
      });

      similarMatches.forEach((m) => {
        if (matchMap.has(m.userId)) {
          const existing = matchMap.get(m.userId);
          matchMap.set(m.userId, {
            ...existing,
            similarityScore: m.similarityScore,
          });
        } else {
          matchMap.set(m.userId, {
            ...m,
            similarityScore: m.similarityScore,
            isMutualMatch: false,
          });
        }
      });

      let combined = Array.from(matchMap.values())
        .filter(
          (match) =>
            match.mutualScore !== undefined &&
            match.similarityScore !== undefined,
        )
        .sort((a, b) => (b.mutualScore || 0) - (a.mutualScore || 0));

      completeStep(4);
      setAllMatches(combined);
      localStorage.setItem(`matches_${user.id}`, JSON.stringify(combined));
      completeStep(5);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter out users who are already mutual matches
    const filteredMatches = allMatches.filter(
      (match) => !mutualMatchIds.has(match.userId),
    );
    setDisplayedMatches(filteredMatches.slice(0, currentLimit));
  }, [allMatches, currentLimit, mutualMatchIds]);

  const loadMore = () => {
    setCurrentLimit((prev) => prev + 5);
  };

  const loadMoreAll = () => {
    setAllLimit((prev) => prev + 15);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    return `$${budget.min} - $${budget.max}`;
  };

  const toggleLike = async (targetUserId) => {
    const isLiked = likedUsers.has(targetUserId);
    try {
      if (isLiked) {
        const response = await fetch(`${API_URL}/likes`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromUserId: user.id, toUserId: targetUserId }),
        });
        const data = await response.json();
        if (data.success) {
          setLikedUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(targetUserId);
            return newSet;
          });
          toast.success("Like removed");
          fetchSentLikes();
          fetchReceivedLikes();
          fetchMutualMatches();
        }
      } else {
        const response = await fetch(`${API_URL}/likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromUserId: user.id, toUserId: targetUserId }),
        });
        const data = await response.json();
        if (data.success) {
          setLikedUsers((prev) => new Set([...prev, targetUserId]));
          if (data.isMutual) {
            toast.success("🎉 It's a match!", { duration: 5000 });
            // Refetch mutual matches to update the filtered list
            fetchMutualMatches();
          } else {
            toast.success("Like sent!");
          }
          fetchSentLikes();
          fetchReceivedLikes();
        }
      }
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  const isRecentlyUpdated = (lastUpdatedAt) => {
    if (!lastUpdatedAt) return false;
    const updatedTime = new Date(lastUpdatedAt);
    const now = new Date();
    const hoursDiff = (now - updatedTime) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  // --- SUB-COMPONENT: User Card ---
  const UserCard = ({ match, type }) => {
    const person = match.user;
    const isLiked = likedUsers.has(match.userId);
    const mutualScore = match.mutualScore
      ? Math.round(match.mutualScore * 100)
      : 0;
    const similarityScore = match.similarityScore
      ? Math.round(match.similarityScore * 100)
      : 0;
    const showScores =
      type !== "all" &&
      (match.mutualScore !== undefined || match.similarityScore !== undefined);

    // Determine Card Theme colors
    let themeColor = "text-primary";
    let themeBg = "bg-primary";
    let themeBorder = "border-primary";

    if (match.isMutualMatch) {
      themeColor = "text-emerald-500";
      themeBg = "bg-emerald-500";
      themeBorder = "border-emerald-200";
    } else {
      themeColor = "text-indigo-500";
      themeBg = "bg-indigo-500";
      themeBorder = "border-indigo-200";
    }

    return (
      <div
        onClick={() => setSelected(match)}
        className="group relative bg-base-100 rounded-3xl border border-base-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
      >
        {/* Top Decorative Gradient */}
        <div
          className={`absolute top-0 w-full h-24 opacity-10 ${themeBg.replace("text", "bg")} bg-gradient-to-b from-current to-transparent`}
        ></div>

        {/* --- Header Actions --- */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {/* Remove Button (Only for Explore) */}
          {type === "explore" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAllMatches((prev) =>
                  prev.filter((m) => m.userId !== match.userId),
                );
              }}
              className="btn btn-circle btn-xs btn-ghost bg-base-100/50 hover:bg-base-200 text-base-content/50"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* --- Badges --- */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {match.isMutualMatch ? (
            <div className="backdrop-blur-md bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Home className="size-3.5 text-emerald-600 fill-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                Best Match
              </span>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-indigo-100/80 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Users className="size-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                Similar
              </span>
            </div>
          )}

          {isRecentlyUpdated(person.lastUpdatedAt) && (
            <div className="backdrop-blur-md bg-purple-100/80 border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
              <Sparkles className="size-3.5 text-purple-600" />
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                New Update
              </span>
            </div>
          )}

          {/* Specific badges for Likes tabs */}
          {type === "received" && (
            <div className="backdrop-blur-md bg-pink-100/80 border border-pink-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Heart className="size-3.5 text-pink-500 fill-pink-500" />
              <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wide">
                Likes You
              </span>
            </div>
          )}
          {type === "sent" && (
            <div className="backdrop-blur-md bg-base-200/80 border border-base-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <ArrowUp className="size-3.5 text-base-content/70" />
              <span className="text-[10px] font-bold text-base-content/70 uppercase tracking-wide">
                Sent
              </span>
            </div>
          )}
        </div>

        {/* --- Profile Content --- */}
        <div className="pt-14 px-6 pb-6 flex flex-col h-full relative z-10">
          {/* Avatar */}
          <div className="self-center mb-4 relative group-hover:scale-105 transition-transform duration-300">
            <div
              className={`w-28 h-28 rounded-full p-1 border-2 ${themeBorder} bg-base-100 shadow-xl`}
            >
              <img
                src={
                  person.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}`
                }
                alt={person.firstName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Age Badge */}
            <div className="absolute bottom-1 right-0 bg-base-100 border border-base-200 shadow-md px-2 py-0.5 rounded-lg text-xs font-bold text-base-content/80">
              {calculateAge(person.dateOfBirth)}
            </div>
          </div>

          {/* Name & Loc */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-base-content tracking-tight leading-tight">
              {person.firstName} {person.lastName}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-xs font-medium text-base-content/50 uppercase tracking-wider">
              <MapPin className="size-3" />
              {person.city || "Unknown Loc"}
            </div>
          </div>

          {/* Stats Bars - hidden on All Users tab */}
          {showScores && (
            <div className="space-y-3 mb-6 bg-base-200/50 p-4 rounded-2xl">
              {match.mutualScore !== undefined && (
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Home className="size-3" /> Roommate Fit
                    </span>
                    <span className="text-emerald-600">{mutualScore}%</span>
                  </div>
                  <progress
                    className="progress progress-success w-full h-2"
                    value={mutualScore}
                    max="100"
                  ></progress>
                </div>
              )}
              {match.similarityScore !== undefined && (
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Users className="size-3" /> Lifestyle
                    </span>
                    <span className="text-indigo-600">{similarityScore}%</span>
                  </div>
                  <progress
                    className="progress progress-info w-full h-2"
                    value={similarityScore}
                    max="100"
                  ></progress>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto pt-4 border-t border-base-200/60">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(match.userId);
              }}
              className={`btn btn-block rounded-xl border-none shadow-md transition-all duration-300 ${
                isLiked
                  ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                  : "bg-base-100 border border-base-300 text-base-content hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
              }`}
            >
              <Heart className={`size-5 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? (type === "sent" ? "Unlike" : "Matched") : "Like"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200/30 relative font-sans">
      <Navbar />

      {/* --- LOADING STATE --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-base-100 p-8 rounded-3xl shadow-xl max-w-md w-full border border-base-200">
            <h2 className="text-2xl font-black mb-6 text-center text-primary">
              Finding Your Crew
            </h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-success/20 text-success" : "bg-base-200"}`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <span className="loading loading-spinner loading-xs text-base-content/30"></span>
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium transition-colors ${step.done ? "text-base-content" : "text-base-content/40"}`}
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ERROR STATE --- */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="alert alert-error shadow-lg rounded-2xl">
            <span>Error loading matches: {error}</span>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      {!loading && !error && user && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 relative">
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-base-200 pb-4">
            {/* Left: Title & Context */}
            <div className="shrink-0">
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
                Explore
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm font-medium text-base-content/60">
                {currentUser?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {currentUser.city}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Search Bar (Expands on mobile, fixed on desktop) */}
            <div className="w-full md:max-w-xs relative md:self-end md:mx-auto md:mr-4 md:h-[48px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="size-4 text-base-content/40" />
              </div>
              <input
                type="text"
                placeholder="Search name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full h-[48px] pl-10 pr-10 text-base rounded-lg bg-base-100 focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Right: Tabs & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              {/* FIXED WIDTH TABS */}
              <div className="bg-base-100 p-1 rounded-xl border border-base-200 shadow-sm w-full md:min-w-[480px]">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "all", label: "All", icon: UserCircle },
                    { id: "explore", label: "For You", icon: Sparkles },
                    {
                      id: "likes",
                      label: "Likes",
                      icon: Heart,
                      count: receivedLikes.length,
                    },
                    {
                      id: "sent",
                      label: "Sent",
                      icon: ArrowUp,
                      count: sentLikes.length,
                    },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSearchQuery(""); // Optional: Clear search when switching tabs
                        }}
                        className={`
                relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors duration-200
                ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                }
              `}
                      >
                        <tab.icon className="size-4" strokeWidth={2.5} />
                        <span className="truncate">{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span
                            className={`
                  ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold
                  ${isActive ? "bg-primary text-white" : "bg-base-300 text-base-content/60"}
                `}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* --- LEGEND BAR + REFRESH --- */}
          <div className="h-8 mb-6 flex items-center justify-between">
            {activeTab === "explore" ? (
              // Show Legend for Explore Tab
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-base-content/60 animate-in fade-in zoom-in-95 duration-200">
                <span className="uppercase tracking-wider font-bold text-base-content/40 text-[10px]">
                  Match Types:
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-emerald-700">Roommate Fit</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-indigo-700">Lifestyle</span>
                </div>
              </div>
            ) : (
              // Show simple text (or empty spacer) for other tabs to hold the height
              <div className="text-xs font-medium text-base-content/40 italic animate-in fade-in zoom-in-95 duration-200">
                {activeTab === "all" && "Browsing all community members"}
                {activeTab === "likes" && "People who liked your profile"}
                {activeTab === "sent" && "People you have reached out to"}
              </div>
            )}

            {activeTab === "explore" && (
              <button
                onClick={fetchMatches}
                disabled={loading}
                className="btn btn-circle btn-ghost border border-base-200 bg-base-100 shadow-sm"
                title="Refresh matches"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin text-primary" : "text-base-content/70"}`}
                />
              </button>
            )}
          </div>

          {/* --- CONTENT AREA --- */}
          {/* --- CONTENT AREA --- */}

          {/* 1. All Users Tab */}
          {activeTab === "all" &&
            (() => {
              // LOGIC: If searching, filter ALL users. If not, use sliced/paginated list.
              const dataToShow = searchQuery
                ? getFilteredData(allUsers)
                : allUsers.slice(0, allLimit);

              return (
                <>
                  {dataToShow.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl border border-dashed border-base-300">
                      <div className="bg-base-200 p-4 rounded-full mb-3">
                        {searchQuery ? (
                          <Search className="size-6 text-base-content/40" />
                        ) : (
                          <UserCircle className="size-6 text-base-content/40" />
                        )}
                      </div>
                      <p className="text-base-content/60 font-medium">
                        {searchQuery
                          ? `No users found matching "${searchQuery}"`
                          : "No users found."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {dataToShow.map((userItem) => (
                          <UserCard
                            key={userItem.id}
                            match={{
                              userId: userItem.id,
                              user: userItem,
                              mutualScore: 0,
                              similarityScore: 0,
                            }}
                            type="all"
                          />
                        ))}
                      </div>
                      {/* Show Load More only if NOT searching and there are more items */}
                      {!searchQuery && allUsers.length > allLimit && (
                        <div className="flex justify-center mt-10">
                          <button
                            className="btn btn-outline btn-sm rounded-full px-6"
                            onClick={loadMoreAll}
                          >
                            Load More
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}

          {/* 2. Suggestions (For You) Tab */}
          {activeTab === "explore" &&
            (() => {
              // LOGIC: If searching, filter ALL matches. If not, use displayedMatches (paginated).
              // Note: We filter out mutual matches first to keep the logic consistent with your original code.
              const baseList = allMatches.filter(
                (m) => !mutualMatchIds.has(m.userId),
              );
              const dataToShow = searchQuery
                ? getFilteredData(baseList)
                : displayedMatches;

              return (
                <>
                  {dataToShow.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl border border-dashed border-base-300">
                      <div className="bg-base-200 p-4 rounded-full mb-3">
                        {searchQuery ? (
                          <Search className="size-6 text-base-content/40" />
                        ) : (
                          <Users className="size-6 text-base-content/40" />
                        )}
                      </div>
                      <p className="text-base-content/60 font-medium">
                        {searchQuery
                          ? `No matches found matching "${searchQuery}"`
                          : "No matches found yet."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {dataToShow.map((match) => (
                          <UserCard
                            key={match.userId}
                            match={match}
                            type="explore"
                          />
                        ))}
                      </div>

                      {/* Show Load More only if NOT searching and there are more items */}
                      {!searchQuery &&
                        displayedMatches.length < baseList.length && (
                          <div className="flex justify-center mt-10">
                            <button
                              className="btn btn-outline btn-sm rounded-full px-6"
                              onClick={loadMore}
                            >
                              Load More
                            </button>
                          </div>
                        )}
                    </>
                  )}
                </>
              );
            })()}

          {/* 3. Likes Received Tab */}
          {activeTab === "likes" &&
            (() => {
              const dataToShow = getFilteredData(receivedLikes);
              return (
                <>
                  {dataToShow.length === 0 ? (
                    <div className="text-center py-20">
                      {searchQuery ? (
                        <>
                          <Search className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                          <p className="text-base-content/50">
                            No likes match your search.
                          </p>
                        </>
                      ) : (
                        <>
                          <Heart className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                          <p className="text-base-content/50">
                            No new likes yet.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {dataToShow.map((match) => (
                        <UserCard
                          key={match.userId}
                          match={match}
                          type="received"
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

          {/* 4. Sent Likes Tab */}
          {activeTab === "sent" &&
            (() => {
              const dataToShow = getFilteredData(sentLikes);
              return (
                <>
                  {dataToShow.length === 0 ? (
                    <div className="text-center py-20">
                      {searchQuery ? (
                        <>
                          <Search className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                          <p className="text-base-content/50">
                            No sent likes match your search.
                          </p>
                        </>
                      ) : (
                        <>
                          <ArrowUp className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                          <p className="text-base-content/50">
                            No sent likes yet.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {dataToShow.map((match) => (
                        <UserCard
                          key={match.userId}
                          match={match}
                          type="sent"
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
        </div>
      )}

      {/* --- SLIDE-OVER DETAILS PANEL --- */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setSelected(null)}
          ></div>

          <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-base-100 shadow-2xl z-[70] overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Modal Header (Simple Version) */}
            <div className="p-6 bg-base-100 shrink-0 relative border-b border-base-200">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm"
                onClick={() => setSelected(null)}
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col items-center pt-4">
                {/* Small Profile Image */}
                <img
                  src={
                    selected.user.profileImageUrl ||
                    `https://ui-avatars.com/api/?name=${selected.user.firstName}+${selected.user.lastName}`
                  }
                  alt={selected.user.firstName}
                  className="w-24 h-24 rounded-full object-cover shadow-lg mb-4 border-4 border-base-100"
                />
                {/* Name & Details */}
                <h2 className="text-2xl font-black text-base-content text-center">
                  {selected.user.firstName} {selected.user.lastName}
                </h2>
                <p className="text-base-content/70 font-medium text-center mt-1">
                  {calculateAge(selected.user.dateOfBirth)} years old •{" "}
                  {selected.user.zipCode || "No Location"}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8 grow">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl text-center border border-emerald-100 dark:border-emerald-900/30">
                  <Home className="size-6 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-emerald-600">
                    {Math.round((selected.mutualScore || 0) * 100)}%
                  </div>
                  <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-wide">
                    Roommate Fit
                  </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900/30">
                  <Users className="size-6 text-indigo-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-indigo-600">
                    {Math.round((selected.similarityScore || 0) * 100)}%
                  </div>
                  <div className="text-xs font-bold text-indigo-600/70 uppercase tracking-wide">
                    Lifestyle
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> About Me
                </h3>
                <p className="text-base-content/70 leading-relaxed bg-base-200/50 p-4 rounded-2xl">
                  {selected.user.moreAboutMe ||
                    "This user hasn't written a bio yet."}
                </p>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="size-4 text-primary" /> Essentials
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-base-200/50 rounded-xl">
                    <span className="text-xs text-base-content/50 uppercase font-bold block mb-1">
                      Budget
                    </span>
                    <span className="font-semibold">
                      {formatBudget(selected.user.budget)}{" "}
                      <span className="text-xs text-base-content/50">/mo</span>
                    </span>
                  </div>
                  <div className="p-3 bg-base-200/50 rounded-xl">
                    <span className="text-xs text-base-content/50 uppercase font-bold block mb-1">
                      Gender
                    </span>
                    <span className="font-semibold capitalize">
                      {selected.user.gender || "Not specified"}
                    </span>
                  </div>
                  <div className="p-3 bg-base-200/50 rounded-xl">
                    <span className="text-xs text-base-content/50 uppercase font-bold block mb-1">
                      Pets
                    </span>
                    <span className="font-semibold">
                      {selected.user.lifestyle?.petFriendly
                        ? "🐶 Pet Friendly"
                        : "🚫 No Pets"}
                    </span>
                  </div>
                  <div className="p-3 bg-base-200/50 rounded-xl">
                    <span className="text-xs text-base-content/50 uppercase font-bold block mb-1">
                      Smoking
                    </span>
                    <span className="font-semibold">
                      {selected.user.lifestyle?.smoking
                        ? "🚬 Smoker"
                        : "🚭 Non-smoker"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifestyle */}
              {selected.user.lifestyle && (
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Calendar className="size-4 text-primary" /> Routine
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="badge badge-lg p-4 bg-base-200 border-base-300 gap-2">
                      {selected.user.lifestyle.nightOwl
                        ? "🌙 Night Owl"
                        : "☀️ Early Bird"}
                    </div>
                    <div className="badge badge-lg p-4 bg-base-200 border-base-300 gap-2">
                      Guests: {selected.user.lifestyle.guestFrequency || "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-6 border-t border-base-200 bg-base-100/80 backdrop-blur-md sticky bottom-0 z-10 flex gap-3">
              <button
                onClick={() => alert("Opening chat...")}
                className="btn btn-outline flex-1 rounded-xl"
              >
                <MessageCircle className="size-5" /> Message
              </button>
              <button
                onClick={() => {
                  toggleLike(selected.userId);
                  setSelected(null);
                }}
                className={`btn flex-1 rounded-xl shadow-lg border-none ${
                  likedUsers.has(selected.userId)
                    ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                    : "btn-primary text-white"
                }`}
              >
                <Heart
                  className={`size-5 ${likedUsers.has(selected.userId) ? "fill-current" : ""}`}
                />
                {likedUsers.has(selected.userId) ? "Unlike" : "Like Profile"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExplorePage;
