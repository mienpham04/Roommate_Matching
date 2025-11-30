import React, { useRef, useEffect, useState } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import MapCard from "../components/MapCard";

const Test = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Position for map & marker
  const pos = { lat: 37.7749, lng: -122.4194 };

  // Map & marker references
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Create or update the AdvancedMarkerElement
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Update existing marker
    if (markerRef.current) {
      markerRef.current.position = pos;
      return;
    }

    // Create a new AdvancedMarkerElement
    markerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: pos,
    });
  }, [isLoaded]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      zoom={13}
      center={pos}
      mapContainerStyle={{ width: "100%", height: "100vh" }}
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* Your Map Info Card Overlay */}
      <MapCard
        position={pos}
        name="San Francisco"
        description="A nice place."
      />
    </GoogleMap>
  );
};

export default Test;
