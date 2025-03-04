
import React from 'react'; 
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Location = {
  latitude: number;
  longitude: number;
  capacity: number;
};

interface MapProps {
  locations: Location[];
}

const Map: React.FC<MapProps> = ({ locations }) => {
  // Optionally, set the map center based on the first location, or fallback to a default center
  const defaultCenter: [number, number] = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [51.505, -0.09];

  return (
    <div className='h-full w-full'>
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-2xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, index) => (
          <Marker key={index} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <div>
                <strong>Point {index + 1}</strong>
                <br />
                Capacity: {loc.capacity}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
