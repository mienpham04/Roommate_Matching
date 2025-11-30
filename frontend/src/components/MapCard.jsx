import { OverlayView } from "@react-google-maps/api";

const MapCard = ({ position, name, description }) => {
  const getOffset = (width, height) => ({
    x: -(width / 2),
    y: -height - 10,
  });

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getOffset}
    >
      <div className="bg-base-100 shadow-xl rounded-xl p-4 border border-base-300 w-56">
        <h3 className="font-bold text-base-content text-lg">{name}</h3>
        <p className="text-sm text-base-content/70 mt-1">{description}</p>
      </div>
    </OverlayView>
  );
};

export default MapCard;
