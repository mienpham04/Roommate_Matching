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
  const [allMatches, setAllMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const userEmail = user.primaryEmailAddress.emailAddress;

      // Fetch all users to find current user's MongoDB ID
      const usersResponse = await fetch(`${API_URL}/users`);
      if (!usersResponse.ok) throw new Error("Failed to fetch users");

      const allUsers = await usersResponse.json();
      const currentUser = allUsers.find(u => u.email === userEmail);

      if (!currentUser) {
        throw new Error("User profile not found. Please complete your profile first.");
      }

      const userId = currentUser.id;

      // Fetch both similar and mutual matches in parallel
      const [similarResponse, mutualResponse] = await Promise.all([
        fetch(`${API_URL}/matching/similar/${userId}?topK=10`),
        fetch(`${API_URL}/matching/mutual/${userId}?topK=10`)
      ]);

      if (!similarResponse.ok) throw new Error("Failed to fetch similar matches");
      if (!mutualResponse.ok) throw new Error("Failed to fetch mutual matches");

      const similarData = await similarResponse.json();
      const mutualData = await mutualResponse.json();

      const similarMatches = similarData.matches || [];
      const mutualMatches = mutualData.matches || [];

      // Mark matches with type flags
      const markedMutualMatches = mutualMatches.map(match => ({
        ...match,
        isMutualMatch: true
      }));

      const markedSimilarMatches = similarMatches.map(match => ({
        ...match,
        isMutualMatch: false
      }));

      // Combine and remove duplicates (prefer mutual matches)
      const combined = [...markedMutualMatches];
      const mutualIds = new Set(markedMutualMatches.map(m => m.userId));

      markedSimilarMatches.forEach(match => {
        if (!mutualIds.has(match.userId)) {
          combined.push(match);
        }
      });

      setAllMatches(combined);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      {loading && <Loading />}

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
              <span className="text-sm">Mutual Match (Both compatible)</span>
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
              {/* PEOPLE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {allMatches.map((match) => {
                  const person = match.user;
                  const score = match.similarityScore || match.mutualScore || 0;

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
                          setAllMatches(allMatches.filter(m => m.userId !== match.userId));
                        }}
                      >
                        <X className="size-4 text-gray-600" />
                      </button>

                      {/* Match type icon */}
                      {match.isMutualMatch ? (
                        <div className="absolute top-3 left-3 bg-green-200 p-1 rounded-full shadow-sm" title="Mutual Match">
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

                      <p className={`font-semibold mt-2 ${match.isMutualMatch ? 'text-green-600' : 'text-blue-600'}`}>
                        Match Score {Math.round(score * 100)}%
                      </p>

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
              <div className="text-center mt-10">
                <button
                  className="btn btn-outline"
                  onClick={fetchMatches}
                >
                  Refresh Matches
                </button>
              </div>
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
                  <span className="text-sm text-green-700 font-medium">Mutual Match</span>
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="mt-6 space-y-4">
              <p className="font-semibold text-lg">
                Match Score:{" "}
                <span className={selected.isMutualMatch ? "text-green-600" : "text-blue-600"}>
                  {Math.round((selected.similarityScore || selected.mutualScore || 0) * 100)}%
                </span>
              </p>

              {selected.mutualScore && (
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Compatibility Breakdown:</p>
                  <div className="space-y-1 text-sm">
                    <p>You want them: {Math.round((selected.forwardScore || 0) * 100)}%</p>
                    <p>They want you: {Math.round((selected.reverseScore || 0) * 100)}%</p>
                    <p className="font-semibold">Mutual: {Math.round((selected.mutualScore || 0) * 100)}%</p>
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
