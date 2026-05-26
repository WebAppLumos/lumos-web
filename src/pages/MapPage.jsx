import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapPage() {

  const position = [
    35.8532,
    128.4913,
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >

      <MapContainer
        center={position}
        zoom={17}
        style={{
          width: "100%",
          height: "100%",
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>

          <Popup>
            계명대학교
          </Popup>

        </Marker>

      </MapContainer>

    </div>
  );
}

export default MapPage;