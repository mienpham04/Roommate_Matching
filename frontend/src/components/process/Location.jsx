import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import { Search } from "lucide-react";

function Location({ dbUser, id, setDbUser }) {
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
  const [isBudgetConfirmed, setIsBudgetConfirmed] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const [isLoadingZip, setIsLoadingZip] = useState(false);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  async function getZipCodeFromLatLng(lat, lng) {
    setIsLoadingZip(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results?.length) {
        setZipCode("");
        return;
      }

      const zipComponent = data.results[0].address_components.find((comp) =>
        comp.types.includes("postal_code")
      );

      setZipCode(zipComponent ? zipComponent.long_name : "N/A");
    } catch (err) {
      console.log("ZIP Error:", err);
      setZipCode("");
    } finally {
      setIsLoadingZip(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setSelectedPosition(newPos);
          await getZipCodeFromLatLng(latitude, longitude);
        },
        async () => {
          const fallback = { lat: 39.9784, lng: -86.118 };
          setSelectedPosition(fallback);
          await getZipCodeFromLatLng(fallback.lat, fallback.lng);
        }
      );
    }
  }, [isLoaded]);

  async function onPlaceChanged() {
    if (isBudgetConfirmed) return;

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

  async function handleMapClick(e) {
    if (isBudgetConfirmed) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };

    setSelectedPosition(newPos);
    mapRef.current?.panTo(newPos);
    await getZipCodeFromLatLng(lat, lng);
  }

  const saveToDB = async () => {
    if (!id || !dbUser) return;

    const updateUser = {
      ...dbUser,
      zipCode: zipCode || dbUser.zipCode,
      budget: {
        min: Number(minBudget) || dbUser?.budget?.min || 0,
        max: Number(maxBudget) || dbUser?.budget?.max || 0,
      },
    };

    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateUser),
      });

      if (!res.ok) {
        console.error("Failed to update user:", await res.text());
        return;
      }

      const saved = await res.json();
      setDbUser(saved);
      console.log("✔ Saved:", saved);

    } catch (err) {
      console.error("🔥 saveToDB error:", err);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">

      <div className="form-control w-full relative z-10">
        <label className="label">
          <span className="label-text font-semibold">Start your search</span>
        </label>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
          className="w-full"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search by city, neighborhood, or address..."
              onChange={(e) => setLocationQuery(e.target.value)}
              className="input input-bordered w-full pl-11 shadow-sm focus:shadow-md transition-shadow"
              disabled={isBudgetConfirmed}
            />
            <Search
              className="absolute left-4 top-3 h-5 w-5 opacity-50"
              strokeWidth={2}
            />
          </div>
        </Autocomplete>
      </div>

      <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-base-300">

        {!selectedPosition ? (
          <div className="w-full h-full bg-base-200 animate-pulse flex items-center justify-center">
            <span className="text-sm opacity-50">Locating...</span>
          </div>
        ) : (
          <GoogleMap
            zoom={DEFAULT_ZOOM}
            center={selectedPosition}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            onLoad={(map) => (mapRef.current = map)}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: !isBudgetConfirmed,
              draggable: !isBudgetConfirmed,
              scrollwheel: !isBudgetConfirmed,
              disableDoubleClickZoom: isBudgetConfirmed,
              clickableIcons: false
            }}
          >
            <Marker position={selectedPosition} />
            <Circle
              center={selectedPosition}
              radius={DEFAULT_RADIUS}
              options={{
                fillColor: "#570DF8",
                strokeColor: "#4506CB",
                fillOpacity: 0.15,
                strokeOpacity: 0.3
              }}
            />
          </GoogleMap>
        )}

        <div className="absolute top-4 right-4 badge badge-lg bg-base-100/90 backdrop-blur shadow-md border-0 gap-2 p-4 text-sm font-semibold">
          📍 ZIP: {isLoadingZip ? <span className="loading loading-dots loading-xs"></span> : (zipCode || "Unknown")}
        </div>
      </div>

      <div className={`transition-colors duration-300 p-6 rounded-2xl border ${isBudgetConfirmed ? "bg-base-100 border-primary/40 shadow-sm" : "bg-base-200/50 border-base-200"
        }`}>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          💰 Monthly Budget Range
        </h3>

        <div className="flex items-center gap-4">
          <div className="form-control w-full">
            <label className="label pt-0"><span className="label-text text-xs opacity-70">Minimum</span></label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-base-content/50">$</span>
              <input
                type="number"
                min="0"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="input input-bordered w-full pl-7"
                placeholder="0"
                disabled={isBudgetConfirmed}
              />
            </div>
          </div>

          <div className="text-2xl text-base-content/30 mt-4">-</div>

          <div className="form-control w-full">
            <label className="label pt-0"><span className="label-text text-xs opacity-70">Maximum</span></label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-base-content/50">$</span>
              <input
                type="number"
                min="0"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="input input-bordered w-full pl-7"
                placeholder="2500+"
                disabled={isBudgetConfirmed}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-base-content/10">
          <label className="cursor-pointer label justify-start gap-3 hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={isBudgetConfirmed}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsBudgetConfirmed(checked);

                if (checked) {
                  saveToDB();
                }
              }}
            />
            <span className={`label-text transition-all ${isBudgetConfirmed ? "text-primary font-bold" : "text-base-content"
              }`}>
              {isBudgetConfirmed ? "Budget Confirmed" : "Confirm this is my budget range"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Location;
