import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { X, Home } from "lucide-react";

const peopleData = [
  {
    name: "Michael Scott",
    year: "Freshman",
    age: 53,
    gender: "Male",
    orientation: "Straight",
    budget: "$1,350",
    image: "/profile1.jpg",
    match: 0.91,
    roommate: false,
    bio: "Professional / Substance abuse therapy (+1)",
  },
  {
    name: "Jim Halpert",
    year: "Freshman",
    age: 26,
    gender: "Male",
    orientation: "Straight",
    budget: "$1,300",
    image: "/profile2.jpg",
    match: 0.9,
    roommate: false,
    bio: "Professional / Amazon FBA seller (+6)",
  },
  {
    name: "Oscar Martinez",
    year: "Freshman",
    age: 30,
    gender: "Male",
    orientation: "Gay",
    budget: "$1,450",
    image: "/profile3.jpg",
    match: 0.81,
    roommate: true,
    bio: "Professional / Accountant",
  },
  {
    name: "Michael Scott",
    year: "Freshman",
    age: 53,
    gender: "Male",
    orientation: "Straight",
    budget: "$1,350",
    image: "/profile1.jpg",
    match: 0.91,
    roommate: false,
    bio: "Professional / Substance abuse therapy (+1)",
  },
  {
    name: "Jim Halpert",
    year: "Freshman",
    age: 26,
    gender: "Male",
    orientation: "Straight",
    budget: "$1,300",
    image: "/profile2.jpg",
    match: 0.9,
    roommate: false,
    bio: "Professional / Amazon FBA seller (+6)",
  },
  {
    name: "Oscar Martinez",
    year: "Freshman",
    age: 30,
    gender: "Male",
    orientation: "Gay",
    budget: "$1,450",
    image: "/profile3.jpg",
    match: 0.81,
    roommate: true,
    bio: "Professional / Accountant",
  },
];

function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  return (
    <div className="min-h-screen bg-base-100 relative">
      <Navbar />

      {loading && <Loading />}

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          {/* HEADER */}
          <h1 className="text-center bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-6xl tracking-wider font-black mb-2">
            Explore
          </h1>
          <p className="text-center text-base-content/70 max-w-xl mx-auto">
            Oday believes these people are the best fit to be your hommie
          </p>

          {/* PEOPLE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {peopleData.map((person) => (
              <div
                key={person.name}
                className="bg-base-100 rounded-xl shadow border p-4 flex flex-col items-center relative"
              >
                {/* REMOVE BUTTON */}
                <button
                  className="absolute top-3 right-3 bg-base-100 rounded-full shadow p-1 transition-transform duration-200 hover:scale-125 hover:shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <X className="size-4 text-gray-600" />
                </button>

                {/* Roommate icon */}
                {person.roommate && (
                  <div className="absolute top-3 left-3 bg-green-200 p-1 rounded-full shadow-sm">
                    <Home className="size-4 text-green-600" />
                  </div>
                )}

                {/* PROFILE IMAGE */}
                <div
                  className="w-24 h-24 rounded-full overflow-hidden shadow-md mt-2 cursor-pointer"
                  onClick={() => setSelected(person)}
                >
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* NAME */}
                <h3
                  className="text-lg font-semibold mt-3 cursor-pointer hover:underline"
                  onClick={() => setSelected(person)}
                >
                  {person.name}
                </h3>

                <p className="text-sm text-base-content/60">{person.year}</p>

                <p className="text-green-600 font-semibold mt-2">
                  Match Score {Math.round(person.match * 100)}%
                </p>

                {/* DIVIDER */}
                <div className="w-full mt-4 mb-3 border-t border-base-300"></div>

                {/* BUTTON ROW (kept as requested) */}
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
            ))}
          </div>
          {/* LOAD MORE */}
          <div className="text-center mt-10">
            <button className="btn btn-outline">Load More</button>
          </div>
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
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold mt-4">{selected.name}</h2>
              <p className="text-base-content/60">{selected.year}</p>
            </div>

            {/* DETAILS */}
            <div className="mt-6 space-y-4">
              <p className="font-semibold text-lg">
                Match Score:{" "}
                <span className="text-green-600">
                  {Math.round(selected.match * 100)}%
                </span>
              </p>

              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-bold">Age:</span> {selected.age}
                </p>
                <p>
                  <span className="font-bold">Gender:</span> {selected.gender}
                </p>
                <p>
                  <span className="font-bold">Orientation:</span>{" "}
                  {selected.orientation}
                </p>
                <p>
                  <span className="font-bold">Budget:</span> {selected.budget}
                </p>
              </div>

              <div>
                <p className="font-bold mb-1">About</p>
                <p className="text-base-content/70">{selected.bio}</p>
              </div>

              {/* KEEP ADD FRIEND & MESSAGE HERE TOO */}
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
