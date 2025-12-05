import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

function Location() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const DEFAULT_RADIUS = 2414; // 1.5 miles in meters
  const DEFAULT_ZOOM = 14;

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [zipCode, setZipCode] = useState("");

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  async function getZipCodeFromLatLng(lat, lng) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results?.length) {
        setZipCode("");
        return;
      }

      for (let comp of data.results[0].address_components) {
        if (comp.types.includes("postal_code")) {
          setZipCode(comp.long_name);
          return;
        }
      }

      setZipCode("");
    } catch (err) {
      console.log("ZIP Error:", err);
      setZipCode("");
    }
  }

  // Geolocation on load
  useEffect(() => {
    if (!isLoaded) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedPosition({ lat: latitude, lng: longitude });
        await getZipCodeFromLatLng(latitude, longitude);
      },
      async () => {
        const fallback = { lat: 39.9784, lng: -86.118 };
        setSelectedPosition(fallback);
        await getZipCodeFromLatLng(fallback.lat, fallback.lng);
      }
    );
  }, [isLoaded]);

  // When user selects a place
  async function onPlaceChanged() {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;

    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setSelectedPosition(pos);
    mapRef.current?.panTo(pos);
    await getZipCodeFromLatLng(pos.lat, pos.lng);
  }

  // Clicking on map sets new location
  async function handleMapClick(e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setSelectedPosition({ lat, lng });
    await getZipCodeFromLatLng(lat, lng);
  }

  if (!isLoaded || !selectedPosition) return <p>Loading map...</p>;

  return (
    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 bg-base-100 border rounded-xl shadow overflow-hidden">

      {/* LEFT PANEL */}
      <div className="flex flex-col h-[600px] border-r bg-base-100">

        {/* SEARCH BAR */}
        <div className="p-4 border-b">
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Search an address..."
              onChange={(e) => setLocationQuery(e.target.value)}
              className="input input-bordered w-full rounded-full"
            />
          </Autocomplete>
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-8 space-y-8">

          <div className="text-5xl">🏘️</div>

          <h2 className="text-xl font-semibold text-base-content">
            Choose your ideal neighborhood
          </h2>

          <p className="text-base-content/60 text-sm max-w-xs">
            We'll use this area to match you with suitable roommates nearby.
          </p>

          {/* BUDGET INPUTS */}
          <div className="w-full space-y-3 mt-4">
            <h3 className="text-sm font-semibold text-base-content">
              Budget Range (per month)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label-text text-xs">Min</span>
                <input
                  type="number"
                  min="0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="$500"
                  className="input input-bordered w-full"
                />
              </label>

              <label className="form-control">
                <span className="label-text text-xs">Max</span>
                <input
                  type="number"
                  min="0"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="$1500"
                  className="input input-bordered w-full"
                />
              </label>
            </div>

            {/* ZIP CODE */}
            <p className="text-md text-base-content/70 mt-4">
              ZIP Code:{" "}
              <span className="font-bold text-base-content">
                {zipCode || "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — MAP */}
      <div className="relative h-[600px] w-full">
        <GoogleMap
          zoom={DEFAULT_ZOOM}
          center={selectedPosition}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={(map) => (mapRef.current = map)}
          onClick={handleMapClick}
        >
          <Marker position={selectedPosition} />

          {/* CONSTANT 1.5-MILE RADIUS */}
          <Circle
            center={selectedPosition}
            radius={DEFAULT_RADIUS}
            options={{
              fillColor: "#5dd39e",
              strokeColor: "#3c8d66",
              fillOpacity: 0.25,
              strokeOpacity: 0.5,
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
}

export default Location;
