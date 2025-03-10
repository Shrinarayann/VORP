// src/pages/MapPage.tsx
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import SavedRoutes, { SavedRoute } from '@/components/SavedRoutes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Plus, MapPin, Truck } from 'lucide-react';
import axios from 'axios';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/auth/supabase';
import { Loader2, Save } from 'lucide-react';

type Vehicle = {
  id: number;
  capacity: number;
};

const MapPage: React.FC = () => {
  // State for map points
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number[]>([33]);
  const { Locations, setLocations } = useLocation();

  // State for depot selection (index of the chosen point)
  const [depotIndex, setDepotIndex] = useState<number | null>(null);

  // Sidebar tab state: "points" or "vehicles"
  const [activeTab, setActiveTab] = useState<"points" | "vehicles">("points");

  // State for vehicles details
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(0);
  const [batchQuantity, setBatchQuantity] = useState<number>(1);

  // For the collapsible saved routes sidebar on the left
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Add this state near your other state declarations
  const [calculatedRoutes, setCalculatedRoutes] = useState<{[key: string]: [number, number][]} | null>(null);

  // Add these state variables
  const [locationName, setLocationName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user } = useUser();

  // Add a new handleMapClick function
  const handleMapClick = (lat: number, lng: number) => {
    // Update latitude and longitude state
    setLatitude(lat);
    setLongitude(lng);
    
    // If we're in the points tab, automatically scroll to the inputs
    if (activeTab === "points") {
      const pointsSection = document.getElementById("add-points-section");
      if (pointsSection) {
        pointsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Function implementations remain unchanged...
  const handleSavedRouteSelect = (route: SavedRoute) => {
    setLocations(route.locations);
    setDepotIndex(null);
    // Close the sidebar after selecting a route
    setSidebarOpen(false);
  };

  const handleAddPoint = (lat: number, lng: number, demand: number) => {
    try {
      const newPoint = { latitude: lat, longitude: lng, capacity: demand };
      const updatedLocations = [...Locations, newPoint];
      setLocations(updatedLocations);
      console.log("Updated Points:", updatedLocations);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePoint = (index: number) => {
    const updatedLocations = Locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    if (depotIndex === index) {
      setDepotIndex(null);
    }
  };

  const handleAddVehicle = () => {
    if (vehicleCapacity <= 0) return;
    const newVehicle: Vehicle = {
      id: vehicles.length,
      capacity: vehicleCapacity,
    };
    setVehicles([...vehicles, newVehicle]);
    setVehicleCapacity(0);
  };

  const handleBatchAddVehicles = () => {
    if (vehicleCapacity <= 0 || batchQuantity < 1) return;
    const newVehicles = Array.from({ length: batchQuantity }, (_, idx) => ({
      id: vehicles.length + idx,
      capacity: vehicleCapacity,
    }));
    setVehicles([...vehicles, ...newVehicles]);
    setVehicleCapacity(0);
    setBatchQuantity(1);
  };

  const handleDeleteVehicle = (id: number) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  const handleCalculateRoutes = async () => {
    if (Locations.length < 2) {
      alert("Please add at least 2 points.");
      return;
    }
    if (vehicles.length < 1) {
      alert("Please add at least 1 vehicle.");
      return;
    }
    if (depotIndex === null) {
      alert("Please select a depot from your points.");
      return;
    }

    try {
      // Format data according to what the backend expects
      const formattedData = {
        locations: Locations.map(loc => [loc.longitude, loc.latitude]),
        num_vehicles: vehicles.length,
        depot: depotIndex,
        capacities: vehicles.map(v => v.capacity),
        demands: Locations.map((point, index) => 
          index === depotIndex ? 0 : point.capacity
        )
      };

      // Make the API call
      const response = await axios.post(
        'http://localhost:8080/api/v1/calculate_routes', 
        formattedData
      );
      
      // Process response
      if (response.data && response.data.routes) {
        // Original format with "routes" property
        const formattedRoutes: {[key: string]: [number, number][]} = {};
        
        response.data.routes.forEach((route: any, index: number) => {
          if (route && route.route && Array.isArray(route.route)) {
            const routeCoordinates: [number, number][] = route.route.map((point: any) => {
              const nodeIndex = point.node;
              if (Locations[nodeIndex]) {
                return [Locations[nodeIndex].longitude, Locations[nodeIndex].latitude];
              }
              return [0, 0]; 
            }).filter((coord: [number, number]) => coord[0] !== 0 || coord[1] !== 0);
            
            formattedRoutes[index.toString()] = routeCoordinates;
          }
        });
        
        setCalculatedRoutes(formattedRoutes);
      } 
      else if (response.data && response.data.calculated_routes) {
        // Alternative format with "calculated_routes" property
        try {
          // Try to parse the calculated_routes directly
          if (typeof response.data.calculated_routes === 'object') {
            setCalculatedRoutes(response.data.calculated_routes);
          } 
          // Or format it if it's an array
          else if (Array.isArray(response.data.calculated_routes)) {
            const formattedRoutes: {[key: string]: [number, number][]} = {};
            
            response.data.calculated_routes.forEach((route: any, index: number) => {
              if (Array.isArray(route)) {
                formattedRoutes[index.toString()] = route;
              }
            });
            
            setCalculatedRoutes(formattedRoutes);
          }
          else {
            throw new Error("calculated_routes is not in expected format");
          }
        } catch (parseError) {
          alert(`Routes calculated but format couldn't be processed.`);
        }
      } 
      else if (response.data && response.data.status === "success") {
        alert("Routes calculated successfully, but no route data was returned.");
      } 
      else {
        alert("Failed to calculate routes: Invalid response format.");
      }
    } catch (error: any) {
      const errorMessage = error.response ? 
        `Server error: ${error.response.status} ${error.response.statusText}` : 
        "Network error or server unavailable";
      alert(`Failed to calculate routes: ${errorMessage}.`);
    }
  };

  // Function to handle saving locations
  const handleSaveLocations = async () => {
    if (!user) {
      alert("Please log in to save locations");
      return;
    }
    
    if (Locations.length === 0) {
      alert("Add points to save");
      return;
    }
    
    if (!locationName.trim()) {
      alert("Please enter a name for this location set");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const locationData = {
        user_id: user.id,
        name: locationName,
        data: { locations: Locations }
      };
      
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select();
      
      if (error) {
        throw error;
      }
      
      alert("Locations saved successfully!");
      setLocationName('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to save locations: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pt-16"> {/* Add pt-16 here to create space at the top */}
      <Navbar />
      {/* Main content container without margin/padding, since parent has pt-16 */}
      <div className="flex flex-grow"> 
        {/* Collapsible Saved Routes Sidebar (left) */}
        <div
          className={`transition-all duration-300 border-r border-gray-200 bg-white shadow-sm flex flex-col ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <Button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="m-2 hover:bg-gray-100"
            variant="outline"
            size="sm"
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          {sidebarOpen && (
            <div className="w-full p-2">
              <h3 className="font-semibold text-lg mb-2 text-secBlue">Saved Routes</h3>
              <SavedRoutes onSelectRoute={handleSavedRouteSelect} />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow">
          <div className="flex flex-grow">
            {/* Map Section */}
            <div className="p-4 flex-grow">
              <h1 className="text-2xl font-bold py-2 text-secBlue">Route Optimizer</h1>
              {/* Add position: relative and adjust the height calculation */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-160px)] relative">
                <Map 
                  locations={Locations} 
                  calculatedRoutes={calculatedRoutes || {}} 
                  depotIndex={depotIndex} 
                  onMapClick={handleMapClick} 
                />
              </div>
            </div>

            {/* Right Sidebar for Inputs */}
            <div className="w-96 p-4 border-l border-gray-200 bg-white shadow-sm">
              {/* Tab Header */}
              <div className="flex space-x-2 mb-6">
                <Button
                  onClick={() => setActiveTab("points")}
                  className={`flex-1 rounded-md font-medium ${
                    activeTab === "points" 
                      ? "bg-LightBlue text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <MapPin className="mr-2 h-4 w-4" /> Points
                </Button>

                <Button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex-1 rounded-md font-medium ${
                    activeTab === "vehicles" 
                      ? "bg-LightBlue text-white shadow-md" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Truck className="mr-2 h-4 w-4" /> Vehicles
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === "points" && (
                <div className="points-tab">
                  <div id="add-points-section" className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Add Points</h2>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        placeholder="Latitude"
                        value={latitude || ""} // Add value prop
                        className="w-1/2 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        onChange={(e) => setLatitude(Number(e.target.value))}
                      />
                      <Input
                        placeholder="Longitude"
                        value={longitude || ""} // Add value prop
                        className="w-1/2 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        onChange={(e) => setLongitude(Number(e.target.value))}
                      />
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Demand:</span>
                        <span className="text-sm font-medium text-gray-700">{sliderValue[0]}</span>
                      </div>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="py-4"
                      />
                    </div>
                    <Button 
                      className="w-full bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                      onClick={() => handleAddPoint(latitude, longitude, sliderValue[0])}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Point
                    </Button>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Added Points</h2>
                    <div className="h-[calc(100vh-450px)] overflow-y-auto pr-1">
                      {Locations.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No points added yet</p>
                      ) : (
                        Locations.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center mb-3">
                            <div className={`border p-3 w-full rounded-md ${depotIndex === index ? 'bg-blue-50 border-LightBlue' : 'bg-white'}`}>
                              <div className="font-medium flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                Point {index + 1} {depotIndex === index && <span className="ml-2 text-LightBlue font-bold">(Depot)</span>}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Demand: {item.capacity}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button 
                                className={`text-xs py-1 px-2 h-auto ${
                                  depotIndex === index 
                                    ? "bg-gray-300 text-gray-600 cursor-default" 
                                    : "bg-LightBlue text-white hover:bg-blue-700"
                                }`}
                                disabled={depotIndex === index}
                                onClick={() => setDepotIndex(index)}
                              >
                                Set Depot
                              </Button>
                              <Button 
                                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 h-auto"
                                onClick={() => handleDeletePoint(index)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {/* Save Locations Section */}
                  {Locations.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-xl font-semibold mb-3 text-gray-800">Save Location Set</h2>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter a name"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          className="flex-1 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                          disabled={isSaving || !user}
                        />
                        <Button 
                          className="bg-LightBlue hover:bg-blue-700 text-white"
                          onClick={handleSaveLocations}
                          disabled={isSaving || !user || !locationName.trim() || Locations.length === 0}
                        >
                          {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                      </div>
                      {!user && (
                        <p className="text-xs text-gray-500 mt-2">Log in to save locations</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "vehicles" && (
                <div className="vehicles-tab">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Vehicle Details</h2>
                    <div className="flex flex-col space-y-3">
                      <Input
                        placeholder="Vehicle Capacity"
                        value={vehicleCapacity || ""}
                        onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                        className="border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                      />
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Quantity"
                          value={batchQuantity || ""}
                          onChange={(e) => setBatchQuantity(Number(e.target.value))}
                          className="w-1/3 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        />
                        <Button 
                          className="flex-1 bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                          onClick={handleBatchAddVehicles}
                        >
                          Add Multiple
                        </Button>
                      </div>
                      <Button 
                        className="w-full bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                        onClick={handleAddVehicle}
                      >
                        <Truck className="mr-2 h-4 w-4" /> Add Single Vehicle
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Added Vehicles</h2>
                    <div className="h-[calc(100vh-450px)] overflow-y-auto pr-1">
                      {vehicles.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No vehicles added yet</p>
                      ) : (
                        vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex gap-2 items-center mb-3">
                            <div className="border p-3 w-full rounded-md bg-white">
                              <div className="font-medium flex items-center">
                                <Truck className="h-4 w-4 mr-1" />
                                Vehicle {vehicle.id + 1}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">Capacity: {vehicle.capacity}</div>
                            </div>
                            <Button 
                              className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 h-auto"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Calculate Routes Button */}
              {(Locations.length >= 2 && vehicles.length >= 1) && (
                <div className="mt-6">
                  <Button 
                    className="w-full bg-AccYellow hover:bg-yellow-600 text-white shadow-md py-6 text-lg font-semibold transition-all"
                    onClick={handleCalculateRoutes}
                  >
                    Calculate Routes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
