// "use client";

// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import type { LatLngExpression } from "leaflet";
// import type { MapContainerProps } from "react-leaflet";

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// export default function Map() {
//   const center: LatLngExpression = [-34.6, -58.4];

//   const props: MapContainerProps = {
//     center,
//     zoom: 13,
//     style: { height: "100vh", width: "100%" },
//   };

//   const vehicles = [
//     { id: 1, position: [-34.6, -58.4], status: "moving" },
//     { id: 2, position: [-34.61, -58.41], status: "idle" },
//     { id: 3, position: [-34.62, -58.42], status: "stopped" },
//   ];

//   return (
//     <MapContainer {...props}>
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//       {vehicles.map((v) => (
//         <Marker key={v.id} position={v.position as [number, number]}>
//           <Popup>
//             Vehicle {v.id} - {v.status}
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// }

"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useVehicles } from "../hooks/useVehicles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const center: LatLngExpression = [-34.6, -58.4];

export default function Map() {
  const { vehicles } = useVehicles();

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {vehicles.map((v) => (
        <Marker key={v.id} position={v.position}>
          <Popup>
            {v.label} — {v.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
