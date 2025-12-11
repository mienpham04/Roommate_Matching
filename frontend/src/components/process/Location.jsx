import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
// FIX: Added 'ArrowRight' to the import list below
import { Search, MapPin, DollarSign, Lock, ArrowRight } from "lucide-react";

function Location({ dbUser, id, setDbUser }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const DEFAULT_RADIUS = 2414; 
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
      if (!data.results?.length) { setZipCode(""); return; }
      const zipComponent = data.results[0].address_components.find((comp) => comp.types.includes("postal_code"));
      setZipCode(zipComponent ? zipComponent.long_name : "N/A");
    } catch (err) { console.log("ZIP Error:", err); setZipCode(""); } 
    finally { setIsLoadingZip(false); }
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
    const pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
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
        budget: { min: Number(minBudget) || 0, max: Number(maxBudget) || 0 },
      };
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateUser),
        });
        const saved = await res.json();
        setDbUser(saved);
      } catch (err) { console.error("saveToDB error:", err); }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="space-y-4">

      {/* --- MAP SECTION --- */}
      <div className="relative w-full h-72 rounded-3xl overflow-hidden shadow-xl shadow-base-300/50 border border-base-200 group">
        
        {/* Floating Search Bar (Inside Map) */}
        {!isBudgetConfirmed && (
             <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
                <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                    <div className="relative group/search">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-primary group-focus-within/search:text-primary-focus transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search city, neighborhood..."
                            onChange={(e) => setLocationQuery(e.target.value)}
                            className="input w-full pl-12 py-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border-0 text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </Autocomplete>
            </div>
        )}

        {/* Map */}
        {!selectedPosition ? (
          <div className="w-full h-full bg-base-200 animate-pulse flex items-center justify-center">
            <span className="text-sm font-medium text-base-content/40">Locating...</span>
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
              clickableIcons: false,
              styles: [ { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] } ] // Cleaner map style
            }}
          >
            <Marker position={selectedPosition} />
            <Circle
              center={selectedPosition}
              radius={DEFAULT_RADIUS}
              options={{ fillColor: "#570DF8", strokeColor: "#4506CB", fillOpacity: 0.15, strokeOpacity: 0.3, strokeWeight: 1 }}
            />
          </GoogleMap>
        )}

        {/* Zip Badge overlay */}
        <div className="absolute bottom-4 left-4 badge badge-lg bg-pink-500 backdrop-blur text-white shadow-lg border-0 gap-2 p-4 font-bold">
           <MapPin size={14} />
           {isLoadingZip ? <span className="loading loading-dots loading-xs"></span> : (zipCode || "Zip unavailable")}
        </div>

        {isBudgetConfirmed && (
            <div className="absolute inset-0 bg-base-100/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <div className="badge badge-lg p-4 gap-2 bg-base-100 shadow-xl border border-base-200">
                    <Lock size={14}/> Location Locked
                </div>
            </div>
        )}
      </div>


      {/* --- BUDGET SECTION --- */}
      <div className={`transition-all duration-500 p-4 rounded-2xl border ${
          isBudgetConfirmed
            ? "bg-base-100 border-primary shadow-[0_0_20px_rgba(87,13,248,0.1)]"
            : "bg-base-100 border-base-200 shadow-sm"
        }`}>

        <div className="flex items-center gap-2 mb-3">
             <div className={`p-1.5 rounded-lg ${isBudgetConfirmed ? 'bg-primary text-white' : 'bg-base-200 text-base-content/60'}`}>
                <DollarSign size={18} />
             </div>
             <div>
                <h3 className="font-bold text-base">Monthly Budget</h3>
                <p className="text-xs text-base-content/50">Estimated range per person</p>
             </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">

          {/* Min Input */}
          <div className="form-control w-full">
            <label className="label pt-0 pb-1"><span className="label-text text-xs font-bold uppercase text-base-content/40">Minimum</span></label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 font-bold group-focus-within:text-primary transition-colors text-sm">$</span>
              <input
                type="number"
                min="0"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="input input-bordered w-full pl-7 h-10 bg-base-200 focus:bg-white text-base font-semibold shadow-sm focus:shadow-md transition-all rounded-xl border-2 border-base-300"
                placeholder="0"
                disabled={isBudgetConfirmed}
              />
            </div>
          </div>

          <div className="hidden md:block text-base-content/20 pt-4">
              <ArrowRight size={18} />
          </div>

          {/* Max Input */}
          <div className="form-control w-full">
            <label className="label pt-0 pb-1"><span className="label-text text-xs font-bold uppercase text-base-content/40">Maximum</span></label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 font-bold group-focus-within:text-primary transition-colors text-sm">$</span>
              <input
                type="number"
                min="0"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="input input-bordered w-full pl-7 h-10 bg-base-200 focus:bg-white text-base font-semibold shadow-sm focus:shadow-md transition-all rounded-xl border-2 border-base-300"
                placeholder="2500+"
                disabled={isBudgetConfirmed}
              />
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="mt-3 pt-3 border-t border-base-200 flex items-center justify-between">
            <span className="text-sm font-medium text-base-content/70">
                Are you done with this step?
            </span>
            <label className="cursor-pointer flex items-center gap-3">
                <span className={`text-sm font-bold transition-colors ${isBudgetConfirmed ? "text-primary" : "text-base-content/40"}`}>
                    {isBudgetConfirmed ? "Locked in" : "Lock in details"}
                </span>
                <input
                type="checkbox"
                className="toggle toggle-primary toggle-md hover:scale-105 transition-transform"
                checked={isBudgetConfirmed}
                onChange={(e) => {
                    const checked = e.target.checked;
                    setIsBudgetConfirmed(checked);
                    if (checked) saveToDB();
                }}
                />
            </label>
        </div>
      </div>
    </div>
  );
}

export default Location;