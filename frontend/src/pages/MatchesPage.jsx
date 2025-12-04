import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart, MapPin, DollarSign, User, Loader2, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

function MatchesPage() {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchMatches();
    }
  }, [user?.id]);

  const fetchMatches = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch mutual likes (users who both liked each other)
      const res = await fetch(`http://localhost:8080/api/likes/mutual/${user.id}`);

      // If endpoint doesn't exist yet, just show empty state
      if (res.status === 404) {
        setMatches([]);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch matches");
      }

      // Transform the data to match the expected format
      const mutualMatches = (data.mutualMatches || []).map(match => ({
        userId: match.id,
        name: `${match.firstName} ${match.lastName}`,
        age: match.age,
        profileImageUrl: match.profileImageUrl,
        location: match.zipCode,
        minBudget: match.budget?.min,
        maxBudget: match.budget?.max,
        lifestyle: match.lifestyle
      }));

      setMatches(mutualMatches);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen w-full bg-base-200 flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-base-content/60">Finding your perfect matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-base-200 flex flex-col">
      <Navbar />

      <div className="grow flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
              Your Matches
            </h1>
            <p className="text-base-content/60">
              Find your perfect roommate based on mutual compatibility
            </p>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-6 md:p-8">
            {error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="w-12 h-12 text-error mb-4" />
                <p className="text-error font-semibold mb-2">Failed to load matches</p>
                <p className="text-base-content/60 text-sm mb-4">{error}</p>
                <button onClick={fetchMatches} className="btn btn-primary btn-sm">
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Match Count */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-base-content/60">
                    {matches.length} {matches.length === 1 ? "match" : "matches"}
                  </div>
                </div>

                {/* Description */}
                <div className="alert alert-info mb-6">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  <span className="text-sm">
                    People who you both liked each other! These are your mutual connections.
                  </span>
                </div>

                {/* Matches List */}
                {matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Heart className="w-16 h-16 text-base-content/20 mb-4" />
                    <p className="text-lg font-semibold text-base-content/60 mb-2">No matches yet</p>
                    <p className="text-sm text-base-content/40 mb-4">
                      Head to the Explore page to find your perfect roommate match!
                    </p>
                    <a href="/explore" className="btn btn-primary btn-sm">
                      Go to Explore
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match, index) => (
                      <div
                        key={match.userId || index}
                        className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow border border-base-300"
                      >
                        <div className="card-body p-4">
                          {/* Header with Avatar and Name */}
                          <div className="flex items-start gap-4 mb-3">
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                  src={match.profileImageUrl || "https://i.pravatar.cc/150?img=" + index}
                                  alt={match.name || "User"}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{match.name || "Anonymous"}</h3>
                              <p className="text-sm text-base-content/60">{match.age || "N/A"} years old</p>

                              {/* Match Badge */}
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                  <span className="text-sm font-bold text-red-500">
                                    Mutual Match
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-2">
                            {match.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-base-content/60" />
                                <span>{match.location}</span>
                              </div>
                            )}

                            {(match.minBudget || match.maxBudget) && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-base-content/60" />
                                <span>
                                  ${match.minBudget || 0} - ${match.maxBudget || 0}/month
                                </span>
                              </div>
                            )}

                            {match.lifestyle && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {match.lifestyle.petFriendly && (
                                  <span className="badge badge-sm badge-outline">Pet Friendly</span>
                                )}
                                {match.lifestyle.smoking && (
                                  <span className="badge badge-sm badge-outline">Smoking OK</span>
                                )}
                                {match.lifestyle.isNightOwl !== undefined && (
                                  <span className="badge badge-sm badge-outline">
                                    {match.lifestyle.isNightOwl ? "Night Owl" : "Early Bird"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="card-actions justify-end mt-4">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => window.open(`/user/${match.userId}`, '_blank')}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchesPage;
