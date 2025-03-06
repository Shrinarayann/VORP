import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Proper TypeScript declaration for Routing
declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
  }
}

// Define the Location type
type Location = {
  latitude: number;
  longitude: number;
  capacity: number;
};

interface MapProps {
  locations: Location[];
}

// Routing machine component to handle the routing logic
const RoutingMachine = () => {
  const map = useMap();
  
  useEffect(() => {
    // Define the start and end points
    const startPoint = L.latLng(12.925064, 80.116439);
    const endPoint = L.latLng(12.918706, 80.052883);
    
    // Create and add the routing control
    const routingControl = L.Routing.control({
      waypoints: [startPoint, endPoint],
      lineOptions: {
        styles: [{ color: '#3388ff', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true
    }).addTo(map);
    
    // Fit the map to show the entire route
    setTimeout(() => {
      const bounds = L.latLngBounds([startPoint, endPoint]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 1000);
    
    // Clean up on unmount
    return () => {
      map.removeControl(routingControl);
    };
  }, [map]);
  
  return null;
};

const Map: React.FC<MapProps> = ({ locations }) => {
  // Define default center (midpoint between the two routing points)
  const defaultCenter: [number, number] = [12.921885, 80.084661]; // Midpoint of the two coordinates
  
  // Add our fixed routing points to the locations
  const allLocations = [
    ...locations,
    { latitude: 12.925064, longitude: 80.116439, capacity: 0 },
    { latitude: 12.918706, longitude: 80.052883, capacity: 0 }
  ];
  
  return (
    <div className="h-full w-full">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-2xl"
        style={{ height: '500px' }} // Explicit height needed
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allLocations.map((loc, index) => (
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
        <RoutingMachine />
      </MapContainer>
    </div>
  );
};

export default Map;