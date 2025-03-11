import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import './map.css';

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
  calculatedRoutes?: {[key: string]: [number, number][]};
  selectedRouteId?: string | null;
  depotIndex: number | null;
  onMapClick?: (lat: number, lng: number) => void;
}

// Handle map clicks and other events
const MapEvents = ({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

// Add markers and routing to the map
const MapContent = ({ locations, calculatedRoutes, selectedRouteId, depotIndex }: MapProps) => {
  const map = useMap();
  
  // Reference to store routing controls for cleanup
  const routingControlsRef = React.useRef<L.Routing.Control[]>([]);

  // Create markers for each location
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new L.LatLngBounds([]);
      locations.forEach(loc => {
        bounds.extend([loc.latitude, loc.longitude]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  // Create routes when calculatedRoutes changes
// Create routes when calculatedRoutes changes
useEffect(() => {
  // Clear previous routing controls
  routingControlsRef.current.forEach(control => {
    if (control && map) {
      map.removeControl(control);
    }
  });
  routingControlsRef.current = [];

  if (!calculatedRoutes || Object.keys(calculatedRoutes).length === 0) return;

  // Define different colors for each route - brighter colors for better visibility
  const colors = [
    '#FF5733', // Orange-Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F033FF', // Purple
    '#FF33A1', // Pink
    '#33FFF6', // Cyan
    '#FFBD33', // Gold
    '#8833FF', // Indigo
    '#FF3333', // Red
    '#33FFBD'  // Teal
  ];

  // First render non-selected routes
  const routeKeys = Object.keys(calculatedRoutes);
  const nonSelectedRoutes = routeKeys.filter(key => key !== selectedRouteId);
  
  // Then render selected route (so it appears on top)
  const routeRenderOrder = [...nonSelectedRoutes];
  if (selectedRouteId) {
    routeRenderOrder.push(selectedRouteId);
  }

  // Add each route with a different color
  routeRenderOrder.forEach((vehicleIndex) => {
    try {
      const routePoints = calculatedRoutes[vehicleIndex];
      if (!routePoints || routePoints.length < 2) return; // Skip invalid routes
      
      const waypoints = routePoints.map(point => L.latLng(point[1], point[0]));
      
      // Check if this route is selected
      const isSelected = selectedRouteId === vehicleIndex;
      
      // Determine route styling
      const colorIndex = parseInt(vehicleIndex) % colors.length;
      const routeColor = isSelected ? '#000000' : colors[colorIndex]; // Black for selected route
      const weight = isSelected ? 7 : 4; // Make selected route thicker
      const opacity = isSelected ? 1.0 : (selectedRouteId ? 0.3 : 0.7); // Fade non-selected routes more
      
      // Add route path animation for selected route
      const dashArray = isSelected ? '15, 10' : null;
      const dashOffset = isSelected ? '0' : null;
      
      try {
        const routingControl = L.Routing.control({
          waypoints: waypoints,
          lineOptions: {
            styles: [{ 
              color: routeColor, 
              weight: weight, 
              opacity: opacity,
              dashArray: dashArray,
              dashOffset: dashOffset
            }],
            extendToWaypoints: true,
            missingRouteTolerance: 100
          },
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          showAlternatives: false,
          fitSelectedRoutes: false, // Prevent auto-fitting which can cause display issues
          createMarker: function() { return null; } // Don't create markers for waypoints
        }).addTo(map);

        // Hide the itinerary
        if (routingControl && routingControl._container) {
          routingControl._container.style.display = 'none';
        }
        
        // Store the control for later cleanup
        routingControlsRef.current.push(routingControl);
        
        // If this is the selected route, add route markers to better visualize the sequence
        if (isSelected && routePoints.length > 0) {
          // Skip the first and last point if they're the depot (to avoid duplicate markers)
          const filteredPoints = routePoints.slice(
            depotIndex !== null && locations[depotIndex]?.longitude === routePoints[0][0] && 
            locations[depotIndex]?.latitude === routePoints[0][1] ? 1 : 0,
            depotIndex !== null && locations[depotIndex]?.longitude === routePoints[routePoints.length-1][0] && 
            locations[depotIndex]?.latitude === routePoints[routePoints.length-1][1] ? -1 : routePoints.length
          );
          
          // Add sequence indicators
          filteredPoints.forEach((point, idx) => {
            // Find the location index
            const locIndex = locations.findIndex(loc => 
              loc.longitude === point[0] && loc.latitude === point[1] && 
              (depotIndex === null || locIndex !== depotIndex)
            );
            
            if (locIndex !== -1) {
              try {
                // Create a circle marker with sequence number
                const sequenceMarker = L.circleMarker([point[1], point[0]], {
                  radius: 14,
                  fillColor: '#000000',
                  color: '#ffffff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(map);
                
                // Add sequence number
                const iconDiv = L.DomUtil.create('div', 'sequence-number');
                iconDiv.innerHTML = `${idx + 1}`;
                iconDiv.style.color = 'white';
                iconDiv.style.fontWeight = 'bold';
                iconDiv.style.fontSize = '12px';
                iconDiv.style.textAlign = 'center';
                iconDiv.style.marginTop = '-5px';
                
                const textIcon = L.divIcon({
                  html: iconDiv,
                  className: 'sequence-marker',
                  iconSize: [20, 20]
                });
                
                L.marker([point[1], point[0]], { 
                  icon: textIcon, 
                  interactive: false
                }).addTo(map);
              } catch (markerError) {
                console.error("Error creating sequence markers:", markerError);
              }
            }
          });
        }
      } catch (routeError) {
        console.error("Error creating routing control:", routeError);
      }
    } catch (error) {
      console.error("Error processing route:", error, vehicleIndex);
    }
  });

  // Apply path animation for selected route if it exists
  if (selectedRouteId) {
    try {
      // Use a setTimeout to ensure the DOM elements are available
      setTimeout(() => {
        const pathElements = document.querySelectorAll(`path[stroke="#000000"][stroke-width="7"]`);
        pathElements.forEach(path => {
          // Add animation class
          path.classList.add('selected-route-animation');
          // Apply animation directly with JS to ensure it works
          const pathElement = path as HTMLElement;
          pathElement.style.strokeDasharray = '15, 10';
          pathElement.style.animation = 'dash 1.5s linear infinite';
        });
      }, 100);
    } catch (animationError) {
      console.error("Error applying route animation:", animationError);
    }
  }

}, [calculatedRoutes, selectedRouteId, map, locations, depotIndex]);

  return null;
};

const Map: React.FC<MapProps> = ({ locations, calculatedRoutes, depotIndex, onMapClick, selectedRouteId }) => {
  // Create custom icons for regular points and depot
  const regularIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const depotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  // Precomputed center for better performance
  const defaultCenter: [number, number] = [12.921885, 80.084661];
  
  // Add CSS for the selected route animation
  React.useEffect(() => {
    // Add a style element if it doesn't exist
    if (!document.getElementById('route-animation-style')) {
      const style = document.createElement('style');
      style.id = 'route-animation-style';
      style.innerHTML = `
        @keyframes dash {
          to {
            stroke-dashoffset: -25;
          }
        }
        .selected-route-animation {
          animation: dash 1.5s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up when component unmounts
      const styleElement = document.getElementById('route-animation-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  return (
    <div className="h-full w-full z-1">
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
        {locations.map((loc, index) => (
          <Marker 
            key={index} 
            position={[loc.latitude, loc.longitude]} 
            icon={index === depotIndex ? depotIcon : regularIcon}
          >
            <Popup>
              <div>
                <strong>{index === depotIndex ? "Depot" : `Point ${index + 1}`}</strong>
                <br />
                Capacity: {loc.capacity}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapContent 
          locations={locations} 
          calculatedRoutes={calculatedRoutes} 
          depotIndex={depotIndex} 
          selectedRouteId={selectedRouteId}
        />
        <MapEvents onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};

export default Map;