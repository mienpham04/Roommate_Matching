import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

const Location = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [radius, setRadius] = useState(0);
  const [zoom, setZoom] = useState(13);

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  function radiusToZoom(r) {
    const scale = r / 500; 
    const zoomLevel = Math.floor(16 - Math.log(scale) / Math.log(2));
    return Math.max(2, Math.min(18, zoomLevel));
  }

  useEffect(() => {
    if (!mapRef.current) return;
    const newZoom = radiusToZoom(radius);
    setZoom(newZoom);
    mapRef.current.setZoom(newZoom);
  }, [radius]);

  useEffect(() => {
    if (!isLoaded) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const userPos = { lat: latitude, lng: longitude };
        setSelectedPosition(userPos);
      },
      () => {
        setSelectedPosition({ lat: 39.9784, lng: -86.118 });
      }
    );
  }, [isLoaded]);

  function onPlaceChanged() {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;

    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setSelectedPosition(pos);
    mapRef.current?.panTo(pos);
  }

//   useEffect(() => {
//     if (!mapRef.current || !locationQuery) return;

//     const service = new window.google.maps.places.PlacesService(mapRef.current);

//     service.findPlaceFromQuery(
//       {
//         query: locationQuery,
//         fields: ["name", "geometry", "opening_hours"],
//       },
//       (results) => {
//         if (results) setPlaces(results);
//       }
//     );
//   }, [locationQuery]);

  if (!isLoaded || !selectedPosition) return <p>Loading map...</p>;

  return (
    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 bg-base-100 border rounded-xl shadow overflow-hidden">
      {/* LEFT SIDEBAR */}
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

        {/* CENTERED CONTENT */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-8 space-y-6">
          <div className="text-5xl">🏘️</div>

          <h2 className="text-xl font-semibold text-base-content">
            Choose your ideal neighborhood
          </h2>

          <p className="text-base-content/60 text-sm max-w-xs">
            Set how far from your chosen location you're comfortable living.
            Your roommate matches will be based on this distance.
          </p>

          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Match radius</span>
              <span className="text-sm opacity-60">
                {(radius / 1609.34).toFixed(1)} miles
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="32186"
              step="800"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="range range-success w-full"
            />
          </div>
        </div>
      </div>

      {/* RIGHT — MAP */}
      <div className="relative h-[600px] w-full">
        <GoogleMap
          zoom={zoom}
          center={selectedPosition}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={(map) => {
            mapRef.current = map;
            setZoom(radiusToZoom(radius));
          }}
          onClick={(e) =>
            setSelectedPosition({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        >
          {/* Default Marker */}
          <Marker position={selectedPosition} />

          {/* Radius Circle */}
          <Circle
            center={selectedPosition}
            radius={radius}
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
};

export default Location;
