import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
  }
}


type Location = {
  latitude: number;
  longitude: number;
  capacity: number;
};

interface MapProps {
  locations: Location[];
}

// Faster routing implementation
const FastRouting = () => {
  const map = useMap();
  
  useEffect(() => {
    // Define the start and end points
    const startPoint = L.latLng(12.925064, 80.116439);
    const endPoint = L.latLng(12.918706, 80.052883);
    
    // Set bounds immediately to improve perceived performance
    const bounds = L.latLngBounds([startPoint, endPoint]);
    map.fitBounds(bounds, { padding: [50, 50] });
    
    // Simplified routing options for faster loading
    const routingControl = L.Routing.control({
      waypoints: [startPoint, endPoint],
      lineOptions: {
        styles: [{ color: '#3388ff', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100 // Higher tolerance for faster routing
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      showAlternatives: false,
      useZoomParameter: false,
      // Simplified router
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        timeout: 5000,
        geometryOnly: true
      })
    }).addTo(map);
    
    return () => {
      map.removeControl(routingControl);
    };
  }, [map]);
  
  return null;
};

const Map: React.FC<MapProps> = ({ locations }) => {
  // Precomputed center for better performance
  const defaultCenter: [number, number] = [12.921885, 80.084661];
  
  // Only show the fixed routing points, unless specific locations are important
  const showOnlyRoutingPoints = locations.length === 0;
  const displayLocations = showOnlyRoutingPoints ? 
    [
      { latitude: 12.925064, longitude: 80.116439, capacity: 0 },
      { latitude: 12.918706, longitude: 80.052883, capacity: 0 }
    ] : 
    locations;
  
  return (
    <div className="h-full w-full">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-2xl"
        preferCanvas={true} // Use canvas for better performance
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {displayLocations.map((loc, index) => (
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
        <FastRouting />
      </MapContainer>
    </div>
  );
};

export default Map;