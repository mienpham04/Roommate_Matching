import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

function ProcessPage() {
  // ------------------ STEP DATA ------------------
  const stepData = [
    {
      name: "Basic info",
      title: "Let’s Make Sharing a Home Feel Easy",
      description:
        "Learn your habits and preferences to recommend roommates who naturally align with your daily life.",
    },
    {
      name: "Choose location",
      title: "Location",
      description:
        "Tell us where you want to live and adjust the search radius.",
    },
    {
      name: "Preferences",
      title: "Preferences",
      description: "Tell us your daily habits.",
    },
    {
      name: "Lifestyle",
      title: "Lifestyle",
      description: "Describe your routines & expectations.",
    },
  ];

  const [current, setCurrent] = useState(0);

  // ------------------ MAP + AUTOCOMPLETE STATES ------------------
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // FORM VALUES FROM AUTOCOMPLETE
  const [addressFields, setAddressFields] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [radius, setRadius] = useState(5000);

  const [selectedPosition, setSelectedPosition] = useState({
    lat: 39.9784,
    lng: -86.118,
  });

  const [places, setPlaces] = useState([]);
  const [autocompleteRef, setAutocompleteRef] = useState(null);
  let mapRef = null;

  // ------------------ AUTOCOMPLETE HANDLER ------------------
  function onPlaceChanged() {
    if (!autocompleteRef) return;

    const place = autocompleteRef.getPlace();
    if (!place.geometry) return;

    // Move map marker
    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setSelectedPosition(pos);
    mapRef.panTo(pos);

    // Extract address fields
    const components = place.address_components || [];
    const get = (type) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    setAddressFields({
      address: `${get("street_number")} ${get("route")}`.trim(),
      city: get("locality"),
      state: get("administrative_area_level_1"),
      zip: get("postal_code"),
      country: get("country"),
    });
  }

  // ------------------ LOCATION SEARCH API (optional) ------------------
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    if (!mapRef || !locationQuery) return;

    const service = new window.google.maps.places.PlacesService(mapRef);

    const request = {
      query: locationQuery,
      fields: ["name", "geometry", "opening_hours"],
    };

    service.findPlaceFromQuery(request, (results) => {
      if (results) setPlaces(results);
    });
  }, [locationQuery]);

  const handleNext = () => {
    if (current < stepData.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  // ------------------ STEP CONTENT ------------------
  function renderStepContent() {
    if (current === 0) {
      return (
        <div className="col-span-2 card bg-base-100 border shadow-sm">
          <div className="card-body space-y-4">
            <h2 className="card-title text-xl">Basic Info</h2>

            <input
              className="input input-bordered w-full"
              placeholder="Your Name"
            />
            <input
              className="input input-bordered w-full"
              placeholder="Email"
            />
          </div>
        </div>
      );
    }

    // ------------------ LOCATION PICKER WITH AUTOCOMPLETE ------------------
    if (current === 1) {
      if (!isLoaded) return <p>Loading map...</p>;

      return (
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 bg-base-100 border rounded-xl shadow overflow-hidden">
          {/* LEFT PANEL — Starbucks-style */}
          <div className="flex flex-col h-[600px] border-r">
            {/* AUTOCOMPLETE INPUT */}
            <div className="p-4 border-b">
              <Autocomplete
                onLoad={(ref) => setAutocompleteRef(ref)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Search an address..."
                />
              </Autocomplete>
            </div>

            {/* Recommended title */}
            {/* <div className="px-4 py-3 border-b text-lg font-semibold">
              Location Recommendations
            </div> */}

            {/* Scrollable recommended list */}
            <div className="flex-1 overflow-y-auto">
              {places.map((p, i) => {
                const pos = {
                  lat: p.geometry.location.lat(),
                  lng: p.geometry.location.lng(),
                };

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPosition(pos);
                      mapRef.panTo(pos);
                    }}
                  >
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-xs text-base-content/60">
                        {p.opening_hours?.open_now ? "Open now" : "Closed"}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button>❤️</button>
                      <button>ℹ️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL — Map */}
          <div className="relative h-[600px] w-full">
            <GoogleMap
              zoom={13}
              center={selectedPosition}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              onLoad={(map) => (mapRef = map)}
              onClick={(e) => {
                setSelectedPosition({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                });
              }}
            >
              <Marker position={selectedPosition} />

              <Circle
                center={selectedPosition}
                radius={radius}
                options={{
                  fillColor: "#3b82f6",
                  strokeColor: "#2563eb",
                  fillOpacity: 0.25,
                  strokeOpacity: 0.5,
                }}
              />
            </GoogleMap>

            {/* Radius Slider */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-base-100/90 backdrop-blur p-4 rounded-xl shadow-xl">
              <label className="text-sm font-medium text-base-content">
                Match radius: {(radius / 1609.34).toFixed(1)} miles
              </label>

              <input
                type="range"
                min="1609" // 1 mile
                max="32186" // 20 miles
                step="804" // 0.5 miles
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full mt-2 custom-range"
              />
            </div>
          </div>
        </div>
      );
    }

    // ------------------ PREFERENCES ------------------
    if (current === 2) {
      return (
        <div className="col-span-2 card bg-base-100 border shadow-sm">
          <div className="card-body space-y-4">
            <h2 className="card-title text-xl">Preferences</h2>
            <label>
              <input type="checkbox" className="checkbox" /> Night Owl
            </label>
          </div>
        </div>
      );
    }

    // ------------------ LIFESTYLE ------------------
    if (current === 3) {
      return (
        <div className="col-span-2 card bg-base-100 border shadow-sm">
          <div className="card-body space-y-4">
            <h2 className="card-title text-xl">Lifestyle</h2>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Describe your lifestyle..."
            />
          </div>
        </div>
      );
    }
  }

  // ------------------ STEPPER ------------------
  function Stepper() {
    return (
      <div className="card-body space-y-5">
        <ul className="steps w-full">
          {stepData.map((s, i) => (
            <li
              key={i}
              className={`step cursor-pointer ${
                i <= current ? "step-primary" : ""
              }`}
              onClick={() => setCurrent(i)}
            >
              {s.name}
            </li>
          ))}
        </ul>

        <div className="text-center">
          <h3 className="text-3xl font-bold">{stepData[current].title}</h3>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            {stepData[current].description}
          </p>
        </div>
      </div>
    );
  }

  // ------------------ PAGE LAYOUT ------------------
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <Stepper />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderStepContent()}
          </div>
        </div>
      </main>

      <footer className="w-full mt-auto pb-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="btn btn-outline btn-lg rounded-full disabled:opacity-40"
          >
            BACK
          </button>
          <button
            onClick={handleNext}
            disabled={current === stepData.length - 1}
            className="btn btn-primary btn-lg rounded-full disabled:opacity-40"
          >
            NEXT
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ProcessPage;
