import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { X, Home, Users } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function ExplorePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [allMatches, setAllMatches] = useState([]); // All fetched matches
  const [displayedMatches, setDisplayedMatches] = useState([]); // Matches to display
  const [error, setError] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [steps, setSteps] = useState([
    { text: "Getting your profile ID…", done: false },
    { text: "Finding people with similar lifestyles…", done: false },
    { text: "Checking who fits your roommate preferences…", done: false },
    { text: "Analyzing compatibility and merging results…", done: false },
    { text: "Finalizing your matches…", done: false }
  ]);

  const completeStep = (index) => {
    setSteps(prev =>
      prev.map((step, i) =>
        i === index ? { ...step, done: true } : step
      )
    );
  };

  // Fetch matches only when user changes
  useEffect(() => {
    if (user?.id) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Update displayed matches when allMatches or currentLimit changes
  useEffect(() => {
    setDisplayedMatches(allMatches.slice(0, currentLimit));
  }, [allMatches, currentLimit]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentLimit(5); // Reset to initial display limit

      // Reset steps
      setSteps(prev => prev.map(s => ({ ...s, done: false })));

      /* STEP 0 */
      completeStep(0);

      /* STEP 1 — Get user ID from Clerk (no API call needed!) */
      const userId = user.id; // Clerk ID = MongoDB _id
      completeStep(1);

      /* STEP 2 — Fetch similar lifestyles */
      // Fetch a large number to get all possible matches
      const similarResponse = await fetch(
        `${API_URL}/matching/similar/${userId}?topK=1000`
      );
      if (!similarResponse.ok) throw new Error("Failed to fetch similar matches");
      const similarData = await similarResponse.json();
      completeStep(2);

      /* STEP 3 — Fetch roommate potential */
      // Fetch a large number to get all possible matches
      const mutualResponse = await fetch(
        `${API_URL}/matching/mutual/${userId}?topK=1000`
      );
      if (!mutualResponse.ok) throw new Error("Failed to fetch roommate potential");
      const mutualData = await mutualResponse.json();
      completeStep(3);

      /* STEP 4 — Merge results */
      const similarMatches = similarData.matches || [];
      const mutualMatches = mutualData.matches || [];

      // Create a map to merge both scores for each user
      const matchMap = new Map();

      // Add mutual matches to map
      mutualMatches.forEach(m => {
        matchMap.set(m.userId, {
          ...m,
          mutualScore: m.mutualScore,
          isMutualMatch: true,
        });
      });

      // Merge similar matches - add similarity score to existing or create new entry
      similarMatches.forEach(m => {
        if (matchMap.has(m.userId)) {
          // User exists - add similarity score
          const existing = matchMap.get(m.userId);
          matchMap.set(m.userId, {
            ...existing,
            similarityScore: m.similarityScore,
          });
        } else {
          // User only in similar matches - add them
          matchMap.set(m.userId, {
            ...m,
            similarityScore: m.similarityScore,
            isMutualMatch: false,
          });
        }
      });

      // Convert to array and sort by mutualScore (highest first)
      // Store ALL matches without slicing
      let combined = Array.from(matchMap.values())
        .filter(match => match.mutualScore !== undefined && match.similarityScore !== undefined)
        .sort((a, b) => (b.mutualScore || 0) - (a.mutualScore || 0));

      completeStep(4);

      /* STEP 5 — Finalizing */
      setAllMatches(combined);
      completeStep(5);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  // Load more matches by increasing the display limit (no re-fetching)
  const loadMore = () => {
    setCurrentLimit(prev => prev + 5);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    return `$${budget.min} - $${budget.max}`;
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      <Navbar />

    {loading && (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <h2 className="text-xl font-bold mb-4 text-primary">Preparing Your Matches…</h2>

        <div className="w-full max-w-md space-y-3 text-left">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {step.done ? (
                <span className="text-green-600 font-bold text-lg">✓</span>
              ) : (
                <span className="loading loading-spinner loading-sm text-gray-400"></span>
              )}
              <p className={`${step.done ? "text-green-700" : "text-gray-500"}`}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}



      {!loading && error && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="alert alert-error">
            <span>Error loading matches: {error}</span>
          </div>
        </div>
      )}

      {!loading && !error && !user && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="alert alert-info">
            <span>Please sign in to see your roommate matches</span>
          </div>
        </div>
      )}

      {!loading && !error && user && (
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          {/* HEADER */}
          <h1 className="text-center bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-6xl tracking-wider font-black mb-2">
            Explore
          </h1>
          <p className="text-center text-base-content/70 max-w-xl mx-auto">
            Oday believes these people are the best fit to be your hommie
          </p>

          {/* LEGEND */}
          <div className="flex justify-center gap-4 mt-6 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg">
              <Home className="size-5 text-green-600" />
                <span className="text-sm">Roommate Potential (Both interested)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg">
              <Users className="size-5 text-blue-600" />
              <span className="text-sm">Similar Lifestyle</span>
            </div>
          </div>

          {allMatches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-base-content/60 text-lg">No matches found yet. Try updating your profile!</p>
            </div>
          ) : (
            <>
              {/* MATCHES COUNT */}
              <div className="text-center mt-8">
                <p className="text-base-content/70">
                  Showing {displayedMatches.length} of {allMatches.length} {allMatches.length === 1 ? 'match' : 'matches'}
                </p>
              </div>

              {/* PEOPLE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {displayedMatches.map((match) => {
                  const person = match.user;

                  return (
                    <div
                      key={match.userId}
                      className="bg-base-100 rounded-xl shadow border p-4 flex flex-col items-center relative hover:shadow-lg transition-shadow"
                    >
                      {/* REMOVE BUTTON */}
                      <button
                        className="absolute top-3 right-3 bg-base-100 rounded-full shadow p-1 transition-transform duration-200 hover:scale-125 hover:shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove from allMatches - displayedMatches will update automatically
                          setAllMatches(prev => prev.filter(m => m.userId !== match.userId));
                        }}
                      >
                        <X className="size-4 text-gray-600" />
                      </button>

                      {/* Match type icon */}
                      {match.isMutualMatch ? (
                        <div className="absolute top-3 left-3 bg-green-200 p-1 rounded-full shadow-sm" title="Roommate Potential">
                          <Home className="size-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-blue-200 p-1 rounded-full shadow-sm" title="Similar Lifestyle">
                          <Users className="size-4 text-blue-600" />
                        </div>
                      )}

                      {/* PROFILE IMAGE */}
                      <div
                        className="w-24 h-24 rounded-full overflow-hidden shadow-md mt-2 cursor-pointer"
                        onClick={() => setSelected(match)}
                      >
                        <img
                          src={person.profileImageUrl || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&size=200`}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* NAME */}
                      <h3
                        className="text-lg font-semibold mt-3 cursor-pointer hover:underline"
                        onClick={() => setSelected(match)}
                      >
                        {person.firstName} {person.lastName}
                      </h3>

                      <p className="text-sm text-base-content/60">{calculateAge(person.dateOfBirth)} years old</p>
                      <div className="mt-3 text-center space-y-1">
                        {match.mutualScore !== undefined && (
                          <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                            <Home className="size-4 text-green-600" />
                            Roommate Potential: {Math.round(match.mutualScore * 100)}%
                          </p>
                        )}

                        {match.similarityScore !== undefined && (
                          <p className="text-blue-600 font-semibold flex items-center justify-center gap-1">
                            <Users className="size-4 text-blue-600" />
                            Similar Lifestyle: {Math.round(match.similarityScore * 100)}%
                          </p>
                        )}
                      </div>


                {/* DIVIDER */}
                <div className="w-full mt-4 mb-3 border-t border-base-300"></div>

                {/* BUTTON ROW */}
                      <div className="flex items-center justify-between w-full p-3 gap-3">
                        {/* ADD FRIEND */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Friend request sent!");
                          }}
                          className="flex-1 py-2 rounded-lg bg-base-100 border text-green-600 font-medium hover:bg-base-300 transition"
                        >
                          Add Friend
                        </button>

                        {/* MESSAGE */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Opening chat...");
                          }}
                          className="p-2 bg-base-300 rounded-full shadow hover:bg-base-400 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M7 8h10M7 12h6M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.5-4.5A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* LOAD MORE */}
              {displayedMatches.length < allMatches.length && (
                <div className="text-center mt-10">
                  <button
                    className="btn btn-primary"
                    onClick={loadMore}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PROFILE SLIDE PANEL */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSelected(null)}
          ></div>

          <div className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-base-100 shadow-xl z-50 p-6 overflow-y-auto animate-slideLeft">
            {/* CLOSE BTN */}
            <button
              className="absolute top-4 right-4 bg-base-200 p-2 rounded-full hover:bg-base-300 transition"
              onClick={() => setSelected(null)}
            >
              <X className="size-5" />
            </button>

            {/* HEADER */}
            <div className="flex flex-col items-center mt-6">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow">
                <img
                  src={selected.user.profileImageUrl || `https://ui-avatars.com/api/?name=${selected.user.firstName}+${selected.user.lastName}&size=200`}
                  alt={`${selected.user.firstName} ${selected.user.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold mt-4">{selected.user.firstName} {selected.user.lastName}</h2>
              <p className="text-base-content/60">{calculateAge(selected.user.dateOfBirth)} years old</p>

              {selected.isMutualMatch && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <Home className="size-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Roommate Potential</span>
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="mt-6 space-y-4">
              <div className="space-y-1">
                {selected.mutualScore !== undefined && (
                  <p className="font-semibold text-lg text-green-600 flex items-center gap-1">
                    <Home className="size-5 text-green-600" />
                    Roommate Potential: {Math.round(selected.mutualScore * 100)}%
                  </p>
                )}

                {selected.similarityScore !== undefined && (
                  <p className="font-semibold text-lg text-blue-600 flex items-center gap-1">
                    <Users className="size-5 text-blue-600" />
                    Similar Lifestyle: {Math.round(selected.similarityScore * 100)}%
                  </p>
                )}
              </div>


              {selected.mutualScore && (
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Compatibility Breakdown:</p>
                  <div className="space-y-1 text-sm">
                    <p>You want them: {Math.round((selected.forwardScore || 0) * 100)}%</p>
                    <p>They want you: {Math.round((selected.reverseScore || 0) * 100)}%</p>
                    <p className="font-semibold">Roommate Potential: {Math.round((selected.mutualScore || 0) * 100)}%</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-bold">Gender:</span> {selected.user.gender || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Budget:</span> {formatBudget(selected.user.budget)}
                </p>
                <p>
                  <span className="font-bold">Location:</span> {selected.user.zipCode || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Pet Friendly:</span> {selected.user.lifestyle?.petFriendly ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <p className="font-bold mb-1">About</p>
                <p className="text-base-content/70">{selected.description || "No description available"}</p>
              </div>

              {selected.user.lifestyle && (
                <div>
                  <p className="font-bold mb-2">Lifestyle</p>
                  <div className="space-y-1 text-sm">
                    <p>Smoking: {selected.user.lifestyle.smoking ? "Yes" : "No"}</p>
                    <p>Night Owl: {selected.user.lifestyle.nightOwl ? "Yes" : "No"}</p>
                    <p>Guests: {selected.user.lifestyle.guestFrequency || "N/A"}</p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <button className="btn btn-primary w-full mt-4">
                Add Friend
              </button>

              <button className="btn btn-outline w-full mt-2">Message</button>
            </div>
          </div>

          <style>{`
            @keyframes slideLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slideLeft {
              animation: slideLeft 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default ExplorePage;
