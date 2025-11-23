import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { Settings, Star } from "lucide-react";

const sampleData = [
  {
    title: "Japanese American Museum of San Jose",
    address: "535 N 5th St, San Jose, CA 95112",
    distance: "7.9 mi",
    duration: "15 mins",
    image: "/sample1.jpg",
    match: 0.85,
    description:
      "Immerse yourself in Japanese American history and culture at this museum, offering exhibits and programs that shed light on the community's contributions.",
    link: "https://maps.google.com",
  },
  {
    title: "Alum Rock Park",
    address: "15350 Penitencia Creek Rd, San Jose, CA 95127",
    distance: "15.1 mi",
    duration: "30 mins",
    image: "/sample2.jpg",
    match: 0.9,
    description:
      "Explore the natural beauty of Alum Rock Park, featuring hiking trails, picnic areas, and mineral springs — ideal for outdoor activities.",
    link: "https://maps.google.com",
  },
  {
    title: "The Tech Interactive",
    address: "201 S Market St, San Jose, CA 95113",
    distance: "6.8 mi",
    duration: "14 mins",
    image: "/sample3.jpg",
    match: 0.8,
    description:
      "Engage in interactive exhibits and educational programs at The Tech Interactive — offering fun and enriching experiences for all ages.",
    link: "https://maps.google.com",
  },
  {
    title: "Japanese American Museum of San Jose",
    address: "535 N 5th St, San Jose, CA 95112",
    distance: "7.9 mi",
    duration: "15 mins",
    image: "/sample1.jpg",
    match: 0.85,
    description:
      "Immerse yourself in Japanese American history and culture at this museum, offering exhibits and programs that shed light on the community's contributions.",
    link: "https://maps.google.com",
  },
  {
    title: "Alum Rock Park",
    address: "15350 Penitencia Creek Rd, San Jose, CA 95127",
    distance: "15.1 mi",
    duration: "30 mins",
    image: "/sample2.jpg",
    match: 0.9,
    description:
      "Explore the natural beauty of Alum Rock Park, featuring hiking trails, picnic areas, and mineral springs — ideal for outdoor activities.",
    link: "https://maps.google.com",
  },
  {
    title: "The Tech Interactive",
    address: "201 S Market St, San Jose, CA 95113",
    distance: "6.8 mi",
    duration: "14 mins",
    image: "/sample3.jpg",
    match: 0.8,
    description:
      "Engage in interactive exhibits and educational programs at The Tech Interactive — offering fun and enriching experiences for all ages.",
    link: "https://maps.google.com",
  },
];

function ExplorePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      {/* LOADING STATE */}
      {loading && <Loading />}

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* PAGE TITLE */}
          {/* className="font-black text-xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider" */}
          <h1 className="text-center bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-5xl tracking-wider font-black mb-2">
            Explore
          </h1>
          <p className="text-center text-base-content/70 max-w-xl mx-auto">
            Oday believes these people are the best fit to be your hommie
          </p>

          {/* SECTION */}
          <div className="mt-16">
            {/* <div className="flex items-center gap-2 mb-6">
              <h2 className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-3xl font-bold">People</h2>
              <Settings className="size-6 text-base-content/70" />
            </div> */}

            {/* GRID OF CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sampleData.map((place) => (
                <div
                  key={place.title}
                  className="bg-base-200 rounded-xl shadow p-5 border hover:shadow-lg transition"
                >
                  {/* Title */}
                  <h3 className="text-xl font-semibold">{place.title}</h3>
                  <p className="text-sm text-base-content/60">
                    {place.address} • {place.distance} • {place.duration}
                  </p>

                  {/* IMAGE */}
                  <img
                    src={place.image}
                    alt={place.title}
                    className="mt-4 w-full h-40 object-cover rounded-lg"
                  />

                  {/* MATCH LEVEL + MAP LINK */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="font-semibold text-lg">
                      {place.match} Match Level
                    </p>

                    <a
                      href={place.link}
                      target="_blank"
                      className="text-primary font-medium hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-sm text-base-content/70 mt-3">
                    {place.description}
                  </p>

                  {/* AI FOOTER */}
                  <div className="flex items-center gap-2 mt-4 text-xs text-base-content/60">
                    <Star className="size-4" />
                    <span>
                      Generated with{" "}
                      <a
                        href="https://gemini.google.com"
                        target="_blank"
                        className="text-primary"
                      >
                        Gemini
                      </a>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* LOAD MORE */}
            <div className="text-center mt-10">
              <button className="btn btn-outline">Load More</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
